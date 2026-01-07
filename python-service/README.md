# Python AI Service for Debt Propensity Scoring

This Python service provides AI-powered propensity scoring for debt cases using TensorFlow. It integrates with the Java Spring Boot backend via REST API.

## Features

- **TensorFlow-based ML model** for predicting debt collection propensity scores (0-1 range)
- **REST API endpoints** matching the Java integration expectations:
  - `POST /predict` - Score debt cases
  - `GET /health` - Health check endpoint
- **Batch processing** - Can handle single cases or lists of cases
- **Default model fallback** - Creates a model if no trained model exists

## API Endpoints

### POST /predict

Predicts propensity scores for debt cases.

**Request Body:**
```json
[
  {
    "invoiceNumber": "INV-10001",
    "customerName": "Customer A",
    "amount": 5000.0,
    "daysOverdue": 30,
    "serviceType": "EXPRESS",
    "pastDefaults": 0
  }
]
```

**Response:**
```json
{
  "predictions": [
    {
      "invoiceNumber": "INV-10001",
      "propensityScore": 0.7523
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "debt-propensity-ai",
  "model_loaded": true
}
```

## Model Features

The model uses the following features:
- `amount` (Double) - Debt amount
- `daysOverdue` (Integer) - Number of days overdue
- `pastDefaults` (Integer) - Number of past defaults
- `serviceType` (Enum: EXPRESS, GROUND, FREIGHT) - Service type

## Setup

### Option 1: Train Model Locally

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Train the model:
```bash
python train_model.py
```

This will generate:
- `models/propensity_model.h5` - Trained TensorFlow model
- `models/preprocessor.pkl` - Feature preprocessor

3. Run the service:
```bash
python app.py
```

Or with gunicorn:
```bash
gunicorn --bind 0.0.0.0:8000 --workers 2 app:app
```

### Option 2: Docker

The service will create a default model on first run if no trained model exists.

The provided Dockerfile uses a multi-stage build (build wheels in a builder stage, then install into a slim runtime stage) to keep the runtime image smaller and speed up rebuilds.

```bash
docker build -t python-ai-service .
docker run -p 8000:8000 python-ai-service
```

## Model Training

The `train_model.py` script generates synthetic training data and trains a neural network. In production, replace the synthetic data generation with real historical debt case data.

The model architecture:
- Input: 4 feature groups (amount, days_overdue, past_defaults, service_type one-hot)
- Hidden layers: 64 → 32 → 16 neurons with dropout
- Output: Single sigmoid output (propensity score 0-1)

## Integration with Java Backend

The Java `AIResponseIntegration` class expects:
- Service running on `http://localhost:8000`
- `/predict` endpoint accepting POST requests
- `/health` endpoint for health checks

The service is automatically integrated via Docker Compose.

