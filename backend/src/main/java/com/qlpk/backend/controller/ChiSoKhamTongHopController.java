package com.qlpk.backend.controller;

import com.qlpk.backend.entity.ChiSoKhamTongHop;
import com.qlpk.backend.service.ChiSoKhamTongHopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chi-so-kham-tong-hop")
@CrossOrigin("*")
public class ChiSoKhamTongHopController {

    @Autowired
    private ChiSoKhamTongHopService service;

    // 1. Lấy tất cả bản ghi
    @GetMapping
    public ResponseEntity<List<ChiSoKhamTongHop>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // 2. Lấy chi tiết theo ID bản ghi
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        ChiSoKhamTongHop data = service.getById(id);
        if (data != null) {
            return ResponseEntity.ok(data);
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy dữ liệu với ID: " + id));
    }

    // 3. Lấy dữ liệu theo Mã Phiếu Khám (Dùng nhiều nhất ở UI Khám bệnh)
    @GetMapping("/phieu-kham/{maPhieuKham}")
    public ResponseEntity<?> getByPhieuKham(@PathVariable Integer maPhieuKham) {
        Optional<ChiSoKhamTongHop> data = service.findByMaPhieuKham(maPhieuKham);
        // Trả về dữ liệu nếu có, hoặc null (200 OK) để frontend dễ xử lý khởi tạo form
        return ResponseEntity.ok(data.orElse(null));
    }

    // 4. Lưu hoặc Cập nhật (Hàm đặc biệt chuyển trạng thái CHO_BAC_SI)
    @PostMapping("/save-and-update")
    public ResponseEntity<?> saveAndUpdate(@RequestBody ChiSoKhamTongHop body) {
        try {
            if (body.getMaPhieuKham() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã phiếu khám không được để trống"));
            }
            ChiSoKhamTongHop saved = service.saveAndUpdatePhieuKham(body);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    // 5. Thêm mới bản ghi cơ bản
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ChiSoKhamTongHop body) {
        return ResponseEntity.ok(service.create(body));
    }

    // 6. Cập nhật bản ghi theo ID
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody ChiSoKhamTongHop body) {
        ChiSoKhamTongHop updated = service.update(id, body);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy ID để cập nhật"));
    }

    // 7. Xóa bản ghi
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi xóa: " + e.getMessage()));
        }
    }
    
}