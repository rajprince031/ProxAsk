package com.proxask.service.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Service
public class JWTService {

    private final SecretKey jwtSecretKey;

    public JWTService() {
        jwtSecretKey = generateKey();
    }

    public String generateToken(String username) {
        Date currentDate = new Date();
        long jwtExpirationDate = 3600000;
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);
        return Jwts.builder()
                .subject(username)
                .issuedAt(currentDate)
                .expiration(expireDate)
                .signWith(jwtSecretKey)
                .compact();
    }

    public SecretKey generateKey(){
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("HmacSHA256");
            return keyGenerator.generateKey();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean validateToken(String token){
        try {
            Jwts.parser()
                    .verifyWith(jwtSecretKey)
                    .build()
                    .parse(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String extractUsername(String token) {
        System.out.println("------------------------------"+extractAllClaims(token).getSubject());
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenExpired(String token){
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parser()
                .verifyWith(jwtSecretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
