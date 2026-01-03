package com.iit.fedex.dto;

import com.iit.fedex.assets.Role;

/**
 * DTO for agent management by managers
 */
public record AgentManagementDTO(
        String agentEmail,
        Role role,
        Boolean active,
        String notes
) {
}

