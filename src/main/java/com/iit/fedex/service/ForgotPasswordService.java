package com.iit.fedex.service;

import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.mail.SimpleMailMessage;
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
        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "Email not found";
        }

        String token = generateToken();
        resetTokens.put(email, token);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("NEXUS Platform | Password Reset Request");
        message.setText("Dear User,\n\n" +
                "You have requested a password reset for your NEXUS account.\n\n" +
                "Your reset code is: " + token + "\n\n" +
                "Please use this code to reset your password within the next hour.\n\n" +
                "Best Regards,\n" +
                "NEXUS System Administrator\n" +
                "FedEx Global Recovery Team");
        message.setFrom("testingxyz123456@gmail.com");

        javaMailSender.send(message);

        return "Reset code sent to your email";
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
}

