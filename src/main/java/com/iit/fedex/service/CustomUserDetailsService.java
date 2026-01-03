package com.iit.fedex.service;

import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class CustomUserDetailsService implements UserDetailsService {

    private final JWTLoginRepository jwtLoginRepository;
    public CustomUserDetailsService(JWTLoginRepository jwtLoginRepository) {
        this.jwtLoginRepository = jwtLoginRepository;
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        JWTLoginEntity jwtLoginEntity = jwtLoginRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return User.withUsername(jwtLoginEntity.getEmail())
                .password(jwtLoginEntity.getPassword())
                .roles(jwtLoginEntity.getRole().name())
                .build();
    }
}
