package com.iit.fedex.service;

import com.iit.fedex.dto.AuthResponse;
import com.iit.fedex.dto.LoginRequest;
import com.iit.fedex.repository.JWTLoginEntity;
import com.iit.fedex.repository.JWTLoginRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        Optional<JWTLoginEntity> userOpt = jwtLoginRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        JWTLoginEntity user = userOpt.get();
        String role = user.getRole() != null ? user.getRole().name() : "DCA_AGENT";

        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("pheonix-fedex")
                .subject(request.getEmail())
                .claim("role", role)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(3600))
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        return new AuthResponse(token, request.getEmail(), role);
    }
}

