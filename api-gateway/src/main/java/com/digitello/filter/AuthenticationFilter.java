package com.digitello.filter;

import com.digitello.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            System.out.println("🌐 Gateway reçoit une requête sur : " + path);
            
            if (validator.isSecured.test(exchange.getRequest())) {
                System.out.println("🛡️ Route SÉCURISÉE détectée");
                // Check if missing authorization header
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    System.out.println("⚠️ Header Authorization MANQUANT");
                    return onError(exchange.getResponse(), "Missing Authorization header", HttpStatus.UNAUTHORIZED);
                }

                List<String> authHeaders = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);
                String authHeader = (authHeaders != null && !authHeaders.isEmpty()) ? authHeaders.get(0) : null;
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    jwtUtil.validateToken(authHeader);

                    Claims claims = jwtUtil.getClaims(authHeader);
                    String username = claims.getSubject();
                    String role = claims.get("role", String.class);
                    // Extract custom fields if necessary

                    ServerHttpRequest request = exchange.getRequest().mutate()
                            .header("X-Username", username)
                            .header("X-User-Role", role)
                            .build();

                    return chain.filter(exchange.mutate().request(request).build());

                } catch (Exception e) {
                    System.err.println("❌ Erreur validation Token : " + e.getMessage());
                    return onError(exchange.getResponse(), "Unauthorized access to application", HttpStatus.UNAUTHORIZED);
                }
            } else {
                System.out.println("🔓 Route PUBLIQUE détectée (Auth)");
            }
            return chain.filter(exchange);
        });
    }

    private Mono<Void> onError(ServerHttpResponse response, String errCode, HttpStatus httpStatus) {
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"message\":\"" + errCode + "\"}";
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
    }
}
