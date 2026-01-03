package com.iit.fedex.controller;

import com.iit.fedex.service.ForgotPasswordService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    public ForgotPasswordController(ForgotPasswordService forgotPasswordService) {
        this.forgotPasswordService = forgotPasswordService;
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {
        return forgotPasswordService.sendResetToken(email);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        return forgotPasswordService.resetPassword(email, token, newPassword);
    }
}

