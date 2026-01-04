package com.iit.fedex.config;

import com.iit.fedex.assets.Role;
import com.iit.fedex.assets.Service;
import com.iit.fedex.assets.Stage;
import com.iit.fedex.assets.Status;
import com.iit.fedex.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class SampleDataInitializer implements CommandLineRunner {

    private static final String SEED_ENTITY_TYPE = "SYSTEM";
    private static final String SEED_ENTITY_ID = "SAMPLE_DATA_V1";

    private static final String ADMIN_EMAIL = "admin@fedex.local";
    private static final String MANAGER_EMAIL = "manager@dca.local";
    private static final String AGENT1_EMAIL = "agent1@dca.local";
    private static final String AGENT2_EMAIL = "agent2@dca.local";

    private static final String AGENCY_ALPHA = "AGENCY_ALPHA";
    private static final String AGENCY_BETA = "AGENCY_BETA";

    private final JWTLoginRepository jwtLoginRepository;
    private final DebtCaseRepository debtCaseRepository;
    private final DebtInvestRepository debtInvestRepository;
    private final AuditLogRepository auditLogRepository;
    private final BackLogRepository backLogRepository;
    private final PasswordEncoder passwordEncoder;

    public SampleDataInitializer(
            JWTLoginRepository jwtLoginRepository,
            DebtCaseRepository debtCaseRepository,
            DebtInvestRepository debtInvestRepository,
            AuditLogRepository auditLogRepository,
            BackLogRepository backLogRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.jwtLoginRepository = jwtLoginRepository;
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.auditLogRepository = auditLogRepository;
        this.backLogRepository = backLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedUsers();
        seedDebtCasesAndInvestigations();
        seedAuditAndBacklog();
    }

    private void seedUsers() {
        ensureUser(ADMIN_EMAIL, "Password@123", Role.FEDEX_ADMIN, null);
        ensureUser(MANAGER_EMAIL, "Password@123", Role.DCA_MANAGER, AGENCY_ALPHA);
        ensureUser(AGENT1_EMAIL, "Password@123", Role.DCA_AGENT, AGENCY_ALPHA);
        ensureUser(AGENT2_EMAIL, "Password@123", Role.DCA_AGENT, AGENCY_BETA);
    }

    private void ensureUser(String email, String rawPassword, Role role, String agencyId) {
        var existingOpt = jwtLoginRepository.findByEmailIgnoreCase(email);
        if (existingOpt.isPresent()) {
            var existing = existingOpt.get();
            boolean changed = false;

            if (existing.getRole() != role) {
                existing.setRole(role);
                changed = true;
            }

            String existingAgency = existing.getAgencyId();
            if (agencyId == null) {
                if (existingAgency != null) {
                    existing.setAgencyId(null);
                    changed = true;
                }
            } else if (!agencyId.equals(existingAgency)) {
                existing.setAgencyId(agencyId);
                changed = true;
            }

            if (existing.getPassword() == null || !passwordEncoder.matches(rawPassword, existing.getPassword())) {
                existing.setPassword(passwordEncoder.encode(rawPassword));
                changed = true;
            }

            if (changed) {
                jwtLoginRepository.save(existing);
            }
            return;
        }

        var user = new JWTLoginEntity(email, passwordEncoder.encode(rawPassword), role, agencyId);
        jwtLoginRepository.save(user);
    }

    private void seedDebtCasesAndInvestigations() {
        // Debt cases (invoiceNumber is used as the natural key across the app)
        ensureDebtCase("INV-10001", "Acme Imports", 1250.75, 12, Service.EXPRESS, 0, Status.UN_ASSIGNED, null, 0.22);
        ensureDebtCase("INV-10002", "Blue Ocean Retail", 9800.00, 65, Service.GROUND, 2, Status.ASSIGNED, AGENCY_ALPHA, 0.81);
        ensureDebtCase("INV-10003", "Cedar Logistics", 420.10, 5, Service.FREIGHT, 0, Status.UN_ASSIGNED, null, 0.15);
        ensureDebtCase("INV-10004", "Delta Supplies", 15200.00, 92, Service.EXPRESS, 3, Status.ASSIGNED_AND_WAITING, AGENCY_BETA, 0.90);
        ensureDebtCase("INV-10005", "Evergreen Traders", 3100.50, 31, Service.GROUND, 1, Status.ASSIGNED, AGENCY_ALPHA, 0.67);

        // Investigations (one per case max in current repository API)
        ensureDebtInvest("INV-10002", AGENT1_EMAIL, Stage.IN_PROGRESS, "Reached customer; awaiting updated payment plan.");
        ensureDebtInvest("INV-10004", AGENT2_EMAIL, Stage.PROMISED_TO_PAY, "Customer promised to pay within 7 days.");
        ensureDebtInvest("INV-10005", AGENT1_EMAIL, Stage.DISPUTED, "Customer disputes charges; requested proof of delivery.");
    }

    private void ensureDebtCase(
            String invoiceNumber,
            String customerName,
            double amount,
            int daysOverdue,
            Service serviceType,
            int pastDefaults,
            Status status,
            String assignedTo,
            double propensityScore
    ) {
        DebtCaseEntity existing = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
        if (existing == null) {
            var created = new DebtCaseEntity(invoiceNumber, customerName, amount, daysOverdue, serviceType, pastDefaults);
            created.setStatus(status);
            created.setAssignedTo(assignedTo);
            created.setPropensityScore(propensityScore);
            debtCaseRepository.save(created);
            return;
        }

        boolean changed = false;

        if (!safeEquals(existing.getCustomerName(), customerName)) {
            existing.setCustomerName(customerName);
            changed = true;
        }
        if (existing.getAmount() == null || Double.compare(existing.getAmount(), amount) != 0) {
            existing.setAmount(amount);
            changed = true;
        }
        if (existing.getDaysOverdue() == null || existing.getDaysOverdue() != daysOverdue) {
            existing.setDaysOverdue(daysOverdue);
            changed = true;
        }
        if (existing.getServiceType() != serviceType) {
            existing.setServiceType(serviceType);
            changed = true;
        }
        if (existing.getPastDefaults() == null || existing.getPastDefaults() != pastDefaults) {
            existing.setPastDefaults(pastDefaults);
            changed = true;
        }
        if (existing.getStatus() != status) {
            existing.setStatus(status);
            changed = true;
        }
        if (!safeEquals(existing.getAssignedTo(), assignedTo)) {
            existing.setAssignedTo(assignedTo);
            changed = true;
        }
        if (existing.getPropensityScore() == null || Double.compare(existing.getPropensityScore(), propensityScore) != 0) {
            existing.setPropensityScore(propensityScore);
            changed = true;
        }

        if (changed) {
            debtCaseRepository.save(existing);
        }
    }

    private void ensureDebtInvest(String invoiceNumber, String assignedToEmail, Stage stage, String message) {
        DebtCaseEntity debtCase = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
        if (debtCase == null) {
            return;
        }

        var existingOpt = debtInvestRepository.findByCaseEntity(debtCase);
        if (existingOpt.isEmpty()) {
            var created = new DebtInvestEntity(debtCase, assignedToEmail);
            created.setStage(stage);
            created.setMessage(message);
            debtInvestRepository.save(created);
            return;
        }

        var existing = existingOpt.get();
        boolean changed = false;

        if (!safeEquals(existing.getAssignedToEmail(), assignedToEmail)) {
            existing.setAssignedToEmail(assignedToEmail);
            changed = true;
        }
        if (existing.getStage() != stage) {
            existing.setStage(stage);
            changed = true;
        }
        if (!safeEquals(existing.getMessage(), message)) {
            existing.setMessage(message);
            changed = true;
        }

        if (changed) {
            debtInvestRepository.save(existing);
        }
    }

    private void seedAuditAndBacklog() {
        // Seed only once (idempotent marker rows).
        boolean auditSeeded = auditLogRepository.existsByUserEmailAndActionAndEntityTypeAndEntityId(
                "seed@system",
                "SEED",
                SEED_ENTITY_TYPE,
                SEED_ENTITY_ID
        );

        if (!auditSeeded) {
            List<AuditLogEntity> audits = new ArrayList<>();
            audits.add(new AuditLogEntity(
                    "seed@system",
                    "SEED",
                    SEED_ENTITY_TYPE,
                    SEED_ENTITY_ID,
                    "Initialized sample data",
                    "127.0.0.1"
            ));

            audits.add(new AuditLogEntity(
                    ADMIN_EMAIL,
                    "LOGIN",
                    "User",
                    ADMIN_EMAIL,
                    "Sample admin logged in",
                    "127.0.0.1"
            ));

            audits.add(new AuditLogEntity(
                    MANAGER_EMAIL,
                    "ASSIGN_CASES",
                    "Agency",
                    AGENCY_ALPHA,
                    "Assigned invoices INV-10002, INV-10005",
                    "127.0.0.1"
            ));

            auditLogRepository.saveAll(audits);
        }

        boolean backlogSeeded = backLogRepository.existsByModuleAndActionAndEntityTypeAndEntityId(
                "SEED",
                "INIT",
                SEED_ENTITY_TYPE,
                SEED_ENTITY_ID
        );

        if (!backlogSeeded) {
            List<BackLogEntity> backlogs = new ArrayList<>();

            backlogs.add(createBacklog(
                    "INIT",
                    "SEED",
                    "Initialized sample data",
                    SEED_ENTITY_TYPE,
                    SEED_ENTITY_ID,
                    "{}",
                    "{\"ok\":true}",
                    "seed@system",
                    true,
                    null,
                    "POST",
                    "/seed"
            ));

            backlogs.add(createBacklog(
                    "CSV_UPLOAD",
                    "CSV",
                    "Sample CSV import simulated",
                    "DebtCase",
                    "INV-10001",
                    "{\"file\":\"sample.csv\"}",
                    "{\"imported\":5}",
                    ADMIN_EMAIL,
                    true,
                    null,
                    "POST",
                    "/put/CSV"
            ));

            backlogs.add(createBacklog(
                    "ASSIGN",
                    "DEBT",
                    "Assigned case to agency",
                    "DebtCase",
                    "INV-10002",
                    "{\"assignedTo\":\"" + AGENCY_ALPHA + "\"}",
                    "{\"status\":\"ASSIGNED\"}",
                    ADMIN_EMAIL,
                    true,
                    null,
                    "PUT",
                    "/put/assignedTo"
            ));

            backLogRepository.saveAll(backlogs);
        }
    }

    private BackLogEntity createBacklog(
            String action,
            String module,
            String description,
            String entityType,
            String entityId,
            String requestData,
            String responseData,
            String performedBy,
            boolean success,
            String errorMessage,
            String httpMethod,
            String endpoint
    ) {
        BackLogEntity b = new BackLogEntity();
        b.setAction(action);
        b.setModule(module);
        b.setDescription(description);
        b.setEntityType(entityType);
        b.setEntityId(entityId);
        b.setRequestData(requestData);
        b.setResponseData(responseData);
        b.setPerformedBy(performedBy);
        b.setIpAddress("127.0.0.1");
        b.setUserAgent("SampleDataInitializer");
        b.setTimestamp(LocalDateTime.now().minusHours(2));
        b.setDurationMs(15L);
        b.setSuccess(success);
        b.setErrorMessage(errorMessage);
        b.setHttpMethod(httpMethod);
        b.setEndpoint(endpoint);
        return b;
    }

    private boolean safeEquals(String a, String b) {
        if (a == null) {
            return b == null;
        }
        return a.equals(b);
    }
}
