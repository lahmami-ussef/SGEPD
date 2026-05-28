package com.digitello.client_service.service;

import com.digitello.client_service.dto.ClientRequest;
import com.digitello.client_service.dto.ClientResponse;
import com.digitello.client_service.entity.Client;
import com.digitello.client_service.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final RestTemplate restTemplate;

    @Value("${services.assignment-url:http://localhost:8087}")
    private String assignmentServiceUrl;

    @Transactional
    public ClientResponse createClient(ClientRequest request) {
        if (clientRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà existant");
        }

        // 1. Create client
        Client client = Client.builder()
            .raisonSociale(request.getRaisonSociale())
            .nomContact(request.getNomContact())
            .email(request.getEmail())
            .telephone(request.getTelephone())
            .adressePostale(request.getAdressePostale())
            .userId(0L) // Placeholder: Account creation will be handled via API Gateway or orchestrator later
            .build();

        Client savedClient = clientRepository.save(client);
        
        // TODO: Send confirmation email via external service
        
        return mapToResponse(savedClient);
    }

    public List<ClientResponse> getAllClients() {
        return clientRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public ClientResponse getClientById(Long id) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        return mapToResponse(client);
    }

    @Transactional
    public ClientResponse updateClient(Long id, ClientRequest request) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        client.setRaisonSociale(request.getRaisonSociale());
        client.setNomContact(request.getNomContact());
        client.setTelephone(request.getTelephone());
        client.setAdressePostale(request.getAdressePostale());

        return mapToResponse(clientRepository.save(client));
    }

    @Transactional
    public void deleteClient(Long id, String authHeader) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        // 1. Vérifier l'intégrité référentielle
        String url = assignmentServiceUrl + "/api/assignments/client/" + id + "/has-active";
        
        try {
            HttpHeaders headers = new HttpHeaders();
            if (authHeader != null && !authHeader.isEmpty()) {
                headers.set("Authorization", authHeader);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Boolean> response = restTemplate.exchange(url, HttpMethod.GET, entity, Boolean.class);
            Boolean hasActiveAssignments = response.getBody();
            
            if (Boolean.TRUE.equals(hasActiveAssignments)) {
                throw new RuntimeException("Impossible de supprimer : ce client possède des assignations liées.");
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la communication avec le service d'assignation : " + e.getMessage());
        }

        // 2. TODO: Deactivate user account via API Gateway/orchestrator later

        // 3. Delete the client
        clientRepository.delete(client);
    }

    private ClientResponse mapToResponse(Client client) {
        return ClientResponse.builder()
            .id(client.getId())
            .raisonSociale(client.getRaisonSociale())
            .nomContact(client.getNomContact())
            .email(client.getEmail())
            .telephone(client.getTelephone())
            .adressePostale(client.getAdressePostale())
            .userId(client.getUserId())
            .build();
    }
}
