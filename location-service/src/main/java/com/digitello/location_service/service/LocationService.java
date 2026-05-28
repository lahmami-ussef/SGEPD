package com.digitello.location_service.service;

import com.digitello.location_service.dto.*;
import com.digitello.location_service.entity.Location;
import com.digitello.location_service.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final GeocodingService geocodingService;

    public List<LocationResponse> getAll() {
        return locationRepository.findAll()
                .stream()
                .map(LocationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public LocationResponse getById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Localisation non trouvée avec id: " + id));
        return LocationResponse.fromEntity(location);
    }

    public LocationResponse getByScreenId(Long screenId) {
        Location location = locationRepository.findByScreenId(screenId)
                .orElseThrow(() -> new RuntimeException("Localisation non trouvée pour screen: " + screenId));
        return LocationResponse.fromEntity(location);
    }

    public LocationResponse create(LocationRequest request) {
    // ✅ Si une localisation existe déjà pour cet écran, on la met à jour
    Optional<Location> existing = locationRepository.findByScreenId(request.getScreenId());
    if (existing.isPresent()) {
        Location location = existing.get();
        location.setCity(request.getCity());
        location.setAddress(request.getAddress());
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setCountry(request.getCountry());
        location.setPostalCode(request.getPostalCode());
        location.setRegion(request.getRegion());
        return LocationResponse.fromEntity(locationRepository.save(location));
    }

    // Sinon on crée une nouvelle
    Location location = Location.builder()
            .screenId(request.getScreenId())
            .city(request.getCity())
            .address(request.getAddress())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .country(request.getCountry())
            .postalCode(request.getPostalCode())
            .region(request.getRegion())
            .build();
    return LocationResponse.fromEntity(locationRepository.save(location));
}
    public LocationResponse createWithGeocoding(String address, Long screenId) {
        GeocodingResponse geo = geocodingService.geocode(address);
        Location location = Location.builder()
                .screenId(screenId)
                .address(address)
                .latitude(geo.getLatitude())
                .longitude(geo.getLongitude())
                .city(geo.getCity())
                .country(geo.getCountry())
                .build();
        return LocationResponse.fromEntity(locationRepository.save(location));
    }

    public LocationResponse update(Long id, LocationRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Localisation non trouvée avec id: " + id));
        location.setCity(request.getCity());
        location.setAddress(request.getAddress());
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setCountry(request.getCountry());
        location.setPostalCode(request.getPostalCode());
        location.setRegion(request.getRegion());
        return LocationResponse.fromEntity(locationRepository.save(location));
    }

    public void delete(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Localisation non trouvée avec id: " + id);
        }
        locationRepository.deleteById(id);
    }

    public List<LocationResponse> getByCity(String city) {
        return locationRepository.findByCityContainingIgnoreCase(city)
                .stream()
                .map(LocationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<LocationResponse> getNearby(Double lat, Double lng, Double radius) {
        return locationRepository.findNearby(lat, lng, radius)
                .stream()
                .map(LocationResponse::fromEntity)
                .collect(Collectors.toList());
    }
}