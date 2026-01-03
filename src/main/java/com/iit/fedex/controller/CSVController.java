package com.iit.fedex.controller;

import com.iit.fedex.dto.AdminAssignment;
import com.iit.fedex.repository.DebtCaseEntity;
import com.iit.fedex.service.CSVService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class CSVController {

    private final CSVService csvService;

    public CSVController(CSVService csvService) {
        this.csvService = csvService;
    }

    @PostMapping("/put/CSV")
    public String putCSV(@RequestParam MultipartFile file) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        if (file.isEmpty()) return "File is empty!";
        return csvService.putCSV(user , file);
    }

    @PutMapping("/put/assignedTo")
    public String putAssignedTo(@RequestBody AdminAssignment adminAssignment) {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return csvService.assign(user, adminAssignment);
    }

    @GetMapping("/get/CSV")
    public List<DebtCaseEntity> getCSV() {
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return csvService.getCSV(user);
    }
}
