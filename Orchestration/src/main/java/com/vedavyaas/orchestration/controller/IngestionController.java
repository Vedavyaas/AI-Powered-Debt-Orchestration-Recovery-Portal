package com.vedavyaas.orchestration.controller;

import com.vedavyaas.orchestration.model.InvalidCredentialsException;
import com.vedavyaas.orchestration.service.DebtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Endpoint to accept data in a csv file in bulk
 */

@RestController
@Secured("SCOPE_ROLE_MANAGER")
@RequestMapping("/api/debt")
public class IngestionController {

    private final DebtService debtService;

    public IngestionController(DebtService debtService) {
        this.debtService = debtService;
    }

    @PostMapping("/bulk")
    public ResponseEntity<String> bulkIngestionCSV(@RequestBody MultipartFile multipartFile, @AuthenticationPrincipal Jwt jwt) {
        /**
         * Format of csv
         * debt_name, customer_name, customer_email, customer_phone_number, principal_amount, outstanding_amount, due_date, status
         */

        if (multipartFile.isEmpty()) {
            throw new InvalidCredentialsException("File is empty.");
        }

        return ResponseEntity.ok(debtService.bulkIngestion(multipartFile, jwt.getSubject()));
    }
}
