package com.qlpk.backend.controller;

import com.qlpk.backend.entity.KetQuaXetNghiem;
import com.qlpk.backend.service.KetQuaXetNghiemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController; 
import org.springframework.web.bind.annotation.RequestMapping; 
import java.util.Map;
import java.util.List;



@RestController
@RequestMapping("/api/ket-qua-xet-nghiem")
@CrossOrigin(origins = "*") 
public class KetQuaXetNghiemController {

      

    @Autowired
    private KetQuaXetNghiemService service;

// lấy danh sách kết quả xét nghiệm trong ngày
    @GetMapping("/today")
public ResponseEntity<List<Map<String, Object>>> getTodayResults() {
    return ResponseEntity.ok(service.getTodayResults());
}

// bác sĩ duyệt kết quả xét nghiệm
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveResult(@PathVariable Integer id) {
        KetQuaXetNghiem updated = service.updateStatus(id, "DA_DUYET");
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}