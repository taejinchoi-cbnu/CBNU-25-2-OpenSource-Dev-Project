package com.example.server.board.exception;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(String message) {
        super(message);
    }
}
