package com.example.server.global.jwt;

import com.example.server.config.SupabaseProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SigningKeyResolverAdapter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigInteger;
import java.net.URI;
import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class JwtUtil {

    private final SupabaseProperties supabaseProperties;
    private final WebClient webClient;
    private final Map<String, Key> keyCache = new ConcurrentHashMap<>();

    public JwtUtil(SupabaseProperties supabaseProperties) {
        this.supabaseProperties = supabaseProperties;
        this.webClient = WebClient.create();
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKeyResolver(new SigningKeyResolverAdapter() {
                    @Override
                    public Key resolveSigningKey(JwsHeader header, Claims claims) {
                        String kid = header.getKeyId();
                        return keyCache.computeIfAbsent(kid, k -> getPublicKey(k));
                    }
                })
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    private Key getPublicKey(String kid) {
        try {
            // Fetch JWKS from Supabase
            Map<String, List<Map<String, String>>> jwks = webClient.get()
                    .uri(URI.create(supabaseProperties.getJwksUrl()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (jwks == null || !jwks.containsKey("keys")) {
                throw new RuntimeException("Invalid JWKS format");
            }

            // Find the key with the matching "kid"
            Map<String, String> keyInfo = jwks.get("keys").stream()
                    .filter(key -> kid.equals(key.get("kid")))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Public key not found for kid: " + kid));

            // Decode the RSA public key components
            BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode(keyInfo.get("n")));
            BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode(keyInfo.get("e")));
            RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
            KeyFactory factory = KeyFactory.getInstance("RSA");
            return factory.generatePublic(spec);

        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            log.error("Error creating public key", e);
            throw new RuntimeException("Failed to create public key", e);
        } catch (Exception e) {
            log.error("Unexpected error while fetching public key", e);
            throw new RuntimeException("Unexpected error while fetching public key", e);
        }
    }
}
