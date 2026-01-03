package com.iit.fedex.dto;

import java.util.List;

public record AdminAssignment(String agencyID, List<String> invoiceNumber) {
}
