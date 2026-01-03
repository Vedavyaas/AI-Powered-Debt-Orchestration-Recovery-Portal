 package com.iit.fedex.service;

import com.iit.fedex.repository.BackLogEntity;
import com.iit.fedex.repository.BackLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing BackLog entries
 */
@Service
public class BackLogService {

    private final BackLogRepository backLogRepository;

    public BackLogService(BackLogRepository backLogRepository) {
        this.backLogRepository = backLogRepository;
    }

    /**
     * Manually create a back log entry
     */
    public BackLogEntity createLog(String action, String module, String description,
                                   String performedBy, String ipAddress, boolean success) {
        BackLogEntity log = new BackLogEntity();
        log.setAction(action);
        log.setModule(module);
        log.setDescription(description);
        log.setPerformedBy(performedBy);
        log.setIpAddress(ipAddress);
        log.setSuccess(success);
        return backLogRepository.save(log);
    }

    /**
     * Asynchronous logging for non-intrusive tracking
     */
    @Async
    public void logAsync(String action, String module, String description,
                         String entityType, String entityId,
                         String performedBy, String ipAddress, boolean success,
                         String errorMessage) {
        try {
            BackLogEntity log = new BackLogEntity();
            log.setAction(action);
            log.setModule(module);
            log.setDescription(description);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setPerformedBy(performedBy);
            log.setIpAddress(ipAddress);
            log.setSuccess(success);
            log.setErrorMessage(errorMessage);
            backLogRepository.save(log);
        } catch (Exception e) {
            // Don't let logging failures affect main operations
        }
    }

    /**
     * Get all logs for a specific user
     */
    public List<BackLogEntity> getLogsByUser(String userEmail) {
        return backLogRepository.findByPerformedByOrderByTimestampDesc(userEmail);
    }

    /**
     * Get all logs for a specific module
     */
    public List<BackLogEntity> getLogsByModule(String module) {
        return backLogRepository.findByModuleOrderByTimestampDesc(module);
    }

    /**
     * Get all logs for a specific action
     */
    public List<BackLogEntity> getLogsByAction(String action) {
        return backLogRepository.findByActionOrderByTimestampDesc(action);
    }

    /**
     * Get logs for a specific entity
     */
    public List<BackLogEntity> getLogsForEntity(String entityType, String entityId) {
        return backLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    /**
     * Get logs within a time range with pagination
     */
    public Page<BackLogEntity> getLogsBetween(LocalDateTime start, LocalDateTime end, int page, int size) {
        return backLogRepository.findByTimestampBetweenOrderByTimestampDesc(start, end, PageRequest.of(page, size));
    }

    /**
     * Get failed operations
     */
    public Page<BackLogEntity> getFailedLogs(int page, int size) {
        return backLogRepository.findBySuccessOrderByTimestampDesc(false, PageRequest.of(page, size));
    }

    /**
     * Get recent logs for a user
     */
    public List<BackLogEntity> getRecentLogsForUser(String userEmail, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return backLogRepository.findRecentByUser(userEmail, since);
    }

    /**
     * Get activity statistics by module
     */
    public Map<String, Long> getModuleActivityStats(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Object[]> results = backLogRepository.countByModuleSince(since);
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    /**
     * Get activity statistics by action
     */
    public Map<String, Long> getActionStats(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Object[]> results = backLogRepository.countActionsSince(since);
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    /**
     * Get total activity count
     */
    public Long getTotalActivityCount(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return backLogRepository.countTotalSince(since);
    }

    /**
     * Get activity summary
     */
    public Map<String, Object> getActivitySummary(int hours) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalActivities", getTotalActivityCount(hours));
        summary.put("moduleStats", getModuleActivityStats(hours));
        summary.put("actionStats", getActionStats(hours));
        return summary;
    }

    /**
     * Search logs with filters
     */
    public Page<BackLogEntity> searchLogs(String module, String action, String userEmail,
                                          LocalDateTime start, LocalDateTime end,
                                          int page, int size) {
        return backLogRepository.searchBackLogs(module, action, userEmail, start, end, PageRequest.of(page, size));
    }

    /**
     * Get all logs with pagination
     */
    public Page<BackLogEntity> getAllLogs(int page, int size) {
        return backLogRepository.findAll(PageRequest.of(page, size));
    }

    /**
     * Get a specific log by ID
     */
    public BackLogEntity getLogById(Long id) {
        return backLogRepository.findById(id).orElse(null);
    }
}

