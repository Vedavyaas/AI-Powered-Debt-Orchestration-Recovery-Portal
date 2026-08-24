package com.vedavyaas.assignment.repository;

import jakarta.persistence.*;

@Entity
public class WaitingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long debtId;

    public WaitingEntity() {
    }

    public WaitingEntity(Long debtId) {
        this.debtId = debtId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public Long getDebtId() {
        return debtId;
    }

    public void setDebtId(Long debtId) {
        this.debtId = debtId;
    }
}
