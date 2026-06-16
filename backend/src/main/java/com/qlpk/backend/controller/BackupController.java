package com.qlpk.backend.controller;

import com.qlpk.backend.service.DatabaseBackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/backup")
@CrossOrigin("*")
public class BackupController {

    @Autowired
    private DatabaseBackupService backupService;

    @GetMapping("/export")
    public ResponseEntity<?> exportBackup() {
        try {
            Map<String, Object> backupResult = backupService.createBackup();
            String filename = (String) backupResult.get("filename");
            byte[] data = backupService.downloadBackup(filename);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(data.length);

            return new ResponseEntity<>(data, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importBackup(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new java.util.HashMap<>();
        try {
            backupService.restoreFromUpload(file);
            response.put("success", true);
            response.put("message", "Khôi phục dữ liệu thành công!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Lỗi trong quá trình khôi phục: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}