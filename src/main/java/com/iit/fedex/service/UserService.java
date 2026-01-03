package com.iit.fedex.service;

import com.iit.fedex.dto.UserProfileDTO;
import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final JWTLoginRepository jwtLoginRepository;

    public UserService(JWTLoginRepository jwtLoginRepository) {
        this.jwtLoginRepository = jwtLoginRepository;
    }

    public UserProfileDTO getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return jwtLoginRepository.findByEmail(email)
                .map(user -> new UserProfileDTO(
                        user.getEmail(),
                        user.getAgencyId(),
                        user.getRole().name(),
                        null, null, null
                ))
                .orElse(null);
    }

    public String updateProfile(UserProfileDTO profileDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return jwtLoginRepository.findByEmail(email)
                .map(user -> {
                    if (profileDTO.agencyId() != null) {
                        user.setAgencyId(profileDTO.agencyId());
                    }
                    jwtLoginRepository.save(user);
                    return "Profile updated successfully";
                })
                .orElse("User not found");
    }
}

