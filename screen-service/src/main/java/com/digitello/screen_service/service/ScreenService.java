package com.digitello.screen_service.service;

import com.digitello.screen_service.dto.*;
import com.digitello.screen_service.entity.Screen;
import com.digitello.screen_service.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenRepository screenRepository;

    public List<ScreenResponse> getAll() {
        return screenRepository.findAll()
                .stream()
                .map(ScreenResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ScreenResponse getById(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Écran non trouvé avec id: " + id));
        return ScreenResponse.fromEntity(screen);
    }

    // ✅ updateStatus — accepte String et convertit en enum
    public ScreenResponse updateStatus(Long id, String status) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Écran non trouvé avec id: " + id));
        try {
            screen.setStatus(Screen.Status.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide : " + status + ". Valeurs acceptées : ACTIF, EN_PANNE, EN_MAINTENANCE");
        }
        return ScreenResponse.fromEntity(screenRepository.save(screen));
    }

    public ScreenResponse create(ScreenRequest request) {
        Screen screen = Screen.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .model(request.getModel())
                .size(request.getSize())
                .resolution(request.getResolution())
                .os(request.getOs())
                .osVersion(request.getOsVersion())
                .ssid(request.getSsid())
                .macAddress(request.getMacAddress())
                .wifiSignal(request.getWifiSignal())
                .playerModel(request.getPlayerModel())
                .playerVersion(request.getPlayerVersion())
                .playerStorage(request.getPlayerStorage())
                .city(request.getCity())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(request.getStatus() != null ? request.getStatus() : Screen.Status.ACTIF)
                .build();

        return ScreenResponse.fromEntity(screenRepository.save(screen));
    }

    public ScreenResponse update(Long id, ScreenRequest request) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Écran non trouvé avec id: " + id));

        screen.setName(request.getName());
        screen.setBrand(request.getBrand());
        screen.setModel(request.getModel());
        screen.setSize(request.getSize());
        screen.setResolution(request.getResolution());
        screen.setOs(request.getOs());
        screen.setOsVersion(request.getOsVersion());
        screen.setSsid(request.getSsid());
        screen.setMacAddress(request.getMacAddress());
        screen.setWifiSignal(request.getWifiSignal());
        screen.setPlayerModel(request.getPlayerModel());
        screen.setPlayerVersion(request.getPlayerVersion());
        screen.setPlayerStorage(request.getPlayerStorage());
        screen.setCity(request.getCity());
        screen.setAddress(request.getAddress());
        screen.setLatitude(request.getLatitude());
        screen.setLongitude(request.getLongitude());
        if (request.getStatus() != null) screen.setStatus(request.getStatus());

        return ScreenResponse.fromEntity(screenRepository.save(screen));
    }

    public void delete(Long id) {
        if (!screenRepository.existsById(id)) {
            throw new RuntimeException("Écran non trouvé avec id: " + id);
        }
        screenRepository.deleteById(id);
    }

    public List<ScreenResponse> getByStatus(Screen.Status status) {
        return screenRepository.findByStatus(status)
                .stream()
                .map(ScreenResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ScreenResponse> getByCity(String city) {
        return screenRepository.findByCity(city)
                .stream()
                .map(ScreenResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ✅ helper privé si ScreenResponse.fromEntity n'existe pas
    private ScreenResponse mapToResponse(Screen screen) {
        return ScreenResponse.fromEntity(screen);
    }
}