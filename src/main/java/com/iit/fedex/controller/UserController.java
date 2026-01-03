package com.iit.fedex.controller;

import com.iit.fedex.dto.UserProfileDTO;
import com.iit.fedex.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user/profile")
    public UserProfileDTO getProfile() {
        return userService.getProfile();
    }

    @PutMapping("/user/profile")
    public String updateProfile(@RequestBody UserProfileDTO profileDTO) {
        return userService.updateProfile(profileDTO);
    }
}

