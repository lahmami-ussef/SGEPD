package com.digitello.location_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LocationRequest {

    @NotNull
    private Long screenId;

    @NotBlank
    private String city;

    @NotBlank
    private String address;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String country;
    private String postalCode;
    private String region;
}