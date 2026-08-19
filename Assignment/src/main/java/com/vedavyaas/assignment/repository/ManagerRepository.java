package com.vedavyaas.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ManagerRepository extends JpaRepository<ManagerEntity, Long> {
    Optional<ManagerEntity> findByManagerName(String managerName);
}
