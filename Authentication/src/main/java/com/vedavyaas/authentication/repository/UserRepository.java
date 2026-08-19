package com.vedavyaas.authentication.repository;

import com.vedavyaas.authentication.model.Role;
import com.vedavyaas.authentication.model.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByName(String name);

    boolean existsByNameOrEmailOrCompany_Name(String name, String email, String companyName);

    UserDTO findByName(String name, Sort sort);

    Page<UserDTO> findByCompany_NameAndRole(String companyName, Role role, Pageable pageable);

    boolean existsByName(String name);

    boolean existsByEmail(String email);

    Page<UserEntity> findByRoleAndSent(Role role, boolean sent, Pageable pageable);
}
