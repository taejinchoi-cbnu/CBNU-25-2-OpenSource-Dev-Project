package com.example.server.global.exception;

import com.example.server.auth.exception.SupabaseAuthException;
import com.example.server.board.exception.NoPermissionException;
import com.example.server.board.exception.PostNotFoundException;
import com.example.server.global.common.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(WebExchangeBindException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage();
        ErrorResponse errorResponse = new ErrorResponse(errorMessage, HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(SupabaseAuthException.class)
    public ResponseEntity<ErrorResponse> handleSupabaseAuthException(SupabaseAuthException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), ex.getStatusCode().value());
        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }

    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePostNotFoundException(PostNotFoundException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoPermissionException.class)
    public ResponseEntity<ErrorResponse> handleNoPermissionException(NoPermissionException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), HttpStatus.FORBIDDEN.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        // TODO: 로깅 추가 (ex. Sentry, Logback)
        ErrorResponse errorResponse = new ErrorResponse("서버 내부 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
