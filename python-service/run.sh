#!/bin/bash

# Quick start script for Python AI service

echo "Python AI Service - Quick Start"
echo "================================"

# Check if models exist
if [ ! -f "models/propensity_model.h5" ]; then
    echo "No trained model found. Training model..."
    python train_model.py
else
    echo "Using existing model: models/propensity_model.h5"
fi

# Start the service
echo ""
echo "Starting Flask service on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""

python app.py

