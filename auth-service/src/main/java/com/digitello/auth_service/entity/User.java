package com.digitello.auth_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité représentant l'identité de l'utilisateur pour l'authentification.
 * Stockée dans la base 'auth_db'.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Utilisé pour le login
    @Column(nullable = false, unique = true)
    private String username;

    // Mot de passe TOUJOURS stocké sous forme de hash (BCrypt)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    // Rôle utilisé pour les autorisations Spring Security
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Permet de désactiver un compte si nécessaire
    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Les différents niveaux d'accès disponibles dans le système.
     */
    public enum Role {
        ADMIN, TECHNICIEN, CLIENT
    }
}