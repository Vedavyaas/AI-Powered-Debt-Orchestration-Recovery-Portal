package com.iit.fedex.controller;

import com.iit.fedex.dto.PasswordResetRequestDTO;
import com.iit.fedex.service.ForgotPasswordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    public ForgotPasswordController(ForgotPasswordService forgotPasswordService) {
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        String result = forgotPasswordService.sendResetToken(email);
        
        if (result.contains("not found")) {
            response.put("error", "Email not found");
            return ResponseEntity.status(404).body(response);
        }
        
        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        
        String email = request.get("email");
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        if (email == null || token == null || newPassword == null) {
            response.put("error", "Missing required fields");
            return ResponseEntity.badRequest().body(response);
        }
        
        String result = forgotPasswordService.resetPassword(email, token, newPassword);
        
        if (result.contains("Invalid") || result.contains("expired")) {
            response.put("error", result);
            return ResponseEntity.status(400).body(response);
        }
        
        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password-confirm")
    public ResponseEntity<Map<String, String>> resetPasswordConfirm(
            @RequestParam String email,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword) {
        
        Map<String, String> response = new HashMap<>();
        
        if (!newPassword.equals(confirmPassword)) {
            response.put("error", "Passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (newPassword.length() < 8) {
            response.put("error", "Password must be at least 8 characters");
            return ResponseEntity.badRequest().body(response);
        }
        
        String result = forgotPasswordService.resetPasswordDirect(email, newPassword);
        
        if (result.contains("not found")) {
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }
        
        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Object>> validateResetToken(
            @RequestParam String email,
            @RequestParam String token) {
        
        Map<String, Object> response = new HashMap<>();
        boolean isValid = forgotPasswordService.validateResetToken(email, token);
        
        response.put("valid", isValid);
        if (!isValid) {
            response.put("error", "Invalid or expired token");
        }
        
        return ResponseEntity.ok(response);
    }
}

