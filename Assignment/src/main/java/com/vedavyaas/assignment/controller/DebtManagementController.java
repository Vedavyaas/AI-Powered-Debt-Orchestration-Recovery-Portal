package com.vedavyaas.assignment.controller;

import com.vedavyaas.assignment.model.DebtDTO;
import com.vedavyaas.assignment.model.Status;
import com.vedavyaas.assignment.service.DebtAgentManagerService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignment")
public class DebtManagementController {

    private final DebtAgentManagerService debtAgentManagerService;

    public DebtManagementController(DebtAgentManagerService debtAgentManagerService) {
        this.debtAgentManagerService = debtAgentManagerService;
    }

    @Secured("SCOPE_ROLE_AGENT")
    @GetMapping
    public ResponseEntity<Page<DebtDTO>> getDebts(@RequestParam Integer pageStart, @RequestParam Integer pageSize, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtAgentManagerService.getDebts(pageStart, pageSize, jwt.getSubject()));
    }

    @Secured("SCOPE_ROLE_AGENT")
    @PatchMapping("/{id}")
    public ResponseEntity<String> changeStatus(@PathVariable Long id, @RequestParam Status status, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtAgentManagerService.changeStatus(id, status, jwt.getSubject()));
    }

    @Secured("SCOPE_ROLE_AGENT")
    @PutMapping("/{id}")
    public ResponseEntity<String> addDetails(@PathVariable Long id, @RequestParam List<String> notes, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtAgentManagerService.addNotes(id, notes, jwt.getSubject()));
    }

    @Secured("SCOPE_ROLE_MANAGER")
    @PatchMapping("/agent/{id}")
    public ResponseEntity<String> changeAgent(@PathVariable Long id, @RequestParam String agentName, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtAgentManagerService.changeAgent(id, agentName, jwt.getSubject()));
    }

    @Secured("SCOPE_ROLE_MANAGER")
    @GetMapping("/debt/{debtName}")
    public ResponseEntity<DebtDTO> getSpecificDebt(@PathVariable String debtName, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(debtAgentManagerService.getSingleDebt(debtName, jwt.getSubject()));
    }
}