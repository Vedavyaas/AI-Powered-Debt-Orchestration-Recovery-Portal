package com.iit.fedex.controller;

import com.iit.fedex.dto.AgentPerformanceStats;
import com.iit.fedex.dto.CollectionStats;
import com.iit.fedex.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin/stats/collections")
    public CollectionStats getCollectionStats() {
        return analyticsService.getCollectionStats();
    }

    @GetMapping("/admin/stats/agent-performance")
    public List<AgentPerformanceStats> getAgentPerformance() {
        return analyticsService.getAgentPerformance();
    }
}

