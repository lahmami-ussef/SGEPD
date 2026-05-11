package com.digitello.client_service.service;

import com.digitello.client_service.dto.ClientRequest;
import com.digitello.client_service.dto.ClientResponse;
import com.digitello.client_service.entity.Client;
import com.digitello.client_service.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

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
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        // TODO: Check for active/future assignments before deleting
        // TODO: Deactivate user account via API Gateway/orchestrator later

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
