package com.qlpk.backend.controller;

import com.qlpk.backend.dto.ReferralRequest;
import com.qlpk.backend.entity.ChiTietChiDinh;
import com.qlpk.backend.entity.PhieuChiDinh;
import com.qlpk.backend.service.CloudinaryService;
import com.qlpk.backend.service.PhieuChiDinhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phieu-chi-dinh")
@CrossOrigin("*")
public class PhieuChiDinhController {

    @Autowired
    private PhieuChiDinhService phieuChiDinhService;

// lấy danh sách xét nghiệm/CĐHA đang chờ thực hiện
    @GetMapping("/pending-tests")
    public ResponseEntity<?> getPendingTests(@RequestParam(value = "maChuyenKhoa", required = false) Integer maChuyenKhoa) {
        return ResponseEntity.ok(phieuChiDinhService.getPendingTests(maChuyenKhoa));
    }

// lấy danh sách xét nghiệm/CĐHA đã hoàn thành trong ngày
    @GetMapping("/completed-tests-today")
    public ResponseEntity<?> getCompletedTestsToday(@RequestParam(value = "maChuyenKhoa", required = false) Integer maChuyenKhoa) {
        return ResponseEntity.ok(phieuChiDinhService.getCompletedTestsToday(maChuyenKhoa));
    }

// gửi/nhập kết quả xét nghiệm
    @PostMapping("/submit-result")
    public ResponseEntity<?> submitTestResult(@RequestBody Map<String, Object> body) {
        try {
            phieuChiDinhService.submitTestResult(body);
            return ResponseEntity.ok(Map.of("message", "Cập nhật kết quả thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            if (e.getMessage().contains("Thiếu thông tin") || e.getMessage().contains("Không tìm thấy")) {
                return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

// tạo phiếu chỉ định mới
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ReferralRequest request) {
        try {
            PhieuChiDinh savedPk = phieuChiDinhService.create(request);
            return ResponseEntity.ok(savedPk);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

// lấy phiếu chỉ định theo mã phiếu khám
    @GetMapping("/phieu-kham/{maPhieuKham}")
    public ResponseEntity<?> getByPhieuKham(@PathVariable Integer maPhieuKham) {
        return ResponseEntity.ok(phieuChiDinhService.getByPhieuKham(maPhieuKham));
    }

// lấy phiếu chỉ định theo mã bệnh nhân
    @GetMapping("/benh-nhan/{maBenhNhan}")
    public ResponseEntity<?> getByBenhNhan(@PathVariable Integer maBenhNhan) {
        return ResponseEntity.ok(phieuChiDinhService.getByBenhNhan(maBenhNhan));
    }

// lấy chi tiết phiếu chỉ định
    @GetMapping("/{id}/details")
    public ResponseEntity<?> getDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(phieuChiDinhService.getDetails(id));
    }

// lấy kết quả CĐHA theo chi tiết chỉ định
    @GetMapping("/result-cdha/{detailId}")
    public ResponseEntity<?> getCdhaResult(@PathVariable Integer detailId) {
        Object result = phieuChiDinhService.getCdhaResult(detailId);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.ok().build();
    }

// lấy kết quả xét nghiệm theo chi tiết chỉ định
    @GetMapping("/result-xet-nghiem/{detailId}")
    public ResponseEntity<?> getXetNhiemResult(@PathVariable Integer detailId) {
        Object result = phieuChiDinhService.getXetNhiemResult(detailId);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.ok().build();
    }

// lấy danh sách kết quả xét nghiệm theo phiếu khám
    @GetMapping("/phieu-kham/{maPhieuKham}/result-xet-nghiem")
    public ResponseEntity<?> getXetNhiemResultsByPhieuKham(@PathVariable Integer maPhieuKham) {
        return ResponseEntity.ok(phieuChiDinhService.getXetNhiemResultsByPhieuKham(maPhieuKham));
    }

// duyệt kết quả xét nghiệm
    @PostMapping("/approve-result/{id}")
    public ResponseEntity<?> approveTestResult(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        try {
            phieuChiDinhService.approveTestResult(id, body);
            return ResponseEntity.ok(Map.of("message", "Duyệt kết quả xét nghiệm thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            if (e.getMessage().contains("Không tìm thấy")) return ResponseEntity.notFound().build();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @Autowired
    private CloudinaryService cloudinaryService;

// upload hình ảnh lên Cloudinary
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File rỗng"));
            }
            
            String url = cloudinaryService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                "url", url,
                "message", "Upload ảnh lên Cloudinary thành công!"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi upload ảnh lên Cloudinary: " + e.getMessage()));
        }
    }

// lấy danh sách chờ duyệt kết quả
    @GetMapping("/pending-approval")
    public ResponseEntity<?> getPendingApprovalList(@RequestParam(value = "maChuyenKhoa", required = false) Integer maChuyenKhoa) {
        return ResponseEntity.ok(phieuChiDinhService.getPendingApprovalList(maChuyenKhoa));
    }

// lấy danh sách đã duyệt kết quả
    @GetMapping("/approved-list")
    public ResponseEntity<?> getApprovedList(@RequestParam(value = "maChuyenKhoa", required = false) Integer maChuyenKhoa) {
        return ResponseEntity.ok(phieuChiDinhService.getApprovedList(maChuyenKhoa));
    }

// lấy lịch sử duyệt kết quả theo bác sĩ
    @GetMapping("/approved-history")
    public ResponseEntity<?> getApprovedHistory(@RequestParam Integer maBacSi) {
        try {
            return ResponseEntity.ok(phieuChiDinhService.getApprovedHistory(maBacSi));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
// hàm từ chối kết quả xét nghiệm
    @PostMapping("/reject-result/{id}")
    public ResponseEntity<?> rejectTestResult(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        try {
            phieuChiDinhService.rejectTestResult(id, body);
            return ResponseEntity.ok(Map.of("message", "Đã từ chối kết quả xét nghiệm"));
        } catch (Exception e) {
            e.printStackTrace();
            if (e.getMessage().contains("Vui lòng nhập")) return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            if (e.getMessage().contains("Không tìm thấy")) return ResponseEntity.notFound().build();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

// lấy danh sách kết quả CĐHA theo phiếu khám
    @GetMapping("/phieu-kham/{maPhieuKham}/result-cdha")
    public ResponseEntity<?> getCdhaResultsByPhieuKham(@PathVariable Integer maPhieuKham) {
        try {
            return ResponseEntity.ok(phieuChiDinhService.getCdhaResultsByPhieuKham(maPhieuKham));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

// duyệt kết quả CĐHA
    @PostMapping("/approve-cdha/{detailId}")
    public ResponseEntity<?> approveCdhaResult(@PathVariable Integer detailId, @RequestBody Map<String, Object> body) {
        try {
            phieuChiDinhService.approveCdhaResult(detailId, body);
            return ResponseEntity.ok(Map.of("message", "Duyệt kết quả CĐHA thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

// từ chối kết quả CĐHA
    @PostMapping("/reject-cdha/{detailId}")
    public ResponseEntity<?> rejectCdhaResult(@PathVariable Integer detailId, @RequestBody Map<String, String> body) {
        try {
            phieuChiDinhService.rejectCdhaResult(detailId, body);
            return ResponseEntity.ok(Map.of("message", "Đã từ chối kết quả CĐHA"));
        } catch (Exception e) {
            e.printStackTrace();
            if (e.getMessage().contains("Vui lòng nhập")) return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
