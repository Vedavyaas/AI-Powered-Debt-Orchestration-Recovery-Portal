package com.iit.fedex.dto;

import com.iit.fedex.assets.Status;

import java.util.List;

public record CaseSearchRequest(
    String customerName,
    String invoiceNumber,
    Status status,
    Double minAmount,
    Double maxAmount,
    Integer minDaysOverdue,
    List<String> serviceTypes
) {
}

