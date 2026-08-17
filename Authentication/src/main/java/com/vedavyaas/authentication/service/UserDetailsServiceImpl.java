package com.vedavyaas.authentication.service;

import com.vedavyaas.authentication.repository.UserEntity;
import com.vedavyaas.authentication.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;


/**
 * Service to provide authentication by connecting with Database
 */

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserEntity> user = userRepository.findByName(username);

        if (user.isEmpty()) {
            throw new UsernameNotFoundException("Username not found.");
        }

        return User
                .withUsername(username)
                .password(user.get().getPassword())
                .roles(user.get().getRole().toString())
                .accountLocked(!user.get().isEnabled())
                .build();
    }
}
