package com.iit.fedex.repository;

import com.iit.fedex.assets.Role;
import jakarta.persistence.*;

@Entity
public class JWTLoginEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
    private String agencyId;

    public JWTLoginEntity() {}

    public JWTLoginEntity(String email, String password, Role role, String agencyId) {
        this.email = email;
        this.password = password;
        this.role = role;
        this.agencyId = agencyId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
    
    public void setRoleFromString(String roleString) {
        if(roleString != null && !roleString.isEmpty()) {
            try {
                this.role = Role.valueOf(roleString);
            } catch (IllegalArgumentException e) {
                this.role = null;
            }
        } else {
            this.role = null;
        }
    }

    public String getAgencyId() {
        return agencyId;
    }

    public void setAgencyId(String agencyId) {
        this.agencyId = agencyId;
    }

    public Long getId() {
        return id;
    }
}
