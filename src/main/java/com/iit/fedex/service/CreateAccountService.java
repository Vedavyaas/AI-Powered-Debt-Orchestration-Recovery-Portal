package com.iit.fedex.service;

import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.mail.SimpleMailMessage;
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

        map.put(normalizedEmail, Key());

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("PHEONIX Platform | Secure Access Invitation - FedEx DCA Management");
        message.setText("Dear User,\n\n" +
            "You have been invited to join the PHEONIX AI-Powered Debt Recovery Ecosystem. " +
                "Our platform leverages advanced Spring Boot security and Python ML to streamline " +
                "agency collaboration and recovery efficiency.\n\n" +
                "Your secure access key is: " + map.get(normalizedEmail) + "\n\n" +
            "Please use this key to complete your account registration on the PHEONIX portal. " +
                "This key is unique to your email and ensures 100% auditable access for compliance.\n\n" +
                "Best Regards,\n" +
            "PHEONIX System Administrator\n" +
                "FedEx Global Recovery Team");
        message.setFrom("testingxyz123456@gmail.com");

        javaMailSender.send(message);

        return "Code sent. Check your email.";
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

        if(key != null && key.equals(map.get(normalizedEmail))) {
            com.iit.fedex.assets.Role role = jwtLoginEntity.getRole();
            if(role == null) {
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
