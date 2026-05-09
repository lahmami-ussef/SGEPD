package com.digitello.screen_service.dto;

import com.digitello.screen_service.entity.Screen;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ScreenRequest {

    @NotBlank
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
    private String playerModel;
    private String playerVersion;
    private String playerStorage;
    private String city;
    private String address;
    private Double latitude;
    private Double longitude;
    private Screen.Status status;
}