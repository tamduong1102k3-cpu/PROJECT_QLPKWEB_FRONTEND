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

// lấy tất cả phiếu khám
    @GetMapping
    public List<PhieuKham> getAll() {
        return phieuKhamService.getAll();
    }

// tạo phiếu khám mới
    @PostMapping
    public ResponseEntity<PhieuKham> create(@RequestBody PhieuKham body) {
        PhieuKham created = phieuKhamService.create(body);
        return ResponseEntity.ok(created);
    }

// lấy phiếu khám theo ID
    @GetMapping("/{id}")
    public ResponseEntity<PhieuKham> getById(@PathVariable Integer id) {
        PhieuKham pk = phieuKhamService.getById(id);
        if (pk != null) {
            return ResponseEntity.ok(pk);
        }
        return ResponseEntity.notFound().build();
    }

// cập nhật phiếu khám
    @PutMapping("/{id}")
    public ResponseEntity<PhieuKham> update(@PathVariable Integer id, @RequestBody PhieuKham body) {
        PhieuKham updated = phieuKhamService.update(id, body);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(404).body(null);
    }

// lấy danh sách phiếu khám trong ngày
    @GetMapping("/today")
    public List<PhieuKham> getToday() {
        return phieuKhamService.getToday();
    }

// check-in đầy đủ cho bệnh nhân (tạo phiếu khám + chỉ định)
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

// tiếp nhận bệnh nhân từ đăng ký khám
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

// lấy lịch sử khám của bác sĩ
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestParam Integer maBacSi) {
        System.out.println("DEBUG: Fetching history for maBacSi = " + maBacSi);
        List<Map<String, Object>> result = phieuKhamService.getHistory(maBacSi);
        System.out.println("DEBUG: Found " + result.size() + " records");
        return ResponseEntity.ok(result);
    }

// kết thúc ca khám
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
// lấy lịch sử khám theo chuyên khoa (cho trợ lý)
    @GetMapping("/assistant-history")
    public ResponseEntity<?> getAssistantHistory(@RequestParam Integer maChuyenKhoa) {
        try {
            List<Map<String, Object>> result = phieuKhamService.getAssistantHistory(maChuyenKhoa);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
// cập nhật trạng thái chờ bác sĩ khám
    @PutMapping("/{maPhieuKham}/status-waiting")
    public ResponseEntity<?> updateStatusWaiting(@PathVariable Integer maPhieuKham) {
        try {
            phieuKhamService.updateToWaitingForDoctor(maPhieuKham);
            return ResponseEntity.ok(Map.of("message", "Đã chuyển bệnh nhân sang trạng thái chờ bác sĩ khám"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

// cập nhật trạng thái chờ CLS
    @PutMapping("/{maPhieuKham}/status-cls")
    public ResponseEntity<?> updateStatusCls(@PathVariable Integer maPhieuKham) {
        try {
            phieuKhamService.updateToChoCls(maPhieuKham);
            return ResponseEntity.ok(Map.of("message", "Đã chuyển bệnh nhân sang trạng thái chờ CLS"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

// lấy danh sách kết quả CLS có sẵn của phiếu khám
    @GetMapping("/{id}/available-cls-results")
    public ResponseEntity<?> getAvailableClsResults(@PathVariable Integer id) {
        return ResponseEntity.ok(phieuKhamService.getAvailableClsResults(id));
    }

    /** Lấy danh sách bệnh nhân đã hoàn thành khám hôm nay (cho thu ngân) */
    @GetMapping("/completed-patients")
    public ResponseEntity<?> getCompletedPatients(@RequestParam(value = "keyword", required = false) String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(phieuKhamService.getCompletedPatientsTodayWithSearch(keyword.trim()));
        }
        return ResponseEntity.ok(phieuKhamService.getCompletedPatientsToday());
    }

    /** Lấy lịch sử khám theo chuyên khoa cho tất cả các ngày */
    @GetMapping("/specialty-history")
    public ResponseEntity<?> getSpecialtyHistory(@RequestParam Integer maChuyenKhoa) {
        try {
            return ResponseEntity.ok(phieuKhamService.getHistoryByChuyenKhoaAllDays(maChuyenKhoa));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * KTV tiếp nhận bệnh nhân CLS: tạo PhieuKham
     */
    @PostMapping("/accept-cls-patient/{registrationId}")
    public ResponseEntity<?> acceptClsPatient(@PathVariable Integer registrationId, @RequestParam Integer technicianId) {
        try {
            Map<String, Object> result = phieuKhamService.acceptClsPatient(registrationId, technicianId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            if (e.getMessage().contains("Không tìm thấy") || e.getMessage().contains("đã được tiếp nhận")) {
                return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    /**
     * Kỹ thuật viên xác nhận dịch vụ CLS: tạo TiepNhanCls + PhieuChiDinh + ChiTietChiDinh
     */
    @PostMapping("/{maPhieuKham}/tech-confirm-cls")
    public ResponseEntity<?> techConfirmClsService(@PathVariable Integer maPhieuKham, @RequestParam Integer technicianId, @RequestBody Map<String, String> body) {
        try {
            String lyDoDen = body.get("lyDoDen");
            String thongTinSangLoc = body.get("thongTinSangLoc");
            String ghiChu = body.get("ghiChu");
            if (lyDoDen == null || lyDoDen.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Lý do đến không được để trống"));
            }
            if (thongTinSangLoc == null || thongTinSangLoc.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thông tin sàng lọc không được để trống"));
            }
            Map<String, Object> result = phieuKhamService.techConfirmClsService(maPhieuKham, technicianId, lyDoDen, thongTinSangLoc, ghiChu);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Bác sĩ CLS xác nhận thực hiện dịch vụ: tạo PhieuChiDinh + ChiTietChiDinh
     */
    @PostMapping("/{maPhieuKham}/confirm-cls")
    public ResponseEntity<?> confirmClsService(@PathVariable Integer maPhieuKham, @RequestParam Integer doctorId) {
        try {
            Map<String, Object> result = phieuKhamService.confirmClsService(maPhieuKham, doctorId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Lấy danh sách bệnh nhân CLS chờ bác sĩ xác nhận (đã có PhieuKham, chưa có PhieuChiDinh)
     */
    @GetMapping("/pending-cls-confirmation")
    public ResponseEntity<?> getPendingClsConfirmation(@RequestParam Integer maChuyenKhoa) {
        try {
            return ResponseEntity.ok(phieuKhamService.getPendingClsConfirmation(maChuyenKhoa));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
