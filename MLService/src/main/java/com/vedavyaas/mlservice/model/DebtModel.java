package com.vedavyaas.mlservice.model;

import java.util.Date;

public record DebtModel(String debtName, String managerName, Double principalAmount, Double outStandingAmount, Date dueDate) {
}
