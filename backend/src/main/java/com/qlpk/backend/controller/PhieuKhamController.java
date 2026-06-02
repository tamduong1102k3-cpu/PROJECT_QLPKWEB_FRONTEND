package com.qlpk.backend.controller;

import com.qlpk.backend.dto.CheckInRequest;
import com.qlpk.backend.entity.PhieuKham;
import com.qlpk.backend.service.PhieuKhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phieu-kham")
@CrossOrigin("*")
public class PhieuKhamController {

    @Autowired
    private PhieuKhamService phieuKhamService;

    @GetMapping
    public List<PhieuKham> getAll() {
        return phieuKhamService.getAll();
    }

    @PostMapping
    public ResponseEntity<PhieuKham> create(@RequestBody PhieuKham phieuKham) {
        return ResponseEntity.ok(phieuKhamService.create(phieuKham));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhieuKham> update(@PathVariable Integer id, @RequestBody PhieuKham body) {
        PhieuKham updated = phieuKhamService.update(id, body);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(404).body(null);
    }

    @GetMapping("/today")
    public List<PhieuKham> getToday() {
        return phieuKhamService.getToday();
    }

    @PostMapping("/full-check-in")
    public ResponseEntity<?> fullCheckIn(@RequestBody CheckInRequest request) {
        try {
            Map<String, Object> result = phieuKhamService.fullCheckIn(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            if (e.getMessage().contains("Thiếu mã") || e.getMessage().contains("Vui lòng chọn")) {
                return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PostMapping("/accept-patient/{registrationId}")
    public ResponseEntity<?> acceptPatient(@PathVariable Integer registrationId, @RequestParam(required = false) Integer assistantId) {
        try {
            Map<String, Object> result = phieuKhamService.acceptPatient(registrationId, assistantId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            if (e.getMessage().contains("Không tìm thấy")) {
                return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
            } else if (e.getMessage().contains("đã có phiếu khám")) {
                return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestParam Integer maBacSi) {
        System.out.println("DEBUG: Fetching history for maBacSi = " + maBacSi);
        List<Map<String, Object>> result = phieuKhamService.getHistory(maBacSi);
        System.out.println("DEBUG: Found " + result.size() + " records");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/finish/{maPhieuKham}")
    public ResponseEntity<?> finishConsultation(@PathVariable Integer maPhieuKham) {
        try {
            phieuKhamService.finishConsultation(maPhieuKham);
            return ResponseEntity.ok(Map.of("message", "Kết thúc khám thành công"));
        } catch (Exception e) {
            if (e.getMessage().contains("Không tìm thấy")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
       @GetMapping("/assistant-history")
    public ResponseEntity<?> getAssistantHistory(@RequestParam Integer maChuyenKhoa) {
        try {
            List<Map<String, Object>> result = phieuKhamService.getAssistantHistory(maChuyenKhoa);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
    @PutMapping("/{maPhieuKham}/status-waiting")
    public ResponseEntity<?> updateStatusWaiting(@PathVariable Integer maPhieuKham) {
        try {
            phieuKhamService.updateToWaitingForDoctor(maPhieuKham);
            return ResponseEntity.ok(Map.of("message", "Đã chuyển bệnh nhân sang trạng thái chờ bác sĩ khám"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/available-cls-results")
    public ResponseEntity<?> getAvailableClsResults(@PathVariable Integer id) {
        return ResponseEntity.ok(phieuKhamService.getAvailableClsResults(id));
    }
}
