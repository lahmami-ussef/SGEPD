package com.digitello.auth_service.controller;

import com.digitello.auth_service.dto.*;
import com.digitello.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur gérant les requêtes d'authentification (Login, Inscription).
 * Toutes les routes ici sont préfixées par /api/auth.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Autorise les appels Cross-Origin (utile pour le frontend)
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint pour la connexion.
     * @param request Contient le username et le password.
     * @return Un token JWT et les infos de l'utilisateur en cas de succès.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Endpoint pour la création d'un nouveau compte (Identité).
     * @param request Contient username, password, email et role.
     * @return Un token JWT pour une connexion immédiate après inscription.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }
}