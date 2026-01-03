package com.iit.fedex.controller;

import com.iit.fedex.assets.Role;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import com.iit.fedex.service.AuditService;
import com.iit.fedex.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final ExportService exportService;
    private final AuditService auditService;
    private final DebtCaseRepository debtCaseRepository;

    public ExportController(ExportService exportService,
                           AuditService auditService,
                           DebtCaseRepository debtCaseRepository) {
        this.exportService = exportService;
        this.auditService = auditService;
        this.debtCaseRepository = debtCaseRepository;
    }

    @GetMapping("/csv")
    public String exportToCSV(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) Integer minDaysOverdue,
            @RequestParam(defaultValue = "amount") String sortBy,
            @RequestParam(defaultValue = "false") boolean ascending) {

        List<DebtCaseEntity> cases = exportService.filterCases(
                status, stage, minAmount, maxAmount, minDaysOverdue, sortBy, ascending);

        auditService.logAction("EXPORT_CSV", "BULK_EXPORT", "CSV",
                String.format("Exported %d cases to CSV", cases.size()),
                "N/A", true);

        return exportService.exportCasesToCSV(cases);
    }

    @GetMapping("/json")
    public String exportToJSON(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) Integer minDaysOverdue,
            @RequestParam(defaultValue = "amount") String sortBy,
            @RequestParam(defaultValue = "false") boolean ascending,
            @RequestParam(defaultValue = "false") boolean includeInvestData) {

        List<DebtCaseEntity> cases = exportService.filterCases(
                status, stage, minAmount, maxAmount, minDaysOverdue, sortBy, ascending);

        auditService.logAction("EXPORT_JSON", "BULK_EXPORT", "JSON",
                String.format("Exported %d cases to JSON", cases.size()),
                "N/A", true);

        if (includeInvestData) {
            return exportService.exportCasesWithInvestData(cases);
        }
        return exportService.exportCasesToJSON(cases);
    }

    @GetMapping("/summary")
    public Map<String, Object> getExportSummary() {
        return exportService.getExportSummary();
    }

    @GetMapping("/all")
    public List<DebtCaseEntity> getAllCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) Integer minDaysOverdue,
            @RequestParam(defaultValue = "amount") String sortBy,
            @RequestParam(defaultValue = "false") boolean ascending,
            @RequestParam(defaultValue = "false") boolean descending) {

        return exportService.filterCases(
                status, stage, minAmount, maxAmount, minDaysOverdue, sortBy, descending);
    }

    @GetMapping("/count")
    public Map<String, Object> getFilteredCount(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) Integer minDaysOverdue) {

        List<DebtCaseEntity> cases = exportService.filterCases(
                status, stage, minAmount, maxAmount, minDaysOverdue, null, false);

        Map<String, Object> result = exportService.getExportSummary();
        result.put("filteredCount", cases.size());
        result.put("filterApplied", Map.of(
                "status", status != null ? status : "all",
                "stage", stage != null ? stage : "all",
                "minAmount", minAmount != null ? minAmount : "none",
                "maxAmount", maxAmount != null ? maxAmount : "none",
                "minDaysOverdue", minDaysOverdue != null ? minDaysOverdue : "none"
        ));

        return result;
    }
}

