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

@RestController
@RequestMapping("/api/manager")
@Secured("SCOPE_ROLE_MANAGER")
public class ManagerController {
    private final UserService userService;

    public ManagerController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserDTO> getSelf(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getSelf(jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> alterSelf(@PathVariable Long id, @RequestBody UserDTO userDTO, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.alterEmployees(id, userDTO, jwt.getSubject()));
    }

    @PostMapping("/create")
    public ResponseEntity<String> createEmployees(@RequestBody CreateAccount createAccount, @AuthenticationPrincipal Jwt jwt) {
        if (!createAccount.role().equals(Role.AGENT)) {
            throw new InvalidCredentialException("You dont have enough permission to perform this action.");
        }
        return ResponseEntity.ok(userService.createAccount(createAccount, jwt.getSubject()));
    }

    @GetMapping("/employee")
    public ResponseEntity<Page<UserDTO>> getInfo(@RequestParam Integer startPage, @RequestParam Integer pageSize, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getInfo(jwt.getSubject(), startPage, pageSize, Role.AGENT));
    }

    @PutMapping("/employee/{id}")
    public ResponseEntity<String> alterWorkers(@PathVariable Long id, @RequestBody UserDTO userDTO, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.alterEmployees(id, userDTO, jwt.getSubject()));
    }

    @PatchMapping("/employee/{id}")
    public ResponseEntity<String> toggleWorkers(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.accepted().body(userService.toggleEnabled(id, jwt.getSubject()));
    }
}
