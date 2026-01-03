package com.iit.fedex.controller;

import com.iit.fedex.assets.Stage;
import com.iit.fedex.assets.Status;
import com.iit.fedex.dto.BulkStatusUpdate;
import com.iit.fedex.dto.CaseSearchRequest;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtInvestEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import com.iit.fedex.repository.DebtInvestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class DebtController {

    private final DebtCaseRepository debtCaseRepository;
    private final DebtInvestRepository debtInvestRepository;

    public DebtController(DebtCaseRepository debtCaseRepository,
                         DebtInvestRepository debtInvestRepository) {
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
    }

    @GetMapping("/debt/case/{invoiceNumber}")
    public DebtCaseEntity getCaseByInvoice(@PathVariable String invoiceNumber) {
        return debtCaseRepository.findByInvoiceNumber(invoiceNumber);
    }

    @GetMapping("/debt/search")
    public List<DebtCaseEntity> searchCases(@RequestBody(required = false) CaseSearchRequest request) {
        if (request == null) {
            return debtCaseRepository.findAll();
        }
        
        List<DebtCaseEntity> results = debtCaseRepository.findAll();
        
        if (request.customerName() != null && !request.customerName().isEmpty()) {
            results = results.stream()
                    .filter(c -> c.getCustomerName() != null && 
                            c.getCustomerName().toLowerCase().contains(request.customerName().toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (request.invoiceNumber() != null && !request.invoiceNumber().isEmpty()) {
            results = results.stream()
                    .filter(c -> c.getInvoiceNumber() != null && 
                            c.getInvoiceNumber().equals(request.invoiceNumber()))
                    .collect(Collectors.toList());
        }
        
        if (request.status() != null) {
            results = results.stream()
                    .filter(c -> c.getStatus() == request.status())
                    .collect(Collectors.toList());
        }
        
        if (request.minAmount() != null) {
            results = results.stream()
                    .filter(c -> c.getAmount() != null && c.getAmount() >= request.minAmount())
                    .collect(Collectors.toList());
        }
        
        if (request.maxAmount() != null) {
            results = results.stream()
                    .filter(c -> c.getAmount() != null && c.getAmount() <= request.maxAmount())
                    .collect(Collectors.toList());
        }
        
        return results;
    }

    @GetMapping("/debt/case/{invoiceNumber}/details")
    public DebtInvestEntity getCaseDetails(@PathVariable String invoiceNumber) {
        DebtCaseEntity caseEntity = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
        if (caseEntity == null) {
            return null;
        }
        return debtInvestRepository.findByCaseEntity(caseEntity).orElse(null);
    }

    // Bulk Operations
    
    @PostMapping("/debt/bulk/status")
    public Map<String, Object> bulkUpdateStatus(@RequestBody BulkStatusUpdate request) {
        Map<String, Object> response = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();
        
        for (String invoiceNumber : request.invoiceNumbers()) {
            try {
                DebtCaseEntity caseEntity = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
                if (caseEntity != null) {
                    caseEntity.setStatus(request.newStatus());
                    if (request.assignedTo() != null) {
                        caseEntity.setAssignedTo(request.assignedTo());
                    }
                    debtCaseRepository.save(caseEntity);
                    successCount++;
                } else {
                    failCount++;
                    errors.add("Case not found: " + invoiceNumber);
                }
            } catch (Exception e) {
                failCount++;
                errors.add("Error updating " + invoiceNumber + ": " + e.getMessage());
            }
        }
        
        response.put("successCount", successCount);
        response.put("failCount", failCount);
        response.put("errors", errors);
        response.put("message", String.format("Bulk update completed: %d successful, %d failed", successCount, failCount));
        
        return response;
    }

    @PostMapping("/debt/bulk/stage")
    public Map<String, Object> bulkUpdateStage(@RequestBody BulkStageUpdate request) {
        Map<String, Object> response = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> errors = new ArrayList<>();
        
        for (String invoiceNumber : request.invoiceNumbers()) {
            try {
                DebtCaseEntity caseEntity = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
                if (caseEntity != null) {
                    Optional<DebtInvestEntity> investOpt = debtInvestRepository.findByCaseEntity(caseEntity);
                    if (investOpt.isPresent()) {
                        DebtInvestEntity invest = investOpt.get();
                        invest.setStage(Stage.valueOf(request.stage()));
                        debtInvestRepository.save(invest);
                        successCount++;
                    } else {
                        failCount++;
                        errors.add("Invest record not found: " + invoiceNumber);
                    }
                } else {
                    failCount++;
                    errors.add("Case not found: " + invoiceNumber);
                }
            } catch (Exception e) {
                failCount++;
                errors.add("Error updating " + invoiceNumber + ": " + e.getMessage());
            }
        }
        
        response.put("successCount", successCount);
        response.put("failCount", failCount);
        response.put("errors", errors);
        response.put("message", String.format("Bulk stage update completed: %d successful, %d failed", successCount, failCount));
        
        return response;
    }

    @GetMapping("/debt/high-value")
    public List<DebtCaseEntity> getHighValueCases(@RequestParam(defaultValue = "10000") Double minAmount) {
        return debtCaseRepository.findAll().stream()
                .filter(c -> c.getAmount() != null && c.getAmount() >= minAmount)
                .sorted((a, b) -> Double.compare(b.getAmount(), a.getAmount()))
                .collect(Collectors.toList());
    }

    @GetMapping("/debt/overdue")
    public List<DebtCaseEntity> getOverdueCases(@RequestParam(defaultValue = "30") Integer minDays) {
        return debtCaseRepository.findAll().stream()
                .filter(c -> c.getDaysOverdue() != null && c.getDaysOverdue() >= minDays)
                .sorted((a, b) -> Integer.compare(b.getDaysOverdue(), a.getDaysOverdue()))
                .collect(Collectors.toList());
    }

    @GetMapping("/debt/stats")
    public Map<String, Object> getDebtStats() {
        Map<String, Object> stats = new HashMap<>();
        List<DebtCaseEntity> allCases = debtCaseRepository.findAll();
        
        long totalCases = allCases.size();
        Double totalAmount = allCases.stream()
                .filter(c -> c.getAmount() != null)
                .mapToDouble(DebtCaseEntity::getAmount)
                .sum();
        
        long assignedCount = allCases.stream()
                .filter(c -> c.getStatus() == Status.ASSIGNED)
                .count();
        
        long unassignedCount = allCases.stream()
                .filter(c -> c.getStatus() == Status.UN_ASSIGNED)
                .count();
        
        stats.put("totalCases", totalCases);
        stats.put("totalAmount", totalAmount);
        stats.put("assignedCases", assignedCount);
        stats.put("unassignedCases", unassignedCount);
        stats.put("assignmentRate", totalCases > 0 ? (double) assignedCount / totalCases * 100 : 0.0);
        
        return stats;
    }

    // Inner class for bulk stage update request
    public record BulkStageUpdate(
            List<String> invoiceNumbers,
            String stage
    ) {}
}

