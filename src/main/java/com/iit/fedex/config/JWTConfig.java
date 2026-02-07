package com.iit.fedex.config;

import com.iit.fedex.service.CustomUserDetailsService;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.http.HttpMethod;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

@Configuration
@EnableWebSecurity
public class JWTConfig {

    private static RequestMatcher otpRequestMatcher() {
        return request -> {
            String path = request.getRequestURI();
            String contextPath = request.getContextPath();
            if (contextPath != null && !contextPath.isEmpty() && path != null && path.startsWith(contextPath)) {
                path = path.substring(contextPath.length());
            }

            if (path == null) {
                return false;
            }

            return path.equals("/get/OTP")
                || path.equals("/get/otp")
                || path.startsWith("/get/OTP/")
                || path.startsWith("/get/otp/");
        };
    }

    @Bean
    @Order(0)
    public SecurityFilterChain otpSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(otpRequestMatcher())
            .authorizeHttpRequests(authorizeRequests -> authorizeRequests.anyRequest().permitAll())
            .oauth2ResourceServer(oauth2 -> oauth2.disable())
            .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
        .authorizeHttpRequests(authorizeRequests -> authorizeRequests
            // allow unauthenticated access to static SPA assets, auth endpoints and SPA routes
            .requestMatchers(
                "/",
                "/index.html",
                "/static/**",
                "/assets/**",
                "/favicon.ico",
                "/manifest.json",
                "/h2-console/**",
                "/login/**",
                "/create/**",
                "/create",
                "/get/OTP",
                "/get/OTP/**",
                "/get/otp",
                "/get/otp/**",
                "/forgot-password/**",
                "/reset-password/**",
                "/home/**",
                "/signup/**",
                "/users/**",
                "/debt-search/**",
                "/ai/**",
                "/csv-upload/**",
                "/reports/**",
                "/export/**",
                "/dashboard/**",
                "/profile/**",
                "/audit/**",
                "/my-debts/**",
                "/agents/**",
                "/action/**"
            ).permitAll()
            .requestMatchers(HttpMethod.POST,
                "/api/auth/login",
                "/api/auth/forgot-password",
                "/api/auth/reset-password",
                "/api/auth/reset-password-confirm",
                "/api/auth/validate-reset-token"
            ).permitAll()
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));
        return http.build();
    }

    @Bean
    KeyPair keyPair() throws NoSuchAlgorithmException {
        var keyPair = KeyPairGenerator.getInstance("RSA");
        keyPair.initialize(2048);
        return keyPair.generateKeyPair();
    }

    @Bean
    RSAPublicKey publicKey() throws NoSuchAlgorithmException {
        return (RSAPublicKey) keyPair().getPublic();
    }

    @Bean
    RSAPrivateKey privateKey() throws NoSuchAlgorithmException {
        return (RSAPrivateKey) keyPair().getPrivate();
    }

    @Bean
    JwtEncoder jwtEncoder(RSAPublicKey rsaPublicKey, RSAPrivateKey rsaPrivateKey) {
        var rsaKey = new RSAKey.Builder(rsaPublicKey)
                .privateKey(rsaPrivateKey)
                .keyID(UUID.randomUUID().toString())
                .build();

        var jwKSet = new JWKSet(rsaKey);
        var jwkSource = new ImmutableJWKSet<>(jwKSet);

        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(userDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(authenticationProvider);
    }
}
