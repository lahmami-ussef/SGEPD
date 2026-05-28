package com.digitello.assignment_service.service;

import com.digitello.assignment_service.dto.*;
import com.digitello.assignment_service.entity.Assignment;
import com.digitello.assignment_service.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public List<AssignmentResponse> getAll() {
        return assignmentRepository.findAll()
                .stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public AssignmentResponse getById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée avec id: " + id));
        return AssignmentResponse.fromEntity(assignment);
    }

    public AssignmentResponse create(AssignmentRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("La date de fin doit être après la date de début");
        }

        List<Assignment> conflicts = assignmentRepository.findConflicts(
                request.getScreenId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException(
                "Conflit détecté : cet écran est déjà affecté du " +
                conflicts.get(0).getStartDate() + " au " +
                conflicts.get(0).getEndDate()
            );
        }

        Assignment assignment = Assignment.builder()
                .screenId(request.getScreenId())
                .clientId(request.getClientId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription())
                .build();

        return AssignmentResponse.fromEntity(assignmentRepository.save(assignment));
    }

    public AssignmentResponse update(Long id, AssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affectation non trouvée avec id: " + id));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("La date de fin doit être après la date de début");
        }

        assignment.setScreenId(request.getScreenId());
        assignment.setClientId(request.getClientId());
        assignment.setStartDate(request.getStartDate());
        assignment.setEndDate(request.getEndDate());
        assignment.setDescription(request.getDescription());

        return AssignmentResponse.fromEntity(assignmentRepository.save(assignment));
    }

    public void delete(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new RuntimeException("Affectation non trouvée avec id: " + id);
        }
        assignmentRepository.deleteById(id);
    }

    public List<AssignmentResponse> getByScreenId(Long screenId) {
        return assignmentRepository.findByScreenId(screenId)
                .stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AssignmentResponse> getByClientId(Long clientId) {
        return assignmentRepository.findByClientId(clientId)
                .stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<AssignmentResponse> getExpiringSoon(int days) {
        LocalDate today = LocalDate.now();
        LocalDate limitDate = today.plusDays(days);
        return assignmentRepository.findExpiringBetween(today, limitDate)
                .stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public boolean checkIfClientHasActiveAssignments(Long clientId) {
        return assignmentRepository.existsByClientId(clientId);
    }
}