package com.qlpk.backend.controller;

import com.qlpk.backend.entity.ChiTietHoaDon;
import com.qlpk.backend.entity.HoaDon;
import com.qlpk.backend.repository.ChiTietHoaDonRepository;
import com.qlpk.backend.service.ChiTietHoaDonService;
import com.qlpk.backend.service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.List;
import java.util.HashMap;

@RestController
@RequestMapping("/api/hoa-don")
@CrossOrigin("*")
public class HoaDonController {

    @Autowired
    private HoaDonService hoaDonService;

    @Autowired
    private ChiTietHoaDonService chiTietHoaDonService;

    @Autowired
    private ChiTietHoaDonRepository chiTietHoaDonRepository;

// lấy tất cả hóa đơn
    @GetMapping
    public List<HoaDon> getAll() {
        return hoaDonService.getAll();
    }

// lấy hóa đơn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<HoaDon> getById(@PathVariable Integer id) {
        HoaDon hoaDon = hoaDonService.getById(id);
        if (hoaDon != null) {
            return ResponseEntity.ok(hoaDon);
        }
        return ResponseEntity.notFound().build();
    }

// lấy chi tiết các mục trong hóa đơn
    @GetMapping("/{id}/chi-tiet")
    public List<ChiTietHoaDon> getChiTiet(@PathVariable Integer id) {
        return chiTietHoaDonService.findByMaHoaDon(id);
    }

// lấy danh sách các mục cần thanh toán cho phiếu khám
    @GetMapping("/phieu-kham/{maPhieuKham}/billing-items")
    public ResponseEntity<?> getBillingItems(@PathVariable Integer maPhieuKham) {
        try {
            Map<String, Object> items = hoaDonService.getBillingItems(maPhieuKham);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

// tạo hóa đơn từ phiếu khám
    @PostMapping("/phieu-kham/{maPhieuKham}/create")
    public ResponseEntity<?> createInvoiceFromPhieuKham(@PathVariable Integer maPhieuKham, @RequestBody Map<String, Object> body) {
        try {
            Integer maNhanVien = body.get("maNhanVien") != null 
                ? Integer.parseInt(body.get("maNhanVien").toString()) 
                : null;
            HoaDon result = hoaDonService.taoHoaDonTuPhieuKham(maPhieuKham, maNhanVien);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

// lấy danh sách hóa đơn đã thanh toán (cho dược sĩ)
    @GetMapping("/paid-invoices")
    public ResponseEntity<?> getPaidInvoices() {
        try {
            List<Map<String, Object>> invoices = hoaDonService.getPaidInvoicesDetailed();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

// lấy hóa đơn đã thanh toán có thuốc
    @GetMapping("/paid-invoices-with-thuoc")
    public ResponseEntity<?> getPaidInvoicesWithThuoc() {
        try {
            List<Map<String, Object>> invoices = hoaDonService.getPaidInvoicesWithThuoc();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

// lấy hóa đơn đã thanh toán có thuốc kèm trạng thái toa thuốc
    @GetMapping("/paid-invoices-with-thuoc-status")
    public ResponseEntity<?> getPaidInvoicesWithThuocAndStatus() {
        try {
            List<Map<String, Object>> invoices = hoaDonService.getPaidInvoicesWithThuocAndStatus();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

// lấy hóa đơn đã thanh toán đã cấp thuốc (cho lịch sử dược sĩ)
    @GetMapping("/paid-invoices-da-cap-thuoc")
    public ResponseEntity<?> getPaidInvoicesDaCapThuoc() {
        try {
            List<Map<String, Object>> invoices = hoaDonService.getPaidInvoicesDaCapThuoc();
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

// lấy chi tiết hóa đơn chỉ gồm các mục thuốc
    @GetMapping("/{id}/chi-tiet-thuoc")
    public ResponseEntity<?> getChiTietThuoc(@PathVariable Integer id) {
        try {
            List<ChiTietHoaDon> thuocItems = chiTietHoaDonRepository.findThuocByMaHoaDon(id);
            return ResponseEntity.ok(thuocItems);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

// thanh toán hóa đơn
    @PostMapping("/{id}/thanh-toan")
    public ResponseEntity<?> thanhToan(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        try {
            Integer maNhanVien = body.get("maNhanVien") != null 
                ? Integer.parseInt(body.get("maNhanVien").toString()) 
                : null;
            String phuongThuc = (String) body.getOrDefault("phuongThuc", "tien_mat");
            BigDecimal soTienNhan = body.get("soTienNhan") != null 
                ? new BigDecimal(body.get("soTienNhan").toString()) 
                : null;
            String maGiaoDich = (String) body.get("maGiaoDich");

            HoaDon result = hoaDonService.thanhToan(id, maNhanVien, phuongThuc, soTienNhan, maGiaoDich);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
