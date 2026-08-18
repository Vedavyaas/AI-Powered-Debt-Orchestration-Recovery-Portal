package com.vedavyaas.orchestration.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DebtRepository extends JpaRepository<DebtEntity, Long> {
    boolean existsByDebtName(String debtName);

    @Query("SELECT new com.vedavyaas.orchestration.model.DebtDTO(d.id, d.debtName, c.name, m.managerName, d.principalAmount, d.outstandingAmount, d.dueDate, d.status) " +
           "FROM DebtEntity d JOIN d.customerEntity c JOIN d.managerName m " +
           "WHERE m.managerName = :managerName")
    Page<com.vedavyaas.orchestration.model.DebtDTO> findByManagerName_ManagerName(@Param("managerName") String managerName, Pageable pageable);
}
