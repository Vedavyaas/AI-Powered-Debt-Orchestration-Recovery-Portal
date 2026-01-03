package com.iit.fedex.dto;

import java.util.List;

/**
 * DTO for batch AI scoring response
 */
public record BatchAIPredictionDTO(
        int totalCases,
        int processedCases,
        double averagePropensityScore,
        List<AIPredictionDTO> predictions
) {
}

