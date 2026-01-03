package com.iit.fedex.controller;

import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.service.CreateAccountService;
import org.springframework.web.bind.annotation.*;

@RestController
public class CreateAccountController {

    private final CreateAccountService createAccountService;

    public CreateAccountController(CreateAccountService createAccountService){
        this.createAccountService=createAccountService;
    }

    @GetMapping("/get/OTP")
    public String getOTP(@RequestParam String email) {
        return createAccountService.generateKey(email);
    }

    @PostMapping("/create")
    public String createAccount(@RequestBody JWTLoginEntity jwtLoginEntity, @RequestParam String key) {
        return createAccountService.createAccount(jwtLoginEntity, key);
    }
}
