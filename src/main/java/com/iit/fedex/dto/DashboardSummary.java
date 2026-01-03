package com.iit.fedex.dto;

import java.util.List;

public record DashboardSummary(
    Long totalCases,
    Long totalAgents,
    Long totalManagers,
    Double totalPortfolioValue,
    Long pendingCases,
    Long collectedToday,
    Double collectedTodayAmount,
    Long casesThisWeek,
    Double casesThisWeekAmount,
    List<TopAgentDTO> topAgents,
    List<RecentCaseDTO> recentCases
) {
    
    public record TopAgentDTO(
        String email,
        String name,
        Long collectedCases,
        Double collectedAmount
    ) {}
    
    public record RecentCaseDTO(
        String invoiceNumber,
        String customerName,
        String status,
        String stage,
        Double amount
    ) {}
}

