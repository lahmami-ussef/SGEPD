package com.digitello.location_service.dto;

import lombok.Data;

@Data
public class GeocodingResponse {
    private Double latitude;
    private Double longitude;
    private String displayName;
    private String city;
    private String country;
    private String postalCode;
}