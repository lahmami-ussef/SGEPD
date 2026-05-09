package com.digitello.screen_service.dto;

import com.digitello.screen_service.entity.Screen;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScreenResponse {

    private Long id;
    private String name;
    private String brand;
    private String model;
    private String size;
    private String resolution;
    private String os;
    private String osVersion;
    private String ssid;
    private String macAddress;
    private String wifiSignal;
    private LocalDateTime lastConnection;
    private String playerModel;
    private String playerVersion;
    private String playerStorage;
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;
    private Screen.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ScreenResponse fromEntity(Screen screen) {
        ScreenResponse response = new ScreenResponse();
        response.setId(screen.getId());
        response.setName(screen.getName());
        response.setBrand(screen.getBrand());
        response.setModel(screen.getModel());
        response.setSize(screen.getSize());
        response.setResolution(screen.getResolution());
        response.setOs(screen.getOs());
        response.setOsVersion(screen.getOsVersion());
        response.setSsid(screen.getSsid());
        response.setMacAddress(screen.getMacAddress());
        response.setWifiSignal(screen.getWifiSignal());
        response.setLastConnection(screen.getLastConnection());
        response.setPlayerModel(screen.getPlayerModel());
        response.setPlayerVersion(screen.getPlayerVersion());
        response.setPlayerStorage(screen.getPlayerStorage());
        response.setCity(screen.getCity());
        response.setAddress(screen.getAddress());
        response.setLatitude(screen.getLatitude());
        response.setLongitude(screen.getLongitude());
        response.setStatus(screen.getStatus());
        response.setCreatedAt(screen.getCreatedAt());
        response.setUpdatedAt(screen.getUpdatedAt());
        return response;
    }
}