package com.vedavyaas.assignment.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DebtRepository extends JpaRepository<DebtEntity, Long> {
    Optional<DebtEntity> findByDebtName(String debtName);

    Optional<List<DebtEntity>> findByAgentEntity(AgentEntity agentEntity);

    Page<DebtEntity> findByAgentEntity(AgentEntity agentEntity, Pageable pageable);

    Optional<DebtEntity> findByIdAndAgentEntity(Long id, AgentEntity agentEntity);

    Optional<DebtEntity> findByIdAndManagerEntity(Long id, ManagerEntity managerEntity);

    Optional<DebtEntity> findByDebtNameAndManagerEntity(String debtName, ManagerEntity managerEntity);
}
