"""
Flask REST API service for debt case propensity scoring using TensorFlow.
This service matches the expected API contract from AIResponseIntegration.java
"""

from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pickle
import os
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global variables for model and preprocessor
model = None
preprocessor = None
model_path = os.path.join(os.path.dirname(__file__), 'models', 'propensity_model.h5')
preprocessor_path = os.path.join(os.path.dirname(__file__), 'models', 'preprocessor.pkl')

# Service type mapping (EXPRESS, GROUND, FREIGHT)
SERVICE_TYPES = ['EXPRESS', 'GROUND', 'FREIGHT']


def load_model():
    """Load the trained TensorFlow model and preprocessor"""
    global model, preprocessor
    
    if model is None:
        if os.path.exists(model_path):
            logger.info(f"Loading model from {model_path}")
            model = tf.keras.models.load_model(model_path)
            logger.info("Model loaded successfully")
        else:
            logger.warning(f"Model not found at {model_path}. Using default model.")
            model = create_default_model()
    
    if preprocessor is None:
        if os.path.exists(preprocessor_path):
            logger.info(f"Loading preprocessor from {preprocessor_path}")
            with open(preprocessor_path, 'rb') as f:
                preprocessor = pickle.load(f)
            logger.info("Preprocessor loaded successfully")
        else:
            logger.warning(f"Preprocessor not found at {preprocessor_path}. Using default preprocessor.")
            preprocessor = create_default_preprocessor()


def create_default_model():
    """Create a default model if no trained model exists"""
    logger.info("Creating default model architecture")
    
    # Input layers
    amount_input = tf.keras.layers.Input(shape=(1,), name='amount')
    days_overdue_input = tf.keras.layers.Input(shape=(1,), name='days_overdue')
    past_defaults_input = tf.keras.layers.Input(shape=(1,), name='past_defaults')
    service_type_input = tf.keras.layers.Input(shape=(len(SERVICE_TYPES),), name='service_type')
    
    # Normalize numerical features
    amount_norm = tf.keras.layers.BatchNormalization()(amount_input)
    days_norm = tf.keras.layers.BatchNormalization()(days_overdue_input)
    defaults_norm = tf.keras.layers.BatchNormalization()(past_defaults_input)
    
    # Concatenate all features
    concatenated = tf.keras.layers.Concatenate()([
        amount_norm, days_norm, defaults_norm, service_type_input
    ])
    
    # Dense layers
    dense1 = tf.keras.layers.Dense(64, activation='relu')(concatenated)
    dropout1 = tf.keras.layers.Dropout(0.3)(dense1)
    dense2 = tf.keras.layers.Dense(32, activation='relu')(dropout1)
    dropout2 = tf.keras.layers.Dropout(0.2)(dense2)
    dense3 = tf.keras.layers.Dense(16, activation='relu')(dropout2)
    
    # Output layer (propensity score between 0 and 1)
    output = tf.keras.layers.Dense(1, activation='sigmoid', name='propensity_score')(dense3)
    
    model = tf.keras.Model(
        inputs=[amount_input, days_overdue_input, past_defaults_input, service_type_input],
        outputs=output
    )
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'mae']
    )
    
    return model


def create_default_preprocessor():
    """Create a default preprocessor with reasonable scaling factors"""
    return {
        'amount_mean': 5000.0,
        'amount_std': 3000.0,
        'days_overdue_mean': 45.0,
        'days_overdue_std': 30.0,
        'past_defaults_mean': 1.5,
        'past_defaults_std': 2.0
    }


def preprocess_case(case: Dict[str, Any]) -> Dict[str, np.ndarray]:
    """Preprocess a single debt case for model prediction"""
    # Extract and normalize numerical features
    amount = case.get('amount', 0.0)
    days_overdue = case.get('daysOverdue', 0)
    past_defaults = case.get('pastDefaults', 0)
    service_type = case.get('serviceType', 'EXPRESS')
    
    # Normalize numerical features
    amount_norm = (amount - preprocessor['amount_mean']) / (preprocessor['amount_std'] + 1e-8)
    days_norm = (days_overdue - preprocessor['days_overdue_mean']) / (preprocessor['days_overdue_std'] + 1e-8)
    defaults_norm = (past_defaults - preprocessor['past_defaults_mean']) / (preprocessor['past_defaults_std'] + 1e-8)
    
    # One-hot encode service type
    service_onehot = np.zeros(len(SERVICE_TYPES))
    if service_type in SERVICE_TYPES:
        service_onehot[SERVICE_TYPES.index(service_type)] = 1.0
    
    return {
        'amount': np.array([[amount_norm]]),
        'days_overdue': np.array([[days_norm]]),
        'past_defaults': np.array([[defaults_norm]]),
        'service_type': np.array([service_onehot])
    }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'debt-propensity-ai',
        'model_loaded': model is not None
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict propensity scores for debt cases.
    
    Expected input format:
    [
        {
            "invoiceNumber": "INV-10001",
            "customerName": "Customer A",
            "amount": 5000.0,
            "daysOverdue": 30,
            "serviceType": "EXPRESS",
            "pastDefaults": 0
        },
        ...
    ]
    
    Returns:
    {
        "predictions": [
            {
                "invoiceNumber": "INV-10001",
                "propensityScore": 0.75
            },
            ...
        ]
    }
    """
    try:
        # Load model if not already loaded
        if model is None:
            load_model()
        
        # Parse request data
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Handle both single case and list of cases
        if isinstance(data, dict):
            cases = [data]
        elif isinstance(data, list):
            cases = data
        else:
            return jsonify({'error': 'Invalid data format. Expected list or object.'}), 400
        
        predictions = []
        
        for case in cases:
            invoice_number = case.get('invoiceNumber', 'UNKNOWN')
            
            try:
                # Preprocess the case
                preprocessed = preprocess_case(case)
                
                # Make prediction
                prediction = model.predict([
                    preprocessed['amount'],
                    preprocessed['days_overdue'],
                    preprocessed['past_defaults'],
                    preprocessed['service_type']
                ], verbose=0)
                
                # Extract propensity score (sigmoid output is between 0 and 1)
                propensity_score = float(prediction[0][0])
                
                predictions.append({
                    'invoiceNumber': invoice_number,
                    'propensityScore': round(propensity_score, 4)
                })
                
            except Exception as e:
                logger.error(f"Error processing case {invoice_number}: {str(e)}")
                # Return a default score if processing fails
                predictions.append({
                    'invoiceNumber': invoice_number,
                    'propensityScore': 0.5
                })
        
        return jsonify({
            'predictions': predictions
        }), 200
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Load model on startup
    load_model()
    
    # Run Flask app
    port = int(os.environ.get('PORT', 8000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    logger.info(f"Starting Flask app on {host}:{port}")
    app.run(host=host, port=port, debug=False)

