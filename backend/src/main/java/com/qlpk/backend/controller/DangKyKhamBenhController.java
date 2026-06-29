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

// lấy tất cả đăng ký khám bệnh
    @GetMapping
    public ResponseEntity<List<DangKyKhamBenh>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

// lấy đăng ký khám theo ID
    @GetMapping("/{id}")
    public ResponseEntity<DangKyKhamBenh> getById(@PathVariable Integer id) {
        DangKyKhamBenh entity = service.getById(id);
        if (entity != null) {
            return ResponseEntity.ok(entity);
        }
        return ResponseEntity.notFound().build();
    }

// tạo đăng ký khám mới
    @PostMapping
    public ResponseEntity<DangKyKhamBenh> create(@RequestBody DangKyKhamBenh entity) {
        DangKyKhamBenh created = service.create(entity);
        return ResponseEntity.ok(created);
    }

// cập nhật đăng ký khám
    @PutMapping("/{id}")
    public ResponseEntity<DangKyKhamBenh> update(@PathVariable Integer id, @RequestBody DangKyKhamBenh entity) {
        entity.setId(id);
        DangKyKhamBenh updated = service.update(id, entity);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

// xóa đăng ký khám
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

// lấy danh sách đăng ký khám trong ngày
    @GetMapping("/today")
    public ResponseEntity<List<Map<String, Object>>> getToday(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(service.getTodayRegistrationsDetailedWithSearch(keyword.trim()));
        }
        return ResponseEntity.ok(service.getTodayRegistrationsDetailed());
    }

// cập nhật trạng thái đăng ký khám
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
