package com.iit.fedex.controller;

import com.iit.fedex.assets.Role;
import com.iit.fedex.dto.UserManagementDTO;
import com.iit.fedex.dto.UserSummaryDTO;
import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import com.iit.fedex.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final JWTLoginRepository jwtLoginRepository;
    private final AuditService auditService;

    public AdminUserController(JWTLoginRepository jwtLoginRepository, AuditService auditService) {
        this.jwtLoginRepository = jwtLoginRepository;
        this.auditService = auditService;
    }

    @GetMapping("/list")
    public List<UserSummaryDTO> listAllUsers() {
        return jwtLoginRepository.findAll().stream()
                .map(u -> new UserSummaryDTO(u.getEmail(), u.getRole(), u.getAgencyId(), true))
                .toList();
    }

    @GetMapping("/list/{role}")
    public List<UserSummaryDTO> listUsersByRole(@PathVariable Role role) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> adminOpt = jwtLoginRepository.findByEmail(adminEmail);
        
        if (adminOpt.isPresent() && adminOpt.get().getRole() == Role.FEDEX_ADMIN) {
            return jwtLoginRepository.findAll().stream()
                    .filter(u -> u.getRole() == role)
                    .map(u -> new UserSummaryDTO(u.getEmail(), u.getRole(), u.getAgencyId(), true))
                    .toList();
        }
        return List.of();
    }

    @GetMapping("/agency/{agencyId}")
    public List<UserSummaryDTO> listUsersByAgency(@PathVariable String agencyId) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> adminOpt = jwtLoginRepository.findByEmail(adminEmail);
        
        if (adminOpt.isPresent() && adminOpt.get().getRole() == Role.FEDEX_ADMIN) {
            return jwtLoginRepository.findByAgencyId(agencyId).stream()
                    .map(u -> new UserSummaryDTO(u.getEmail(), u.getRole(), u.getAgencyId(), true))
                    .toList();
        }
        return List.of();
    }

    @PutMapping("/update-role")
    public ResponseEntity<Map<String, String>> updateUserRole(@RequestBody UserManagementDTO request) {
        Map<String, String> response = new HashMap<>();
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> adminOpt = jwtLoginRepository.findByEmail(adminEmail);
        
        if (adminOpt.isEmpty() || adminOpt.get().getRole() != Role.FEDEX_ADMIN) {
            response.put("error", "Access denied. Admin role required.");
            return ResponseEntity.status(403).body(response);
        }
        
        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }
        
        JWTLoginEntity user = userOpt.get();
        user.setRole(request.role());
        jwtLoginRepository.save(user);
        
        auditService.logAction("UPDATE_ROLE", "JWTLoginEntity", request.email(),
                String.format("Role changed to %s", request.role().name()), adminEmail, true);
        
        response.put("message", "User role updated successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-agency")
    public ResponseEntity<Map<String, String>> updateUserAgency(@RequestBody UserManagementDTO request) {
        Map<String, String> response = new HashMap<>();
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> adminOpt = jwtLoginRepository.findByEmail(adminEmail);
        
        if (adminOpt.isEmpty() || adminOpt.get().getRole() != Role.FEDEX_ADMIN) {
            response.put("error", "Access denied. Admin role required.");
            return ResponseEntity.status(403).body(response);
        }
        
        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }
        
        JWTLoginEntity user = userOpt.get();
        user.setAgencyId(request.agencyId());
        jwtLoginRepository.save(user);
        
        auditService.logAction("UPDATE_AGENCY", "JWTLoginEntity", request.email(),
                String.format("Agency changed to %s", request.agencyId()), adminEmail, true);
        
        response.put("message", "User agency updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{email}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String email) {
        Map<String, String> response = new HashMap<>();
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> adminOpt = jwtLoginRepository.findByEmail(adminEmail);
        
        if (adminOpt.isEmpty() || adminOpt.get().getRole() != Role.FEDEX_ADMIN) {
            response.put("error", "Access denied. Admin role required.");
            return ResponseEntity.status(403).body(response);
        }
        
        if (email.equals(adminEmail)) {
            response.put("error", "Cannot delete your own account");
            return ResponseEntity.status(400).body(response);
        }
        
        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(404).body(response);
        }
        
        jwtLoginRepository.delete(userOpt.get());
        
        auditService.logAction("DELETE_USER", "JWTLoginEntity", email,
                "User account deleted", adminEmail, true);
        
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public Map<String, Long> getUserCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("total", jwtLoginRepository.count());
        counts.put("admins", jwtLoginRepository.countByAgencyIdAndRole(null, Role.FEDEX_ADMIN));
        counts.put("managers", jwtLoginRepository.countByAgencyIdAndRole(null, Role.DCA_MANAGER));
        counts.put("agents", jwtLoginRepository.countByAgencyIdAndRole(null, Role.DCA_AGENT));
        return counts;
    }

    @GetMapping("/search")
    public List<UserSummaryDTO> searchUsers(@RequestParam String query) {
        return jwtLoginRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(query.toLowerCase()) ||
                        (u.getAgencyId() != null && u.getAgencyId().toLowerCase().contains(query.toLowerCase())))
                .map(u -> new UserSummaryDTO(u.getEmail(), u.getRole(), u.getAgencyId(), true))
                .toList();
    }
}

