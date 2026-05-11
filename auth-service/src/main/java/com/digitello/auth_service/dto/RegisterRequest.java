package com.digitello.auth_service.dto;

import com.digitello.auth_service.entity.User;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String username;
    @NotBlank
    @Size(min = 6)
    private String password;
    @Email
    private String email;
    private User.Role role;
}