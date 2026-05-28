package com.digitello.assignment_service.controller;

import com.digitello.assignment_service.dto.*;
import com.digitello.assignment_service.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getAll() {
        return ResponseEntity.ok(assignmentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getById(id));
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest request) {
        try {
            return ResponseEntity.status(201).body(assignmentService.create(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/screen/{screenId}")
    public ResponseEntity<List<AssignmentResponse>> getByScreenId(@PathVariable Long screenId) {
        return ResponseEntity.ok(assignmentService.getByScreenId(screenId));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AssignmentResponse>> getByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(assignmentService.getByClientId(clientId));
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<AssignmentResponse>> getExpiringSoon(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(assignmentService.getExpiringSoon(days));
    }

    @GetMapping("/client/{clientId}/has-active")
    public ResponseEntity<Boolean> hasActiveAssignments(@PathVariable Long clientId) {
        return ResponseEntity.ok(assignmentService.checkIfClientHasActiveAssignments(clientId));
    }
}