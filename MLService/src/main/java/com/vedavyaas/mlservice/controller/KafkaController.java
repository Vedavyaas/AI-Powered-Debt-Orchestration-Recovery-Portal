package com.vedavyaas.mlservice.controller;

import com.vedavyaas.mlservice.core.Orchestrator;
import com.vedavyaas.mlservice.model.AIModel;
import com.vedavyaas.mlservice.model.DebtModel;
import com.vedavyaas.mlservice.model.PredictionModel;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;

@Service
public class KafkaController {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final Orchestrator orchestrator;
    private final AIModel aiModel;

    public KafkaController(KafkaTemplate<String, String> kafkaTemplate, Orchestrator orchestrator, AIModel aiModel) {
        this.kafkaTemplate = kafkaTemplate;
        this.orchestrator = orchestrator;
        this.aiModel = aiModel;
    }

    @KafkaListener(topics = "debt-request-topic", groupId = "mlGroup")
    public void receiveMessage(String message) throws ParseException {
        //debt_name, manager_name, principal_amount, outstanding_amount, due_date
        String[] input = message.split("EOF");
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy");
        DebtModel debtModel = new DebtModel(
                input[0],
                input[1],
                Double.parseDouble(input[2]),
                Double.parseDouble(input[3]),
                formatter.parse(input[4])
        );

        PredictionModel predictionModel = orchestrator.calculateScore(debtModel);
        sendMessage(predictionModel);
    }

    @KafkaListener(topics = "agent-prediction-topic", groupId = "mlGroup")
    public void receiveAgentMessage(String message) {
        //agent_name, cases_pending, cases_solved, success_rate, average_resolution_time
        String result = aiModel.query(message);
        sendMessageAgentScore(result);
    }

    public void sendMessage(PredictionModel predictionModel) {
        String message = predictionModel.debtName() + "EOF"
                + predictionModel.managerName() + "EOF"
                + predictionModel.recoveryProbability() + "EOF"
                + predictionModel.trustScore() + "EOF"
                + predictionModel.niceValue();
        kafkaTemplate.send("debt-prediction-topic", message);
    }

    public void sendMessageAgentScore(String message) {
        kafkaTemplate.send("agent-score-topic", message);
    }
}
