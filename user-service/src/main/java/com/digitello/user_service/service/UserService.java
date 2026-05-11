package com.digitello.user_service.service;

import com.digitello.user_service.dto.CreateUserRequest;
import com.digitello.user_service.dto.UserDTO;
import com.digitello.user_service.entity.User;
import com.digitello.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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

    /**
     * Crée un nouvel utilisateur.
     * @param request Les données de l'utilisateur.
     * @return Le DTO de l'utilisateur créé.
     */
    public UserDTO createUser(CreateUserRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        
        // Mapper DTO -> Entity
        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role(User.Role.valueOf(request.getRole()))
                .build();
        
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
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
