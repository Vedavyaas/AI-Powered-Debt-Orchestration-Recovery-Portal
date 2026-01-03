package com.iit.fedex.controller;

import com.iit.fedex.assets.Stage;
import com.iit.fedex.assets.Status;
import com.iit.fedex.dto.CollectionStats;
import com.iit.fedex.dto.ReportRequestDTO;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import com.iit.fedex.repository.DebtInvestRepository;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportingController {

    private final DebtCaseRepository debtCaseRepository;
    private final DebtInvestRepository debtInvestRepository;
    private final JWTLoginRepository jwtLoginRepository;

    public ReportingController(DebtCaseRepository debtCaseRepository,
                               DebtInvestRepository debtInvestRepository,
                               JWTLoginRepository jwtLoginRepository) {
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.jwtLoginRepository = jwtLoginRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getReportSummary() {
        List<DebtCaseEntity> allCases = debtCaseRepository.findAll();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCases", allCases.size());
        summary.put("totalAmount", allCases.stream()
                .filter(c -> c.getAmount() != null)
                .mapToDouble(DebtCaseEntity::getAmount)
                .sum());
        summary.put("assignedCases", allCases.stream()
                .filter(c -> c.getStatus() == Status.ASSIGNED)
                .count());
        summary.put("unassignedCases", allCases.stream()
                .filter(c -> c.getStatus() == Status.UN_ASSIGNED)
                .count());
        summary.put("collectedCases", debtInvestRepository.countByStage(Stage.COLLECTED));
        summary.put("pendingCases", debtInvestRepository.countByStage(Stage.PENDING) +
                debtInvestRepository.countByStage(Stage.IN_PROGRESS));
        summary.put("disputedCases", debtInvestRepository.countByStage(Stage.DISPUTED));
        
        return summary;
    }

    @GetMapping("/by-status")
    public Map<String, Object> getCasesByStatus() {
        Map<String, Object> result = new HashMap<>();
        
        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("ASSIGNED", debtCaseRepository.countByStatus(Status.ASSIGNED));
        statusCounts.put("UN_ASSIGNED", debtCaseRepository.countByStatus(Status.UN_ASSIGNED));
        statusCounts.put("ASSIGNED_AND_WAITING", debtCaseRepository.countByStatus(Status.ASSIGNED_AND_WAITING));
        
        Map<String, Double> statusAmounts = new HashMap<>();
        statusAmounts.put("ASSIGNED", debtCaseRepository.sumAmountByStatus(Status.ASSIGNED) != null ? 
                debtCaseRepository.sumAmountByStatus(Status.ASSIGNED) : 0.0);
        statusAmounts.put("UN_ASSIGNED", debtCaseRepository.sumAmountByStatus(Status.UN_ASSIGNED) != null ? 
                debtCaseRepository.sumAmountByStatus(Status.UN_ASSIGNED) : 0.0);
        
        result.put("statusCounts", statusCounts);
        result.put("statusAmounts", statusAmounts);
        
        return result;
    }

    @GetMapping("/by-stage")
    public Map<String, Object> getCasesByStage() {
        Map<String, Object> result = new HashMap<>();
        
        Map<String, Long> stageCounts = new HashMap<>();
        for (Stage stage : Stage.values()) {
            stageCounts.put(stage.name(), debtInvestRepository.countByStage(stage));
        }
        
        result.put("stageCounts", stageCounts);
        
        return result;
    }

    @GetMapping("/high-value")
    public List<DebtCaseEntity> getHighValueCases(
            @RequestParam(defaultValue = "10000") Double minAmount,
            @RequestParam(defaultValue = "amount") String sortBy,
            @RequestParam(defaultValue = "true") boolean descending) {
        
        List<DebtCaseEntity> cases = debtCaseRepository.findAll().stream()
                .filter(c -> c.getAmount() != null && c.getAmount() >= minAmount)
                .sorted((a, b) -> {
                    int cmp = Double.compare(b.getAmount(), a.getAmount());
                    return descending ? cmp : -cmp;
                })
                .collect(Collectors.toList());
        
        return cases;
    }

    @GetMapping("/overdue")
    public List<DebtCaseEntity> getOverdueCases(
            @RequestParam(defaultValue = "30") Integer minDays) {
        
        return debtCaseRepository.findAll().stream()
                .filter(c -> c.getDaysOverdue() != null && c.getDaysOverdue() >= minDays)
                .sorted((a, b) -> Integer.compare(b.getDaysOverdue(), a.getDaysOverdue()))
                .collect(Collectors.toList());
    }

    @GetMapping("/collection-trend")
    public Map<String, Object> getCollectionTrend() {
        Map<String, Object> trend = new HashMap<>();
        
        long totalCases = debtCaseRepository.count();
        long collectedCases = debtInvestRepository.countByStage(Stage.COLLECTED);
        double collectionRate = totalCases > 0 ? (double) collectedCases / totalCases * 100 : 0.0;
        
        trend.put("totalCases", totalCases);
        trend.put("collectedCases", collectedCases);
        trend.put("collectionRate", collectionRate);
        trend.put("remainingCases", totalCases - collectedCases);
        
        return trend;
    }

    @GetMapping("/manager-summary")
    public Map<String, Object> getManagerSummary() {
        String managerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        var managerOpt = jwtLoginRepository.findByEmail(managerEmail);
        
        Map<String, Object> summary = new HashMap<>();
        
        if (managerOpt.isPresent()) {
            String agencyId = managerOpt.get().getAgencyId();
            List<DebtCaseEntity> agencyCases = debtCaseRepository.findByAssignedTo(agencyId);
            
            summary.put("totalCases", agencyCases.size());
            summary.put("agencyId", agencyId);
            summary.put("totalAmount", agencyCases.stream()
                    .filter(c -> c.getAmount() != null)
                    .mapToDouble(DebtCaseEntity::getAmount)
                    .sum());
        }
        
        return summary;
    }

    @GetMapping("/trend-analysis")
    public Map<String, Object> getTrendAnalysis() {
        Map<String, Object> analysis = new HashMap<>();
        
        // Stage distribution
        Map<String, Long> stageDistribution = new HashMap<>();
        for (Stage stage : Stage.values()) {
            stageDistribution.put(stage.name(), debtInvestRepository.countByStage(stage));
        }
        analysis.put("stageDistribution", stageDistribution);
        
        // Status distribution
        Map<String, Long> statusDistribution = new HashMap<>();
        statusDistribution.put("ASSIGNED", debtCaseRepository.countByStatus(Status.ASSIGNED));
        statusDistribution.put("UN_ASSIGNED", debtCaseRepository.countByStatus(Status.UN_ASSIGNED));
        statusDistribution.put("ASSIGNED_AND_WAITING", debtCaseRepository.countByStatus(Status.ASSIGNED_AND_WAITING));
        analysis.put("statusDistribution", statusDistribution);
        
        // High value cases
        List<DebtCaseEntity> highValueCases = debtCaseRepository.findAll().stream()
                .filter(c -> c.getAmount() != null && c.getAmount() >= 10000)
                .sorted((a, b) -> Double.compare(b.getAmount(), a.getAmount()))
                .limit(10)
                .collect(Collectors.toList());
        analysis.put("topHighValueCases", highValueCases);
        
        // Overdue cases
        List<DebtCaseEntity> overdueCases = debtCaseRepository.findAll().stream()
                .filter(c -> c.getDaysOverdue() != null && c.getDaysOverdue() >= 30)
                .sorted((a, b) -> Integer.compare(b.getDaysOverdue(), a.getDaysOverdue()))
                .limit(10)
                .collect(Collectors.toList());
        analysis.put("mostOverdueCases", overdueCases);
        
        return analysis;
    }

    @PostMapping("/custom")
    public Map<String, Object> getCustomReport(@RequestBody ReportRequestDTO request) {
        Map<String, Object> report = new HashMap<>();
        report.put("reportType", request.reportType());
        report.put("generatedAt", LocalDateTime.now());
        
        // Filter cases based on criteria
        List<DebtCaseEntity> filteredCases = debtCaseRepository.findAll();
        
        // Apply date range filter if provided
        if (request.startDate() != null && request.endDate() != null) {
            // Add date filtering logic here based on entity's date field
        }
        
        report.put("totalCases", filteredCases.size());
        report.put("totalAmount", filteredCases.stream()
                .filter(c -> c.getAmount() != null)
                .mapToDouble(DebtCaseEntity::getAmount)
                .sum());
        
        return report;
    }
}

