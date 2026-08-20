package com.vedavyaas.assignment.service;

import com.vedavyaas.assignment.model.DebtDTO;
import com.vedavyaas.assignment.model.InvalidCredentialException;
import com.vedavyaas.assignment.model.Status;
import com.vedavyaas.assignment.repository.*;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class DebtAgentManagerService {
    private final DebtRepository debtRepository;
    private final AgentRepository agentRepository;
    private final ManagerRepository managerRepository;

    public DebtAgentManagerService(DebtRepository debtRepository, AgentRepository agentRepository, ManagerRepository managerRepository) {
        this.debtRepository = debtRepository;
        this.agentRepository = agentRepository;
        this.managerRepository = managerRepository;
    }

    public Page<DebtDTO> getDebts(Integer pageStart, Integer pageSize, String agentName) {
        Optional<AgentEntity> agentEntity = agentRepository.findByAgentName(agentName);

        if (agentEntity.isEmpty()) {
            return Page.empty();
        }

        Pageable pageable = PageRequest.of(pageStart, pageSize);
        Page<DebtEntity> page = debtRepository.findByAgentEntity(agentEntity.get(), pageable);

        return page.map(debt -> new DebtDTO(
                    debt.getId(),
                    debt.getDebtName(),
                    debt.getAgentEntity().getAgentName(),
                    debt.getManagerEntity().getManagerName(),
                    debt.getRecoveryProbability(),
                    debt.getTrustScore(),
                    debt.getSightInformation()
        ));
    }

    public String changeStatus(Long id, Status status, String agentName) {
        Optional<AgentEntity> agentEntity = agentRepository.findByAgentName(agentName);

        if (agentEntity.isEmpty()) {
            throw new InvalidCredentialException("Some error occurred.");
        }

        Optional<DebtEntity> debtEntity = debtRepository.findByIdAndAgentEntity(id, agentEntity.get());

        if (debtEntity.isEmpty()) {
            throw new InvalidCredentialException("No such debt exist.");
        }

        if (!status.equals(Status.APPROVED) && !status.equals(debtEntity.get().getStatus())) {
            debtEntity.get().setStatus(status);
            debtRepository.save(debtEntity.get());
            return "Status changed successfully.";
        }

        return "No changes.";
    }

    public String addNotes(Long id, List<String> notes, String agentName) {
        if (notes.isEmpty()) return "No data to change.";

        Optional<AgentEntity> agentEntity = agentRepository.findByAgentName(agentName);

        if (agentEntity.isEmpty()) {
            throw new InvalidCredentialException("Some error occurred.");
        }

        Optional<DebtEntity> debtEntity = debtRepository.findByIdAndAgentEntity(id, agentEntity.get());

        if (debtEntity.isEmpty()) {
            throw new InvalidCredentialException("No such debt exist.");
        }

        debtEntity.get().setSightInformation(notes);
        debtRepository.save(debtEntity.get());

        return "Data added successfully.";
    }

    public String changeAgent(Long id, String agentName, String managerName) {
        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(managerName);
        if (managerEntity.isEmpty()) {
            return "Some error occurred.";
        }

        Optional<DebtEntity> debtEntity = debtRepository.findByIdAndManagerEntity(id, managerEntity.get());
        if (debtEntity.isEmpty()) {
            return "Some error occurred.";
        }

        Optional<AgentEntity> agentEntity = agentRepository.findByAgentName(agentName);
        if (agentEntity.isEmpty()) {
            return "Some error occurred. Try logging in again.";
        }

        if (debtEntity.get().getAgentEntity().getAgentName().equals(agentName)) {
            return "No changes to be made.";
        }

        debtEntity.get().setAgentEntity(agentEntity.get());
        debtRepository.save(debtEntity.get());

        return "Agent changed successfully";
    }

    public DebtDTO getSingleDebt(String debtName, String managerName) {
        Optional<ManagerEntity> managerEntity = managerRepository.findByManagerName(managerName);
        if (managerEntity.isEmpty()) {
            throw new InvalidCredentialException("Some error occurred.");
        }

        Optional<DebtEntity> debtEntity = debtRepository.findByDebtNameAndManagerEntity(debtName, managerEntity.get());
        if (debtEntity.isEmpty()) {
            throw new InvalidCredentialException("Some error occurred.");
        }

        if (!debtEntity.get().isCalculated()) {
            //"Computation still in-progress"
            return null;
        }

        return new DebtDTO(
                debtEntity.get().getId(),
                debtEntity.get().getDebtName(),
                debtEntity.get().getAgentEntity() != null ? debtEntity.get().getAgentEntity().getAgentName() : null,
                debtEntity.get().getManagerEntity() != null ? debtEntity.get().getManagerEntity().getManagerName() : null,
                debtEntity.get().getRecoveryProbability(),
                debtEntity.get().getTrustScore(),
                debtEntity.get().getSightInformation()
        );
    }
}
