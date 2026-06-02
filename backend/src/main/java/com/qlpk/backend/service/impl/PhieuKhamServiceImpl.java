package com.qlpk.backend.service.impl;

import com.qlpk.backend.dto.CheckInRequest;
import com.qlpk.backend.entity.*;
import com.qlpk.backend.repository.*;
import com.qlpk.backend.service.PhieuKhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class PhieuKhamServiceImpl implements PhieuKhamService {

    @Autowired
    private PhieuKhamRepository repository;

    @Autowired
    private DangKyKhamBenhRepository dangKyRepository;

    @Autowired
    private ChuyenKhoaRepository chuyenKhoaRepository;

    @Autowired
    private PhieuChiDinhRepository phieuChiDinhRepository;

    @Autowired
    private ChiTietChiDinhRepository chiTietRepository;

    @Autowired
    private DichVuRepository dichVuRepository;

    @Autowired
    private KetQuaXetNghiemRepository ketQuaXetNghiemRepository;

    @Autowired
    private KetQuaCdhaRepository ketQuaCdhaRepository;

    @Override
    public List<PhieuKham> getAll() {
        return repository.findAll();
    }

    @Override
    public PhieuKham getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
public List<Map<String, Object>> getAssistantHistory(Integer maChuyenKhoa) {
    return repository.findAssistantHistory(maChuyenKhoa);
}

    @Override
    public PhieuKham create(PhieuKham entity) {
        if (entity.getNgayKham() == null) {
            entity.setNgayKham(LocalDateTime.now());
        }
        if (entity.getNgayTao() == null) {
            entity.setNgayTao(LocalDateTime.now());
        }
        if (entity.getTrangThai() == null) {
            entity.setTrangThai("CHO");
        }
        return repository.save(entity);
    }

    @Override
    public PhieuKham update(Integer id, PhieuKham entity) {
        return repository.findById(id).map(existing -> {
            if (entity.getMaNhanVien() != null) existing.setMaNhanVien(entity.getMaNhanVien());
            if (entity.getMaChuyenKhoa() != null) existing.setMaChuyenKhoa(entity.getMaChuyenKhoa());
            if (entity.getTrangThai() != null) existing.setTrangThai(entity.getTrangThai());
            if (entity.getGhiChu() != null) existing.setGhiChu(entity.getGhiChu());

            return repository.save(existing);
        }).orElse(null);
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public List<PhieuKham> getToday() {
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        return repository.findByNgayKhamBetween(start, end);
    }

    @Override
    @Transactional
    public Map<String, Object> fullCheckIn(CheckInRequest request) throws Exception {
        if (request.getMaBenhNhan() == null || request.getMaChuyenKhoa() == null) {
            throw new Exception("Thiếu mã bệnh nhân hoặc chuyên khoa");
        }

        // Lấy thông tin chuyên khoa để kiểm tra tên
        ChuyenKhoa ck = chuyenKhoaRepository.findById(request.getMaChuyenKhoa()).orElse(null);
        String tenCK = (ck != null) ? ck.getTenChuyenKhoa().toLowerCase() : "";

        boolean canTaoPhieuKham = tenCK.contains("xét nghiệm") || tenCK.contains("hình ảnh");
        PhieuKham pk = null;

        if (canTaoPhieuKham) {
            Integer doctorId = request.getMaNhanVienBacSi();
            if (doctorId == null) {
                throw new Exception("Vui lòng chọn bác sĩ chỉ định cho chuyên khoa kỹ thuật này");
            }

            pk = new PhieuKham();
            pk.setMaBenhNhan(request.getMaBenhNhan());
            pk.setMaNhanVien(doctorId);
            pk.setMaChuyenKhoa(request.getMaChuyenKhoa());
            pk.setNgayKham(LocalDateTime.now());
            pk.setNgayTao(LocalDateTime.now());
            pk.setTrangThai("CHO");
            pk.setGhiChu(request.getGhiChu());
            pk.setMaDichVu(request.getMaDichVu());
            pk = repository.saveAndFlush(pk);

            if (request.getMaDichVu() != null) {
                Double donGia = 0.0;
                DichVu dv = dichVuRepository.findById(request.getMaDichVu()).orElse(null);
                if (dv != null && dv.getDonGia() != null) {
                    donGia = dv.getDonGia().doubleValue();
                }

                PhieuChiDinh pcd = new PhieuChiDinh();
                pcd.setMaPhieuKham(pk.getMaPhieuKham());
                pcd.setMaNhanVienChiDinh(doctorId);
                pcd.setNgayChiDinh(LocalDateTime.now());
                pcd.setTongTien(donGia);
                pcd = phieuChiDinhRepository.saveAndFlush(pcd);

                ChiTietChiDinh ct = new ChiTietChiDinh();
                ct.setMaPhieuChiDinh(pcd.getMaPhieuChiDinh());
                ct.setMaDichVu(request.getMaDichVu());
                ct.setSoLuong(1);
                ct.setDonGia(donGia);
                ct.setTrangThaiDv("CHUA_THUC_HIEN");
                chiTietRepository.saveAndFlush(ct);
            }
        }

        DangKyKhamBenh dk = new DangKyKhamBenh();
        dk.setMaBenhNhan(request.getMaBenhNhan());
        dk.setMaNhanVien(request.getMaNhanVienLeTan());
        dk.setMaChuyenKhoa(request.getMaChuyenKhoa());
        dk.setThoiGianDangKy(LocalDateTime.now());
        dk.setTrangThai("CHO_KHAM");
        
        if (pk != null) {
            dk.setMaPhieuKham(pk.getMaPhieuKham());
        }

        String note = request.getGhiChu();
        if (request.getMaDichVu() != null) {
            note = "[Dịch vụ ID: " + request.getMaDichVu() + "] " + (note != null ? note : "");
        }
        dk.setGhiChu(note);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long count = dangKyRepository.countTodayRegistrations(startOfDay);
        dk.setSoThuTu((int)count + 1);

        dangKyRepository.saveAndFlush(dk);

        return Map.of(
            "message", "Tiếp đón thành công",
            "soThuTu", dk.getSoThuTu(),
            "hasPhieuKham", pk != null
        );
    }

    @Override
    @Transactional
    public Map<String, Object> acceptPatient(Integer registrationId, Integer assistantId) throws Exception {
        DangKyKhamBenh dk = dangKyRepository.findById(registrationId).orElse(null);
        if (dk == null) {
            throw new Exception("Không tìm thấy hồ sơ đăng ký khám");
        }
        if (dk.getMaPhieuKham() != null) {
            throw new Exception("Bệnh nhân này đã có phiếu khám");
        }

        PhieuKham pk = new PhieuKham();
        pk.setMaBenhNhan(dk.getMaBenhNhan());
        pk.setMaChuyenKhoa(dk.getMaChuyenKhoa());
        pk.setMaNhanVien(assistantId != null ? assistantId : dk.getMaNhanVien()); 
        pk.setNgayKham(LocalDateTime.now());
        pk.setNgayTao(LocalDateTime.now());
        pk.setTrangThai("CHO"); 
        pk = repository.saveAndFlush(pk);

        dk.setMaPhieuKham(pk.getMaPhieuKham());
        dk.setTrangThai("DANG_KHAM");
        dangKyRepository.saveAndFlush(dk);

        return Map.of(
            "message", "Đã tạo phiếu khám thành công", 
            "phieuKhamId", pk.getMaPhieuKham(),
            "registration", dk
        );
    }

    @Override
    public List<Map<String, Object>> getHistory(Integer maBacSi) {
        return repository.findHistoryDetailed(maBacSi);
    }


    @Override
@Transactional
public void updateToWaitingForDoctor(Integer maPhieuKham) throws Exception {
    // 1. Cập nhật trạng thái trong bảng phieu_kham
    PhieuKham pk = repository.findById(maPhieuKham)
            .orElseThrow(() -> new Exception("Không tìm thấy phiếu khám #" + maPhieuKham));
    pk.setTrangThai("CHO_BAC_SI");
    repository.save(pk);

    // 2. Cập nhật trạng thái trong bảng dang_ky_kham_benh (để lễ tân/hàng đợi thấy)
    dangKyRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
        dk.setTrangThai("CHO_BAC_SI");
        dangKyRepository.save(dk);
    });
}

    @Override
    @Transactional
    public void finishConsultation(Integer maPhieuKham) throws Exception {
        PhieuKham pk = repository.findById(maPhieuKham).orElse(null);
        if (pk == null) throw new Exception("Không tìm thấy phiếu khám");

        pk.setTrangThai("HOAN_THANH");
        repository.save(pk);

        dangKyRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
            dk.setTrangThai("HOAN_THANH");
            dangKyRepository.save(dk);
        });
    }

    @Override
    public List<Map<String, Object>> getAvailableClsResults(Integer maPhieuKham) {
        List<Map<String, Object>> results = new java.util.ArrayList<>();
        List<PhieuChiDinh> pcdList = phieuChiDinhRepository.findByMaPhieuKham(maPhieuKham);
        if (pcdList == null) return results;

        for (PhieuChiDinh pcd : pcdList) {
            List<ChiTietChiDinh> details = chiTietRepository.findByMaPhieuChiDinh(pcd.getMaPhieuChiDinh());
            if (details == null) continue;

            for (ChiTietChiDinh detail : details) {
                if ("DA_THUC_HIEN".equals(detail.getTrangThaiDv())) {
                    // Check if xét nghiệm and approved
                    var kqxnOpt = ketQuaXetNghiemRepository.findByMaChiTietChiDinh(detail.getId());
                    if (kqxnOpt.isPresent() && "DA_DUYET".equals(kqxnOpt.get().getTrangThai())) {
                        String tenDv = dichVuRepository.findById(detail.getMaDichVu())
                                .map(DichVu::getTenDichVu).orElse("Dịch vụ xét nghiệm");
                        Map<String, Object> map = new java.util.HashMap<>();
                        map.put("id", detail.getId());
                        map.put("loai", "XET_NGHIEM");
                        map.put("tenDichVu", tenDv);
                        results.add(map);
                        continue;
                    }

                    // Check if CĐHA and approved
                    var kqcdhaOpt = ketQuaCdhaRepository.findByIdChiTietChiDinh(detail.getId());
                    if (kqcdhaOpt.isPresent() && "DA_DUYET".equals(kqcdhaOpt.get().getTrangThai())) {
                        String tenDv = dichVuRepository.findById(detail.getMaDichVu())
                                .map(DichVu::getTenDichVu).orElse("Dịch vụ CĐHA");
                        Map<String, Object> map = new java.util.HashMap<>();
                        map.put("id", detail.getId());
                        map.put("loai", "CDHA");
                        map.put("tenDichVu", tenDv);
                        results.add(map);
                    }
                }
            }
        }
        return results;
    }
}