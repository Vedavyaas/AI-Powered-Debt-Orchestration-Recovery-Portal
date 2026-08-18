package com.vedavyaas.orchestration.controller;

import com.vedavyaas.orchestration.model.CustomerDTO;
import com.vedavyaas.orchestration.model.CustomerDetails;
import com.vedavyaas.orchestration.service.DebtService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debt/customer")
public class CustomerController {
    private final DebtService debtService;

    public CustomerController(DebtService debtService) {
        this.debtService = debtService;
    }

    @PostMapping
    public ResponseEntity<String> createCustomer(@RequestBody CustomerDetails customerDetails, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtService.createCustomer(customerDetails, jwt.getSubject()));
    }

    @GetMapping
    public ResponseEntity<Page<CustomerDTO>> getCustomer(@RequestParam("pageStart") Integer pageStart, @RequestParam("pageSize") Integer pageSize, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtService.getCustomerInfo(pageStart, pageSize, jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> alterCustomer(@PathVariable Long id, @RequestParam(required = false) String phoneNumber, @RequestParam(required = false) String email, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtService.alterCustomer(id, phoneNumber, email, jwt.getSubject()));
    }
}
