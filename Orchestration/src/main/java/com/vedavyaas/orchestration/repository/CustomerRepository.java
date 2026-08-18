package com.vedavyaas.orchestration.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {
    Page<CustomerEntity> findByManager_ManagerName(String managerManagerName, Pageable pageable);

    Optional<CustomerEntity> findByNameOrEmail(String name, String email);
}
