package com.iit.fedex.service;

import com.iit.fedex.repository.AuditLogEntity;
import com.iit.fedex.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void logAction(String action, String entityType, String entityId, 
                         String details, String ipAddress, boolean success) {
        try {
            String userEmail = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getName()
                    : "SYSTEM";

            AuditLogEntity auditLog = new AuditLogEntity(
                    userEmail,
                    action,
                    entityType,
                    entityId,
                    details,
                    ipAddress
            );
            
            auditLog.setStatus(success ? AuditLogEntity.ActionStatus.SUCCESS 
                                       : AuditLogEntity.ActionStatus.FAILURE);
            
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Don't let logging failures affect main operations
            System.err.println("Failed to log audit action: " + e.getMessage());
        }
    }

    public void logLogin(String email, String ipAddress, boolean success) {
        logAction("LOGIN", "USER", email, 
                "User login attempt", ipAddress, success);
    }

    public void logLogout(String email, String ipAddress) {
        logAction("LOGOUT", "USER", email, 
                "User logged out", ipAddress, true);
    }

    public void logCaseUpdate(String invoiceNumber, String changes, String ipAddress) {
        logAction("UPDATE", "DEBT_CASE", invoiceNumber, 
                changes, ipAddress, true);
    }

    public void logCaseAssignment(String invoiceNumber, String assignedTo, String ipAddress) {
        logAction("ASSIGN", "DEBT_CASE", invoiceNumber, 
                "Assigned to: " + assignedTo, ipAddress, true);
    }

    public void logStageChange(String invoiceNumber, String fromStage, String toStage, String ipAddress) {
        logAction("STAGE_CHANGE", "DEBT_INVEST", invoiceNumber,
                String.format("Changed from %s to %s", fromStage, toStage), ipAddress, true);
    }

    public void logCSVUpload(String filename, int recordCount, String ipAddress) {
        logAction("CSV_UPLOAD", "BULK_IMPORT", filename,
                String.format("Uploaded %d records", recordCount), ipAddress, true);
    }

    public List<AuditLogEntity> getUserActivity(String userEmail) {
        return auditLogRepository.findByUserEmailOrderByTimestampDesc(userEmail);
    }

    public List<AuditLogEntity> getEntityHistory(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    public Page<AuditLogEntity> getActivityBetween(LocalDateTime start, LocalDateTime end, int page, int size) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(
                start, end, PageRequest.of(page, size));
    }

    public List<AuditLogEntity> getRecentActivity(String userEmail, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return auditLogRepository.findRecentByUser(userEmail, since);
    }

    public Map<String, Long> getActionCountsSince(LocalDateTime since) {
        List<Object[]> results = auditLogRepository.countActionsSince(since);
        return results.stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    public Map<String, Long> getEntityTypeCountsSince(LocalDateTime since) {
        List<Object[]> results = auditLogRepository.countByEntityTypeSince(since);
        return results.stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }
}

