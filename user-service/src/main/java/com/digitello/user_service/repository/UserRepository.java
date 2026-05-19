package com.digitello.user_service.repository;

import com.digitello.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Interface Repository pour l'accès aux données de la table 'users'.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Recherche un utilisateur par son email.
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Vérifie si un email existe déjà en base.
     */
    boolean existsByEmail(String email);

    /**
     * Recherche un utilisateur par son nom d'utilisateur.
     */
    Optional<User> findByUsername(String username);

    /**
     * Supprime un utilisateur par son nom d'utilisateur.
     */
    void deleteByUsername(String username);
}
