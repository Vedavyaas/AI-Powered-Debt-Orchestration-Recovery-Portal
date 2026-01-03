package com.iit.fedex.controller;

import com.iit.fedex.dto.AuthResponse;
import com.iit.fedex.dto.LoginRequest;
import com.iit.fedex.service.LoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = loginService.login(request);
        return ResponseEntity.ok(response);
    }
}

