package com.vedavyaas.mlservice.core;

import com.vedavyaas.mlservice.controller.KafkaController;
import com.vedavyaas.mlservice.model.DebtModel;
import com.vedavyaas.mlservice.model.PredictionModel;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.dataset.api.preprocessor.NormalizerStandardize;
import org.nd4j.linalg.factory.Nd4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

@Service
public class Orchestrator {

    private final ModelTrainingService modelTrainingService;
    private final KafkaController kafkaController;

    public Orchestrator(ModelTrainingService modelTrainingService, @Lazy KafkaController kafkaController) {
        this.modelTrainingService = modelTrainingService;
        this.kafkaController = kafkaController;
    }

    public PredictionModel calculateScore(DebtModel debtModel) {
        // --- Build feature vector (must match training: principalAmount, outstandingAmount, daysDue) ---
        LocalDate today = LocalDate.now();
        LocalDate dueLocalDate = debtModel.dueDate()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        long daysDue = ChronoUnit.DAYS.between(today, dueLocalDate);

        INDArray input = Nd4j.create(new double[]{
                debtModel.principalAmount(),
                debtModel.outStandingAmount(),
                (double) daysDue
        }, new int[]{1, 3});

        // --- Normalize input using the same normalizer fitted on training data ---
        NormalizerStandardize normalizer = modelTrainingService.getNormalizer();
        normalizer.transform(input);

        // --- Run inference ---
        INDArray output = modelTrainingService.getModel().output(input, false);

        // --- Revert output labels to original scale ---
        normalizer.revertLabels(output);

        double recoveryProbability = output.getDouble(0, 0);
        double trustScore          = output.getDouble(0, 1);
        int    niceValue           = (int) Math.round(output.getDouble(0, 2));

        // Clamp probabilities to [0, 1]
        recoveryProbability = Math.max(0.0, Math.min(1.0, recoveryProbability));
        trustScore          = Math.max(0.0, Math.min(1.0, trustScore));

        PredictionModel predictionModel = new PredictionModel(
                debtModel.debtName(),
                debtModel.managerName(),
                recoveryProbability,
                trustScore,
                niceValue
        );

        // --- Publish result back to Kafka ---
        kafkaController.sendMessage(predictionModel);

        return predictionModel;
    }
}
