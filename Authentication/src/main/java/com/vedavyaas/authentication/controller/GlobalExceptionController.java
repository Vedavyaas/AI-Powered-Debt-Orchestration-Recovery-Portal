package com.vedavyaas.authentication.controller;

import com.vedavyaas.authentication.model.InvalidCredentialException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionController {
    @ExceptionHandler(InvalidCredentialException.class)
    public ResponseEntity<String> exceptionHandler(InvalidCredentialException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
