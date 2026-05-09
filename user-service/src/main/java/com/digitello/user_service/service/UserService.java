package com.digitello.user_service.service;

import com.digitello.user_service.dto.UserDTO;
import com.digitello.user_service.entity.User;
import com.digitello.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service gérant la logique métier des utilisateurs.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Crée un nouvel utilisateur en encodant son mot de passe.
     * @param user L'entité utilisateur à enregistrer.
     * @return Le DTO de l'utilisateur créé.
     */
    public UserDTO createUser(User user) {
        // Vérifier si l'email existe déjà pour éviter les doublons
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        
        // Crypter le mot de passe avant l'enregistrement en base de données
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Sauvegarder l'entité
        User savedUser = userRepository.save(user);
        
        // Convertir l'entité en DTO pour la réponse
        return mapToDTO(savedUser);
    }

    /**
     * Récupère la liste de tous les utilisateurs inscrits.
     * @return Liste de UserDTO.
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un utilisateur par son identifiant unique.
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return mapToDTO(user);
    }

    /**
     * Supprime un utilisateur de la base de données.
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Méthode privée pour transformer une Entité (User) en DTO (UserDTO).
     * Cela permet de ne pas exposer le champ 'password' vers l'extérieur.
     */
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .email(user.getEmail())
                .build();
    }
}
