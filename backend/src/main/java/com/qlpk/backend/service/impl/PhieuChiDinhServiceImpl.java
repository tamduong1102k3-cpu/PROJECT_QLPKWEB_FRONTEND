package com.qlpk.backend.service.impl;

import com.qlpk.backend.dto.ReferralRequest;
import com.qlpk.backend.entity.*;
import com.qlpk.backend.repository.*;
import com.qlpk.backend.service.PhieuChiDinhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PhieuChiDinhServiceImpl implements PhieuChiDinhService {

    @Autowired private PhieuChiDinhRepository repository;
    @Autowired private ChiTietChiDinhRepository chiTietRepository;
    @Autowired private KhamLamSangRepository khamLamSangRepository;
    @Autowired private KetQuaXetNghiemRepository ketQuaXetNghiemRepository;
    @Autowired private KetQuaCdhaRepository ketQuaCdhaRepository;
    @Autowired private KetQuaXnChiSoRepository ketQuaXnChiSoRepository;
    @Autowired private DangKyKhamBenhRepository dangKyKhamBenhRepository;
    @Autowired private DichVuRepository dichVuRepository;

    private static class IndicatorDef {
        String name; String unit; String refRange; Double minVal; Double maxVal; boolean isSelect;
        IndicatorDef(String name, String unit, String refRange, Double minVal, Double maxVal, boolean isSelect) {
            this.name = name; this.unit = unit; this.refRange = refRange; this.minVal = minVal; this.maxVal = maxVal; this.isSelect = isSelect;
        }
    }

    private static final Map<String, IndicatorDef> INDICATOR_DICTIONARY = Map.ofEntries(
        Map.entry("rbc", new IndicatorDef("Hồng cầu (RBC)", "T/L", "3.8 - 5.8", 3.8, 5.8, false)),
        Map.entry("wbc", new IndicatorDef("Bạch cầu (WBC)", "G/L", "4.0 - 10.0", 4.0, 10.0, false)),
        Map.entry("hgb", new IndicatorDef("Hemoglobin (HGB)", "g/dL", "12.0 - 16.5", 12.0, 16.5, false)),
        Map.entry("plt", new IndicatorDef("Tiểu cầu (PLT)", "G/L", "150 - 400", 150.0, 400.0, false)),
        Map.entry("glucose", new IndicatorDef("Glucose (Đường huyết)", "mmol/L", "3.9 - 6.4", 3.9, 6.4, false)),
        Map.entry("ure", new IndicatorDef("Ure", "mmol/L", "2.5 - 7.5", 2.5, 7.5, false)),
        Map.entry("creatinin", new IndicatorDef("Creatinin", "µmol/L", "44 - 106", 44.0, 106.0, false)),
        Map.entry("ast", new IndicatorDef("SGOT (AST)", "U/L", "0 - 37", 0.0, 37.0, false)),
        Map.entry("alt", new IndicatorDef("SGPT (ALT)", "U/L", "0 - 41", 0.0, 41.0, false)),
        Map.entry("ph", new IndicatorDef("Độ pH nước tiểu", "", "5.0 - 8.5", 5.0, 8.5, false)),
        Map.entry("glucose_uri", new IndicatorDef("Glucose nước tiểu", "", "Negative", null, null, true)),
        Map.entry("protein_uri", new IndicatorDef("Protein nước tiểu", "", "Negative", null, null, true)),
        Map.entry("leukocytes", new IndicatorDef("Bạch cầu nước tiểu", "", "Negative", null, null, true))
    );

    @Override public List<PhieuChiDinh> getAll() { return repository.findAll(); }
    @Override public PhieuChiDinh getById(Integer id) { return repository.findById(id).orElse(null); }
    @Override public PhieuChiDinh create(PhieuChiDinh entity) { return repository.save(entity); }
    @Override public PhieuChiDinh update(Integer id, PhieuChiDinh entity) { return repository.save(entity); }
    @Override public void delete(Integer id) { repository.deleteById(id); }

    @Override
    public List<Map<String, Object>> getPendingTests(Integer maChuyenKhoa) {
        return repository.findPendingTests(maChuyenKhoa);
    }

    @Override
    public List<Map<String, Object>> getCompletedTestsToday(Integer maChuyenKhoa) {
        return repository.findCompletedTestsToday(maChuyenKhoa);
    }

    @Override
    @Transactional
    public void submitTestResult(Map<String, Object> body) throws Exception {
        Integer detailId = null;
        if (body.get("id") != null) detailId = Integer.valueOf(body.get("id").toString());
        Integer maPhieuKham = null;
        if (body.get("maPhieuKham") != null) maPhieuKham = Integer.valueOf(body.get("maPhieuKham").toString());
        String ketQua = (String) body.get("ketQua");
        Integer maNhanVienThucHien = null;
        if (body.get("maNhanVienThucHien") != null) maNhanVienThucHien = Integer.valueOf(body.get("maNhanVienThucHien").toString());
        String tenDichVu = (String) body.get("tenDichVu");

        if (detailId == null || maPhieuKham == null || ketQua == null) {
            throw new Exception("Thiếu thông tin bắt buộc");
        }

        var detailOpt = chiTietRepository.findById(detailId);
        if (detailOpt.isEmpty()) throw new Exception("Không tìm thấy chi tiết chỉ định");
        
        ChiTietChiDinh detail = detailOpt.get();
        detail.setTrangThaiDv("DA_THUC_HIEN");
        if (maNhanVienThucHien != null) detail.setMaNhanVienThucHien(maNhanVienThucHien);
        chiTietRepository.save(detail);

        var klsOpt = khamLamSangRepository.findByMaPhieuKham(maPhieuKham);
        KhamLamSang kls;
        String formattedResult = "- Xét nghiệm (" + (tenDichVu != null ? tenDichVu : "Dịch vụ") + "): " + ketQua;
        if (klsOpt.isPresent()) {
            kls = klsOpt.get();
            String existingKq = kls.getKetQuaKhamCanLamSang();
            if (existingKq == null || existingKq.trim().isEmpty()) {
                kls.setKetQuaKhamCanLamSang(formattedResult);
            } else {
                kls.setKetQuaKhamCanLamSang(existingKq + "\n" + formattedResult);
            }
        } else {
            kls = new KhamLamSang();
            kls.setMaPhieuKham(maPhieuKham);
            kls.setKetQuaKhamCanLamSang(formattedResult);
        }
        khamLamSangRepository.save(kls);

        if (body.get("templateValues") != null) {
            try {
                Map<String, Object> tVals = (Map<String, Object>) body.get("templateValues");
                String templateKey = (String) body.get("templateKey");

                if ("HEMATOLOGY".equals(templateKey) || "BIOCHEMISTRY".equals(templateKey) || "URINALYSIS".equals(templateKey)) {
                    KetQuaXetNghiem kqxn = ketQuaXetNghiemRepository.findByMaChiTietChiDinh(detailId)
                            .orElse(new KetQuaXetNghiem());
                    
                    kqxn.setMaChiTietChiDinh(detailId);
                    kqxn.setNgayThucHien(LocalDateTime.now());
                    kqxn.setNguoiThucHien(maNhanVienThucHien);
                    kqxn.setKetLuan(ketQua);

                    if (tVals.get("nhom_mau") != null) kqxn.setNhomMau(tVals.get("nhom_mau").toString());
                    if (tVals.get("dong_mau_co_ban") != null) kqxn.setDongMauCoBan(tVals.get("dong_mau_co_ban").toString());
                    if (tVals.get("ghi_chu_them") != null) kqxn.setGhiChuThem(tVals.get("ghi_chu_them").toString());
                    
                    if (body.get("trangThai") != null) kqxn.setTrangThai(body.get("trangThai").toString());
                    else kqxn.setTrangThai("CHO_DUYET");
                    
                    KetQuaXetNghiem savedKqxn = ketQuaXetNghiemRepository.save(kqxn);

                    ketQuaXnChiSoRepository.deleteByKetQuaXetNghiemId(savedKqxn.getId());

                    for (Map.Entry<String, Object> entry : tVals.entrySet()) {
                        String key = entry.getKey();
                        if (INDICATOR_DICTIONARY.containsKey(key)) {
                            Object rawVal = entry.getValue();
                            String valStr = rawVal != null ? rawVal.toString().trim() : "";
                            IndicatorDef def = INDICATOR_DICTIONARY.get(key);

                            boolean batThuong = false;
                            if (!valStr.isEmpty() && def != null) {
                                if (def.isSelect) {
                                    String valLower = valStr.toLowerCase();
                                    if (valLower.contains("positive") || valLower.contains("dương") || 
                                        valLower.contains("trace") || valLower.contains("vết")) {
                                        batThuong = true;
                                    }
                                } else if (def.minVal != null && def.maxVal != null) {
                                    try {
                                        double valNum = Double.parseDouble(valStr);
                                        if (valNum < def.minVal || valNum > def.maxVal) batThuong = true;
                                    } catch (NumberFormatException ignored) {}
                                }
                            }

                            KetQuaXnChiSo chiSo = new KetQuaXnChiSo();
                            chiSo.setKetQuaXetNghiemId(savedKqxn.getId());
                            chiSo.setMaChiSo(key);
                            chiSo.setTenChiSo(def.name);
                            chiSo.setGiaTri(valStr);
                            chiSo.setDonVi(def.unit);
                            chiSo.setChiSoThamChieu(def.refRange);
                            chiSo.setBatThuong(batThuong);
                            ketQuaXnChiSoRepository.save(chiSo);
                        }
                    }
                } else if ("ULTRASOUND".equals(templateKey) || "XRAY".equals(templateKey) || "CT_SCAN".equals(templateKey)) {
                    KetQuaCdha kqcdha = ketQuaCdhaRepository.findByIdChiTietChiDinh(detailId)
                            .orElse(new KetQuaCdha());
                    
                    kqcdha.setIdChiTietChiDinh(detailId);
                    kqcdha.setNgayThucHien(LocalDateTime.now());
                    kqcdha.setMaNhanVienThucHien(maNhanVienThucHien);
                    kqcdha.setKetLuan(ketQua);
                    
                    StringBuilder moTa = new StringBuilder();
                    for (var key : tVals.keySet()) {
                        if (!"ket_luan".equals(key) && !"de_nghi".equals(key) && !"duong_dan_anh_1".equals(key) && !"duong_dan_anh_2".equals(key)) {
                            moTa.append(key.toUpperCase()).append(": ").append(tVals.get(key)).append("\n");
                        }
                    }
                    kqcdha.setMoTaHinhAnh(moTa.toString());
                    
                    if (tVals.get("de_nghi") != null) kqcdha.setDeNghi(tVals.get("de_nghi").toString());
                    else if (body.get("deNghi") != null) kqcdha.setDeNghi(body.get("deNghi").toString());

                    if (tVals.get("duong_dan_anh_1") != null) kqcdha.setDuongDanAnh1(tVals.get("duong_dan_anh_1").toString());
                    if (tVals.get("duong_dan_anh_2") != null) kqcdha.setDuongDanAnh2(tVals.get("duong_dan_anh_2").toString());
                    
                    kqcdha.setTrangThai("CHO_DUYET");
                    ketQuaCdhaRepository.save(kqcdha);
                }
            } catch (Exception ex) {
                System.err.println("Lỗi khi lưu kết quả cấu trúc: " + ex.getMessage());
            }
        }

        if (body.get("duongDanAnh1") != null || body.get("duongDanAnh2") != null || body.get("deNghi") != null || (body.get("templateKey") != null && ("ULTRASOUND".equals(body.get("templateKey")) || "XRAY".equals(body.get("templateKey")) || "CT_SCAN".equals(body.get("templateKey"))))) {
            try {
                KetQuaCdha kqcdha = ketQuaCdhaRepository.findByIdChiTietChiDinh(detailId)
                        .orElse(new KetQuaCdha());
                
                kqcdha.setIdChiTietChiDinh(detailId);
                kqcdha.setNgayThucHien(LocalDateTime.now());
                kqcdha.setMaNhanVienThucHien(maNhanVienThucHien);
                kqcdha.setKetLuan(ketQua);
                
                if (body.get("duongDanAnh1") != null) kqcdha.setDuongDanAnh1(body.get("duongDanAnh1").toString());
                if (body.get("duongDanAnh2") != null) kqcdha.setDuongDanAnh2(body.get("duongDanAnh2").toString());
                if (body.get("deNghi") != null) kqcdha.setDeNghi(body.get("deNghi").toString());
                if (body.get("moTaHinhAnh") != null) kqcdha.setMoTaHinhAnh(body.get("moTaHinhAnh").toString());
                else if (kqcdha.getMoTaHinhAnh() == null) kqcdha.setMoTaHinhAnh(ketQua);
                
                kqcdha.setTrangThai("CHO_DUYET");
                ketQuaCdhaRepository.save(kqcdha);
            } catch (Exception ex) {
                System.err.println("Lỗi đồng bộ tự do CĐHA: " + ex.getMessage());
            }
        }

        try {
            dangKyKhamBenhRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
                dk.setTrangThai("CHO_DUYET");
                dangKyKhamBenhRepository.save(dk);
            });
        } catch (Exception ex) {
            System.err.println("Lỗi cập nhật trạng thái đăng ký sang CHO_DUYET: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public PhieuChiDinh create(ReferralRequest request) throws Exception {
        PhieuChiDinh pk = request.getPhieuChiDinh();
        List<ChiTietChiDinh> details = request.getChiTietList();
        
        // Tránh trùng lặp: Tìm các phiếu chỉ định đã có cho phiếu khám này
        if (pk.getMaPhieuKham() != null) {
            List<PhieuChiDinh> existingPcds = repository.findByMaPhieuKham(pk.getMaPhieuKham());
            if (existingPcds != null && !existingPcds.isEmpty()) {
                for (PhieuChiDinh oldPcd : existingPcds) {
                    List<ChiTietChiDinh> oldDetails = chiTietRepository.findByMaPhieuChiDinh(oldPcd.getMaPhieuChiDinh());
                    boolean allChuaThucHien = true;
                    if (oldDetails != null) {
                        for (ChiTietChiDinh od : oldDetails) {
                            if ("DA_THUC_HIEN".equals(od.getTrangThaiDv())) {
                                allChuaThucHien = false;
                                break;
                            }
                        }
                    }
                    if (allChuaThucHien) {
                        if (oldDetails != null && !oldDetails.isEmpty()) {
                            chiTietRepository.deleteAll(oldDetails);
                        }
                        repository.delete(oldPcd);
                    }
                }
            }
        }

        if (details == null || details.isEmpty()) {
            return null;
        }

        if (pk.getNgayChiDinh() == null) pk.setNgayChiDinh(LocalDateTime.now());
        PhieuChiDinh savedPk = repository.save(pk);
        
        for (ChiTietChiDinh item : details) {
            item.setMaPhieuChiDinh(savedPk.getMaPhieuChiDinh());
            if (item.getTrangThaiDv() == null) item.setTrangThaiDv("CHUA_THUC_HIEN");
            chiTietRepository.save(item);
        }
        return savedPk;
    }

    @Override
    public List<PhieuChiDinh> getByPhieuKham(Integer maPhieuKham) {
        return repository.findByMaPhieuKham(maPhieuKham);
    }

    @Override
    public List<PhieuChiDinh> getByBenhNhan(Integer maBenhNhan) {
        return repository.findByMaBenhNhan(maBenhNhan);
    }

    @Override
    public List<ChiTietChiDinh> getDetails(Integer id) {
        return chiTietRepository.findByMaPhieuChiDinh(id);
    }

    @Override
    public Object getCdhaResult(Integer detailId) {
        return ketQuaCdhaRepository.findByIdChiTietChiDinh(detailId).orElse(null);
    }

    @Override
    public Object getXetNhiemResult(Integer detailId) {
        var kqOpt = ketQuaXetNghiemRepository.findByMaChiTietChiDinh(detailId);
        if (kqOpt.isPresent()) {
            KetQuaXetNghiem kq = kqOpt.get();
            List<KetQuaXnChiSo> chiSoList = ketQuaXnChiSoRepository.findByKetQuaXetNghiemId(kq.getId());
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", kq.getId());
            response.put("maChiTietChiDinh", kq.getMaChiTietChiDinh());
            response.put("ngayThucHien", kq.getNgayThucHien());
            response.put("nguoiThucHien", kq.getNguoiThucHien());
            response.put("maBsKetLuan", kq.getMaBsKetLuan());
            response.put("ketLuan", kq.getKetLuan());
            response.put("nhomMau", kq.getNhomMau());
            response.put("dongMauCoBan", kq.getDongMauCoBan());
            response.put("ghiChuThem", kq.getGhiChuThem());
            response.put("trangThai", kq.getTrangThai());
            response.put("chiSoList", chiSoList);
            return response;
        }
        return null;
    }

    @Override
    public List<Map<String, Object>> getXetNhiemResultsByPhieuKham(Integer maPhieuKham) {
        List<PhieuChiDinh> pcdList = repository.findByMaPhieuKham(maPhieuKham);
        List<Map<String, Object>> responseList = new java.util.ArrayList<>();
        
        for (PhieuChiDinh pcd : pcdList) {
            List<ChiTietChiDinh> details = chiTietRepository.findByMaPhieuChiDinh(pcd.getMaPhieuChiDinh());
            for (ChiTietChiDinh detail : details) {
                var kqOpt = ketQuaXetNghiemRepository.findByMaChiTietChiDinh(detail.getId());
                if (kqOpt.isPresent()) {
                    var kq = kqOpt.get();
                    List<KetQuaXnChiSo> chiSoList = ketQuaXnChiSoRepository.findByKetQuaXetNghiemId(kq.getId());
                    
                    String tenDichVu = dichVuRepository.findById(detail.getMaDichVu())
                            .map(DichVu::getTenDichVu).orElse("Dịch vụ xét nghiệm");
                    
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("id", kq.getId());
                    response.put("maChiTietChiDinh", kq.getMaChiTietChiDinh());
                    response.put("tenDichVu", tenDichVu);
                    response.put("ngayThucHien", kq.getNgayThucHien());
                    response.put("nguoiThucHien", kq.getNguoiThucHien());
                    response.put("maBsKetLuan", kq.getMaBsKetLuan());
                    response.put("ketLuan", kq.getKetLuan());
                    response.put("nhomMau", kq.getNhomMau());
                    response.put("dongMauCoBan", kq.getDongMauCoBan());
                    response.put("ghiChuThem", kq.getGhiChuThem());
                    response.put("trangThai", kq.getTrangThai());
                    response.put("chiSoList", chiSoList);
                    responseList.add(response);
                }
            }
        }
        return responseList;
    }

    @Override
    @Transactional
    public void approveTestResult(Integer id, Map<String, Object> body) throws Exception {
        var kqOpt = ketQuaXetNghiemRepository.findById(id);
        if (kqOpt.isEmpty()) throw new Exception("Không tìm thấy kết quả");
        KetQuaXetNghiem kq = kqOpt.get();
        
        if (body.get("ketLuan") != null) kq.setKetLuan(body.get("ketLuan").toString());
        if (body.get("maBsKetLuan") != null) kq.setMaBsKetLuan(Integer.valueOf(body.get("maBsKetLuan").toString()));
        if (body.get("nhomMau") != null) kq.setNhomMau(body.get("nhomMau").toString());
        if (body.get("dongMauCoBan") != null) kq.setDongMauCoBan(body.get("dongMauCoBan").toString());
        if (body.get("ghiChuThem") != null) kq.setGhiChuThem(body.get("ghiChuThem").toString());
        
        if (body.get("chiSoList") != null) {
            List<Map<String, Object>> chiSoList = (List<Map<String, Object>>) body.get("chiSoList");
            for (Map<String, Object> csMap : chiSoList) {
                if (csMap.get("id") != null) {
                    Integer csId = Integer.valueOf(csMap.get("id").toString());
                    ketQuaXnChiSoRepository.findById(csId).ifPresent(cs -> {
                        if (csMap.get("giaTri") != null) cs.setGiaTri(csMap.get("giaTri").toString());
                        if (csMap.get("batThuong") != null) cs.setBatThuong(Boolean.valueOf(csMap.get("batThuong").toString()));
                        ketQuaXnChiSoRepository.save(cs);
                    });
                }
            }
        }

        kq.setTrangThai("DA_DUYET");
        ketQuaXetNghiemRepository.save(kq);

        chiTietRepository.findById(kq.getMaChiTietChiDinh()).ifPresent(detail -> {
            repository.findById(detail.getMaPhieuChiDinh()).ifPresent(pcd -> {
                dangKyKhamBenhRepository.findByMaPhieuKham(pcd.getMaPhieuKham()).ifPresent(dk -> {
                    dk.setTrangThai("CHO_BAC_SI");
                    dangKyKhamBenhRepository.save(dk);
                });
            });
        });
    }

    @Override
    public List<Map<String, Object>> getApprovedHistory(Integer maBacSi) {
        return ketQuaXetNghiemRepository.findApprovedHistoryDetailed(maBacSi);
    }

    @Override
    @Transactional
    public void rejectTestResult(Integer id, Map<String, String> body) throws Exception {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) throw new Exception("Vui lòng nhập lý do từ chối");

        KetQuaXetNghiem kq = ketQuaXetNghiemRepository.findById(id).orElse(null);
        if (kq == null) throw new Exception("Không tìm thấy kết quả");

        kq.setTrangThai("TU_CHOI");
        kq.setGhiChuThem(reason);
        ketQuaXetNghiemRepository.save(kq);

        chiTietRepository.findById(kq.getMaChiTietChiDinh()).ifPresent(detail -> {
            detail.setTrangThaiDv("CHUA_THUC_HIEN");
            chiTietRepository.save(detail);

            repository.findById(detail.getMaPhieuChiDinh()).ifPresent(pcd -> {
                dangKyKhamBenhRepository.findByMaPhieuKham(pcd.getMaPhieuKham()).ifPresent(dk -> {
                    dk.setTrangThai("DA_KHAM_LAM_SANG");
                    dangKyKhamBenhRepository.save(dk);
                });
            });
        });
    }

    @Override
    public List<Map<String, Object>> getCdhaResultsByPhieuKham(Integer maPhieuKham) {
        List<PhieuChiDinh> pcdList = repository.findByMaPhieuKham(maPhieuKham);
        List<Map<String, Object>> responseList = new java.util.ArrayList<>();
        
        for (PhieuChiDinh pcd : pcdList) {
            List<ChiTietChiDinh> details = chiTietRepository.findByMaPhieuChiDinh(pcd.getMaPhieuChiDinh());
            for (ChiTietChiDinh detail : details) {
                var kqOpt = ketQuaCdhaRepository.findByIdChiTietChiDinh(detail.getId());
                if (kqOpt.isPresent()) {
                    var kq = kqOpt.get();
                    String tenDichVu = dichVuRepository.findById(detail.getMaDichVu())
                            .map(DichVu::getTenDichVu).orElse("Dịch vụ chẩn đoán hình ảnh");
                    
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("id", kq.getId());
                    response.put("maChiTietChiDinh", detail.getId());
                    response.put("tenDichVu", tenDichVu);
                    response.put("ngayThucHien", kq.getNgayThucHien());
                    response.put("maNhanVienThucHien", kq.getMaNhanVienThucHien());
                    response.put("maBacSiThucHien", kq.getMaBacSiThucHien());
                    response.put("moTaHinhAnh", kq.getMoTaHinhAnh());
                    response.put("ketLuan", kq.getKetLuan());
                    response.put("deNghi", kq.getDeNghi());
                    response.put("duongDanAnh1", kq.getDuongDanAnh1());
                    response.put("duongDanAnh2", kq.getDuongDanAnh2());
                    response.put("trangThaiDv", detail.getTrangThaiDv());
                    responseList.add(response);
                }
            }
        }
        return responseList;
    }

    @Override
    @Transactional
    public void approveCdhaResult(Integer detailId, Map<String, Object> body) throws Exception {
        var kqOpt = ketQuaCdhaRepository.findByIdChiTietChiDinh(detailId);
        KetQuaCdha kq = kqOpt.orElse(new KetQuaCdha());
        
        kq.setIdChiTietChiDinh(detailId);
        kq.setNgayThucHien(LocalDateTime.now());
        if (body.get("maBacSiThucHien") != null) kq.setMaBacSiThucHien(Integer.valueOf(body.get("maBacSiThucHien").toString()));
        if (body.get("moTaHinhAnh") != null) kq.setMoTaHinhAnh(body.get("moTaHinhAnh").toString());
        if (body.get("ketLuan") != null) kq.setKetLuan(body.get("ketLuan").toString());
        if (body.get("deNghi") != null) kq.setDeNghi(body.get("deNghi").toString());
        if (body.get("duongDanAnh1") != null) kq.setDuongDanAnh1(body.get("duongDanAnh1").toString());
        if (body.get("duongDanAnh2") != null) kq.setDuongDanAnh2(body.get("duongDanAnh2").toString());
        
        kq.setTrangThai("DA_DUYET");
        ketQuaCdhaRepository.save(kq);

        chiTietRepository.findById(detailId).ifPresent(detail -> {
            detail.setTrangThaiDv("DA_THUC_HIEN");
            if (body.get("maBacSiThucHien") != null) {
                detail.setMaNhanVienThucHien(Integer.valueOf(body.get("maBacSiThucHien").toString()));
            }
            chiTietRepository.save(detail);

            repository.findById(detail.getMaPhieuChiDinh()).ifPresent(pcd -> {
                var klsOpt = khamLamSangRepository.findByMaPhieuKham(pcd.getMaPhieuKham());
                KhamLamSang kls;
                
                String tenDichVu = dichVuRepository.findById(detail.getMaDichVu())
                        .map(DichVu::getTenDichVu).orElse("Dịch vụ CDHA");
                String descResult = "- CĐHA (" + tenDichVu + "): Kết luận: " + kq.getKetLuan();
                
                if (klsOpt.isPresent()) {
                    kls = klsOpt.get();
                    String existingKq = kls.getKetQuaKhamCanLamSang();
                    if (existingKq == null || existingKq.trim().isEmpty()) {
                        kls.setKetQuaKhamCanLamSang(descResult);
                    } else {
                        kls.setKetQuaKhamCanLamSang(existingKq + "\n" + descResult);
                    }
                } else {
                    kls = new KhamLamSang();
                    kls.setMaPhieuKham(pcd.getMaPhieuKham());
                    kls.setKetQuaKhamCanLamSang(descResult);
                }
                khamLamSangRepository.save(kls);

                dangKyKhamBenhRepository.findByMaPhieuKham(pcd.getMaPhieuKham()).ifPresent(dk -> {
                    dk.setTrangThai("CHO_BAC_SI");
                    dangKyKhamBenhRepository.save(dk);
                });
            });
        });
    }

    @Override
    @Transactional
    public void rejectCdhaResult(Integer detailId, Map<String, String> body) throws Exception {
        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) throw new Exception("Vui lòng nhập lý do từ chối");

        var kqOpt = ketQuaCdhaRepository.findByIdChiTietChiDinh(detailId);
        if (kqOpt.isPresent()) {
            KetQuaCdha kq = kqOpt.get();
            kq.setDeNghi("YÊU CẦU LÀM LẠI: " + reason);
            kq.setTrangThai("TU_CHOI");
            ketQuaCdhaRepository.save(kq);
        }

        chiTietRepository.findById(detailId).ifPresent(detail -> {
            detail.setTrangThaiDv("CHUA_THUC_HIEN");
            chiTietRepository.save(detail);

            repository.findById(detail.getMaPhieuChiDinh()).ifPresent(pcd -> {
                dangKyKhamBenhRepository.findByMaPhieuKham(pcd.getMaPhieuKham()).ifPresent(dk -> {
                    dk.setTrangThai("DA_KHAM_LAM_SANG");
                    dangKyKhamBenhRepository.save(dk);
                });
            });
        });
    }
}