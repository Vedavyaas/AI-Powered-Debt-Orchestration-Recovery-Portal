package com.vedavyaas.mlservice.model;

public record PredictionModel(String debtName, String managerName, Double recoveryProbability, Double trustScore, Integer niceValue) {
}
