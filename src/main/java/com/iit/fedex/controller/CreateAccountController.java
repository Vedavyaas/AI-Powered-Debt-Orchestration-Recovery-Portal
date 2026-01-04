package com.iit.fedex.controller;

import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.service.CreateAccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:8080"
})
public class CreateAccountController {

    private final CreateAccountService createAccountService;

    public CreateAccountController(CreateAccountService createAccountService){
        this.createAccountService=createAccountService;
    }

    @GetMapping("/get/OTP")
    public ResponseEntity<Map<String, String>> getOTP(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        String result = createAccountService.generateKey(email);

        if (result.toLowerCase().contains("invalid")) {
            response.put("error", result);
            return ResponseEntity.badRequest().body(response);
        }
        if (result.toLowerCase().contains("exists")) {
            response.put("error", result);
            return ResponseEntity.status(409).body(response);
        }

        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createAccount(@RequestBody JWTLoginEntity jwtLoginEntity, @RequestParam String key) {
        Map<String, String> response = new HashMap<>();
        String result = createAccountService.createAccount(jwtLoginEntity, key);

        String lower = result.toLowerCase();
        if (lower.contains("invalid")) {
            response.put("error", result);
            return ResponseEntity.badRequest().body(response);
        }
        if (lower.contains("exists")) {
            response.put("error", result);
            return ResponseEntity.status(409).body(response);
        }
        if (lower.contains("verification failed")) {
            response.put("error", result);
            return ResponseEntity.status(400).body(response);
        }

        response.put("message", result);
        return ResponseEntity.ok(response);
    }
}
