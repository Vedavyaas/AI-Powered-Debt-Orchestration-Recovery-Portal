package com.iit.fedex.pythonService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iit.fedex.assets.Status;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class AIResponseIntegration {

    private static final Logger logger = LoggerFactory.getLogger(AIResponseIntegration.class);
    
    @Value("${python.ai.url:http://localhost:8000}")
    private String pythonBaseUrl;
    
    private String getPythonUrl() {
        return pythonBaseUrl + "/predict";
    }
    
    private String getHealthUrl() {
        return pythonBaseUrl + "/health";
    }
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final DebtCaseRepository debtCaseRepository;

    public AIResponseIntegration(DebtCaseRepository debtCaseRepository) {
        this.debtCaseRepository = debtCaseRepository;
    }

    @Scheduled(fixedRate = 90000)
    @Transactional
    public void syncWithPythonAI() {
        List<DebtCaseEntity> debtCaseEntities = debtCaseRepository.findByStatus(Status.ASSIGNED);
        debtCaseEntities.addAll(debtCaseRepository.findByStatus(Status.UN_ASSIGNED));

        if (debtCaseEntities.isEmpty()) {
            return;
        }

        // Only process cases that haven't been scored yet
        debtCaseEntities.removeIf(debtCaseEntity -> debtCaseEntity.getPropensityScore() != null 
                && debtCaseEntity.getPropensityScore() >= 0);

        if (debtCaseEntities.isEmpty()) {
            return;
        }

        try {
            // Prepare data for Python service
            List<Map<String, Object>> caseData = new ArrayList<>();
            for (DebtCaseEntity entity : debtCaseEntities) {
                Map<String, Object> caseMap = new HashMap<>();
                caseMap.put("invoiceNumber", entity.getInvoiceNumber());
                caseMap.put("customerName", entity.getCustomerName());
                caseMap.put("amount", entity.getAmount());
                caseMap.put("daysOverdue", entity.getDaysOverdue());
                caseMap.put("serviceType", entity.getServiceType() != null ? entity.getServiceType().name() : "EXPRESS");
                caseMap.put("pastDefaults", entity.getPastDefaults());
                caseData.add(caseMap);
            }

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    getPythonUrl(), caseData, Map.class);

            if (responseEntity.getBody() != null) {
                Map<String, Object> response = responseEntity.getBody();
                List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
                
                if (predictions != null) {
                    int updatedCount = 0;
                    for (Map<String, Object> prediction : predictions) {
                        String invoiceNumber = (String) prediction.get("invoiceNumber");
                        Double propensityScore = ((Number) prediction.get("propensityScore")).doubleValue();
                        
                        DebtCaseEntity entity = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
                        if (entity != null) {
                            entity.setPropensityScore(propensityScore);
                            debtCaseRepository.save(entity);
                            updatedCount++;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Don't throw - scheduling should continue even if AI service is unavailable
        }
    }

    /**
     * Manually trigger AI scoring for a specific case
     */
    @Transactional
    public Double scoreCase(DebtCaseEntity caseEntity) {
        try {
            Map<String, Object> caseData = new HashMap<>();
            caseData.put("invoiceNumber", caseEntity.getInvoiceNumber());
            caseData.put("customerName", caseEntity.getCustomerName());
            caseData.put("amount", caseEntity.getAmount());
            caseData.put("daysOverdue", caseEntity.getDaysOverdue());
            caseData.put("serviceType", caseEntity.getServiceType() != null ? caseEntity.getServiceType().name() : "EXPRESS");
            caseData.put("pastDefaults", caseEntity.getPastDefaults());

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(
                    getPythonUrl(), List.of(caseData), Map.class);

            if (responseEntity.getBody() != null) {
                List<Map<String, Object>> predictions = (List<Map<String, Object>>) responseEntity.getBody().get("predictions");
                if (predictions != null && !predictions.isEmpty()) {
                    return ((Number) predictions.get(0).get("propensityScore")).doubleValue();
                }
            }
        } catch (Exception e) {
            // Silently ignore scoring failures
        }
        return null;
    }

    /**
     * Check if AI service is available
     */
    public boolean isAIServiceAvailable() {
        try {
            return restTemplate.getForEntity(getHealthUrl(), String.class)
                    .getStatusCode()
                    .is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }
}
