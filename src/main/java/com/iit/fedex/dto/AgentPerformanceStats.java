package com.iit.fedex.dto;

public record AgentPerformanceStats(
    String agentEmail,
    String agentName,
    Long totalCasesAssigned,
    Long casesCollected,
    Long casesPending,
    Long casesDisputed,
    Double collectionRate,
    Double totalAmountCollected,
    Double averageDaysToCollect
) {
}

