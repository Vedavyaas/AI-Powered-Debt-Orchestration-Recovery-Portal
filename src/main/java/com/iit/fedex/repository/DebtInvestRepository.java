package com.iit.fedex.repository;

import com.iit.fedex.assets.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DebtInvestRepository extends JpaRepository<DebtInvestEntity,Long> {
    List<DebtInvestEntity> findByAssignedToEmail(String assignedToEmail);

    Optional<DebtInvestEntity> findByCaseEntity(DebtCaseEntity caseEntity);

    @Query("update DebtInvestEntity d set d.stage = :stage where d.caseEntity = :caseEntity")
    @Modifying
    void updateStageByCaseEntity(Stage stage, DebtCaseEntity caseEntity);

    @Query("update DebtInvestEntity d set d.message = :message where d.caseEntity = :caseEntity")
    @Modifying
    void updateMessageByCaseEntity(String message, DebtCaseEntity caseEntity);

    long countByStage(Stage stage);

    List<DebtInvestEntity> findByStage(Stage stage);

    @Query("SELECT di FROM DebtInvestEntity di WHERE di.assignedToEmail = :email AND di.stage = :stage")
    List<DebtInvestEntity> findByAssignedToEmailAndStage(String email, Stage stage);

    @Query("SELECT COUNT(di) FROM DebtInvestEntity di WHERE di.stage = :stage")
    long countByStageEnum(Stage stage);
}
