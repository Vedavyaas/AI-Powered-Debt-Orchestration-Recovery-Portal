package com.iit.fedex.controller;

import com.iit.fedex.repository.BackLogEntity;
import com.iit.fedex.service.BackLogService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for BackLog operations
 */
@RestController
@RequestMapping("/backlog")
public class BackLogController {

    private final BackLogService backLogService;

    public BackLogController(BackLogService backLogService) {
        this.backLogService = backLogService;
    }

    /**
     * Get all logs with pagination
     */
    @GetMapping
    public Page<BackLogEntity> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return backLogService.getAllLogs(page, size);
    }

    /**
     * Get logs for a specific user
     */
    @GetMapping("/user/{userEmail}")
    public List<BackLogEntity> getLogsByUser(@PathVariable String userEmail) {
        return backLogService.getLogsByUser(userEmail);
    }

    /**
     * Get logs for a specific module
     */
    @GetMapping("/module/{module}")
    public List<BackLogEntity> getLogsByModule(@PathVariable String module) {
        return backLogService.getLogsByModule(module);
    }

    /**
     * Get logs for a specific action
     */
    @GetMapping("/action/{action}")
    public List<BackLogEntity> getLogsByAction(@PathVariable String action) {
        return backLogService.getLogsByAction(action);
    }

    /**
     * Get logs for a specific entity
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public List<BackLogEntity> getLogsForEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        return backLogService.getLogsForEntity(entityType, entityId);
    }

    /**
     * Get logs within a time range
     */
    @GetMapping("/range")
    public Page<BackLogEntity> getLogsBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return backLogService.getLogsBetween(start, end, page, size);
    }

    /**
     * Get failed operations
     */
    @GetMapping("/failed")
    public Page<BackLogEntity> getFailedLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return backLogService.getFailedLogs(page, size);
    }

    /**
     * Get recent logs for a user
     */
    @GetMapping("/user/{userEmail}/recent")
    public List<BackLogEntity> getRecentLogsForUser(
            @PathVariable String userEmail,
            @RequestParam(defaultValue = "24") int hours) {
        return backLogService.getRecentLogsForUser(userEmail, hours);
    }

    /**
     * Get activity summary
     */
    @GetMapping("/summary")
    public Map<String, Object> getActivitySummary(
            @RequestParam(defaultValue = "24") int hours) {
        return backLogService.getActivitySummary(hours);
    }

    /**
     * Get module activity statistics
     */
    @GetMapping("/stats/module")
    public Map<String, Long> getModuleStats(
            @RequestParam(defaultValue = "24") int hours) {
        return backLogService.getModuleActivityStats(hours);
    }

    /**
     * Get action statistics
     */
    @GetMapping("/stats/action")
    public Map<String, Long> getActionStats(
            @RequestParam(defaultValue = "24") int hours) {
        return backLogService.getActionStats(hours);
    }

    /**
     * Search logs with filters
     */
    @GetMapping("/search")
    public Page<BackLogEntity> searchLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String userEmail,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return backLogService.searchLogs(module, action, userEmail, start, end, page, size);
    }

    /**
     * Get a specific log by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<BackLogEntity> getLogById(@PathVariable Long id) {
        BackLogEntity log = backLogService.getLogById(id);
        if (log != null) {
            return ResponseEntity.ok(log);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Create a manual log entry
     */
    @PostMapping
    public BackLogEntity createLog(@RequestBody LogCreateRequest request) {
        return backLogService.createLog(
                request.action(),
                request.module(),
                request.description(),
                request.performedBy(),
                request.ipAddress(),
                request.success()
        );
    }

    /**
     * Request DTO for creating a log
     */
    public record LogCreateRequest(
            String action,
            String module,
            String description,
            String performedBy,
            String ipAddress,
            Boolean success
    ) {}
}

