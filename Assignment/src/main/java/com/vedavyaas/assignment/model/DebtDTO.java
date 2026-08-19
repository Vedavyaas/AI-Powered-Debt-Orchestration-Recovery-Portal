package com.vedavyaas.assignment.model;

import java.util.List;

public record DebtDTO(Long id, String debtName, String agentName, String managerName, Double recoveryProbability, Double trustScore, List<String> sightInformation) {
}
