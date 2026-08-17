package com.vedavyaas.orchestration.repository;

import com.vedavyaas.orchestration.model.Status;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Date;

@Entity
public class DebtEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_entity_id")
    private CustomerEntity customerEntity;

    private Double principalAmount;
    private Double outstandingAmount;
    private Date dueDate;
    private Status status;
    private Instant createdAt;
    private Instant modifiedAt;

    public DebtEntity() {
    }

    public DebtEntity(CustomerEntity customerEntity, Double principalAmount, Double outstandingAmount, Date dueDate, Status status) {
        this.customerEntity = customerEntity;
        this.principalAmount = principalAmount;
        this.outstandingAmount = outstandingAmount;
        this.dueDate = dueDate;
        this.status = status;
        this.createdAt = this.modifiedAt = Instant.now();
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public CustomerEntity getCustomerEntity() {
        return customerEntity;
    }

    public void setCustomerEntity(CustomerEntity customerEntity) {
        this.customerEntity = customerEntity;
    }

    public Double getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(Double principalAmount) {
        this.principalAmount = principalAmount;
    }

    public Double getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(Double outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }

    public Date getDueDate() {
        return dueDate;
    }

    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
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

    public Instant getModifiedAt() {
        return modifiedAt;
    }

    public void setModifiedAt(Instant modifiedAt) {
        this.modifiedAt = modifiedAt;
    }
}