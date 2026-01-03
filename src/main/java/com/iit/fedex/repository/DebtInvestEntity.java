package com.iit.fedex.repository;

import com.iit.fedex.assets.Stage;
import jakarta.persistence.*;

@Entity
public class DebtInvestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "debt_case_id")
    private DebtCaseEntity caseEntity;
    private String assignedToEmail;
    @Enumerated(EnumType.STRING)
    private Stage stage;
    private String message;

    public DebtInvestEntity() {}

    public DebtInvestEntity(DebtCaseEntity caseEntity, String assignedToEmail) {
        this.caseEntity = caseEntity;
        this.assignedToEmail = assignedToEmail;
        this.stage = Stage.PENDING;
        this.message = null;
    }

    public DebtCaseEntity getCaseEntity() {
        return caseEntity;
    }

    public void setCaseEntity(DebtCaseEntity caseEntity) {
        this.caseEntity = caseEntity;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public void setAssignedToEmail(String assignedToEmail) {
        this.assignedToEmail = assignedToEmail;
    }

    public Stage getStage() {
        return stage;
    }

    public void setStage(Stage stage) {
        this.stage = stage;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
