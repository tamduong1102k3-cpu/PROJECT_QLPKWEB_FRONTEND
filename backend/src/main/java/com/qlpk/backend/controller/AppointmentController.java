package com.qlpk.backend.controller;

import com.qlpk.backend.entity.LichTaiKham;
import com.qlpk.backend.service.LichTaiKhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin("*")
public class AppointmentController {

    @Autowired 
    private LichTaiKhamService service;

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return service.getAllDetailed();
    }

    @PutMapping("/{id}")
    public ResponseEntity<LichTaiKham> update(@PathVariable Integer id, @RequestBody LichTaiKham updated) {
        LichTaiKham result = service.updateAppointment(id, updated);
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (service.getById(id) != null) {
            service.delete(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
