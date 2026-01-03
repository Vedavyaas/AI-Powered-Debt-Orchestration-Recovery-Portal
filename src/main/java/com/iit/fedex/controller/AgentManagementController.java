package com.iit.fedex.controller;

import com.iit.fedex.assets.Role;
import com.iit.fedex.dto.AgentManagementDTO;
import com.iit.fedex.dto.AgentPerformanceStats;
import com.iit.fedex.repository.DebtInvestEntity;
import com.iit.fedex.repository.DebtInvestRepository;
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
@RequestMapping("/api/manager/agents")
public class AgentManagementController {

    private final JWTLoginRepository jwtLoginRepository;
    private final DebtInvestRepository debtInvestRepository;
    private final AuditService auditService;

    public AgentManagementController(JWTLoginRepository jwtLoginRepository,
                                     DebtInvestRepository debtInvestRepository,
                                     AuditService auditService) {
        this.jwtLoginRepository = jwtLoginRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.auditService = auditService;
    }

    @GetMapping("/list")
    public List<JWTLoginEntity> listAgents() {
        String managerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> managerOpt = jwtLoginRepository.findByEmail(managerEmail);
        
        if (managerOpt.isPresent()) {
            return jwtLoginRepository.findAllByAgencyIdAndRole(
                    managerOpt.get().getAgencyId(), Role.DCA_AGENT);
        }
        return List.of();
    }

    @GetMapping("/performance")
    public List<AgentPerformanceStats> getAgentPerformance() {
        String managerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> managerOpt = jwtLoginRepository.findByEmail(managerEmail);
        
        if (managerOpt.isEmpty()) {
            return List.of();
        }
        
        List<JWTLoginEntity> agents = jwtLoginRepository.findAllByAgencyIdAndRole(
                managerOpt.get().getAgencyId(), Role.DCA_AGENT);
        
        return agents.stream().map(agent -> {
            List<DebtInvestEntity> agentCases = debtInvestRepository.findByAssignedToEmail(agent.getEmail());
            
            long totalCases = agentCases.size();
            long casesCollected = agentCases.stream()
                    .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.COLLECTED)
                    .count();
            long casesPending = agentCases.stream()
                    .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.PENDING || 
                            c.getStage() == com.iit.fedex.assets.Stage.IN_PROGRESS)
                    .count();
            long casesDisputed = agentCases.stream()
                    .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.DISPUTED)
                    .count();
            
            double collectionRate = totalCases > 0 ? (double) casesCollected / totalCases * 100 : 0.0;
            
            return new AgentPerformanceStats(
                    agent.getEmail(),
                    agent.getEmail().split("@")[0],
                    totalCases, casesCollected, casesPending, casesDisputed,
                    collectionRate, 0.0, 0.0
            );
        }).toList();
    }

    @GetMapping("/workload")
    public Map<String, Object> getAgentWorkload() {
        String managerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<JWTLoginEntity> managerOpt = jwtLoginRepository.findByEmail(managerEmail);
        
        if (managerOpt.isEmpty()) {
            return Map.of("error", "Manager not found");
        }
        
        List<JWTLoginEntity> agents = jwtLoginRepository.findAllByAgencyIdAndRole(
                managerOpt.get().getAgencyId(), Role.DCA_AGENT);
        
        List<Map<String, Object>> workloadList = agents.stream().map(agent -> {
            List<DebtInvestEntity> agentCases = debtInvestRepository.findByAssignedToEmail(agent.getEmail());
            
            Map<String, Object> workload = new HashMap<>();
            workload.put("email", agent.getEmail());
            workload.put("totalCases", agentCases.size());
            workload.put("pendingCases", agentCases.stream()
                    .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.PENDING || 
                            c.getStage() == com.iit.fedex.assets.Stage.IN_PROGRESS)
                    .count());
            workload.put("collectedCases", agentCases.stream()
                    .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.COLLECTED)
                    .count());
            workload.put("disputedCases", agentCases.stream()
                    .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.DISPUTED)
                    .count());
            workload.put("promisedCases", agentCases.stream()
                    .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.PROMISED_TO_PAY)
                    .count());
            
            return workload;
        }).toList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("agents", workloadList);
        response.put("totalAgents", agents.size());
        
        return response;
    }

    @PutMapping("/deactivate/{email}")
    public ResponseEntity<Map<String, String>> deactivateAgent(@PathVariable String email) {
        Map<String, String> response = new HashMap<>();
        String managerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        
        auditService.logAction("DEACTIVATE_AGENT", "JWTLoginEntity", email,
                "Agent deactivated by manager", managerEmail, true);
        
        response.put("message", "Agent deactivated successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/activate/{email}")
    public ResponseEntity<Map<String, String>> activateAgent(@PathVariable String email) {
        Map<String, String> response = new HashMap<>();
        String managerEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        
        auditService.logAction("ACTIVATE_AGENT", "JWTLoginEntity", email,
                "Agent activated by manager", managerEmail, true);
        
        response.put("message", "Agent activated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/details/{email}")
    public Map<String, Object> getAgentDetails(@PathVariable String email) {
        Optional<JWTLoginEntity> agentOpt = jwtLoginRepository.findByEmail(email);
        
        if (agentOpt.isEmpty()) {
            return Map.of("error", "Agent not found");
        }
        
        JWTLoginEntity agent = agentOpt.get();
        List<DebtInvestEntity> agentCases = debtInvestRepository.findByAssignedToEmail(email);
        
        Map<String, Object> details = new HashMap<>();
        details.put("email", agent.getEmail());
        details.put("agencyId", agent.getAgencyId());
        details.put("role", agent.getRole().name());
        details.put("totalCases", agentCases.size());
        details.put("collectionRate", agentCases.stream()
                .filter(c -> c.getStage() == com.iit.fedex.assets.Stage.COLLECTED)
                .count() / (double) Math.max(1, agentCases.size()) * 100);
        
        return details;
    }
}

