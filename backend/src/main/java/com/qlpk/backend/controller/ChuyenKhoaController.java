package com.qlpk.backend.controller;

import com.qlpk.backend.entity.ChuyenKhoa;
import com.qlpk.backend.service.ChuyenKhoaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chuyen-khoa")
@CrossOrigin("*")
public class ChuyenKhoaController {

    @Autowired
    private ChuyenKhoaService chuyenKhoaService;

// lấy tất cả chuyên khoa
    @GetMapping
    public ResponseEntity<List<ChuyenKhoa>> getAll() {
        return ResponseEntity.ok(chuyenKhoaService.getAll());
    }

// lấy chuyên khoa theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ChuyenKhoa> getById(@PathVariable Integer id) {
        ChuyenKhoa entity = chuyenKhoaService.getById(id);
        if (entity == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(entity);
    }

// thêm chuyên khoa mới
    @PostMapping
    public ResponseEntity<ChuyenKhoa> create(@RequestBody ChuyenKhoa entity) {
        return ResponseEntity.ok(chuyenKhoaService.create(entity));
    }

// cập nhật chuyên khoa
    @PutMapping("/{id}")
    public ResponseEntity<ChuyenKhoa> update(@PathVariable Integer id, @RequestBody ChuyenKhoa entity) {
        ChuyenKhoa updated = chuyenKhoaService.update(id, entity);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

// xóa chuyên khoa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (chuyenKhoaService.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        chuyenKhoaService.delete(id);
        return ResponseEntity.ok().build();
    }
}