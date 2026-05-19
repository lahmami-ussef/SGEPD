package com.digitello.auth_service.service;

import com.digitello.auth_service.dto.LoginRequest;
import com.digitello.auth_service.entity.User;
import com.digitello.auth_service.repository.UserRepository;
import com.digitello.auth_service.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    public void testLogin() {
        User user = new User();
        user.setUsername("admin");
        user.setPassword("encoded_password");
        user.setRole(User.Role.ADMIN);
        user.setEnabled(true);

        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("mock-token");

        LoginRequest request = new LoginRequest("admin", "admin123");
        Map<String, String> response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-token", response.get("token"));
    }
}
