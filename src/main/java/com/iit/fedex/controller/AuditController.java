package com.iit.fedex.controller;

import com.iit.fedex.assets.Role;
import com.iit.fedex.repository.AuditLogEntity;
import com.iit.fedex.repository.AuditLogRepository;
import com.iit.fedex.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;

    public AuditController(AuditLogRepository auditLogRepository, AuditService auditService) {
        this.auditLogRepository = auditLogRepository;
        this.auditService = auditService;
    }

    @GetMapping("/my-activity")
    public List<AuditLogEntity> getMyActivity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return auditService.getRecentActivity(email, 24);
    }

    @GetMapping("/user/{email}")
    public List<AuditLogEntity> getUserActivity(@PathVariable String email) {
        return auditService.getUserActivity(email);
    }

    @GetMapping("/entity/{type}/{id}")
    public List<AuditLogEntity> getEntityHistory(@PathVariable String type, @PathVariable String id) {
        return auditService.getEntityHistory(type, id);
    }

    @GetMapping("/range")
    public Page<AuditLogEntity> getActivityRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return auditService.getActivityBetween(start, end, page, size);
    }

    @GetMapping("/stats")
    public Map<String, Object> getAuditStats(@RequestParam(defaultValue = "24") int hours) {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        
        stats.put("actionCounts", auditService.getActionCountsSince(since));
        stats.put("entityTypeCounts", auditService.getEntityTypeCountsSince(since));
        stats.put("periodHours", hours);
        
        return stats;
    }

    @GetMapping("/all")
    public Page<AuditLogEntity> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return auditLogRepository.findAll(PageRequest.of(page, size));
    }
}

