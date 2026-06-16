package com.qlpk.backend.controller;

import com.qlpk.backend.entity.DangKyKhamBenh;
import com.qlpk.backend.service.DangKyKhamBenhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dang-ky")
@CrossOrigin("*")
public class DangKyKhamBenhController {

    @Autowired
    private DangKyKhamBenhService service;

    @GetMapping("/today")
    public ResponseEntity<List<Map<String, Object>>> getToday(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(service.getTodayRegistrationsDetailedWithSearch(keyword.trim()));
        }
        return ResponseEntity.ok(service.getTodayRegistrationsDetailed());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        String status = payload.get("trangThai");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().body("Thiếu thông tin trangThai");
        }
        
        DangKyKhamBenh updated = service.updateStatus(id, status);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
