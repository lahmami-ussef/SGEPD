package com.digitello.assignment_service.dto;

import com.digitello.assignment_service.entity.Assignment;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AssignmentResponse {

    private Long id;
    private Long screenId;
    private Long clientId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private Assignment.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AssignmentResponse fromEntity(Assignment assignment) {
        AssignmentResponse response = new AssignmentResponse();
        response.setId(assignment.getId());
        response.setScreenId(assignment.getScreenId());
        response.setClientId(assignment.getClientId());
        response.setStartDate(assignment.getStartDate());
        response.setEndDate(assignment.getEndDate());
        response.setDescription(assignment.getDescription());
        response.setStatus(assignment.getStatus());
        response.setCreatedAt(assignment.getCreatedAt());
        response.setUpdatedAt(assignment.getUpdatedAt());
        return response;
    }
}