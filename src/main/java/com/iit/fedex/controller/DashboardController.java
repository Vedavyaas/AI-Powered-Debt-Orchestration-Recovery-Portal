package com.iit.fedex.controller;

import com.iit.fedex.dto.DashboardSummary;
import com.iit.fedex.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummary getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }

    @GetMapping("/stats")
    public DashboardStats getDashboardStats() {
        DashboardSummary summary = dashboardService.getDashboardSummary();
        return new DashboardStats(
                summary.totalCases(),
                summary.totalAgents(),
                summary.totalManagers(),
                summary.totalPortfolioValue(),
                summary.pendingCases(),
                summary.collectedToday()
        );
    }

    // Inner class for simplified stats response
    public record DashboardStats(
            Long totalCases,
            Long totalAgents,
            Long totalManagers,
            Double totalPortfolioValue,
            Long pendingCases,
            Long collectedToday
    ) {}
}

