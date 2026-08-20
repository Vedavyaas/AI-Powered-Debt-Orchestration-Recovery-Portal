package com.vedavyaas.mlservice.core;

import com.vedavyaas.mlservice.model.PreparedData;
import jakarta.annotation.PostConstruct;
import org.deeplearning4j.eval.RegressionEvaluation;
import org.deeplearning4j.nn.conf.MultiLayerConfiguration;
import org.deeplearning4j.nn.conf.NeuralNetConfiguration;
import org.deeplearning4j.nn.conf.layers.DenseLayer;
import org.deeplearning4j.nn.conf.layers.OutputLayer;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.deeplearning4j.util.ModelSerializer;
import org.nd4j.linalg.activations.Activation;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.dataset.DataSet;
import org.nd4j.linalg.dataset.api.preprocessor.NormalizerStandardize;
import org.nd4j.linalg.learning.config.Adam;
import org.nd4j.linalg.lossfunctions.LossFunctions;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class ModelTrainingService {
    private static final String MODEL_PATH = "models/loan-model.zip";
    private static final int EPOCHS = 2000;

    private final CSVVectorService csvVectorService;
    private MultiLayerNetwork model;
    private NormalizerStandardize normalizer;

    public ModelTrainingService(CSVVectorService csvVectorService) {
        this.csvVectorService = csvVectorService;
    }

    @PostConstruct
    public void init() {
        File modelFile = new File(MODEL_PATH);

        if (modelFile.exists()) {
            loadModel(modelFile);
        } else {
            trainModel();
        }
    }

    private void trainModel() {
        PreparedData preparedData = csvVectorService.getPreparedDataSet();

        this.normalizer = preparedData.normalizer();
        model = createModel();

        for (int epoch = 1; epoch <= EPOCHS; epoch++) {
            model.fit(preparedData.trainingData());

            if (epoch % 200 == 0 || epoch == 1) {
                System.out.println("Epoch: " + epoch);
                evaluateModel(preparedData.testingData(), preparedData.normalizer());
            }
        }

        saveModel();
    }

    private MultiLayerNetwork createModel() {
        MultiLayerConfiguration configuration =
                new NeuralNetConfiguration.Builder()
                        .seed(12345)
                        .updater(new Adam(0.0005))
                        .list()
                        .layer(
                                0,
                                new DenseLayer.Builder()
                                        .nIn(3)
                                        .nOut(64)
                                        .activation(Activation.RELU)
                                        .build()
                        )
                        .layer(
                                1,
                                new DenseLayer.Builder()
                                        .nIn(64)
                                        .nOut(32)
                                        .activation(Activation.RELU)
                                        .build()
                        )
                        .layer(
                                2,
                                new DenseLayer.Builder()
                                        .nIn(32)
                                        .nOut(16)
                                        .activation(Activation.RELU)
                                        .build()
                        )
                        .layer(
                                3,
                                new OutputLayer.Builder(
                                        LossFunctions.LossFunction.MSE
                                )
                                        .nIn(16)
                                        .nOut(3)
                                        .activation(Activation.IDENTITY)
                                        .build()
                        )
                        .build();

        MultiLayerNetwork network = new MultiLayerNetwork(configuration);
        network.init();

        return network;
    }

    private void evaluateModel(DataSet testingData, NormalizerStandardize normalizer) {
        INDArray predictions = model.output(testingData.getFeatures(), false);

        // Revert both predictions and true labels to original scale for meaningful RMSE
        INDArray trueLabels = testingData.getLabels().dup();
        INDArray predLabels = predictions.dup();
        normalizer.revertLabels(trueLabels);
        normalizer.revertLabels(predLabels);

        RegressionEvaluation evaluation = new RegressionEvaluation(3);
        evaluation.eval(trueLabels, predLabels);

        double recoveryRmse = evaluation.rootMeanSquaredError(0);
        double trustRmse = evaluation.rootMeanSquaredError(1);
        double niceRmse = evaluation.rootMeanSquaredError(2);

        System.out.println("Recovery RMSE: " + recoveryRmse);
        System.out.println("Trust RMSE: " + trustRmse);
        System.out.println("Nice Value RMSE: " + niceRmse);
    }

    private void saveModel() {
        try {
            File modelFile = new File(MODEL_PATH);
            File parent = modelFile.getParentFile();

            if (parent != null) {
                parent.mkdirs();
            }

            ModelSerializer.writeModel(model, modelFile, true);

            System.out.println(
                    "Model saved: " + modelFile.getAbsolutePath()
            );

        } catch (IOException e) {
            throw new RuntimeException("Failed to save model", e);
        }
    }

    private void loadModel(File modelFile) {
        try {
            model = ModelSerializer.restoreMultiLayerNetwork(modelFile);
            System.out.println("Trained model loaded.");
        } catch (IOException e) {
            throw new RuntimeException("Failed to load model", e);
        }
    }

    public MultiLayerNetwork getModel() {
        if (model == null) {
            throw new IllegalStateException(
                    "Model is not trained or loaded"
            );
        }

        return model;
    }

    public NormalizerStandardize getNormalizer() {
        if (normalizer == null) {
            // If model was loaded from disk (no normalizer in memory), retrain to get normalizer
            trainModel();
        }

        return normalizer;
    }
}