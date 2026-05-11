package com.digitello.assignment_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AssignmentRequest {

    @NotNull
    private Long screenId;

    @NotNull
    private Long clientId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String description;
}