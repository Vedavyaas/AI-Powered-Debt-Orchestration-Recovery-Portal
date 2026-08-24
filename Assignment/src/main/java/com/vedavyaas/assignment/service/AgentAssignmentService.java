package com.vedavyaas.assignment.service;

import com.vedavyaas.assignment.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgentAssignmentService {
    private final AgentRepository agentRepository;
    private final WaitingRepository waitingRepository;
    private final DebtRepository debtRepository;

    public AgentAssignmentService(AgentRepository agentRepository, WaitingRepository waitingRepository, DebtRepository debtRepository) {
        this.agentRepository = agentRepository;
        this.waitingRepository = waitingRepository;
        this.debtRepository = debtRepository;
    }

    public void assignAgent(DebtEntity debtEntity) {
        Integer niceValue = debtEntity.getNiceValue();
        List<AgentEntity> agentEntities = agentRepository.findAllByNiceValueGreaterThan(niceValue);

        if (agentEntities.isEmpty()) {
            List<AgentEntity> allAgents = agentRepository.findAll();
            if (allAgents.isEmpty()) {
                WaitingEntity waitingEntity = new WaitingEntity(debtEntity.getId());
                waitingRepository.save(waitingEntity);
                return;
            }
            debtEntity.setAgentEntity(allAgents.get(allAgents.size() - 1));
            debtRepository.save(debtEntity);
            return;
        }

        debtEntity.setAgentEntity(agentEntities.get(0));
        debtRepository.save(debtEntity);
    }

    @Scheduled(fixedDelay = 1_000_000)
    public void checkWaitingDebts() {
        List<WaitingEntity> waitingEntities = waitingRepository.findAll();

        for (var waitingEntity : waitingEntities) {
            DebtEntity debtEntity = debtRepository.findById(waitingEntity.getDebtId()).get();
            assignAgent(debtEntity);
        }

        waitingRepository.deleteAll(waitingEntities);
    }
}
