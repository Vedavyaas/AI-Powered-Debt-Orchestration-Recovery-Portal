package com.iit.fedex.dto;

import com.iit.fedex.assets.Status;

import java.util.List;

public record BulkStatusUpdate(
    List<String> invoiceNumbers,
    Status newStatus,
    String assignedTo
) {
}

