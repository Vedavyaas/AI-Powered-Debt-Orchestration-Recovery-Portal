package com.iit.fedex.repository;

import com.iit.fedex.assets.Service;
import com.iit.fedex.assets.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DebtCaseRepository extends JpaRepository<DebtCaseEntity, Long> {

    @Query("update DebtCaseEntity d set d.assignedTo = :assignedTo, d.status = :status where d.invoiceNumber = :invoiceNumber")
    @Modifying
    void updateAssignedToAndStatusByInvoiceNumber(String assignedTo, Status status, String invoiceNumber);

    List<DebtCaseEntity> findByAssignedTo(String assignedTo);

    DebtCaseEntity findByInvoiceNumber(String invoiceNumber);

    List<DebtCaseEntity> findByStatus(Status status);

    List<DebtCaseEntity> findByCustomerNameContainingIgnoreCase(String customerName);

    long countByStatus(Status status);

    @Query("SELECT SUM(d.amount) FROM DebtCaseEntity d WHERE d.status = :status")
    Double sumAmountByStatus(Status status);

    @Query("SELECT COUNT(d) FROM DebtCaseEntity d WHERE d.status = :status")
    long countByStatusEnum(Status status);

    List<DebtCaseEntity> findByServiceType(Service serviceType);

    @Query("SELECT d FROM DebtCaseEntity d WHERE d.status = :status AND d.assignedTo = :assignedTo")
    List<DebtCaseEntity> findByStatusAndAssignedTo(Status status, String assignedTo);
}
