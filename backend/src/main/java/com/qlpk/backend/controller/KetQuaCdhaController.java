package com.qlpk.backend.controller;

import com.qlpk.backend.entity.KetQuaCdha;
import com.qlpk.backend.service.KetQuaCdhaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ket-qua-cdha")
@CrossOrigin(origins = "*") 
public class KetQuaCdhaController {

    @Autowired
    private KetQuaCdhaService service;

    // 1. Lấy danh sách tất cả kết quả CĐHA
    @GetMapping
    public ResponseEntity<List<KetQuaCdha>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // 2. Lấy chi tiết một kết quả theo ID
    @GetMapping("/{id}")
    public ResponseEntity<KetQuaCdha> getById(@PathVariable Integer id) {
        KetQuaCdha result = service.getById(id);
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.notFound().build();
    }

    // 3. Thêm mới một kết quả CĐHA (Dành cho kỹ thuật viên nhập)
    @PostMapping
    public ResponseEntity<KetQuaCdha> create(@RequestBody KetQuaCdha entity) {
        try {
            return ResponseEntity.ok(service.create(entity));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 4. Cập nhật kết quả CĐHA
    @PutMapping("/{id}")
    public ResponseEntity<KetQuaCdha> update(@PathVariable Integer id, @RequestBody KetQuaCdha entity) {
        KetQuaCdha updated = service.update(id, entity);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // 5. Xóa kết quả
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Lấy danh sách chờ duyệt trong ngày
    @GetMapping("/today")
    public ResponseEntity<List<Map<String, Object>>> getTodayResults() {
        return ResponseEntity.ok(service.getTodayResults());
    }

    // 7. Lấy danh sách kết quả CĐHA trong ngày theo bác sĩ thực hiện
    @GetMapping("/today/doctor/{doctorId}")
    public ResponseEntity<List<Map<String, Object>>> getTodayResultsByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getTodayResultsByDoctorId(doctorId));
    }

    // 8. Bác sĩ duyệt kết quả 
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveResult(@PathVariable Integer id) {
        KetQuaCdha updated = service.updateStatus(id, "DA_DUYET");
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy mã kết quả: " + id));
    }
}