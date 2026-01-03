package com.iit.fedex.service;

import com.iit.fedex.assets.Role;
import com.iit.fedex.assets.Stage;
import com.iit.fedex.assets.Status;
import com.iit.fedex.dto.AgentPerformanceStats;
import com.iit.fedex.dto.CollectionStats;
import com.iit.fedex.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final DebtCaseRepository debtCaseRepository;
    private final DebtInvestRepository debtInvestRepository;
    private final JWTLoginRepository jwtLoginRepository;

    public AnalyticsService(DebtCaseRepository debtCaseRepository,
                           DebtInvestRepository debtInvestRepository,
                           JWTLoginRepository jwtLoginRepository) {
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.jwtLoginRepository = jwtLoginRepository;
    }

    public CollectionStats getCollectionStats() {
        long totalCases = debtCaseRepository.count();
        long assignedCases = debtCaseRepository.countByStatus(Status.ASSIGNED);
        long unassignedCases = debtCaseRepository.countByStatus(Status.UN_ASSIGNED);
        
        Double totalAmount = debtCaseRepository.findAll().stream()
                .mapToDouble(d -> d.getAmount() != null ? d.getAmount() : 0.0)
                .sum();
        
        Double collectedAmount = debtCaseRepository.sumAmountByStatus(Status.ASSIGNED);
        Double pendingAmount = debtCaseRepository.sumAmountByStatus(Status.UN_ASSIGNED);
        
        Map<String, Long> casesByStatus = new HashMap<>();
        casesByStatus.put("ASSIGNED", debtCaseRepository.countByStatus(Status.ASSIGNED));
        casesByStatus.put("UN_ASSIGNED", debtCaseRepository.countByStatus(Status.UN_ASSIGNED));
        
        Map<String, Double> amountByStatus = new HashMap<>();
        amountByStatus.put("COLLECTED", collectedAmount != null ? collectedAmount : 0.0);
        amountByStatus.put("PENDING", pendingAmount != null ? pendingAmount : 0.0);
        
        long collectedCasesCount = debtInvestRepository.countByStage(Stage.COLLECTED);
        long pendingCasesCount = debtInvestRepository.countByStage(Stage.IN_PROGRESS) + 
                                debtInvestRepository.countByStage(Stage.PENDING);
        long disputedCasesCount = debtInvestRepository.countByStage(Stage.DISPUTED);
        
        return new CollectionStats(
                totalCases, assignedCases, unassignedCases,
                totalAmount, collectedAmount, pendingAmount,
                casesByStatus, amountByStatus,
                collectedCasesCount, pendingCasesCount, disputedCasesCount
        );
    }

    public List<AgentPerformanceStats> getAgentPerformance() {
        List<AgentPerformanceStats> performanceList = new ArrayList<>();
        
        List<JWTLoginEntity> agents = jwtLoginRepository.findAllByAgencyIdAndRole(
                SecurityContextHolder.getContext().getAuthentication().getName(), Role.DCA_AGENT);
        
        for (JWTLoginEntity agent : agents) {
            List<DebtInvestEntity> agentCases = debtInvestRepository.findByAssignedToEmail(agent.getEmail());
            
            long totalCases = agentCases.size();
            long casesCollected = agentCases.stream()
                    .filter(c -> c.getStage() == Stage.COLLECTED)
                    .count();
            long casesPending = agentCases.stream()
                    .filter(c -> c.getStage() == Stage.PENDING || c.getStage() == Stage.IN_PROGRESS)
                    .count();
            long casesDisputed = agentCases.stream()
                    .filter(c -> c.getStage() == Stage.DISPUTED)
                    .count();
            
            double collectionRate = totalCases > 0 ? (double) casesCollected / totalCases * 100 : 0.0;
            
            performanceList.add(new AgentPerformanceStats(
                    agent.getEmail(),
                    agent.getEmail().split("@")[0],
                    totalCases, casesCollected, casesPending, casesDisputed,
                    collectionRate, 0.0, 0.0
            ));
        }
        
        return performanceList.stream()
                .sorted((a, b) -> Double.compare(b.collectionRate(), a.collectionRate()))
                .collect(Collectors.toList());
    }
}

