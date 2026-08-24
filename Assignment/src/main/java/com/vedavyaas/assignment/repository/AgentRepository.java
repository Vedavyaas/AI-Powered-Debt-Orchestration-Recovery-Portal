package com.vedavyaas.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AgentRepository extends JpaRepository<AgentEntity, Long> {
    Optional<AgentEntity> findByAgentName(String agentName);

    List<AgentEntity> findAllByNiceValueGreaterThan(Integer niceValueIsGreaterThan);
}
