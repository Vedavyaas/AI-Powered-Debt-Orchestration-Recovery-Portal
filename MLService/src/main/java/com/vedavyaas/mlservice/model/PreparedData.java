package com.vedavyaas.mlservice.model;

import org.nd4j.linalg.dataset.DataSet;
import org.nd4j.linalg.dataset.api.preprocessor.NormalizerStandardize;

public record PreparedData(
        DataSet trainingData,
        DataSet testingData,
        NormalizerStandardize normalizer
) {
}