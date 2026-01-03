package com.iit.fedex.controller;

import com.iit.fedex.dto.AIPredictionDTO;
import com.iit.fedex.dto.BatchAIPredictionDTO;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import com.iit.fedex.pythonService.AIResponseIntegration;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIResponseIntegration aiIntegration;
    private final DebtCaseRepository debtCaseRepository;

    public AIController(AIResponseIntegration aiIntegration, DebtCaseRepository debtCaseRepository) {
        this.aiIntegration = aiIntegration;
        this.debtCaseRepository = debtCaseRepository;
    }

    @GetMapping("/health")
    public Map<String, Object> checkAIHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("aiServiceAvailable", aiIntegration.isAIServiceAvailable());
        health.put("timestamp", java.time.LocalDateTime.now());
        return health;
    }

    @GetMapping("/score/{invoiceNumber}")
    public ResponseEntity<AIPredictionDTO> getCaseScore(@PathVariable String invoiceNumber) {
        DebtCaseEntity caseEntity = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
        
        if (caseEntity == null) {
            return ResponseEntity.notFound().build();
        }
        
        Double score = caseEntity.getPropensityScore();
        if (score == null) {
            // Trigger AI scoring
            score = aiIntegration.scoreCase(caseEntity);
            if (score != null) {
                caseEntity.setPropensityScore(score);
                debtCaseRepository.save(caseEntity);
            }
        }
        
        String recommendedAction = determineRecommendedAction(score);
        String reasoning = generateReasoning(score, caseEntity);
        
        AIPredictionDTO prediction = new AIPredictionDTO(
                invoiceNumber,
                score != null ? score : -1.0,
                recommendedAction,
                score != null ? score * (caseEntity.getAmount() != null ? caseEntity.getAmount() : 0) : 0,
                score != null ? Math.min(score * 1.2, 95.0) : 0.0,
                reasoning
        );
        
        return ResponseEntity.ok(prediction);
    }

    @PostMapping("/score/batch")
    public ResponseEntity<BatchAIPredictionDTO> scoreBatch(@RequestBody List<String> invoiceNumbers) {
        List<AIPredictionDTO> predictions = new ArrayList<>();
        double totalScore = 0;
        int validScores = 0;
        
        for (String invoiceNumber : invoiceNumbers) {
            DebtCaseEntity caseEntity = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
            
            if (caseEntity != null) {
                Double score = caseEntity.getPropensityScore();
                if (score == null) {
                    score = aiIntegration.scoreCase(caseEntity);
                    if (score != null) {
                        caseEntity.setPropensityScore(score);
                        debtCaseRepository.save(caseEntity);
                    }
                }
                
                String recommendedAction = determineRecommendedAction(score);
                
                predictions.add(new AIPredictionDTO(
                        invoiceNumber,
                        score != null ? score : -1.0,
                        recommendedAction,
                        score != null ? score * (caseEntity.getAmount() != null ? caseEntity.getAmount() : 0) : 0,
                        score != null ? Math.min(score * 1.2, 95.0) : 0.0,
                        generateReasoning(score, caseEntity)
                ));
                
                if (score != null) {
                    totalScore += score;
                    validScores++;
                }
            }
        }
        
        double avgScore = validScores > 0 ? totalScore / validScores : 0;
        
        BatchAIPredictionDTO batchResult = new BatchAIPredictionDTO(
                invoiceNumbers.size(),
                predictions.size(),
                avgScore,
                predictions
        );
        
        return ResponseEntity.ok(batchResult);
    }

    @PostMapping("/score/all-unassigned")
    public ResponseEntity<BatchAIPredictionDTO> scoreAllUnassigned() {
        List<DebtCaseEntity> unassignedCases = debtCaseRepository.findByStatus(
                com.iit.fedex.assets.Status.UN_ASSIGNED);
        
        List<String> invoiceNumbers = unassignedCases.stream()
                .map(DebtCaseEntity::getInvoiceNumber)
                .collect(Collectors.toList());
        
        return scoreBatch(invoiceNumbers);
    }

    @GetMapping("/score/top/{limit}")
    public List<DebtCaseEntity> getTopScoredCases(@PathVariable int limit) {
        return debtCaseRepository.findAll().stream()
                .filter(c -> c.getPropensityScore() != null && c.getPropensityScore() >= 0)
                .sorted((a, b) -> Double.compare(b.getPropensityScore(), a.getPropensityScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @GetMapping("/score/statistics")
    public Map<String, Object> getScoreStatistics() {
        List<DebtCaseEntity> scoredCases = debtCaseRepository.findAll().stream()
                .filter(c -> c.getPropensityScore() != null && c.getPropensityScore() >= 0)
                .collect(Collectors.toList());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalScored", scoredCases.size());
        stats.put("totalCases", debtCaseRepository.count());
        
        if (!scoredCases.isEmpty()) {
            double avgScore = scoredCases.stream()
                    .mapToDouble(DebtCaseEntity::getPropensityScore)
                    .average().orElse(0);
            double maxScore = scoredCases.stream()
                    .mapToDouble(DebtCaseEntity::getPropensityScore)
                    .max().orElse(0);
            double minScore = scoredCases.stream()
                    .mapToDouble(DebtCaseEntity::getPropensityScore)
                    .min().orElse(0);
            
            stats.put("averageScore", avgScore);
            stats.put("maxScore", maxScore);
            stats.put("minScore", minScore);
            
            // Distribution
            long highPriority = scoredCases.stream()
                    .filter(c -> c.getPropensityScore() >= 70).count();
            long mediumPriority = scoredCases.stream()
                    .filter(c -> c.getPropensityScore() >= 40 && c.getPropensityScore() < 70).count();
            long lowPriority = scoredCases.stream()
                    .filter(c -> c.getPropensityScore() < 40).count();
            
            stats.put("highPriorityCount", highPriority);
            stats.put("mediumPriorityCount", mediumPriority);
            stats.put("lowPriorityCount", lowPriority);
        }
        
        return stats;
    }

    private String determineRecommendedAction(Double score) {
        if (score == null) return "Awaiting AI analysis";
        
        if (score >= 80) return "IMMEDIATE ACTION - High recovery probability";
        if (score >= 60) return "Priority outreach recommended";
        if (score >= 40) return "Standard follow-up procedures";
        if (score >= 20) return "Consider settlement options";
        return "Evaluate for write-off consideration";
    }

    private String generateReasoning(Double score, DebtCaseEntity caseEntity) {
        if (score == null) return "Case pending AI analysis";
        
        StringBuilder reasoning = new StringBuilder();
        reasoning.append("Recovery probability: ").append(String.format("%.1f%%", score));
        
        if (caseEntity.getDaysOverdue() != null) {
            reasoning.append(", Days overdue: ").append(caseEntity.getDaysOverdue());
        }
        
        if (caseEntity.getAmount() != null) {
            reasoning.append(", Amount: $").append(caseEntity.getAmount());
        }
        
        if (caseEntity.getPastDefaults() != null && caseEntity.getPastDefaults() > 0) {
            reasoning.append(", Past defaults: ").append(caseEntity.getPastDefaults());
        }
        
        return reasoning.toString();
    }
}

