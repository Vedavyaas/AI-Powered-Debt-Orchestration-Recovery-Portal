package com.iit.fedex.dto;

import java.time.LocalDateTime;

/**
 * DTO for AI prediction response
 */
public record AIPredictionDTO(
        String invoiceNumber,
        Double propensityScore,
        String recommendedAction,
        Double predictedRecovery,
        Double confidenceLevel,
        String reasoning
) {
}

