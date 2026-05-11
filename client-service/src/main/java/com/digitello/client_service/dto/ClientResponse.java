package com.digitello.client_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private Long id;
    private String raisonSociale;
    private String nomContact;
    private String email;
    private String telephone;
    private String adressePostale;
    private Long userId;
}
