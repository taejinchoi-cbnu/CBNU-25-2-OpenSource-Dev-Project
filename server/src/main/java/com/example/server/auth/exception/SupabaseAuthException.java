package com.mysite.server.auth.exception;

import lombok.Getter;
import org.springframework.http.HttpStatusCode;

@Getter
public class SupabaseAuthException extends RuntimeException {
    private final HttpStatusCode statusCode;

    public SupabaseAuthException(String message, HttpStatusCode statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
