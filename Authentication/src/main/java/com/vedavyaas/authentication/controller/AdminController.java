package com.vedavyaas.authentication.controller;

import com.vedavyaas.authentication.model.CreateAccount;
import com.vedavyaas.authentication.model.InvalidCredentialException;
import com.vedavyaas.authentication.model.Role;
import com.vedavyaas.authentication.model.UserDTO;
import com.vedavyaas.authentication.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for ADMIN to create and manage MANAGER
 */

@RestController
@RequestMapping("/api/admin")
@Secured("SCOPE_ROLE_ADMIN")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<String> createAccount(@RequestBody CreateAccount accountCredentials) {
        return ResponseEntity.ok(userService.createAccount(accountCredentials));
    }

    @GetMapping
    public ResponseEntity<UserDTO> getSelf(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getSelf(jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> alterSelf(@PathVariable Long id, @RequestParam String email, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.alterEmployees(id, email, jwt.getSubject()));
    }

    @PostMapping("/create")
    public ResponseEntity<String> createEmployees(@RequestBody CreateAccount accountCredentials, @AuthenticationPrincipal Jwt jwt) {
        if (accountCredentials.role().equals(Role.ADMIN)) {
            throw new InvalidCredentialException("You can create only MANAGERS and AGENTS");
        }

        return ResponseEntity.ok(userService.createAccount(accountCredentials, jwt.getSubject()));
    }

    @GetMapping("/employee")
    public ResponseEntity<Page<UserDTO>> getInfo(@RequestParam Integer startPage, @RequestParam Integer pageSize, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getInfo(jwt.getSubject(), startPage, pageSize, Role.MANAGER));
    }

    @PatchMapping("/employee/{id}")
    public ResponseEntity<String> toggleWorkers(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.accepted().body(userService.toggleEnabled(id, jwt.getSubject()));
    }

    @PutMapping("/employee/{id}")
    public ResponseEntity<String> alterWorkers(@PathVariable Long id, @RequestParam String email, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.alterEmployees(id, email, jwt.getSubject()));
    }
}
