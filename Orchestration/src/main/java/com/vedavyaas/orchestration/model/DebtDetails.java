package com.vedavyaas.orchestration.model;

import java.util.Date;

public record DebtDetails(String debtName, Long customerId, Double principalAmount, Double outStandingAmount, Date dueDate, Status status) {
}
