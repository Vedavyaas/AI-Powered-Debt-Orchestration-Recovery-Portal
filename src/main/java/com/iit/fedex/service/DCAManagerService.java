package com.iit.fedex.service;

import com.iit.fedex.assets.Role;
import com.iit.fedex.dto.ManagerAssignment;
import com.iit.fedex.repository.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DCAManagerService {

    private final JWTLoginRepository jwtLoginRepository;
    private final DebtCaseRepository debtCaseRepository;

    private final DebtInvestRepository debtInvestRepository;
    private final JavaMailSenderImpl mailSender;

    public DCAManagerService(JWTLoginRepository jwtLoginRepository, DebtCaseRepository debtCaseRepository, DebtInvestRepository debtInvestRepository, JavaMailSenderImpl mailSender) {
        this.jwtLoginRepository = jwtLoginRepository;
        this.debtCaseRepository = debtCaseRepository;
        this.debtInvestRepository = debtInvestRepository;
        this.mailSender = mailSender;
    }
    public List<DebtCaseEntity> getAllTasks(String user) {
        Optional<JWTLoginEntity> manager = jwtLoginRepository.findByEmail(user);
        if(manager.isPresent()) {
            if(manager.get().getRole().equals(Role.DCA_MANAGER)) {
                return  debtCaseRepository.findByAssignedTo(manager.get().getAgencyId());
            }
            return null;
        }
        return null;
    }

    public String assignDebts(String user, ManagerAssignment managerAssignment) {
        Optional<JWTLoginEntity> manager = jwtLoginRepository.findByEmail(user);
        if(manager.isPresent()) {
            if(manager.get().getRole().equals(Role.DCA_MANAGER)) {
                List<String> invoiceNumbers = managerAssignment.invoiceNumber();

                for(var invoiceNumber : invoiceNumbers) {
                    debtInvestRepository.save(new DebtInvestEntity(debtCaseRepository.findByInvoiceNumber(invoiceNumber), managerAssignment.agentEmail()));
                }
                sendMailDCAAgent(managerAssignment.agentEmail());
                return "Debt assigned";
            }
            return "You dont have permissions to perform this action";
        }
        return "User not found";
    }

    private void sendMailDCAAgent(String to) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(to);
        mailMessage.setSubject("Debt assigned");
        mailMessage.setText("""
                Hello,
                
                You have been assigned new debt recovery cases in the NEXUS Portal.
                Please log in to your dashboard to review the customer details, check the overdue invoices,
                and begin the outreach process.
                All communication logs and payment promises must be updated directly in the system.
                Regards,
                DCA Management System""");
        mailSender.send(mailMessage);
    }
}
