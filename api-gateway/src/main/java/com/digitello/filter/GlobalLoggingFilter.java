package com.digitello.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class GlobalLoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        System.out.println("🛰️ GLOBAL FILTER : Requête détectée sur " + path);
        
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            System.out.println("✅ GLOBAL FILTER : Réponse renvoyée pour " + path + " | Status: " + exchange.getResponse().getStatusCode());
        }));
    }

    @Override
    public int getOrder() {
        return -1; // Priorité haute
    }
}
