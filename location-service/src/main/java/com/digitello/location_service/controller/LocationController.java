package com.digitello.location_service.controller;

import com.digitello.location_service.dto.*;
import com.digitello.location_service.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<List<LocationResponse>> getAll() {
        return ResponseEntity.ok(locationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getById(id));
    }

    @GetMapping("/screen/{screenId}")
    public ResponseEntity<LocationResponse> getByScreenId(@PathVariable Long screenId) {
        return ResponseEntity.ok(locationService.getByScreenId(screenId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LocationResponse> create(@Valid @RequestBody LocationRequest request) {
        return ResponseEntity.status(201).body(locationService.create(request));
    }

    @PostMapping("/geocode")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LocationResponse> createWithGeocoding(
            @RequestParam String address,
            @RequestParam Long screenId) {
        return ResponseEntity.status(201).body(locationService.createWithGeocoding(address, screenId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LocationResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody LocationRequest request) {
        return ResponseEntity.ok(locationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<LocationResponse>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(locationService.getByCity(city));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<LocationResponse>> getNearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "0.1") Double radius) {
        return ResponseEntity.ok(locationService.getNearby(lat, lng, radius));
    }
}