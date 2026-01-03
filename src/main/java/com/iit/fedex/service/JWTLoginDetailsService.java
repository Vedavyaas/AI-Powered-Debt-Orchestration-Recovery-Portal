package com.iit.fedex.service;

import com.iit.fedex.repository.JWTLoginRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class JWTLoginDetailsService {

    private final JWTLoginRepository jwtLoginRepository;

    public JWTLoginDetailsService(JWTLoginRepository jwtLoginRepository) {
        this.jwtLoginRepository = jwtLoginRepository;
    }

    @Transactional
    public String changeAgencyID(String email , String agencyID) {
        if(jwtLoginRepository.existsByEmail(email)){
            jwtLoginRepository.updateAgencyIdByEmail(agencyID, email);
            return "Agency ID changed successfully";
        }
        return "Failed to change Agency ID";
    }

    @Transactional
    public String deleteAccount(String email) {
        if(jwtLoginRepository.findByEmail(email).isPresent()){
            jwtLoginRepository.deleteById(jwtLoginRepository.findByEmail(email).get().getId());
            SecurityContextHolder.clearContext();
            return "Account deleted successfully";
        }
        return "Failed to delete account - user not found";
    }
}
