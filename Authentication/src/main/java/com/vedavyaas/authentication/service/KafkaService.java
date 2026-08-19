package com.vedavyaas.authentication.service;

import com.vedavyaas.authentication.model.Role;
import com.vedavyaas.authentication.repository.UserEntity;
import com.vedavyaas.authentication.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KafkaService {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final UserRepository userRepository;

    public KafkaService(KafkaTemplate<String, String> kafkaTemplate, UserRepository userRepository) {
        this.kafkaTemplate = kafkaTemplate;
        this.userRepository = userRepository;
    }

    @Transactional
    @Scheduled(fixedDelay = 1_000)
    public void sendMessage() {
        Pageable pageable = PageRequest.of(1, 30);
        Page<UserEntity> userEntities = userRepository.findByRoleAndSent(Role.AGENT, false, pageable);

        if (userEntities.isEmpty()) return;

        for (var agent : userEntities) {
            kafkaTemplate.send("agent-topic", agent.getName());
            agent.setSent(true);
        }

        userRepository.saveAll(userEntities);
    }
}
