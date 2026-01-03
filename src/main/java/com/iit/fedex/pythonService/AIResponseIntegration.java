package com.iit.fedex.pythonService;

import com.iit.fedex.assets.Status;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.repository.DebtCaseRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class AIResponseIntegration {

    private final String pythonUrl = "http://localhost:8000";

    private final RestTemplate restTemplate = new RestTemplate();

    private final DebtCaseRepository debtCaseRepository;

    public AIResponseIntegration(DebtCaseRepository debtCaseRepository) {
        this.debtCaseRepository = debtCaseRepository;
    }

    @Scheduled(fixedRate = 90000)
    @Transactional
    public void syncWithPythonAI() {
        List<DebtCaseEntity> debtCaseEntities = debtCaseRepository.findByStatus(Status.ASSIGNED);
        debtCaseEntities.addAll(debtCaseRepository.findByStatus(Status.UN_ASSIGNED));

        if (debtCaseEntities.isEmpty()) return;

        debtCaseEntities.removeIf(debtCaseEntity -> !debtCaseEntity.getPropensityScore().equals(-1.00));

        ResponseEntity<List> responseEntity = restTemplate.postForEntity(pythonUrl, debtCaseEntities, List.class);

    }
}