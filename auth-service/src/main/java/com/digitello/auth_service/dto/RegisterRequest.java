package com.digitello.auth_service.dto;

import com.digitello.auth_service.entity.User;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;
    @NotBlank
    @Size(min = 6)
    private String password;
    @Email
    private String email;
    private String fullName;
    private User.Role role;
}