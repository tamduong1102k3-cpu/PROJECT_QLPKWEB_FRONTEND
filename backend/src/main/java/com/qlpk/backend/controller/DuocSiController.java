package com.qlpk.backend.controller;

import com.qlpk.backend.entity.ChiTietToaThuoc;
import com.qlpk.backend.entity.KhoThuoc;
import com.qlpk.backend.entity.ToaThuoc;
import com.qlpk.backend.entity.Thuoc;
import com.qlpk.backend.payment.WebSocketPublisher;
import com.qlpk.backend.repository.ChiTietToaThuocRepository;
import com.qlpk.backend.repository.KhoThuocRepository;
import com.qlpk.backend.repository.ThuocRepository;
import com.qlpk.backend.repository.ToaThuocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/duoc-si")
@CrossOrigin("*")
public class DuocSiController {

    @Autowired
    private ToaThuocRepository toaThuocRepository;

    @Autowired
    private ChiTietToaThuocRepository chiTietToaThuocRepository;

    @Autowired
    private ThuocRepository thuocRepository;

    @Autowired
    private KhoThuocRepository khoThuocRepository;

    @Autowired
    private WebSocketPublisher webSocketPublisher;

    /**
     * Lấy danh sách toa thuốc + chi tiết thuốc cho một phiếu khám (cho dược sĩ)
     */
    @GetMapping("/phieu-kham/{maPhieuKham}/toa-thuoc")
    public ResponseEntity<?> getToaThuocByPhieuKham(@PathVariable Integer maPhieuKham) {
        try {
            List<ToaThuoc> toaThuocList = toaThuocRepository.findActiveByMaPhieuKham(maPhieuKham);
            List<Map<String, Object>> result = new ArrayList<>();

            for (ToaThuoc toa : toaThuocList) {
                Map<String, Object> toaData = new HashMap<>();
                toaData.put("maToaThuoc", toa.getMaToaThuoc());
                toaData.put("ghiChu", toa.getGhiChu());
                toaData.put("ngayTao", toa.getNgayTao());
                toaData.put("trangThai", toa.getTrangThai());

                List<ChiTietToaThuoc> chiTietList = chiTietToaThuocRepository.findByMaToaThuoc(toa.getMaToaThuoc());
                List<Map<String, Object>> thuocDetails = new ArrayList<>();
                for (ChiTietToaThuoc ct : chiTietList) {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("id", ct.getId());
                    detail.put("maThuoc", ct.getMaThuoc());
                    detail.put("lieuDung", ct.getLieuDung());
                    detail.put("sang", ct.getSang());
                    detail.put("trua", ct.getTrua());
                    detail.put("chieu", ct.getChieu());
                    detail.put("toi", ct.getToi());
                    detail.put("soNgay", ct.getSoNgay());
                    detail.put("cachDung", ct.getCachDung());
                    detail.put("thoiDiemDung", ct.getThoiDiemDung());

                    // Lấy thông tin thuốc
                    Thuoc thuoc = thuocRepository.findById(ct.getMaThuoc()).orElse(null);
                    if (thuoc != null) {
                        detail.put("tenThuoc", thuoc.getTenThuoc());
                        detail.put("hamLuong", thuoc.getHamLuong());
                        detail.put("dangThuoc", thuoc.getDangThuoc());
                        detail.put("donViTinh", thuoc.getDonViTinh());
                        detail.put("hoatChat", thuoc.getHoatChat());
                        
                        // Kiểm tra hạn sử dụng và tồn kho
                        KhoThuoc kho = khoThuocRepository.findByMaThuoc(ct.getMaThuoc()).orElse(null);
                        Integer tonKho = (kho != null) ? kho.getSoLuongTon() : 0;
                        
                        List<String> warnings = new ArrayList<>();
                        
                        // Kiểm tra hết hàng
                        if (tonKho <= 0) {
                            warnings.add("Hết hàng");
                        }
                        
                        // Kiểm tra hạn sử dụng
                        if (thuoc.getHanSuDung() != null && thuoc.getHanSuDung().isBefore(LocalDate.now())) {
                            warnings.add("Hết hạn sử dụng: " + thuoc.getHanSuDung().toString());
                        } else if (thuoc.getHanSuDung() != null && thuoc.getHanSuDung().isBefore(LocalDate.now().plusMonths(1))) {
                            warnings.add("Sắp hết hạn: " + thuoc.getHanSuDung().toString());
                        }
                        
                        if (!warnings.isEmpty()) {
                            detail.put("canhBao", String.join("; ", warnings));
                        }
                        detail.put("tonKho", tonKho);
                        detail.put("hanSuDung", thuoc.getHanSuDung() != null ? thuoc.getHanSuDung().toString() : null);
                    } else {
                        detail.put("tenThuoc", "Thuốc #" + ct.getMaThuoc());
                        detail.put("hamLuong", "");
                        detail.put("donViTinh", "");
                    }

                    thuocDetails.add(detail);
                }

                toaData.put("chiTietThuoc", thuocDetails);
                result.add(toaData);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xác nhận dược sĩ đã cấp thuốc -> Kiểm tra tồn kho + hạn sử dụng trước khi cho phép cấp
     */
    @PostMapping("/toa-thuoc/{maToaThuoc}/xac-nhan-cap-thuoc")
    @Transactional
    public ResponseEntity<?> xacNhanCapThuoc(@PathVariable Integer maToaThuoc) {
        try {
            ToaThuoc toa = toaThuocRepository.findById(maToaThuoc)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy toa thuốc #" + maToaThuoc));

            if ("DA_CAP_THUOC".equals(toa.getTrangThai())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Toa thuốc #" + maToaThuoc + " đã được cấp trước đó!"));
            }

            // Kiểm tra tồn kho và hạn sử dụng TRƯỚC khi cấp
            List<ChiTietToaThuoc> chiTietList = chiTietToaThuocRepository.findByMaToaThuoc(maToaThuoc);
            List<Map<String, Object>> blockedItems = new ArrayList<>();

            for (ChiTietToaThuoc ct : chiTietList) {
                Thuoc thuoc = thuocRepository.findById(ct.getMaThuoc()).orElse(null);
                KhoThuoc kho = khoThuocRepository.findByMaThuoc(ct.getMaThuoc()).orElse(null);
                Integer soLuongTon = (kho != null) ? kho.getSoLuongTon() : 0;
                String tenThuoc = (thuoc != null) ? thuoc.getTenThuoc() : "Thuốc #" + ct.getMaThuoc();

                Map<String, Object> item = new HashMap<>();
                item.put("maThuoc", ct.getMaThuoc());
                item.put("tenThuoc", tenThuoc);
                item.put("soLuongTon", soLuongTon);

                List<String> lyDo = new ArrayList<>();

                // Kiểm tra hết hàng
                if (soLuongTon <= 0) {
                    lyDo.add("hết hàng trong kho (tồn: " + soLuongTon + ")");
                }

                // Kiểm tra hạn sử dụng
                if (thuoc != null && thuoc.getHanSuDung() != null) {
                    if (thuoc.getHanSuDung().isBefore(LocalDate.now())) {
                        lyDo.add("đã hết hạn sử dụng (" + thuoc.getHanSuDung() + ")");
                    }
                }

                if (!lyDo.isEmpty()) {
                    item.put("lyDo", String.join(", ", lyDo));
                    blockedItems.add(item);
                }
            }

            // Nếu có thuốc bị chặn → không cho cấp, trả về lỗi
            if (!blockedItems.isEmpty()) {
                // Publish cảnh báo qua WebSocket cho nhân viên kho
                for (Map<String, Object> bi : blockedItems) {
                    webSocketPublisher.publishKhoAlert(
                        "BLOCKED_CAP_THUOC",
                        (Integer) bi.get("maThuoc"),
                        (String) bi.get("tenThuoc"),
                        0,
                        "KHONG_THE_CAP"
                    );
                }
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("blocked", blockedItems);
                errorResponse.put("error", "Không thể cấp thuốc do có " + blockedItems.size() + " loại thuốc không đủ điều kiện!");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Tất cả đều OK → tiến hành trừ tồn kho
            for (ChiTietToaThuoc ct : chiTietList) {
                KhoThuoc kho = khoThuocRepository.findByMaThuoc(ct.getMaThuoc())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kho cho thuốc #" + ct.getMaThuoc()));
                
                // Tính số lượng cần lấy
                int soLuongCan = 0;
                try { soLuongCan += Integer.parseInt(ct.getSang()); } catch (Exception ignored) {}
                try { soLuongCan += Integer.parseInt(ct.getTrua()); } catch (Exception ignored) {}
                try { soLuongCan += Integer.parseInt(ct.getChieu()); } catch (Exception ignored) {}
                try { soLuongCan += Integer.parseInt(ct.getToi()); } catch (Exception ignored) {}
                if (ct.getSoNgay() != null) soLuongCan *= ct.getSoNgay();
                if (soLuongCan <= 0) soLuongCan = 1;

                // Trừ tồn kho
                kho.setSoLuongTon(Math.max(0, kho.getSoLuongTon() - soLuongCan));
                kho.setNgayCapNhatCuoi(java.time.LocalDateTime.now());
                khoThuocRepository.save(kho);
            }

            // Publish kho update event
            webSocketPublisher.publishKhoUpdate();

            toaThuocRepository.updateTrangThaiDaCapThuoc(maToaThuoc);
            // Publish WebSocket event để dược sĩ cập nhật realtime
            webSocketPublisher.publishToaThuocChange("DA_CAP_THUOC", toa.getMaPhieuKham());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Đã cấp thuốc thành công cho toa #" + maToaThuoc,
                "maToaThuoc", maToaThuoc
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}