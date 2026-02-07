package com.iit.fedex.service;

import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CreateAccountService {
    private final PasswordEncoder passwordEncoder;
    private Map<String , String> map = new HashMap<>();
    private final JavaMailSender javaMailSender;

    private final JWTLoginRepository jwtLoginRepository;

    public CreateAccountService(JavaMailSender javaMailSender, JWTLoginRepository jwtLoginRepository, PasswordEncoder passwordEncoder) {
        this.javaMailSender = javaMailSender;
        this.jwtLoginRepository = jwtLoginRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private String Key(){
        return UUID.randomUUID().toString();
    }
    public String generateKey(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            return "Invalid email";
        }

        if (jwtLoginRepository.existsByEmailIgnoreCase(normalizedEmail)) {
             return "Email already exists";
        }

        String key = Key();
        map.put(normalizedEmail, key);

        org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
        message.setTo(normalizedEmail);
        message.setSubject("Account Verification");
        message.setText("Your verification key is: " + key);

        try {
            javaMailSender.send(message);
            return "Verification key sent to email";
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to send email";
        }
    }

    public String createAccount(JWTLoginEntity jwtLoginEntity, String key) {
        String email = jwtLoginEntity.getEmail();
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            return "Invalid email";
        }
        if (jwtLoginRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return "Email already exists";
        }

        // Development mode: allow account creation without OTP/key.
        // If a key is provided and matches, we still accept it.
        boolean keyVerified = key != null && !key.isBlank() && key.equals(map.get(normalizedEmail));
        boolean skipKeyVerification = key == null || key.isBlank();

        if (skipKeyVerification || keyVerified) {
            com.iit.fedex.assets.Role role = jwtLoginEntity.getRole();
            if (role == null) {
                role = com.iit.fedex.assets.Role.DCA_AGENT;
            } else {
                try {
                    com.iit.fedex.assets.Role.valueOf(role.name());
                } catch (IllegalArgumentException e) {
                    role = com.iit.fedex.assets.Role.DCA_AGENT;
                }
            }
            map.remove(normalizedEmail);
            jwtLoginEntity.setEmail(normalizedEmail);
            jwtLoginEntity.setRole(role);
            jwtLoginEntity.setPassword(passwordEncoder.encode(jwtLoginEntity.getPassword()));
            jwtLoginRepository.save(jwtLoginEntity);
            return "Account created successfully with role: " + role.name();
        }
        return "Verification failed please try again";
    }
}
