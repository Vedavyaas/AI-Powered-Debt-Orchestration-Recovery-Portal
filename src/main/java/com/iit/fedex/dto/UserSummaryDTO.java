package com.iit.fedex.dto;

import com.iit.fedex.assets.Role;

/**
 * DTO for displaying user information without sensitive data like passwords.
 */
public record UserSummaryDTO(
        String email,
        Role role,
        String agencyId,
        Boolean active
) {
}
