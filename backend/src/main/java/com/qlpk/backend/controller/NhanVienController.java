package com.qlpk.backend.controller;

import com.qlpk.backend.entity.NhanVien;
import com.qlpk.backend.dto.NhanVienRequestDTO;
import com.qlpk.backend.service.NhanVienService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nhan_vien")
@CrossOrigin("*") // Mở CORS để Frontend React gọi được
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;

    // API 1: Lấy danh sách tất cả nhân viên (GET ALL)
    @GetMapping
    public ResponseEntity<List<NhanVien>> getAllNhanVien() {
        return ResponseEntity.ok(nhanVienService.getAllNhanVien());
    }

    // API 2: Thêm nhân viên mới qua Procedure
    @PostMapping
    public ResponseEntity<?> addNhanVien(@RequestBody NhanVienRequestDTO dto) {
        try {
            nhanVienService.addNhanVienViaProcedure(dto);
            return ResponseEntity.ok(Map.of("message", "Thêm nhân viên và tạo tài khoản thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi thêm nhân viên: " + e.getMessage()));
        }
    }

    // API 3: Cập nhật nhân viên
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNhanVien(@PathVariable Integer id, @RequestBody NhanVienRequestDTO dto) {
        try {
            nhanVienService.updateNhanVien(id, dto);
            return ResponseEntity.ok(Map.of("message", "Cập nhật nhân viên thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi cập nhật: " + e.getMessage()));
        }
    }

    // API 4: Xóa nhân viên
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNhanVien(@PathVariable Integer id) {
        try {
            nhanVienService.deleteNhanVien(id);
            return ResponseEntity.ok(Map.of("message", "Xóa nhân viên thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi xóa nhân viên: " + e.getMessage()));
        }
    }
}
