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
import java.security.AlgorithmParameters;
import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPublicKeySpec;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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

    /**
     * JWT 토큰에서 클레임(페이로드)을 추출
     * @param token JWT 문자열
     * @return JWT 클레임
     */
    public Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKeyResolver(new SigningKeyResolverAdapter() {
                    // JWT 헤더의 kid(Key ID)를 기반으로 서명 키를 동적으로 찾아 반환합니다.
                    @Override
                    public Key resolveSigningKey(JwsHeader header, Claims claims) {
                        String kid = header.getKeyId();
                        // 캐시에 키가 없으면 getPublicKey 메서드를 호출하여 가져온 후 캐싱
                        return keyCache.computeIfAbsent(kid, k -> getPublicKey(k));
                    }
                })
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * JWT 토큰의 유효성을 검증합니다.
     * @param token JWT 문자열
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            log.error("유효하지 않은 JWT 토큰임: {}", e.getMessage());
            return false;
        }
    }

    /**
     * JWT 토큰에서 이메일 클레임을 추출
     * @param token JWT 문자열
     * @return 이메일 문자열
     */
    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    /**
     * JWT 토큰에서 사용자 ID (UUID) 클레임을 추출
     * @param token JWT 문자열
     * @return 사용자 ID (UUID)
     */
    public UUID getUserId(String token) {
        String subject = getClaims(token).getSubject();
        return UUID.fromString(subject);
    }

    /**
     * JWKS(JSON Web Key Set)에서 kid에 해당하는 공개 키를 가져와 생성합
     * @param kid Key ID
     * @return 공개 키(Key) 객체
     */
    private Key getPublicKey(String kid) {
        try {
            // Supabase JWKS 엔드포인트에서 JWKS를 가져옴
            Map<String, List<Map<String, String>>> jwks = webClient.get()
                    .uri(URI.create(supabaseProperties.getJwksUrl()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (jwks == null || !jwks.containsKey("keys")) {
                throw new RuntimeException("유효하지 않은 JWKS 형식");
            }

            // JWKS에서 kid가 일치하는 키 정보를 찾기
            Map<String, String> keyInfo = jwks.get("keys").stream()
                    .filter(key -> kid.equals(key.get("kid")))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("kid에 해당하는 공개 키를 찾을 수 없음: " + kid));

            String kty = keyInfo.get("kty");

            if ("EC".equals(kty)) {
                // EC(Elliptic Curve) 키 처리
                String x = keyInfo.get("x");
                String y = keyInfo.get("y");
                String crv = keyInfo.get("crv");

                if (x == null || y == null || crv == null) {
                    throw new RuntimeException("EC 키 구성 요소(x, y, crv)가 누락");
                }

                // Base64 URL 디코딩 및 BigInteger 변환
                BigInteger ecX = new BigInteger(1, Base64.getUrlDecoder().decode(x));
                BigInteger ecY = new BigInteger(1, Base64.getUrlDecoder().decode(y));
                ECPoint ecPoint = new ECPoint(ecX, ecY);

                // 곡선 이름(crv)에 따라 ECParameterSpec 결정
                AlgorithmParameters parameters = AlgorithmParameters.getInstance("EC");
                switch (crv) {
                    case "P-256":
                        parameters.init(new ECGenParameterSpec("secp256r1"));
                        break;
                    case "P-384":
                        parameters.init(new ECGenParameterSpec("secp384r1"));
                        break;
                    case "P-521":
                        parameters.init(new ECGenParameterSpec("secp521r1"));
                        break;
                    default:
                        throw new RuntimeException("지원하지 않는 EC 곡선: " + crv);
                }
                ECParameterSpec ecSpec = parameters.getParameterSpec(ECParameterSpec.class);

                // ECPublicKeySpec을 사용하여 공개 키 생성
                ECPublicKeySpec pubSpec = new ECPublicKeySpec(ecPoint, ecSpec);
                KeyFactory factory = KeyFactory.getInstance("EC");
                return factory.generatePublic(pubSpec);

            } else if ("RSA".equals(kty)) {
                // RSA 키 처리
                BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode(keyInfo.get("n")));
                BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode(keyInfo.get("e")));
                RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
                KeyFactory factory = KeyFactory.getInstance("RSA");
                return factory.generatePublic(spec);
            } else {
                throw new RuntimeException("지원하지 않는 키 타입: " + kty);
            }

        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            log.error("공개 키 생성 중 오류 발생", e);
            throw new RuntimeException("공개 키 생성에 실패.", e);
        } catch (Exception e) {
            log.error("공개 키를 가져오는 중 예상치 못한 오류 발생", e);
            throw new RuntimeException("공개 키를 가져오는 중 예상치 못한 오류 발생", e);
        }
    }
}
