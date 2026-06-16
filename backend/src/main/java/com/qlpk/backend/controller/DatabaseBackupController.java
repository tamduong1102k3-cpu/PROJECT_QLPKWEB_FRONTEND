package com.qlpk.backend.controller;

import com.qlpk.backend.service.DatabaseBackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/database")
@CrossOrigin("*")
public class DatabaseBackupController {

    @Autowired
    private DatabaseBackupService databaseBackupService;

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInfo() {
        return ResponseEntity.ok(databaseBackupService.getDatabaseInfo());
    }

    @GetMapping("/backups")
    public ResponseEntity<List<Map<String, Object>>> listBackups() {
        return ResponseEntity.ok(databaseBackupService.listBackups());
    }

    @PostMapping("/backup")
    public ResponseEntity<?> createBackup() {
        try {
            return ResponseEntity.ok(databaseBackupService.createBackup());
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/backups/{filename}/download")
    public ResponseEntity<?> downloadBackup(@PathVariable String filename) {
        try {
            byte[] data = databaseBackupService.downloadBackup(filename);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(data);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/restore/{filename}")
    public ResponseEntity<?> restoreFromBackup(@PathVariable String filename) {
        try {
            databaseBackupService.restoreFromBackup(filename);
            return ResponseEntity.ok(Map.of("message", "Phục hồi database thành công từ file " + filename));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/restore/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> restoreFromUpload(@RequestParam("file") MultipartFile file) {
        try {
            databaseBackupService.restoreFromUpload(file);
            return ResponseEntity.ok(Map.of("message", "Phục hồi database từ file upload thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/backups/{filename}")
    public ResponseEntity<?> deleteBackup(@PathVariable String filename) {
        try {
            databaseBackupService.deleteBackup(filename);
            return ResponseEntity.ok(Map.of("message", "Đã xóa bản sao lưu " + filename));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}