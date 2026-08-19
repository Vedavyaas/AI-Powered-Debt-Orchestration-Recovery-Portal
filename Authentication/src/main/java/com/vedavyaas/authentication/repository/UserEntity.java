package com.vedavyaas.authentication.repository;

import com.vedavyaas.authentication.model.Role;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Table for maintaining details of the users including admin, managers and agents
 */

@Entity
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String name;
    private String password;

    @Enumerated(value = EnumType.STRING)
    private Role role;
    private String email;
    @ManyToOne(optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;
    private Instant createdAt;
    private Instant modifiedAt;
    private boolean enabled;
    private boolean sent;

    public UserEntity() {
    }

    public UserEntity(String name, String password, Role role, String email, CompanyEntity company) {
        this.name = name;
        this.password = password;
        this.role = role;
        this.email = email;
        this.company = company;
        this.createdAt = this.modifiedAt = Instant.now();
        this.enabled = true;
        this.sent = false;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public CompanyEntity getCompany() {
        return company;
    }

    public void setCompany(CompanyEntity company) {
        this.company = company;
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

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isSent() {
        return sent;
    }

    public void setSent(boolean sent) {
        this.sent = sent;
    }
}
