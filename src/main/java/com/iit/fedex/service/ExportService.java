package com.iit.fedex.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.iit.fedex.assets.Stage;
import com.iit.fedex.assets.Status;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import com.iit.fedex.repository.DebtInvestEntity;
import com.iit.fedex.repository.DebtInvestRepository;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExportService {

    private final DebtCaseRepository debtCaseRepository;
    private final DebtInvestRepository debtInvestRepository;
    private final ObjectMapper objectMapper;

    public ExportService(DebtCaseRepository debtCaseRepository,
                        DebtInvestRepository debtInvestRepository,
                        ObjectMapper objectMapper) {
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.objectMapper = objectMapper;
    }

    public String exportCasesToCSV(List<DebtCaseEntity> cases) {
        try {
            CsvMapper mapper = new CsvMapper();
            CsvSchema.Builder schemaBuilder = CsvSchema.builder()
                    .addColumn("invoiceNumber")
                    .addColumn("customerName")
                    .addColumn("amount")
                    .addColumn("daysOverdue")
                    .addColumn("serviceType")
                    .addColumn("pastDefaults")
                    .addColumn("status")
                    .addColumn("assignedTo")
                    .addColumn("propensityScore");

            List<Map<String, Object>> dataList = cases.stream().map(c -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("invoiceNumber", c.getInvoiceNumber() != null ? c.getInvoiceNumber() : "");
                map.put("customerName", c.getCustomerName() != null ? c.getCustomerName() : "");
                map.put("amount", c.getAmount() != null ? c.getAmount() : 0.0);
                map.put("daysOverdue", c.getDaysOverdue() != null ? c.getDaysOverdue() : 0);
                map.put("serviceType", c.getServiceType() != null ? c.getServiceType().name() : "");
                map.put("pastDefaults", c.getPastDefaults() != null ? c.getPastDefaults() : 0);
                map.put("status", c.getStatus() != null ? c.getStatus().name() : "");
                map.put("assignedTo", c.getAssignedTo() != null ? c.getAssignedTo() : "");
                map.put("propensityScore", c.getPropensityScore() != null ? c.getPropensityScore() : "");
                return map;
            }).collect(Collectors.toList());

            StringWriter writer = new StringWriter();
            mapper.writerFor(List.class)
                    .with(schemaBuilder.build())
                    .writeValue(writer, dataList);

            return writer.toString();
        } catch (Exception e) {
            return "Error exporting to CSV: " + e.getMessage();
        }
    }

    public String exportCasesToJSON(List<DebtCaseEntity> cases) {
        try {
            List<Map<String, Object>> dataList = cases.stream().map(c -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("invoiceNumber", c.getInvoiceNumber());
                map.put("customerName", c.getCustomerName());
                map.put("amount", c.getAmount());
                map.put("daysOverdue", c.getDaysOverdue());
                map.put("serviceType", c.getServiceType() != null ? c.getServiceType().name() : null);
                map.put("pastDefaults", c.getPastDefaults());
                map.put("status", c.getStatus() != null ? c.getStatus().name() : null);
                map.put("assignedTo", c.getAssignedTo());
                map.put("propensityScore", c.getPropensityScore());
                return map;
            }).collect(Collectors.toList());

            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(dataList);
        } catch (Exception e) {
            return "Error exporting to JSON: " + e.getMessage();
        }
    }

    public String exportCasesWithInvestData(List<DebtCaseEntity> cases) {
        try {
            List<Map<String, Object>> dataList = new ArrayList<>();
            for (DebtCaseEntity c : cases) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("invoiceNumber", c.getInvoiceNumber());
                map.put("customerName", c.getCustomerName());
                map.put("amount", c.getAmount());
                map.put("daysOverdue", c.getDaysOverdue());
                map.put("serviceType", c.getServiceType() != null ? c.getServiceType().name() : "");
                map.put("pastDefaults", c.getPastDefaults());
                map.put("status", c.getStatus() != null ? c.getStatus().name() : "");
                map.put("agencyId", c.getAssignedTo() != null ? c.getAssignedTo() : "");
                map.put("propensityScore", c.getPropensityScore());

                // Get invest data
                Optional<DebtInvestEntity> investOpt = debtInvestRepository.findByCaseEntity(c);
                if (investOpt.isPresent()) {
                    DebtInvestEntity invest = investOpt.get();
                    map.put("agentEmail", invest.getAssignedToEmail() != null ? invest.getAssignedToEmail() : "");
                    map.put("stage", invest.getStage() != null ? invest.getStage().name() : "");
                    map.put("agentMessage", invest.getMessage() != null ? invest.getMessage() : "");
                } else {
                    map.put("agentEmail", "");
                    map.put("stage", "");
                    map.put("agentMessage", "");
                }

                dataList.add(map);
            }

            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsString(dataList);
        } catch (Exception e) {
            return "Error exporting to JSON: " + e.getMessage();
        }
    }

    public Map<String, Object> getExportSummary() {
        Map<String, Object> summary = new HashMap<>();
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

        long collectedCount = debtInvestRepository.countByStage(Stage.COLLECTED);
        long pendingCount = debtInvestRepository.countByStage(Stage.PENDING) +
                           debtInvestRepository.countByStage(Stage.IN_PROGRESS);
        long disputedCount = debtInvestRepository.countByStage(Stage.DISPUTED);

        summary.put("totalCases", totalCases);
        summary.put("totalAmount", totalAmount);
        summary.put("assignedCases", assignedCount);
        summary.put("unassignedCases", unassignedCount);
        summary.put("collectedCases", collectedCount);
        summary.put("pendingCases", pendingCount);
        summary.put("disputedCases", disputedCount);
        summary.put("assignmentRate", totalCases > 0 ? (double) assignedCount / totalCases * 100 : 0.0);
        summary.put("collectionRate", totalCases > 0 ? (double) collectedCount / totalCases * 100 : 0.0);

        return summary;
    }

    public List<DebtCaseEntity> filterCases(
            String status,
            String stage,
            Double minAmount,
            Double maxAmount,
            Integer minDaysOverdue,
            String sortBy,
            boolean ascending) {

        List<DebtCaseEntity> cases = debtCaseRepository.findAll();

        // Apply filters
        if (status != null && !status.isEmpty()) {
            Status statusEnum = Status.valueOf(status);
            cases = cases.stream()
                    .filter(c -> c.getStatus() == statusEnum)
                    .collect(Collectors.toList());
        }

        if (stage != null && !stage.isEmpty()) {
            Stage stageEnum = Stage.valueOf(stage);
            cases = cases.stream()
                    .filter(c -> {
                        Optional<DebtInvestEntity> investOpt = debtInvestRepository.findByCaseEntity(c);
                        return investOpt.isPresent() && investOpt.get().getStage() == stageEnum;
                    })
                    .collect(Collectors.toList());
        }

        if (minAmount != null) {
            cases = cases.stream()
                    .filter(c -> c.getAmount() != null && c.getAmount() >= minAmount)
                    .collect(Collectors.toList());
        }

        if (maxAmount != null) {
            cases = cases.stream()
                    .filter(c -> c.getAmount() != null && c.getAmount() <= maxAmount)
                    .collect(Collectors.toList());
        }

        if (minDaysOverdue != null) {
            cases = cases.stream()
                    .filter(c -> c.getDaysOverdue() != null && c.getDaysOverdue() >= minDaysOverdue)
                    .collect(Collectors.toList());
        }

        // Apply sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            Comparator<DebtCaseEntity> comparator = switch (sortBy.toLowerCase()) {
                case "amount" -> Comparator.comparing(DebtCaseEntity::getAmount);
                case "daysoverdue" -> Comparator.comparing(DebtCaseEntity::getDaysOverdue);
                case "customername" -> Comparator.comparing(DebtCaseEntity::getCustomerName,
                        Comparator.nullsLast(Comparator.naturalOrder()));
                case "invoicenumber" -> Comparator.comparing(DebtCaseEntity::getInvoiceNumber);
                default -> Comparator.comparing(DebtCaseEntity::getId);
            };

            if (!ascending) {
                comparator = comparator.reversed();
            }

            cases = cases.stream().sorted(comparator).collect(Collectors.toList());
        }

        return cases;
    }
}

