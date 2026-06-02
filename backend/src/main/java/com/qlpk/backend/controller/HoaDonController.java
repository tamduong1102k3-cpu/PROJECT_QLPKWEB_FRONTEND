package com.qlpk.backend.controller;

import com.qlpk.backend.entity.ChiTietHoaDon;
import com.qlpk.backend.entity.HoaDon;
import com.qlpk.backend.service.ChiTietHoaDonService;
import com.qlpk.backend.service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
@CrossOrigin("*")
public class HoaDonController {

    @Autowired
    private HoaDonService hoaDonService;

    @Autowired
    private ChiTietHoaDonService chiTietHoaDonService;

    // Lấy tất cả hóa đơn
    @GetMapping
    public List<HoaDon> getAll() {
        return hoaDonService.getAll();
    }

    // Lấy hóa đơn theo ID
    @GetMapping("/{id}")
    public ResponseEntity<HoaDon> getById(@PathVariable Integer id) {
        HoaDon hoaDon = hoaDonService.getById(id);
        if (hoaDon != null) {
            return ResponseEntity.ok(hoaDon);
        }
        return ResponseEntity.notFound().build();
    }

    // Lấy chi tiết các mục trong hóa đơn
    @GetMapping("/{id}/chi-tiet")
    public List<ChiTietHoaDon> getChiTiet(@PathVariable Integer id) {
        return chiTietHoaDonService.findByMaHoaDon(id);
    }
}
