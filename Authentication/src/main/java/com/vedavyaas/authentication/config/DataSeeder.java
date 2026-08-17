package com.vedavyaas.authentication.config;

import com.vedavyaas.authentication.model.Role;
import com.vedavyaas.authentication.repository.CompanyEntity;
import com.vedavyaas.authentication.repository.CompanyRepository;
import com.vedavyaas.authentication.repository.UserEntity;
import com.vedavyaas.authentication.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public DataSeeder(PasswordEncoder passwordEncoder, UserRepository userRepository, CompanyRepository companyRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    public void run(String... args) {
        CompanyEntity company = new CompanyEntity("Google");
        companyRepository.save(company);
        UserEntity admin = new UserEntity("Admin", passwordEncoder.encode("123"), Role.ADMIN, "admin@gmail.com", company);
        UserEntity manager = new UserEntity("Manager", passwordEncoder.encode("123"), Role.MANAGER, "manager@gmail.com", company);
        UserEntity agent = new UserEntity("Agent", passwordEncoder.encode("123"), Role.AGENT, "agent@gmail.com", company);

        userRepository.saveAll(List.of(admin, manager, agent));
    }
}
