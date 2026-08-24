package com.vedavyaas.assignment.service;

import com.vedavyaas.assignment.model.Status;
import com.vedavyaas.assignment.repository.AgentEntity;
import com.vedavyaas.assignment.repository.AgentRepository;
import com.vedavyaas.assignment.repository.DebtEntity;
import com.vedavyaas.assignment.repository.DebtRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class AgentCreditService {
    private final AgentRepository agentRepository;
    private final DebtRepository debtRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public AgentCreditService(AgentRepository agentRepository, DebtRepository debtRepository, KafkaTemplate<String, String> kafkaTemplate) {
        this.agentRepository = agentRepository;
        this.debtRepository = debtRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelay = 1_00_000)
    public void agentScoringEngine() {
        Pageable pageable;
        Page<AgentEntity> agentEntities;
        int i = 0;
        do {
            pageable = PageRequest.of(i++, 10);
            agentEntities = agentRepository.findAll(pageable);

            for (var agent : agentEntities) {
                Optional<List<DebtEntity>> debtEntityList = debtRepository.findByAgentEntity(agent);
                if (debtEntityList.isPresent()) {
                    int casesPending = 0;
                    int casesSolved = 0;
                    Duration resolutionTime = Duration.ZERO;
                    for (var debt : debtEntityList.get()) {
                        if (debt.getStatus().equals(Status.PENDING)) casesPending++;
                        else if (debt.getStatus().equals(Status.APPROVED)) {
                            casesSolved++;
                            if (debt.getCreatedAt() != null && debt.getCompletedAt() != null) {
                                resolutionTime = resolutionTime.plus(Duration.between(debt.getCreatedAt(), debt.getCompletedAt()));
                            }
                        }
                    }

                    agent.setCasesPending(casesPending);
                    agent.setCasesSolved(casesSolved);
                    if (casesSolved > 0) {
                        agent.setAverageResolutionTime((double) resolutionTime.dividedBy(casesSolved).toDays());
                    } else {
                        agent.setAverageResolutionTime(0.0);
                    }
                    //agent_name, cases_pending, cases_solved, success_rate, average_resolution_time
                    String message = agent.getAgentName() + "EOF" +
                            agent.getCasesPending() + "EOF" +
                            agent.getCasesSolved() + "EOF" +
                            agent.getSuccessRate() + "EOF" +
                            agent.getAverageResolutionTime();
                    kafkaTemplate.send("agent-prediction-topic", message);
                }
            }
            agentRepository.saveAll(agentEntities);
        } while (agentEntities.hasNext());
    }
}
