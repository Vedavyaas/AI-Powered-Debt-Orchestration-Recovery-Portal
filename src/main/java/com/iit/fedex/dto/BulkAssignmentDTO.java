package com.iit.fedex.dto;

import java.util.List;

/**
 * DTO for bulk assignment of debt cases to agents
 */
public record BulkAssignmentDTO(
        List<String> invoiceNumbers,
        String agentEmail
) {
}

