package com.iit.fedex.dto;

/**
 * DTO for password reset request
 */
public record PasswordResetRequestDTO(
        String currentPassword,
        String newPassword,
        String confirmPassword
) {
}

