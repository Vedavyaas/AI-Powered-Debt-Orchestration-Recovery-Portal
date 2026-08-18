package com.vedavyaas.orchestration.controller;

import com.vedavyaas.orchestration.model.CustomerDTO;
import com.vedavyaas.orchestration.model.CustomerDetails;
import com.vedavyaas.orchestration.model.DebtDTO;
import com.vedavyaas.orchestration.model.DebtDetails;
import com.vedavyaas.orchestration.service.DebtService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debt")
@Secured("SCOPE_ROLE_MANAGER")
public class DebtController {
    private final DebtService debtService;

    public DebtController(DebtService debtService) {
        this.debtService = debtService;
    }

    @PostMapping
    public ResponseEntity<String> createDebt(@RequestBody DebtDetails debtDetails, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtService.createDebt(debtDetails, jwt.getSubject()));
    }

    @GetMapping
    public ResponseEntity<Page<DebtDTO>> getDebts(@RequestParam("pageStart") Integer pageStart, @RequestParam("pageSize") Integer pageSize, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtService.getAllDebts(pageStart, pageSize, jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> alterDebt(@PathVariable Long id, @RequestBody DebtDetails debtDetails, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtService.alterDebt(id, debtDetails, jwt.getSubject()));
    }
}