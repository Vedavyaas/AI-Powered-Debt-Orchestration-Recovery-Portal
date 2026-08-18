package com.vedavyaas.orchestration.controller;

import com.vedavyaas.orchestration.model.InvalidCredentialsException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionController {
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<String> handleException(InvalidCredentialsException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
