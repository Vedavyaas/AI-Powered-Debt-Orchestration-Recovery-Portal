package com.iit.fedex.dto;

import com.iit.fedex.assets.Role;

/**
 * DTO for user management operations
 */
public record UserManagementDTO(
        String email,
        Role role,
        String agencyId,
        Boolean active
) {
}

