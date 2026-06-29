package com.qlpk.backend.controller;

import com.qlpk.backend.entity.KhamLamSang;
import com.qlpk.backend.service.KhamLamSangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kham-lam-sang")
@CrossOrigin("*")
public class KhamLamSangController {

    @Autowired
    private KhamLamSangService service;

// lưu thông tin khám lâm sàng
    @PostMapping
    public ResponseEntity<?> save(@RequestBody KhamLamSang body) {
        try {
            if (body.getMaPhieuKham() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã phiếu khám không được để trống"));
            }

            KhamLamSang savedData = service.saveAndUpdateStatus(body);
            return ResponseEntity.ok(savedData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

// lưu khám lâm sàng kèm chỉ số sinh hiệu
    @PostMapping("/with-vitals")
    public ResponseEntity<?> saveWithVitals(@RequestBody com.qlpk.backend.dto.KhamLamSangAndVitalsDTO body) {
        try {
            if (body.getKhamLamSang() != null && body.getKhamLamSang().getMaPhieuKham() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã phiếu khám của khám lâm sàng không được để trống"));
            }
            if (body.getChiSoKhamTongHop() != null && body.getChiSoKhamTongHop().getMaPhieuKham() == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã phiếu khám của sinh hiệu không được để trống"));
            }
            com.qlpk.backend.dto.KhamLamSangAndVitalsDTO saved = service.saveKhamLamSangAndVitals(body);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi lưu khám lâm sàng và sinh hiệu: " + e.getMessage()));
        }
    }

// lấy khám lâm sàng theo mã phiếu khám
    @GetMapping("/phieu-kham/{maPhieuKham}")
    public ResponseEntity<?> getByPhieuKham(@PathVariable Integer maPhieuKham) {
        return service.findByMaPhieuKham(maPhieuKham)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null)); 
    }

// lấy lịch sử khám lâm sàng theo mã bệnh nhân
    @GetMapping("/benh-nhan/{maBenhNhan}")
    public ResponseEntity<?> getByBenhNhan(@PathVariable Integer maBenhNhan) {
        return ResponseEntity.ok(service.findByMaBenhNhan(maBenhNhan));
    }
}
