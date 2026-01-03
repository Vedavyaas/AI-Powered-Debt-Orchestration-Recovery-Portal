package com.iit.fedex.service;

import com.iit.fedex.assets.Role;
import com.iit.fedex.assets.Stage;
import com.iit.fedex.assets.Status;
import com.iit.fedex.dto.DashboardSummary;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import com.iit.fedex.repository.DebtInvestEntity;
import com.iit.fedex.repository.DebtInvestRepository;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final DebtCaseRepository debtCaseRepository;
    private final DebtInvestRepository debtInvestRepository;
    private final JWTLoginRepository jwtLoginRepository;

    public DashboardService(DebtCaseRepository debtCaseRepository,
                           DebtInvestRepository debtInvestRepository,
                           JWTLoginRepository jwtLoginRepository) {
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.jwtLoginRepository = jwtLoginRepository;
    }

    public DashboardSummary getDashboardSummary() {
        long totalCases = debtCaseRepository.count();
        long totalAgents = jwtLoginRepository.countByAgencyIdAndRole(
                SecurityContextHolder.getContext().getAuthentication().getName(), Role.DCA_AGENT);
        long totalManagers = jwtLoginRepository.countByAgencyIdAndRole(
                SecurityContextHolder.getContext().getAuthentication().getName(), Role.DCA_MANAGER);
        
        double totalPortfolioValue = debtCaseRepository.findAll().stream()
                .mapToDouble(d -> d.getAmount() != null ? d.getAmount() : 0.0)
                .sum();
        
        long pendingCases = debtInvestRepository.countByStage(Stage.PENDING) + 
                           debtInvestRepository.countByStage(Stage.IN_PROGRESS);
        
        long collectedToday = debtInvestRepository.countByStage(Stage.COLLECTED);
        double collectedTodayAmount = 0.0;
        
        long casesThisWeek = collectedToday;
        double casesThisWeekAmount = collectedTodayAmount;
        
        List<DashboardSummary.TopAgentDTO> topAgents = getTopAgents(5);
        List<DashboardSummary.RecentCaseDTO> recentCases = getRecentCases(10);
        
        return new DashboardSummary(
                totalCases, totalAgents, totalManagers, totalPortfolioValue,
                pendingCases, collectedToday, collectedTodayAmount,
                casesThisWeek, casesThisWeekAmount, topAgents, recentCases
        );
    }

    private List<DashboardSummary.TopAgentDTO> getTopAgents(int limit) {
        String agencyId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<com.iit.fedex.repository.JWTLoginEntity> agents = 
                jwtLoginRepository.findByAgencyId(agencyId);
        
        return agents.stream()
                .map(agent -> {
                    List<DebtInvestEntity> agentCases = 
                            debtInvestRepository.findByAssignedToEmail(agent.getEmail());
                    long collectedCases = agentCases.stream()
                            .filter(c -> c.getStage() == Stage.COLLECTED)
                            .count();
                    return new DashboardSummary.TopAgentDTO(
                            agent.getEmail(),
                            agent.getEmail().split("@")[0],
                            collectedCases,
                            0.0
                    );
                })
                .sorted((a, b) -> Long.compare(b.collectedCases(), a.collectedCases()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<DashboardSummary.RecentCaseDTO> getRecentCases(int limit) {
        return debtCaseRepository.findAll().stream()
                .limit(limit)
                .map(caseEntity -> {
                    String stage = "PENDING";
                    DebtInvestEntity invest = debtInvestRepository.findByCaseEntity(caseEntity).orElse(null);
                    if (invest != null) {
                        stage = invest.getStage().name();
                    }
                    return new DashboardSummary.RecentCaseDTO(
                            caseEntity.getInvoiceNumber(),
                            caseEntity.getCustomerName(),
                            caseEntity.getStatus().name(),
                            stage,
                            caseEntity.getAmount()
                    );
                })
                .collect(Collectors.toList());
    }
}

