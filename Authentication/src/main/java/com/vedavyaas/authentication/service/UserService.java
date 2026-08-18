package com.vedavyaas.authentication.service;

import com.vedavyaas.authentication.model.*;
import com.vedavyaas.authentication.repository.CompanyEntity;
import com.vedavyaas.authentication.repository.CompanyRepository;
import com.vedavyaas.authentication.repository.UserEntity;
import com.vedavyaas.authentication.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;

    public UserService(UserRepository userRepository, CompanyRepository companyRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtEncoder jwtEncoder) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
    }

    public JWTToken login(LoginCredentials loginCredentials) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginCredentials.name(), loginCredentials.password()));

        Instant now = Instant.now();

        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        // Fetch role from DB and embed into token
        UserEntity userEntity = userRepository.findByName(authentication.getName()).orElse(null);
        String roleName = userEntity != null ? userEntity.getRole().name() : "";

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(3600))
                .subject(authentication.getName())
                .claim("scope", scope)
                .claim("role",  roleName)
                .build();

        String tokenValue = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();

        logger.info("User : {}, logged in.", loginCredentials.name());
        return new JWTToken(tokenValue);
    }

    public String createAccount(CreateAccount accountCredentials) {
        return createAccount(accountCredentials, null);
    }

    public String createAccount(CreateAccount accountCredentials, String adminName) {
        if (adminName == null) {
            // Public registration (Admin) - company must be unique
            if (userRepository.existsByNameOrEmailOrCompany_Name(accountCredentials.name(), accountCredentials.email(), accountCredentials.company())) {
                throw new InvalidCredentialException("Username or Company Name or email is already found.");
            }
        } else {
            // Manager creation - only name and email must be unique
            if (userRepository.existsByName(accountCredentials.name()) || userRepository.existsByEmail(accountCredentials.email())) {
                throw new InvalidCredentialException("Username or email is already taken.");
            }
        }
        
        CompanyEntity companyEntity;

        if (adminName != null) {
            Optional<UserEntity> adminUser = userRepository.findByName(adminName);

            if (adminUser.isEmpty()) {
                logger.warn("{} : {}, tried to create {} account but failed.", adminUser.get().getRole().toString(), adminName, accountCredentials.role().toString());
                throw new InvalidCredentialException("Some error occurred. Try logging in again!");
            }

            companyEntity = adminUser.get().getCompany();
        } else {
            companyEntity = new CompanyEntity(accountCredentials.company());
            companyEntity = companyRepository.save(companyEntity);
        }

        UserEntity user = new UserEntity(
                accountCredentials.name(),
                passwordEncoder.encode(accountCredentials.password()),
                accountCredentials.role(),
                accountCredentials.email(),
                companyEntity);
        userRepository.save(user);

        logger.info("Account created by : {}, successfully.", adminName == null ? accountCredentials.name() : adminName);
        return "Account created successfully.";
    }

    public UserDTO getSelf( String username) {
        return userRepository.findByName(username, Sort.unsorted());
    }

    public String toggleEnabled(Long id, String admin) {
        Optional<UserEntity> user = userRepository.findById(id);

        if (user.isEmpty()) {
            logger.warn("Admin : {}, tried to toggle manager but failed.", admin);
            throw new InvalidCredentialException("User id not found");
        }

        user.get().setEnabled(!user.get().isEnabled());
        userRepository.save(user.get());
        logger.info("Admin : {}, toggled {} successfully.", user.get().getName(), admin);
        return user.get().isEnabled() ? "User enabled successfully." : "User disabled successfully";
    }

    public Page<UserDTO> getInfo(String admin, Integer pageStart, Integer pageSize, Role role) {
        Optional<UserEntity> adminUser = userRepository.findByName(admin);

        if (adminUser.isEmpty()) {
            logger.warn("Anonymous : {}, tried to get {} info but failed.", admin, role.toString());
            throw new InvalidCredentialException("Some error occurred. Try logging in again.");
        }

        String companyName = adminUser.get().getCompany().getName();
        Pageable pageable = PageRequest.of(pageStart, pageSize);

        logger.info("{} : {}, retrieved managers info.", adminUser.get().getRole().toString(), admin);
        return userRepository.findByCompany_NameAndRole(companyName, role, pageable);
    }

    public String alterEmployees(Long id, String email, String admin) {
        Optional<UserEntity> user = userRepository.findById(id);

        if (user.isEmpty()) {
            logger.warn("Anonymous : {}, tried to alter manager but failed.", admin);
            throw new InvalidCredentialException("User not found.");
        }

        if (email != null && !email.equals(user.get().getEmail())) {
            if (userRepository.existsByEmail(email)) throw new InvalidCredentialException("Email is already taken.");
            user.get().setEmail(email);

            user.get().setModifiedAt(Instant.now());
            userRepository.save(user.get());
            logger.info("{} : {}, altered manager details successfully.", user.get().getRole().toString(), admin);
            return "Updated successfully.";
        }

        return "No modification.";
    }
}