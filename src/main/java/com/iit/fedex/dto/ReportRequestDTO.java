package com.iit.fedex.dto;

import java.time.LocalDateTime;

/**
 * DTO for report request with date range
 */
public record ReportRequestDTO(
        LocalDateTime startDate,
        LocalDateTime endDate,
        String reportType,
        String groupBy
) {
}

