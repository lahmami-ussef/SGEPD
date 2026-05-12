package com.digitello.location_service.dto;

import com.digitello.location_service.entity.Location;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LocationResponse {

    private Long id;
    private Long screenId;
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;
    private String country;
    private String postalCode;
    private String region;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LocationResponse fromEntity(Location location) {
        LocationResponse response = new LocationResponse();
        response.setId(location.getId());
        response.setScreenId(location.getScreenId());
        response.setCity(location.getCity());
        response.setAddress(location.getAddress());
        response.setLatitude(location.getLatitude());
        response.setLongitude(location.getLongitude());
        response.setCountry(location.getCountry());
        response.setPostalCode(location.getPostalCode());
        response.setRegion(location.getRegion());
        response.setCreatedAt(location.getCreatedAt());
        response.setUpdatedAt(location.getUpdatedAt());
        return response;
    }
}