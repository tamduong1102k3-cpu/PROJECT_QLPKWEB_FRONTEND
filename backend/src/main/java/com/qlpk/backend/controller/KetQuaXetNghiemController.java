package com.qlpk.backend.controller;

import com.qlpk.backend.entity.KetQuaXetNghiem;
import com.qlpk.backend.service.KetQuaXetNghiemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController; // PHẢI CÓ
import org.springframework.web.bind.annotation.RequestMapping; // PHẢI CÓ
import java.util.Map;
import java.util.List;



@RestController
@RequestMapping("/api/ket-qua-xet-nghiem")
@CrossOrigin(origins = "*") // Để React có thể gọi API mà không bị chặn CORS
public class KetQuaXetNghiemController {

      

    @Autowired
    private KetQuaXetNghiemService service;

    // Endpoint: GET /api/ket-qua-xet-nghiem/today
 @GetMapping("/today")
public ResponseEntity<List<Map<String, Object>>> getTodayResults() {
    return ResponseEntity.ok(service.getTodayResults());
}

    // Endpoint cho bác sĩ duyệt kết quả
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveResult(@PathVariable Integer id) {
        KetQuaXetNghiem updated = service.updateStatus(id, "DA_DUYET");
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}