package com.vedavyaas.authentication.controller;

import com.vedavyaas.authentication.model.CreateAccount;
import com.vedavyaas.authentication.model.JWTToken;
import com.vedavyaas.authentication.model.LoginCredentials;
import com.vedavyaas.authentication.model.Role;
import com.vedavyaas.authentication.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public controller — no authentication required.
 * Handles login and initial admin account registration.
 */
@RestController
@RequestMapping("/api")
public class LoginController {

    private final UserService userService;

    public LoginController(UserService userService) {
        this.userService = userService;
    }

    /** POST /api/authenticate — returns JWT token */
    @PostMapping("/authenticate")
    public ResponseEntity<JWTToken> authenticate(@RequestBody LoginCredentials loginCredentials) {
        return ResponseEntity.ok(userService.login(loginCredentials));
    }

    /** POST /api/register — public admin account registration (no token required) */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody CreateAccount accountCredentials) {
        // Always force ADMIN role for public registration endpoint
        CreateAccount admin = new CreateAccount(
                accountCredentials.name(),
                accountCredentials.password(),
                Role.ADMIN,
                accountCredentials.email(),
                accountCredentials.company()
        );
        return ResponseEntity.ok(userService.createAccount(admin));
    }
}
