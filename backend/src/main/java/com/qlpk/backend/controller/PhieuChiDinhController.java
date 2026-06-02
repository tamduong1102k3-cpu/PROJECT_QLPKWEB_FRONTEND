package com.qlpk.backend.controller;

import com.qlpk.backend.dto.ReferralRequest;
import com.qlpk.backend.entity.ChiTietChiDinh;
import com.qlpk.backend.entity.PhieuChiDinh;
import com.qlpk.backend.service.PhieuChiDinhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phieu-chi-dinh")
@CrossOrigin("*")
public class PhieuChiDinhController {

    @Autowired
    private PhieuChiDinhService phieuChiDinhService;

    @GetMapping("/pending-tests")
    public ResponseEntity<?> getPendingTests(@RequestParam(value = "maChuyenKhoa", required = false) Integer maChuyenKhoa) {
        return ResponseEntity.ok(phieuChiDinhService.getPendingTests(maChuyenKhoa));
    }

    @GetMapping("/completed-tests-today")
    public ResponseEntity<?> getCompletedTestsToday(@RequestParam(value = "maChuyenKhoa", required = false) Integer maChuyenKhoa) {
        return ResponseEntity.ok(phieuChiDinhService.getCompletedTestsToday(maChuyenKhoa));
    }

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

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ReferralRequest request) {
        try {
            PhieuChiDinh savedPk = phieuChiDinhService.create(request);
            return ResponseEntity.ok(savedPk);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @GetMapping("/phieu-kham/{maPhieuKham}")
    public ResponseEntity<?> getByPhieuKham(@PathVariable Integer maPhieuKham) {
        return ResponseEntity.ok(phieuChiDinhService.getByPhieuKham(maPhieuKham));
    }

    @GetMapping("/benh-nhan/{maBenhNhan}")
    public ResponseEntity<?> getByBenhNhan(@PathVariable Integer maBenhNhan) {
        return ResponseEntity.ok(phieuChiDinhService.getByBenhNhan(maBenhNhan));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(phieuChiDinhService.getDetails(id));
    }

    @GetMapping("/result-cdha/{detailId}")
    public ResponseEntity<?> getCdhaResult(@PathVariable Integer detailId) {
        Object result = phieuChiDinhService.getCdhaResult(detailId);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/result-xet-nghiem/{detailId}")
    public ResponseEntity<?> getXetNhiemResult(@PathVariable Integer detailId) {
        Object result = phieuChiDinhService.getXetNhiemResult(detailId);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/phieu-kham/{maPhieuKham}/result-xet-nghiem")
    public ResponseEntity<?> getXetNhiemResultsByPhieuKham(@PathVariable Integer maPhieuKham) {
        return ResponseEntity.ok(phieuChiDinhService.getXetNhiemResultsByPhieuKham(maPhieuKham));
    }

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

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File rỗng"));
            }
            
            String uploadDir = "c:\\Users\\PC\\QLPK-WEB\\frontend\\public\\uploads\\";
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            
            String originalFileName = file.getOriginalFilename();
            String cleanFileName = System.currentTimeMillis() + "_" + (originalFileName != null ? originalFileName.replaceAll("[^a-zA-Z0-9\\.\\-_]", "") : "image.png");
            
            java.io.File destFile = new java.io.File(dir, cleanFileName);
            file.transferTo(destFile);
            
            String relativePath = "/uploads/" + cleanFileName;
            return ResponseEntity.ok(Map.of(
                "url", relativePath,
                "fileName", cleanFileName
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi upload ảnh: " + e.getMessage()));
        }
    }

    @GetMapping("/approved-history")
    public ResponseEntity<?> getApprovedHistory(@RequestParam Integer maBacSi) {
        try {
            return ResponseEntity.ok(phieuChiDinhService.getApprovedHistory(maBacSi));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

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

    @GetMapping("/phieu-kham/{maPhieuKham}/result-cdha")
    public ResponseEntity<?> getCdhaResultsByPhieuKham(@PathVariable Integer maPhieuKham) {
        try {
            return ResponseEntity.ok(phieuChiDinhService.getCdhaResultsByPhieuKham(maPhieuKham));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

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
