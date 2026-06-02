package com.qlpk.backend.controller;

import com.qlpk.backend.entity.BangPhanCongCaLam;
import com.qlpk.backend.service.BangPhanCongCaLamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/phan-cong")
@CrossOrigin("*")
public class BangPhanCongController {

    @Autowired
    private BangPhanCongCaLamService service;

    // 1. Lấy tất cả danh sách phân công
    @GetMapping
    public ResponseEntity<List<BangPhanCongCaLam>> getAll() {
        try {
            List<BangPhanCongCaLam> list = service.getAll();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // 2. Thêm mới ca làm việc (HÀM BẠN ĐANG THIẾU)
    @PostMapping
    public ResponseEntity<BangPhanCongCaLam> create(@RequestBody BangPhanCongCaLam entity) {
        try {
            // Gọi hàm create đã định nghĩa trong Service
            BangPhanCongCaLam created = service.create(entity);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // 3. Xóa ca làm việc theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // 4. Lấy danh sách làm việc hôm nay (cho Tiếp đón)
    @GetMapping("/working-today")
    public ResponseEntity<List<BangPhanCongCaLam>> getWorkingToday() {
        try {
            List<BangPhanCongCaLam> shifts = service.getWorkingToday();
            return ResponseEntity.ok(shifts != null ? shifts : Collections.emptyList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }

    // 5. Lấy phòng hiện tại của nhân viên (cho Bác sĩ)
    @GetMapping("/current-room/{maNhanVien}")
    public ResponseEntity<?> getCurrentRoom(@PathVariable Integer maNhanVien) {
        try {
            Map<String, String> response = service.getCurrentRoom(maNhanVien);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi server: " + e.getMessage()));
        }
    }
}