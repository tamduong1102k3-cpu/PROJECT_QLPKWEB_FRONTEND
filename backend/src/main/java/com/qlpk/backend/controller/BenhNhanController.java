package com.qlpk.backend.controller;

import com.qlpk.backend.dto.HoSoBenhNhanDTO;
import com.qlpk.backend.entity.BenhNhan;
import com.qlpk.backend.service.BenhNhanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/benh-nhan")
@CrossOrigin("*")
public class BenhNhanController {

    @Autowired private BenhNhanService service;

    // ── 1. Danh sách tất cả bệnh nhân ────────────────────────────
    @GetMapping
    public List<BenhNhan> getAll() {
        return service.getAll();
    }

    // ── 2. Tìm kiếm bệnh nhân ─────────────────────────────────────
    @GetMapping("/search")
    public List<BenhNhan> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    // ── 3. Chi tiết một bệnh nhân ─────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<BenhNhan> getById(@PathVariable Integer id) {
        BenhNhan result = service.getById(id);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.notFound().build();
    }

    // ── 4. Hồ sơ bệnh nhân: lịch sử khám + hóa đơn ──────────────
    @GetMapping("/{id}/ho-so")
    public List<HoSoBenhNhanDTO> getHoSo(@PathVariable Integer id) {
        return service.getHoSo(id);
    }

    // ── 5. Thêm bệnh nhân mới ─────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> create(@RequestBody BenhNhan benhNhan) {
        try {
            BenhNhan created = service.create(benhNhan);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            if (e.getMessage().contains("Số điện thoại") || e.getMessage().contains("CCCD") || e.getMessage().contains("Email")) {
                return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi cơ sở dữ liệu: " + e.getMessage()));
        }
    }

    // ── 6. Cập nhật bệnh nhân ─────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<BenhNhan> update(@PathVariable Integer id, @RequestBody BenhNhan body) {
        BenhNhan updated = service.update(id, body);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // ── 7. Xóa bệnh nhân ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (service.getById(id) == null) return ResponseEntity.notFound().build();
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
