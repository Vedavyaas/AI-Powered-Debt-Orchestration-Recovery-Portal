"""
Script to train a TensorFlow model for debt case propensity scoring.
This generates a model that can be used by the Flask API service.
"""

import tensorflow as tf
import numpy as np
import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Service types
SERVICE_TYPES = ['EXPRESS', 'GROUND', 'FREIGHT']


def generate_synthetic_data(n_samples=1000):
    """
    Generate synthetic training data for debt cases.
    In production, this would be replaced with real historical data.
    """
    logger.info(f"Generating {n_samples} synthetic training samples...")
    
    np.random.seed(42)
    
    data = {
        'amount': np.random.lognormal(mean=8.5, sigma=0.8, size=n_samples),
        'days_overdue': np.random.gamma(shape=2, scale=20, size=n_samples).astype(int),
        'past_defaults': np.random.poisson(lam=1.5, size=n_samples),
        'service_type': np.random.choice(SERVICE_TYPES, size=n_samples),
    }
    
    # Generate propensity scores based on features
    # Higher amounts, more days overdue, and more past defaults = lower propensity
    # This is a simplified heuristic for synthetic data
    base_score = 0.7
    amount_factor = -0.0001 * data['amount']
    days_factor = -0.005 * data['days_overdue']
    defaults_factor = -0.1 * data['past_defaults']
    service_factor = np.where(data['service_type'] == 'EXPRESS', 0.05, 
                             np.where(data['service_type'] == 'GROUND', 0.0, -0.05))
    
    # Add some noise
    noise = np.random.normal(0, 0.1, n_samples)
    
    propensity = base_score + amount_factor + days_factor + defaults_factor + service_factor + noise
    propensity = np.clip(propensity, 0.0, 1.0)  # Ensure between 0 and 1
    
    data['propensity_score'] = propensity
    
    return pd.DataFrame(data)


def preprocess_data(df):
    """Preprocess the data for model training"""
    logger.info("Preprocessing data...")
    
    # One-hot encode service type
    service_dummies = pd.get_dummies(df['service_type'], prefix='service')
    df_processed = pd.concat([df.drop('service_type', axis=1), service_dummies], axis=1)
    
    # Ensure all service types are present
    for service in SERVICE_TYPES:
        col_name = f'service_{service}'
        if col_name not in df_processed.columns:
            df_processed[col_name] = 0
    
    # Reorder columns to match expected order
    service_cols = [f'service_{s}' for s in SERVICE_TYPES]
    feature_cols = ['amount', 'days_overdue', 'past_defaults'] + service_cols
    
    X = df_processed[feature_cols].values
    y = df_processed['propensity_score'].values
    
    # Scale numerical features
    scaler = StandardScaler()
    X_scaled = X.copy()
    X_scaled[:, 0] = scaler.fit_transform(X[:, 0].reshape(-1, 1)).flatten()  # amount
    X_scaled[:, 1] = scaler.fit_transform(X[:, 1].reshape(-1, 1)).flatten()  # days_overdue
    X_scaled[:, 2] = scaler.fit_transform(X[:, 2].reshape(-1, 1)).flatten()  # past_defaults
    # Service type columns (3-5) are already 0/1, no scaling needed
    
    # Store scaler statistics for later use
    preprocessor = {
        'amount_mean': scaler.mean_[0] if len(scaler.mean_) > 0 else df['amount'].mean(),
        'amount_std': scaler.scale_[0] if len(scaler.scale_) > 0 else df['amount'].std(),
        'days_overdue_mean': scaler.mean_[1] if len(scaler.mean_) > 1 else df['days_overdue'].mean(),
        'days_overdue_std': scaler.scale_[1] if len(scaler.scale_) > 1 else df['days_overdue'].std(),
        'past_defaults_mean': scaler.mean_[2] if len(scaler.mean_) > 2 else df['past_defaults'].mean(),
        'past_defaults_std': scaler.scale_[2] if len(scaler.scale_) > 2 else df['past_defaults'].std(),
    }
    
    return X_scaled, y, preprocessor


def build_model(input_dim):
    """Build the TensorFlow model architecture"""
    logger.info("Building model architecture...")
    
    # Input layers for each feature type
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
    
    # Dense layers with dropout for regularization
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


def train_model():
    """Main training function"""
    logger.info("Starting model training...")
    
    # Generate or load training data
    df = generate_synthetic_data(n_samples=2000)
    
    # Preprocess data
    X, y, preprocessor = preprocess_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Split features for model input and ensure float32 dtype
    X_train_split = {
        'amount': X_train[:, 0].reshape(-1, 1).astype(np.float32),
        'days_overdue': X_train[:, 1].reshape(-1, 1).astype(np.float32),
        'past_defaults': X_train[:, 2].reshape(-1, 1).astype(np.float32),
        'service_type': X_train[:, 3:6].astype(np.float32)
    }
    
    X_test_split = {
        'amount': X_test[:, 0].reshape(-1, 1).astype(np.float32),
        'days_overdue': X_test[:, 1].reshape(-1, 1).astype(np.float32),
        'past_defaults': X_test[:, 2].reshape(-1, 1).astype(np.float32),
        'service_type': X_test[:, 3:6].astype(np.float32)
    }
    
    # Ensure y is also float32
    y_train = y_train.astype(np.float32)
    y_test = y_test.astype(np.float32)
    
    # Build model
    model = build_model(input_dim=X.shape[1])
    
    # Print model summary
    model.summary()
    
    # Train model
    logger.info("Training model...")
    history = model.fit(
        [X_train_split['amount'], X_train_split['days_overdue'], 
         X_train_split['past_defaults'], X_train_split['service_type']],
        y_train,
        validation_data=(
            [X_test_split['amount'], X_test_split['days_overdue'],
             X_test_split['past_defaults'], X_test_split['service_type']],
            y_test
        ),
        epochs=50,
        batch_size=32,
        verbose=1
    )
    
    # Evaluate model
    logger.info("Evaluating model...")
    test_loss, test_accuracy, test_mae = model.evaluate(
        [X_test_split['amount'], X_test_split['days_overdue'],
         X_test_split['past_defaults'], X_test_split['service_type']],
        y_test,
        verbose=0
    )
    
    logger.info(f"Test Loss: {test_loss:.4f}")
    logger.info(f"Test Accuracy: {test_accuracy:.4f}")
    logger.info(f"Test MAE: {test_mae:.4f}")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Save model
    model_path = 'models/propensity_model.h5'
    model.save(model_path)
    logger.info(f"Model saved to {model_path}")
    
    # Save preprocessor
    preprocessor_path = 'models/preprocessor.pkl'
    with open(preprocessor_path, 'wb') as f:
        pickle.dump(preprocessor, f)
    logger.info(f"Preprocessor saved to {preprocessor_path}")
    
    logger.info("Training completed successfully!")


if __name__ == '__main__':
    train_model()

