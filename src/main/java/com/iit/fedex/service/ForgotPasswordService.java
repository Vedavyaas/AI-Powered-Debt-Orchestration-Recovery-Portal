package com.iit.fedex.service;

import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ForgotPasswordService {

    private final JWTLoginRepository jwtLoginRepository;
    private final JavaMailSender javaMailSender;
    private final PasswordEncoder passwordEncoder;
    private Map<String, String> resetTokens = new HashMap<>();

    public ForgotPasswordService(JWTLoginRepository jwtLoginRepository, JavaMailSender javaMailSender, PasswordEncoder passwordEncoder) {
        this.jwtLoginRepository = jwtLoginRepository;
        this.javaMailSender = javaMailSender;
        this.passwordEncoder = passwordEncoder;
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    public String sendResetToken(String email) {
        // Email is disabled (SMTP config commented out). Keep endpoint behavior explicit.
        return "Password reset via email is disabled on this environment";

    }

    public String resetPassword(String email, String token, String newPassword) {
        String storedToken = resetTokens.get(email);
        if (storedToken == null || !storedToken.equals(token)) {
            return "Invalid or expired reset code";
        }

        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "User not found";
        }

        JWTLoginEntity user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        jwtLoginRepository.save(user);

        resetTokens.remove(email);

        return "Password reset successfully";
    }

    public String resetPasswordDirect(String email, String newPassword) {
        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "User not found";
        }

        JWTLoginEntity user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        jwtLoginRepository.save(user);

        return "Password reset successfully";
    }

    public boolean validateResetToken(String email, String token) {
        String storedToken = resetTokens.get(email);
        return storedToken != null && storedToken.equals(token);
    }
}

