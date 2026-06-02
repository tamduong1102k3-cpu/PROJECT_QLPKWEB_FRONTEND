package com.qlpk.backend.controller;

import com.qlpk.backend.entity.*;
import com.qlpk.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ket-qua-cls")
@CrossOrigin("*")
public class KetQuaClsController {

    @Autowired
    private ChiTietChiDinhRepository chiTietRepository;

    @Autowired
    private DichVuRepository dichVuRepository;

    @Autowired
    private KetQuaXetNghiemRepository ketQuaXetNghiemRepository;

    @Autowired
    private KetQuaCdhaRepository ketQuaCdhaRepository;

    @Autowired
    private KetQuaXnChiSoRepository ketQuaXnChiSoRepository;

    @GetMapping("/{chiDinhId}")
    public ResponseEntity<?> getDetail(@PathVariable Integer chiDinhId) {
        var detailOpt = chiTietRepository.findById(chiDinhId);
        if (detailOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy chi tiết chỉ định #" + chiDinhId));
        }
        ChiTietChiDinh detail = detailOpt.get();
        String tenDv = dichVuRepository.findById(detail.getMaDichVu())
                .map(DichVu::getTenDichVu).orElse("Dịch vụ cận lâm sàng");

        Map<String, Object> res = new HashMap<>();
        res.put("chiDinhId", chiDinhId);
        res.put("tenDichVu", tenDv);

        // Check if xét nghiệm
        var kqxnOpt = ketQuaXetNghiemRepository.findByMaChiTietChiDinh(chiDinhId);
        if (kqxnOpt.isPresent()) {
            KetQuaXetNghiem kqxn = kqxnOpt.get();
            res.put("loaiDichVu", "XET_NGHIEM");
            res.put("ketLuan", kqxn.getKetLuan());
            
            List<KetQuaXnChiSo> chiSoList = ketQuaXnChiSoRepository.findByKetQuaXetNghiemId(kqxn.getId());
            StringBuilder sb = new StringBuilder();
            for (KetQuaXnChiSo cs : chiSoList) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(cs.getTenChiSo()).append(": ").append(cs.getGiaTri());
                if (cs.getDonVi() != null && !cs.getDonVi().isEmpty()) {
                    sb.append(" ").append(cs.getDonVi());
                }
            }
            res.put("noiDungKetQua", sb.toString());
            return ResponseEntity.ok(res);
        }

        // Check if CĐHA
        var kqcdhaOpt = ketQuaCdhaRepository.findByIdChiTietChiDinh(chiDinhId);
        if (kqcdhaOpt.isPresent()) {
            KetQuaCdha kqcdha = kqcdhaOpt.get();
            res.put("loaiDichVu", "CDHA");
            res.put("ketLuan", kqcdha.getKetLuan());
            res.put("noiDungKetQua", kqcdha.getMoTaHinhAnh());
            return ResponseEntity.ok(res);
        }

        return ResponseEntity.status(404).body(Map.of("message", "Chưa có kết quả đã duyệt cho chỉ định #" + chiDinhId));
    }
}
