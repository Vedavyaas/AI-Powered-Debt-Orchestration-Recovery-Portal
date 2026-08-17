package com.vedavyaas.authentication.controller;

import com.vedavyaas.authentication.model.UserDTO;
import com.vedavyaas.authentication.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agent")
public class AgentController {
    private final UserService userService;

    public AgentController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserDTO> getSelfInfo(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getSelf(jwt.getSubject()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> alterSelf(@PathVariable Long id, @RequestBody UserDTO userDTO, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.alterEmployees(id, userDTO, jwt.getSubject()));
    }
}
