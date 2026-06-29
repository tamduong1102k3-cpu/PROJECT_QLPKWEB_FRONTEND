package com.qlpk.backend.controller;

import com.qlpk.backend.entity.LichTaiKham;
import com.qlpk.backend.service.LichTaiKhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired 
    private LichTaiKhamService service;

// lấy tất cả lịch tái khám
    @GetMapping
    public List<Map<String, Object>> getAll() {
        return service.getAllDetailed();
    }

// tạo lịch tái khám mới
    @PostMapping
    public ResponseEntity<LichTaiKham> create(@RequestBody LichTaiKham entity) {
        LichTaiKham saved = service.create(entity);
        return ResponseEntity.ok(saved);
    }

// cập nhật lịch tái khám
    @PutMapping("/{id}")
    public ResponseEntity<LichTaiKham> update(@PathVariable Integer id, @RequestBody LichTaiKham updated) {
        LichTaiKham result = service.updateAppointment(id, updated);
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.notFound().build();
    }

// xóa lịch tái khám
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (service.getById(id) != null) {
            service.delete(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}