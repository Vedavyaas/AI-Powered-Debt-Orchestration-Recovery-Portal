package com.vedavyaas.authentication.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record UserDTO(
        Long id, 
        String name, 
        String email, 
        Role role, 
        @JsonProperty("company") String companyName, 
        Instant createdAt, 
        Instant modifiedAt, 
        boolean enabled
) {
}
