package com.vedavyaas.orchestration.service;

import com.vedavyaas.orchestration.model.DebtKafkaModel;
import com.vedavyaas.orchestration.repository.DebtEntity;
import com.vedavyaas.orchestration.repository.DebtRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;


@Service
public class KafkaService {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final DebtRepository debtRepository;

    public KafkaService(KafkaTemplate<String, String> kafkaTemplate, DebtRepository debtRepository) {
        this.kafkaTemplate = kafkaTemplate;
        this.debtRepository = debtRepository;
    }

    @Transactional
    @Scheduled(fixedDelay = 5_000)
    public void sendMessage() {
        Pageable pageable = PageRequest.of(0, 30);
        Page<DebtEntity> debtEntities = debtRepository.findBySent(false, pageable);

        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy");

        for (var debt : debtEntities) {
            String managerName = debt.getManagerName().getManagerName();

            DebtKafkaModel debtKafkaModel = new DebtKafkaModel(debt.getDebtName(), managerName);
            kafkaTemplate.send("debt-topic", debtKafkaModel.debtName() + "EOF" + debtKafkaModel.managerName());

            String message = debt.getDebtName()
                    + "EOF" + managerName
                    + "EOF" + debt.getPrincipalAmount()
                    + "EOF" + debt.getOutstandingAmount()
                    + "EOF" + formatter.format(debt.getDueDate());
            kafkaTemplate.send("debt-request-topic", message);
            debt.setSent(true);
        }

        debtRepository.saveAll(debtEntities);
    }

    public void sendMessageStatus(String debtName, String change) {
        kafkaTemplate.send("debt-approval", debtName + "EOF" + change);
    }
}
