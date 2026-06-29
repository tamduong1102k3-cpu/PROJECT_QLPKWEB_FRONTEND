package com.qlpk.backend.controller;

import com.qlpk.backend.entity.TiepNhanCls;
import com.qlpk.backend.repository.TiepNhanClsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tiep-nhan-cls")
@CrossOrigin("*")
public class TiepNhanClsController {

    @Autowired
    private TiepNhanClsRepository repository;

// lấy tất cả tiếp nhận CLS
    @GetMapping
    public List<TiepNhanCls> getAll() {
        return repository.findAll();
    }

// lấy tiếp nhận CLS theo mã phiếu khám
    @GetMapping("/phieu-kham/{maPhieuKham}")
    public ResponseEntity<?> getByMaPhieuKham(@PathVariable Integer maPhieuKham) {
        // Lấy danh sách hoặc bản ghi theo mã phiếu khám
        List<TiepNhanCls> list = repository.findByMaPhieuKham(maPhieuKham);
        return ResponseEntity.ok(list);
    }

// tạo tiếp nhận CLS mới
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TiepNhanCls body) {
        if (body.getMaPhieuKham() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu mã phiếu khám (maPhieuKham)"));
        }
        if (body.getLyDoDen() == null || body.getLyDoDen().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lý do đến không được để trống"));
        }
        if (body.getThongTinSangLoc() == null || body.getThongTinSangLoc().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thông tin sàng lọc không được để trống"));
        }

        TiepNhanCls saved = repository.save(body);
        return ResponseEntity.ok(saved);
    }
}
