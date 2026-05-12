package com.digitello.location_service.service;

import com.digitello.location_service.dto.GeocodingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeocodingService {

    @Value("${osm.nominatim.url}")
    private String nominatimUrl;

    @SuppressWarnings("unchecked")
    public GeocodingResponse geocode(String address) {
        WebClient client = WebClient.builder()
                .baseUrl(nominatimUrl)
                .defaultHeader("User-Agent", "Digitello-SGEPD/1.0")
                .build();

        List<Map<String, Object>> results = (List<Map<String, Object>>) (List<?>) client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", address)
                        .queryParam("format", "json")
                        .queryParam("limit", "1")
                        .build())
                .retrieve()
                .bodyToFlux(Map.class)
                .collectList()
                .block();

        if (results == null || results.isEmpty()) {
            throw new RuntimeException("Adresse non trouvée : " + address);
        }

        Map<String, Object> result = results.get(0);
        GeocodingResponse response = new GeocodingResponse();
        response.setLatitude(Double.parseDouble(result.get("lat").toString()));
        response.setLongitude(Double.parseDouble(result.get("lon").toString()));
        response.setDisplayName(result.get("display_name").toString());
        return response;
    }

    @SuppressWarnings("unchecked")
    public GeocodingResponse reverseGeocode(Double lat, Double lng) {
        WebClient client = WebClient.builder()
                .baseUrl(nominatimUrl)
                .defaultHeader("User-Agent", "Digitello-SGEPD/1.0")
                .build();

        Map<String, Object> result = (Map<String, Object>) client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/reverse")
                        .queryParam("lat", lat)
                        .queryParam("lon", lng)
                        .queryParam("format", "json")
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (result == null) {
            throw new RuntimeException("Coordonnées non trouvées");
        }

        GeocodingResponse response = new GeocodingResponse();
        response.setLatitude(lat);
        response.setLongitude(lng);
        response.setDisplayName(result.get("display_name").toString());
        return response;
    }
}