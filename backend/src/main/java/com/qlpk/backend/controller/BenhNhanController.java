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

// lấy danh sách tất cả bệnh nhân
    @GetMapping
    public List<BenhNhan> getAll() {
        return service.getAll();
    }

// tìm kiếm bệnh nhân theo từ khóa
    @GetMapping("/search")
    public List<BenhNhan> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

// lấy chi tiết bệnh nhân theo ID
    @GetMapping("/{id}")
    public ResponseEntity<BenhNhan> getById(@PathVariable Integer id) {
        BenhNhan result = service.getById(id);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.notFound().build();
    }

// lấy hồ sơ bệnh nhân (lịch sử khám + hóa đơn)
    @GetMapping("/{id}/ho-so")
    public List<HoSoBenhNhanDTO> getHoSo(@PathVariable Integer id) {
        return service.getHoSo(id);
    }

// thêm bệnh nhân mới
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

// cập nhật thông tin bệnh nhân
    @PutMapping("/{id}")
    public ResponseEntity<BenhNhan> update(@PathVariable Integer id, @RequestBody BenhNhan body) {
        BenhNhan updated = service.update(id, body);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

// xóa bệnh nhân
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (service.getById(id) == null) return ResponseEntity.notFound().build();
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
