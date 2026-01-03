package com.iit.fedex.dto;

public record UserProfileDTO(
    String email,
    String agencyId,
    String role,
    String firstName,
    String lastName,
    String phone
) {
}

