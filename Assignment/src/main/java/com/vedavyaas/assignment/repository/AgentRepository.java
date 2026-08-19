package com.vedavyaas.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AgentRepository extends JpaRepository<AgentEntity, Long> {
    Optional<AgentEntity> findByAgentName(String agentName);
}
