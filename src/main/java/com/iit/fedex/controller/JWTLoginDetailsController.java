package com.iit.fedex.controller;

import com.iit.fedex.service.JWTLoginDetailsService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JWTLoginDetailsController {

    private final JWTLoginDetailsService jwtLoginDetailsService;

    public JWTLoginDetailsController(JWTLoginDetailsService jwtLoginDetailsService) {
        this.jwtLoginDetailsService = jwtLoginDetailsService;
    }

    @PostMapping("/change/agencyID")
    public String changeAgencyID(@RequestParam String agencyID) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return jwtLoginDetailsService.changeAgencyID(email, agencyID);
    }

    @DeleteMapping("/delete/account")
    public String deleteAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return jwtLoginDetailsService.deleteAccount(email);
    }
}
