package com.iit.fedex.controller;

import com.iit.fedex.repository.DebtInvestEntity;
import com.iit.fedex.service.DCAAgentService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DCAAgentController {

    private final DCAAgentService dcaAgentService;

    public DCAAgentController(DCAAgentService dcaAgentService) {
        this.dcaAgentService = dcaAgentService;
    }

    @GetMapping("/get/debts")
    public List<DebtInvestEntity> getDebts() {
        String user =  SecurityContextHolder.getContext().getAuthentication().getName();
        return dcaAgentService.getDebts(user);

    }

    @PutMapping("/put/stage")
    public String changeStage(@RequestParam String invoiceNumber, @RequestParam String stage) {
        String user =  SecurityContextHolder.getContext().getAuthentication().getName();
        return dcaAgentService.changeStage(user, invoiceNumber, stage);
    }

    @PutMapping("/put/message")
    public String changeMessage(@RequestParam String invoiceNumber, @RequestParam String message) {
        String user =  SecurityContextHolder.getContext().getAuthentication().getName();
        return dcaAgentService.changeMessage(user, invoiceNumber, message);
    }
}
