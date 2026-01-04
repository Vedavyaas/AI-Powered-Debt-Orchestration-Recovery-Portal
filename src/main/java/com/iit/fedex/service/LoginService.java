package com.iit.fedex.service;

import com.iit.fedex.dto.AuthResponse;
import com.iit.fedex.dto.LoginRequest;
import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;

@Service
public class LoginService {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final JWTLoginRepository jwtLoginRepository;

    public LoginService(AuthenticationManager authenticationManager, JwtEncoder jwtEncoder, JWTLoginRepository jwtLoginRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.jwtLoginRepository = jwtLoginRepository;
    }

    public AuthResponse login(LoginRequest request) {
        final String email = request.getEmail();

        // Ensure "email not found" produces a deterministic 404 (instead of Spring Security's generic 401)
        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            // Wrong password or other auth failure for an existing user
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        JWTLoginEntity user = userOpt.get();
        String role = user.getRole() != null ? user.getRole().name() : "DCA_AGENT";

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("nexus-fedex")
                .subject(request.getEmail())
                .claim("role", role)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(3600))
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        return new AuthResponse(token, request.getEmail(), role);
    }
}

