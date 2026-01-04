package com.iit.fedex.controller;

import com.iit.fedex.dto.AuthResponse;
import com.iit.fedex.dto.LoginRequest;
import com.iit.fedex.dto.RefreshTokenRequest;
import com.iit.fedex.dto.ChangePasswordRequest;
import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import com.iit.fedex.service.LoginService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final LoginService loginService;
    private final JWTLoginRepository jwtLoginRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Simple in-memory token blacklist (in production, use Redis or database)
    private final Map<String, Long> tokenBlacklist = new ConcurrentHashMap<>();

    public AuthController(LoginService loginService, 
                         JWTLoginRepository jwtLoginRepository,
                         PasswordEncoder passwordEncoder) {
        this.loginService = loginService;
        this.jwtLoginRepository = jwtLoginRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = loginService.login(request);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            Map<String, Object> body = new HashMap<>();
            String message = ex.getReason() != null && !ex.getReason().isBlank() ? ex.getReason() : "Login failed";
            body.put("error", message);
            body.put("status", ex.getStatusCode().value());
            return ResponseEntity.status(ex.getStatusCode()).body(body);
        } catch (Exception ex) {
            Map<String, Object> body = new HashMap<>();
            body.put("error", "Login failed");
            body.put("status", HttpStatus.UNAUTHORIZED.value());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, String> response = new HashMap<>();
        
        // Add token to blacklist
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklist.put(token, System.currentTimeMillis() + 3600000); // Expire in 1 hour
        }
        
        // Clear security context
        SecurityContextHolder.clearContext();
        
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        Map<String, String> response = new HashMap<>();
        
        // Check if token is blacklisted
        if (tokenBlacklist.containsKey(request.token())) {
            response.put("error", "Token is invalid or expired");
            return ResponseEntity.status(401).body(null);
        }
        
        // Extract email from the current authentication context or decode from token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        JWTLoginEntity user = jwtLoginRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(null);
        }
        
        // Generate new tokens using LoginService
        try {
            LoginRequest loginRequest = new LoginRequest(user.getEmail(), "");
            AuthResponse authResponse = loginService.login(loginRequest);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            response.put("error", "Failed to refresh token: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("error", "Invalid authorization header");
            return ResponseEntity.status(401).body(response);
        }
        
        String token = authHeader.substring(7);
        
        // Check if token is blacklisted
        if (tokenBlacklist.containsKey(token)) {
            response.put("valid", false);
            response.put("error", "Token is revoked");
            return ResponseEntity.status(401).body(response);
        }
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        JWTLoginEntity user = jwtLoginRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            response.put("valid", false);
            response.put("error", "User not found");
            return ResponseEntity.status(401).body(response);
        }
        
        response.put("valid", true);
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        response.put("agencyId", user.getAgencyId());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/password-reset-confirm")
    public ResponseEntity<Map<String, String>> passwordResetConfirm(
            @RequestParam String email,
            @RequestParam String newPassword) {
        Map<String, String> response = new HashMap<>();
        
        JWTLoginEntity user = jwtLoginRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        jwtLoginRepository.save(user);
        
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest request) {
        Map<String, String> response = new HashMap<>();
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        JWTLoginEntity user = jwtLoginRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }
        
        // Verify current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            response.put("error", "Current password is incorrect");
            return ResponseEntity.status(401).body(response);
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        jwtLoginRepository.save(user);
        
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        JWTLoginEntity user = jwtLoginRepository.findByEmail(email).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("email", user.getEmail());
        userInfo.put("agencyId", user.getAgencyId());
        userInfo.put("role", user.getRole().name());
        
        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "NEXUS Auth Service");
        return ResponseEntity.ok(health);
    }

    public boolean isTokenBlacklisted(String token) {
        Long expiry = tokenBlacklist.get(token);
        if (expiry == null) return false;
        if (expiry < System.currentTimeMillis()) {
            tokenBlacklist.remove(token);
            return false;
        }
        return true;
    }
}

