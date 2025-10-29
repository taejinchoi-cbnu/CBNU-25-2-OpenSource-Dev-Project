package com.example.server.global.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import com.example.server.global.common.ErrorResponse;
import com.example.server.auth.exception.SupabaseAuthException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(WebExchangeBindException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
        ErrorResponse errorResponse = new ErrorResponse(errorMessage, 400);
        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(SupabaseAuthException.class)
    public ResponseEntity<ErrorResponse> handleSupabaseAuthException(SupabaseAuthException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), ex.getStatusCode().value());
        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }
}
