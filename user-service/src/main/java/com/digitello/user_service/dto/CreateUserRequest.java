package com.digitello.user_service.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String fullName;
    @Email
    private String email;
    @NotBlank
    private String role;
}
