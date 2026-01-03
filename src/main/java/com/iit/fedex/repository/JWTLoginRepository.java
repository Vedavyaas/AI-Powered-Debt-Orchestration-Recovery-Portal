package com.iit.fedex.repository;

import com.iit.fedex.assets.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface JWTLoginRepository extends JpaRepository<JWTLoginEntity, Long> {

    Optional<JWTLoginEntity> findByEmail(String username);

    boolean existsByEmail(String email);

    @Query("UPDATE JWTLoginEntity j SET j.agencyId = :agencyId WHERE j.email = :email")
    @Modifying
    void updateAgencyIdByEmail(String agencyId, String email);

    List<JWTLoginEntity> findAllByAgencyIdAndRole(String agencyId, Role role);
}
