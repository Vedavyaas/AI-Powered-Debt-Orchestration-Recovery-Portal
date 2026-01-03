package com.iit.fedex.service;

import com.iit.fedex.assets.Role;
import com.iit.fedex.assets.Stage;
import com.iit.fedex.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DCAAgentService {

    private final DebtCaseRepository debtCaseRepository;

    private final DebtInvestRepository debtInvestRepository;

    private final JWTLoginRepository jwtLoginRepository;

    public DCAAgentService(DebtCaseRepository debtCaseRepository, DebtInvestRepository debtInvestRepository, JWTLoginRepository jwtLoginRepository) {
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.jwtLoginRepository = jwtLoginRepository;
    }


    public List<DebtInvestEntity> getDebts(String user) {
        Optional<JWTLoginEntity> agent = jwtLoginRepository.findByEmail(user);
        if (agent.isPresent()) {
            if (agent.get().getRole().equals(Role.DCA_AGENT)) {
                return debtInvestRepository.findByAssignedToEmail(user);
            }
            return null;
        }
        return null;
    }

    public String changeStage(String user, String invoiceNumber, String stage) {
        Optional<JWTLoginEntity> agent = jwtLoginRepository.findByEmail(user);
        if (agent.isPresent()) {
            if (agent.get().getRole().equals(Role.DCA_AGENT)) {
                DebtCaseEntity debt = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
                if (debt != null) {
                    debtInvestRepository.updateStageByCaseEntity(Stage.valueOf(stage), debt);
                    return "Stage changed successfully";
                }
                return "Debt|Stage not found";
            }
            return "You dont have permission to change this stage";
        }
        return "User not found";
    }

    public String changeMessage(String user, String invoiceNumber, String message) {
        Optional<JWTLoginEntity> agent = jwtLoginRepository.findByEmail(user);
        if (agent.isPresent()) {
            if (agent.get().getRole().equals(Role.DCA_AGENT)) {
                DebtCaseEntity debt = debtCaseRepository.findByInvoiceNumber(invoiceNumber);
                if (debt != null) {
                    debtInvestRepository.updateMessageByCaseEntity(message, debt);
                    return "Message changed successfully";
                }
                return "Debt not found";
            }
            return "You dont have permission to perform this action";
        }
        return "User not found";
    }
}
