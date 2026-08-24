package com.vedavyaas.assignment.service;

import com.vedavyaas.assignment.model.Status;
import com.vedavyaas.assignment.repository.*;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class KafkaService {

    private final AgentRepository agentRepository;
    private final DebtRepository debtRepository;
    private final ManagerRepository managerRepository;
    private final AgentAssignmentService agentAssignmentService;

    public KafkaService(AgentRepository agentRepository, DebtRepository debtRepository, ManagerRepository managerRepository, AgentAssignmentService agentAssignmentService) {
        this.agentRepository = agentRepository;
        this.debtRepository = debtRepository;
        this.managerRepository = managerRepository;
        this.agentAssignmentService = agentAssignmentService;
    }

    @KafkaListener(topics = "agent-topic", groupId = "assignGroup")
    public void agentMessageReceiver(String message) {
        Optional<AgentEntity> agentEntity = agentRepository.findByAgentName(message);

        if (agentEntity.isEmpty()) {
            AgentEntity agentEntity1 = new AgentEntity(message);
            agentRepository.save(agentEntity1);
        }
    }

    @KafkaListener(topics = "debt-topic", groupId = "assignGroup")
    public void debtMessageReceiver(String message) {
        //debt_name, manager_name
        String[] input = message.split("EOF");
        if (input.length != 2) return;

        Optional<DebtEntity> debtEntity = debtRepository.findByDebtName(input[0]);
        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(input[1]);

        if (managerEntity.isEmpty()) {
            ManagerEntity managerEntity1 = new ManagerEntity(input[1]);
            managerRepository.save(managerEntity1);
            managerEntity = Optional.of(managerEntity1);
        }

        if (debtEntity.isEmpty()) {
            DebtEntity debtEntity1 = new DebtEntity(input[0], managerEntity.get());
            debtRepository.save(debtEntity1);
        }
    }

    @KafkaListener(topics = "debt-prediction-topic", groupId = "assignGroup")
    public void debtPredictionReceiver(String message) {
        //debt_name, manager_name, recoveryProbability, trust_score, nice_value
        String[] input = message.split("EOF");
        if (input.length != 5) return;

        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(input[1]);
        if (managerEntity.isEmpty()) {
            ManagerEntity managerEntity1 = new ManagerEntity(input[1]);
            managerRepository.save(managerEntity1);
            managerEntity = Optional.of(managerEntity1);
        }

        Optional<DebtEntity> debtEntity = debtRepository.findByDebtName(input[0]);
        if (debtEntity.isEmpty()) {
            DebtEntity debtEntity1 = new DebtEntity(
                    input[0],
                    managerEntity.get(),
                    Double.parseDouble(input[2]),
                    Double.parseDouble(input[3]),
                    Integer.parseInt(input[4])
            );
            debtRepository.save(debtEntity1);
        } else if (!debtEntity.get().isCalculated()) {
            debtEntity.get().setCalculated(true);
            debtEntity.get().setRecoveryProbability(Double.parseDouble(input[2]));
            debtEntity.get().setTrustScore(Double.parseDouble(input[3]));
            debtEntity.get().setNiceValue(Integer.parseInt(input[4]));
            agentAssignmentService.assignAgent(debtEntity.get());
            //set agent

            debtRepository.save(debtEntity.get());
        }
    }

    @KafkaListener(topics = "debt-approval", groupId = "assignGroup")
    public void receiveApproval(String message) {
        // debt_name, true/false
        String[] input = message.split("EOF");
        Optional<DebtEntity> debtEntity = debtRepository.findByDebtName(input[0]);
        if (debtEntity.isEmpty()) {
            //ignore
            return;
        }

        if (input[1].equals("true")) {
            debtEntity.get().setStatus(Status.APPROVED);
            debtEntity.get().setCompletedAt(Instant.now());
        }
        else {
            if (debtEntity.get().getStatus().equals(Status.APPROVED)) debtEntity.get().setStatus(Status.PENDING);
        }
        debtRepository.save(debtEntity.get());
    }

    @KafkaListener(topics = "agent-score-topic", groupId = "assignGroup")
    public void receiveAgentScore(String message) {
        //agent_name, trust_score, nice_value
        String[] input = message.split("EOF");
        Optional<AgentEntity> agentEntity = agentRepository.findByAgentName(input[0]);

        if (agentEntity.isEmpty()) {
            //skip
            return;
        }

        agentEntity.get().setNiceValue((int) Math.round(Double.parseDouble(input[2].trim())));
        agentEntity.get().setTrustScore(Double.parseDouble(input[1].trim()));
        agentRepository.save(agentEntity.get());
    }
}
