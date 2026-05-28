package com.digitello.screen_service.controller;

import com.digitello.screen_service.dto.*;
import com.digitello.screen_service.entity.Screen;
import com.digitello.screen_service.service.ScreenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/screens")
@RequiredArgsConstructor
public class ScreenController {

    private final ScreenService screenService;

    @GetMapping
    public ResponseEntity<List<ScreenResponse>> getAll() {
        return ResponseEntity.ok(screenService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(screenService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ScreenResponse> create(@Valid @RequestBody ScreenRequest request) {
        return ResponseEntity.status(201).body(screenService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ScreenRequest request) {
        return ResponseEntity.ok(screenService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        screenService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ScreenResponse>> getByStatus(@PathVariable Screen.Status status) {
        return ResponseEntity.ok(screenService.getByStatus(status));
    }

    // ✅ PATCH status — pour technicien
    @PatchMapping("/{id}/status")
    public ResponseEntity<ScreenResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(screenService.updateStatus(id, status));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<ScreenResponse>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(screenService.getByCity(city));
    }
}