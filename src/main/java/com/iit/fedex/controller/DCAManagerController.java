package com.iit.fedex.controller;

import com.iit.fedex.dto.ManagerAssignment;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.service.DCAManagerService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DCAManagerController {
    private final DCAManagerService dcaManagerService;

    public DCAManagerController(DCAManagerService dcaManagerService) {
        this.dcaManagerService = dcaManagerService;
    }

    @GetMapping("/get/tasks")
    public List<DebtCaseEntity> getTasks() {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return dcaManagerService.getAllTasks(user);
    }

    @PostMapping("/debt/assign")
    public String assignDebt(@RequestBody ManagerAssignment managerAssignment) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return dcaManagerService.assignDebts(user, managerAssignment);
    }
}
