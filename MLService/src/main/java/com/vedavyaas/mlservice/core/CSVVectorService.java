package com.vedavyaas.mlservice.core;

import com.vedavyaas.mlservice.model.PreparedData;
import org.datavec.api.records.reader.RecordReader;
import org.datavec.api.records.reader.impl.csv.CSVRecordReader;
import org.datavec.api.split.InputStreamInputSplit;
import org.datavec.api.writable.Writable;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.dataset.DataSet;
import org.nd4j.linalg.dataset.SplitTestAndTrain;
import org.nd4j.linalg.dataset.api.preprocessor.NormalizerStandardize;
import org.nd4j.linalg.factory.Nd4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class CSVVectorService {
    private static final String FILE_NAME = "sample.csv";
    private static final SimpleDateFormat FORMATTER = new SimpleDateFormat("dd-MM-yyyy");

    private final Logger logger = LoggerFactory.getLogger(CSVVectorService.class);

    public PreparedData getPreparedDataSet() {
        List<double[]> featureList = new ArrayList<>();
        List<double[]> labelList = new ArrayList<>();

        InputStream inputStream = getClass()
                .getClassLoader()
                .getResourceAsStream(FILE_NAME);

        if (inputStream == null) {
            throw new IllegalStateException("File not found in classpath: " + FILE_NAME);
        }

        try (RecordReader reader = new CSVRecordReader(1, ',')) {
            reader.initialize(new InputStreamInputSplit(inputStream));

            LocalDate today = LocalDate.now();

            while (reader.hasNext()) {
                List<Writable> record = reader.next();

                double principalAmount = record.get(0).toDouble();
                double outstandingAmount = record.get(1).toDouble();

                Date dueDate = FORMATTER.parse(record.get(2).toString());

                LocalDate dueLocalDate = dueDate.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();

                long daysDue = ChronoUnit.DAYS.between(today, dueLocalDate);

                double recoveryProbability = record.get(3).toDouble();
                double trustScore = record.get(4).toDouble();
                double niceValue = record.get(5).toDouble();

                featureList.add(new double[]{
                        principalAmount,
                        outstandingAmount,
                        daysDue
                });

                labelList.add(new double[]{
                        recoveryProbability,
                        trustScore,
                        niceValue
                });
            }

            if (featureList.isEmpty()) {
                throw new IllegalStateException("sample.csv contains no data rows");
            }

            INDArray features = Nd4j.create(featureList.size(), 3);
            INDArray labels = Nd4j.create(labelList.size(), 3);

            for (int i = 0; i < featureList.size(); i++) {
                features.putRow(i, Nd4j.create(featureList.get(i)));
                labels.putRow(i, Nd4j.create(labelList.get(i)));
            }

            DataSet dataSet = new DataSet(features, labels);
            dataSet.shuffle();

            SplitTestAndTrain split = dataSet.splitTestAndTrain(0.8);

            DataSet trainingData = split.getTrain();
            DataSet testingData = split.getTest();

            // Normalize both features AND labels with a single normalizer
            NormalizerStandardize normalizer = new NormalizerStandardize();
            normalizer.fitLabel(true);
            normalizer.fit(trainingData);
            normalizer.transform(trainingData);
            normalizer.transform(testingData);

            return new PreparedData(
                    trainingData,
                    testingData,
                    normalizer
            );

        } catch (IOException | InterruptedException | ParseException e) {
            logger.error("Error reading CSV", e);
            throw new IllegalStateException("Failed to prepare dataset", e);
        }
    }
}