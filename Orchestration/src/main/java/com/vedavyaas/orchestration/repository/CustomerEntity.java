package com.vedavyaas.orchestration.repository;

import jakarta.persistence.*;

@Entity
public class CustomerEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;
    private String phoneNumber;
    private String email;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private ManagerEntity manager;

    public CustomerEntity() {
    }

    public CustomerEntity(String name, String phoneNumber, String email, ManagerEntity managerEntity) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.manager = managerEntity;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public ManagerEntity getManager() {
        return manager;
    }

    public void setManager(ManagerEntity manager) {
        this.manager = manager;
    }
}
