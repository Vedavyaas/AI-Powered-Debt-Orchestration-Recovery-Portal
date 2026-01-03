package com.iit.fedex.dto;

import java.util.List;

public record ManagerAssignment(List<String> invoiceNumber, String agentEmail) {}
