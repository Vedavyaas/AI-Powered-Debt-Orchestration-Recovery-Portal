package com.iit.fedex.dto;

import java.util.List;

/**
 * DTO for bulk stage update operations
 */
public record BulkStageUpdateDTO(
        List<String> invoiceNumbers,
        String stage
) {
}

