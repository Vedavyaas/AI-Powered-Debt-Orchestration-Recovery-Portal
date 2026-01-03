package com.iit.fedex.dto;

import java.util.Map;

public record CollectionStats(
    Long totalCases,
    Long assignedCases,
    Long unassignedCases,
    Double totalAmount,
    Double collectedAmount,
    Double pendingAmount,
    Map<String, Long> casesByStatus,
    Map<String, Double> amountByStatus,
    Long collectedCasesCount,
    Long pendingCasesCount,
    Long disputedCasesCount
) {
}

