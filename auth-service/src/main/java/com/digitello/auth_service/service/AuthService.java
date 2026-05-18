package com.digitello.auth_service.service;

import com.digitello.auth_service.dto.*;
import com.digitello.auth_service.entity.User;
import com.digitello.auth_service.repository.UserRepository;
import com.digitello.auth_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service gérant la logique métier de l'authentification.
 * Responsable de la vérification des identifiants et de la génération des tokens.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Authentifie un utilisateur existant.
     * 1. Cherche l'utilisateur par son username.
     * 2. Compare le mot de passe fourni avec le hash stocké.
     * 3. Génère un token JWT si tout est correct.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérification sécurisée du mot de passe (BCrypt)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // Création du jeton avec le rôle inclus pour les futures vérifications
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    /**
     * Enregistre une nouvelle identité dans la base de données.
     * Note: Ce service ne stocke que les données d'authentification.
     */
    public AuthResponse register(RegisterRequest request) {
        // Validation de l'unicité
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username déjà utilisé");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Hachage du mot de passe avant stockage
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(request.getRole() != null ? request.getRole() : User.Role.CLIENT)
                .build(); // 

        userRepository.save(user);

        // Retourne un token pour que l'utilisateur soit connecté immédiatement
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
}