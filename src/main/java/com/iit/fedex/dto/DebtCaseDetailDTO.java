package com.iit.fedex.dto;

import java.time.LocalDateTime;

/**
 * DTO for debt case with additional metadata
 */
public record DebtCaseDetailDTO(
        Long id,
        String invoiceNumber,
        String customerName,
        Double amount,
        Integer daysOverdue,
        String serviceType,
        Integer pastDefaults,
        String status,
        String assignedTo,
        Double propensityScore,
        String stage,
        String agentEmail,
        String agentMessage,
        LocalDateTime lastUpdated,
        LocalDateTime createdAt
) {
}

