package com.qlpk.backend.controller;

import com.qlpk.backend.entity.DichVu;
import com.qlpk.backend.service.DichVuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dich-vu")
@CrossOrigin("*")
public class DichVuController {

    @Autowired
    private DichVuService dichVuService;

// lấy tất cả dịch vụ
    @GetMapping
    public List<DichVu> getAll() {
        return dichVuService.getAll();
    }

// thêm dịch vụ mới
    @PostMapping
    public ResponseEntity<DichVu> create(@RequestBody DichVu dv) {
        return ResponseEntity.ok(dichVuService.create(dv));
    }

// cập nhật dịch vụ
    @PutMapping("/{id}")
    public ResponseEntity<DichVu> update(@PathVariable Integer id, @RequestBody DichVu dv) {
        DichVu updated = dichVuService.update(id, dv);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

// xóa dịch vụ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (dichVuService.getById(id) == null) return ResponseEntity.notFound().build();
        dichVuService.delete(id);
        return ResponseEntity.ok().build();
    }
}
