package com.vedavyaas.orchestration.model;

import java.util.Date;

public record DebtDTO(Long id, String debtName, String customerName, String managerName, Double principalAmount, Double outstandingAmount, Date dueDate, Status status) {
}
