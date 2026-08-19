package com.vedavyaas.assignment.repository;

import com.vedavyaas.assignment.model.Status;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.List;

@Entity
public class DebtEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String debtName;

    @ManyToOne
    @JoinColumn(name = "agent_entity_id")
    private AgentEntity agentEntity;

    @ManyToOne
    @JoinColumn(name = "manager_entity_id")
    private ManagerEntity managerEntity;

    private Double recoveryProbability;
    private Double trustScore;
    private Integer niceValue;
    private List<String> sightInformation;
    private boolean calculated;

    @Enumerated(value = EnumType.STRING)
    private Status status;

    private Instant createdAt;
    private Instant completedAt;

    public ManagerEntity getManagerEntity() {
        return managerEntity;
    }

    public void setManagerEntity(ManagerEntity managerEntity) {
        this.managerEntity = managerEntity;
    }

    public DebtEntity() {
    }

    public DebtEntity(String debtName, ManagerEntity managerEntity) {
        this.debtName = debtName;
        this.managerEntity = managerEntity;
        this.calculated = false;
        this.status = Status.PENDING;
        this.createdAt = Instant.now();
    }

    public DebtEntity(String debtName, ManagerEntity managerEntity, Double recoveryProbability, Double trustScore, Integer niceValue) {
        this.debtName = debtName;
        this.managerEntity = managerEntity;
        this.recoveryProbability = recoveryProbability;
        this.trustScore = trustScore;
        this.niceValue = niceValue;
        this.calculated = true;
        this.status = Status.PENDING;
        this.createdAt = Instant.now();
    }

    public AgentEntity getAgentEntity() {
        return agentEntity;
    }

    public void setAgentEntity(AgentEntity agentEntity) {
        this.agentEntity = agentEntity;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getDebtName() {
        return debtName;
    }

    public void setDebtName(String debtName) {
        this.debtName = debtName;
    }

    public Double getRecoveryProbability() {
        return recoveryProbability;
    }

    public void setRecoveryProbability(Double recoveryProbability) {
        this.recoveryProbability = recoveryProbability;
    }

    public Double getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(Double trustScore) {
        this.trustScore = trustScore;
    }

    public Integer getNiceValue() {
        return niceValue;
    }

    public void setNiceValue(Integer niceValue) {
        this.niceValue = niceValue;
    }

    public List<String> getSightInformation() {
        return sightInformation;
    }

    public void setSightInformation(List<String> sightInformation) {
        this.sightInformation.addAll(sightInformation);
    }

    public boolean isCalculated() {
        return calculated;
    }

    public void setCalculated(boolean calculated) {
        this.calculated = calculated;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
