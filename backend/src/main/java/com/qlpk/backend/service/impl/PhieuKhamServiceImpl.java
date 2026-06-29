package com.qlpk.backend.service.impl;

import com.qlpk.backend.dto.CheckInRequest;
import com.qlpk.backend.entity.*;
import com.qlpk.backend.payment.WebSocketPublisher;
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
    private LichTaiKhamRepository lichTaiKhamRepository;

    @Autowired
    private KetQuaXetNghiemRepository ketQuaXetNghiemRepository;

    @Autowired
    private KetQuaCdhaRepository ketQuaCdhaRepository;

    @Autowired
    private TiepNhanClsRepository tiepNhanClsRepository;

    @Autowired
    private WebSocketPublisher webSocketPublisher;

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
    @Transactional
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

        // Kiểm tra trùng: không cho tạo PK mới nếu bệnh nhân đã có PK hôm nay với cùng chuyên khoa
        // và PK đó chưa kết thúc (trạng thái != HOAN_THANH)
        if (entity.getMaBenhNhan() != null && entity.getMaChuyenKhoa() != null) {
            List<PhieuKham> existing = repository.findByMaBenhNhanAndMaChuyenKhoaAndNgayKhamBetween(
                entity.getMaBenhNhan(),
                entity.getMaChuyenKhoa(),
                entity.getNgayKham().withHour(0).withMinute(0).withSecond(0),
                entity.getNgayKham().withHour(23).withMinute(59).withSecond(59)
            );
            if (existing != null && !existing.isEmpty()) {
                // Nếu tồn tại PK cũ chưa HOAN_THANH thì trả về PK cũ
                PhieuKham unfinished = null;
                for (PhieuKham pk : existing) {
                    if (!"HOAN_THANH".equals(pk.getTrangThai())) {
                        unfinished = pk;
                        break;
                    }
                }
                if (unfinished != null) {
                    return unfinished;
                }
            }
        }

        PhieuKham saved = repository.save(entity);
        webSocketPublisher.publishPhieuKhamChange("CREATED", saved);

        // KHÔNG tự động tạo PhieuChiDinh nữa
        // Phiếu chỉ định chỉ được tạo khi bác sĩ CLS xác nhận thực hiện dịch vụ
        // (xem method confirmClsService)

        return saved;
    }

    @Override
    public PhieuKham update(Integer id, PhieuKham entity) {
        return repository.findById(id).map(existing -> {
            if (entity.getMaNhanVien() != null) existing.setMaNhanVien(entity.getMaNhanVien());
            if (entity.getMaChuyenKhoa() != null) existing.setMaChuyenKhoa(entity.getMaChuyenKhoa());
            if (entity.getTrangThai() != null) existing.setTrangThai(entity.getTrangThai());
            if (entity.getGhiChu() != null) existing.setGhiChu(entity.getGhiChu());

            PhieuKham saved = repository.save(existing);
            webSocketPublisher.publishPhieuKhamChange("UPDATED", saved);
            return saved;
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

        // Lấy thông tin chuyên khoa để kiểm tra tên và số lượng tối đa
        ChuyenKhoa ck = chuyenKhoaRepository.findById(request.getMaChuyenKhoa()).orElse(null);
        if (ck == null) {
            throw new Exception("Không tìm thấy chuyên khoa");
        }
        String tenCK = ck.getTenChuyenKhoa().toLowerCase();

        // Kiểm tra số lượng tối đa
        if (ck.getSoLuongToiDa() != null && ck.getSoLuongToiDa() > 0) {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            long todayCount = dangKyRepository.countTodayRegistrationsByChuyenKhoa(startOfDay, request.getMaChuyenKhoa());
            if (todayCount >= ck.getSoLuongToiDa()) {
                throw new Exception("Chuyên khoa '" + ck.getTenChuyenKhoa() + "' đã đạt số lượng tối đa hôm nay (" + ck.getSoLuongToiDa() + "). Vui lòng chọn chuyên khoa khác hoặc quay lại vào ngày mai.");
            }
        }

        // Lễ tân CHỈ tạo DangKyKhamBenh, không tạo PhieuKham hay PhieuChiDinh
        // PhieuKham sẽ do KTV (CLS) hoặc Trợ lý (khám thường) tạo sau
        DangKyKhamBenh dk = new DangKyKhamBenh();
        dk.setMaBenhNhan(request.getMaBenhNhan());
        dk.setMaNhanVien(request.getMaNhanVienLeTan());
        dk.setMaChuyenKhoa(request.getMaChuyenKhoa());
        dk.setThoiGianDangKy(LocalDateTime.now());
        dk.setTrangThai("CHO_KHAM");
        dk.setMaDichVu(request.getMaDichVu());

        String note = request.getGhiChu();
        if (request.getMaDichVu() != null) {
            note = "[Dịch vụ ID: " + request.getMaDichVu() + "] " + (note != null ? note : "");
        }
        dk.setGhiChu(note);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long count = dangKyRepository.countTodayRegistrations(startOfDay);
        dk.setSoThuTu((int)count + 1);

        DangKyKhamBenh savedDk = dangKyRepository.saveAndFlush(dk);
        webSocketPublisher.publishDangKyKhamChange("CREATED", savedDk.getId(), savedDk.getTrangThai());

        // Nếu có appointmentId → tự động cập nhật trạng thái lịch hẹn thành DA_DEN
        if (request.getAppointmentId() != null) {
            lichTaiKhamRepository.findById(request.getAppointmentId()).ifPresent(l -> {
                l.setTrangThai("DA_DEN");
                lichTaiKhamRepository.save(l);
            });
        }

        return Map.of(
            "message", "Tiếp đón thành công",
            "soThuTu", dk.getSoThuTu(),
            "hasPhieuKham", false
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
        pk.setMaDichVu(dk.getMaDichVu());
        pk = repository.saveAndFlush(pk);
        webSocketPublisher.publishPhieuKhamChange("CREATED", pk);

        // KHÔNG tự động tạo PhieuChiDinh nữa
        // Phiếu chỉ định (CLS) chỉ được tạo khi bác sĩ CLS xác nhận thực hiện dịch vụ

        dk.setMaPhieuKham(pk.getMaPhieuKham());
        dk.setTrangThai("DANG_KHAM");
        dangKyRepository.saveAndFlush(dk);
        webSocketPublisher.publishDangKyKhamChange("UPDATED", dk.getId(), dk.getTrangThai());

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
    webSocketPublisher.publishPhieuKhamChange("UPDATED", pk);

    // 2. Cập nhật trạng thái trong bảng dang_ky_kham_benh (để lễ tân/hàng đợi thấy)
    dangKyRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
        dk.setTrangThai("CHO_BAC_SI");
        dangKyRepository.save(dk);
        webSocketPublisher.publishDangKyKhamChange("UPDATED", dk.getId(), dk.getTrangThai());
    });
}

    @Override
    @Transactional
    public void updateToChoCls(Integer maPhieuKham) throws Exception {
        PhieuKham pk = repository.findById(maPhieuKham)
                .orElseThrow(() -> new Exception("Không tìm thấy phiếu khám #" + maPhieuKham));
        pk.setTrangThai("CHO_CLS");
        repository.save(pk);
        webSocketPublisher.publishPhieuKhamChange("UPDATED", pk);

        dangKyRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
            dk.setTrangThai("CHO_CLS");
            dangKyRepository.save(dk);
            webSocketPublisher.publishDangKyKhamChange("UPDATED", dk.getId(), dk.getTrangThai());
        });
    }

    @Override
    @Transactional
    public void finishConsultation(Integer maPhieuKham) throws Exception {
        PhieuKham pk = repository.findById(maPhieuKham).orElse(null);
        if (pk == null) throw new Exception("Không tìm thấy phiếu khám");

        pk.setTrangThai("HOAN_THANH");
        repository.save(pk);
        webSocketPublisher.publishPhieuKhamChange("UPDATED", pk);

        dangKyRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
            dk.setTrangThai("HOAN_THANH");
            dangKyRepository.save(dk);
            webSocketPublisher.publishDangKyKhamChange("UPDATED", dk.getId(), dk.getTrangThai());
        });
    }

    @Override
    public List<Map<String, Object>> getCompletedPatientsToday() {
        return repository.findCompletedPatientsToday();
    }

    @Override
    public List<Map<String, Object>> getCompletedPatientsTodayWithSearch(String keyword) {
        return repository.findCompletedPatientsTodayWithSearch(keyword);
    }

    @Override
    public List<Map<String, Object>> getHistoryByChuyenKhoaAllDays(Integer maChuyenKhoa) {
        return repository.findHistoryByChuyenKhoaAllDays(maChuyenKhoa);
    }

    @Override
    @Transactional
    public Map<String, Object> acceptClsPatient(Integer registrationId, Integer technicianId) throws Exception {
        DangKyKhamBenh dk = dangKyRepository.findById(registrationId).orElse(null);
        if (dk == null) {
            throw new Exception("Không tìm thấy hồ sơ đăng ký khám");
        }
        if (dk.getMaPhieuKham() != null) {
            throw new Exception("Bệnh nhân này đã được tiếp nhận");
        }

        // Tạo PhieuKham cho bệnh nhân CLS
        PhieuKham pk = new PhieuKham();
        pk.setMaBenhNhan(dk.getMaBenhNhan());
        pk.setMaChuyenKhoa(dk.getMaChuyenKhoa());
        pk.setMaNhanVien(technicianId != null ? technicianId : dk.getMaNhanVien());
        pk.setNgayKham(LocalDateTime.now());
        pk.setNgayTao(LocalDateTime.now());
        pk.setTrangThai("CHO");
        pk.setMaDichVu(dk.getMaDichVu());
        pk.setGhiChu(dk.getGhiChu());
        pk = repository.saveAndFlush(pk);
        webSocketPublisher.publishPhieuKhamChange("CREATED", pk);

        // Cập nhật DangKyKhamBenh
        dk.setMaPhieuKham(pk.getMaPhieuKham());
        dk.setTrangThai("DANG_KHAM");
        dangKyRepository.saveAndFlush(dk);
        webSocketPublisher.publishDangKyKhamChange("UPDATED", dk.getId(), dk.getTrangThai());

        return Map.of(
            "message", "Đã tiếp nhận bệnh nhân CLS thành công",
            "phieuKhamId", pk.getMaPhieuKham(),
            "registration", dk
        );
    }

    @Override
    @Transactional
    public Map<String, Object> techConfirmClsService(Integer maPhieuKham, Integer technicianId, String lyDoDen, String thongTinSangLoc, String ghiChu) throws Exception {
        PhieuKham pk = repository.findById(maPhieuKham)
                .orElseThrow(() -> new Exception("Không tìm thấy phiếu khám #" + maPhieuKham));

        if (pk.getMaDichVu() == null) {
            throw new Exception("Phiếu khám này không có dịch vụ CLS");
        }

        // 1. Tạo TiepNhanCls
        TiepNhanCls tiepNhan = new TiepNhanCls();
        tiepNhan.setMaPhieuKham(maPhieuKham);
        tiepNhan.setLyDoDen(lyDoDen);
        tiepNhan.setThongTinSangLoc(thongTinSangLoc);
        tiepNhan.setGhiChu(ghiChu);
        tiepNhanClsRepository.save(tiepNhan);

        // 2. Kiểm tra đã có PhieuChiDinh chưa
        List<PhieuChiDinh> existingPcd = phieuChiDinhRepository.findByMaPhieuKham(maPhieuKham);
        if (existingPcd != null && !existingPcd.isEmpty()) {
            throw new Exception("Phiếu chỉ định đã được tạo trước đó cho phiếu khám này");
        }

        // 3. Tạo PhieuChiDinh với maNhanVienChiDinh = technicianId (KTV)
        DichVu dv = dichVuRepository.findById(pk.getMaDichVu()).orElse(null);
        Double donGia = (dv != null && dv.getDonGia() != null) ? dv.getDonGia().doubleValue() : 0.0;

        PhieuChiDinh pcd = new PhieuChiDinh();
        pcd.setMaPhieuKham(maPhieuKham);
        pcd.setMaNhanVienChiDinh(technicianId);
        pcd.setNgayChiDinh(LocalDateTime.now());
        pcd.setTongTien(donGia);
        pcd = phieuChiDinhRepository.saveAndFlush(pcd);

        // 4. Tạo ChiTietChiDinh
        ChiTietChiDinh ct = new ChiTietChiDinh();
        ct.setMaPhieuChiDinh(pcd.getMaPhieuChiDinh());
        ct.setMaDichVu(pk.getMaDichVu());
        ct.setSoLuong(1);
        ct.setDonGia(donGia);
        ct.setTrangThaiDv("CHUA_THUC_HIEN");
        chiTietRepository.saveAndFlush(ct);

        // 5. Cập nhật trạng thái phiếu khám lên CHO_CLS
        pk.setTrangThai("CHO_CLS");
        repository.save(pk);
        webSocketPublisher.publishPhieuKhamChange("UPDATED", pk);

        // 6. Cập nhật DangKyKhamBenh
        dangKyRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
            dk.setTrangThai("CHO_CLS");
            dangKyRepository.save(dk);
            webSocketPublisher.publishDangKyKhamChange("UPDATED", dk.getId(), dk.getTrangThai());
        });

        return Map.of(
            "message", "Đã tiếp nhận CLS và tạo phiếu chỉ định thành công",
            "phieuChiDinhId", pcd.getMaPhieuChiDinh()
        );
    }

    @Override
    @Transactional
    public Map<String, Object> confirmClsService(Integer maPhieuKham, Integer doctorId) throws Exception {
        PhieuKham pk = repository.findById(maPhieuKham)
                .orElseThrow(() -> new Exception("Không tìm thấy phiếu khám #" + maPhieuKham));

        if (pk.getMaDichVu() == null) {
            throw new Exception("Phiếu khám này không có dịch vụ CLS để xác nhận");
        }

        // Kiểm tra đã có PhieuChiDinh chưa (tránh tạo trùng)
        List<PhieuChiDinh> existingPcd = phieuChiDinhRepository.findByMaPhieuKham(maPhieuKham);
        if (existingPcd != null && !existingPcd.isEmpty()) {
            throw new Exception("Phiếu chỉ định đã được tạo trước đó cho phiếu khám này");
        }

        // Tạo PhieuChiDinh
        DichVu dv = dichVuRepository.findById(pk.getMaDichVu()).orElse(null);
        Double donGia = (dv != null && dv.getDonGia() != null) ? dv.getDonGia().doubleValue() : 0.0;

        PhieuChiDinh pcd = new PhieuChiDinh();
        pcd.setMaPhieuKham(maPhieuKham);
        pcd.setMaNhanVienChiDinh(doctorId);
        pcd.setNgayChiDinh(LocalDateTime.now());
        pcd.setTongTien(donGia);
        pcd = phieuChiDinhRepository.saveAndFlush(pcd);

        // Tạo ChiTietChiDinh
        ChiTietChiDinh ct = new ChiTietChiDinh();
        ct.setMaPhieuChiDinh(pcd.getMaPhieuChiDinh());
        ct.setMaDichVu(pk.getMaDichVu());
        ct.setSoLuong(1);
        ct.setDonGia(donGia);
        ct.setTrangThaiDv("CHUA_THUC_HIEN");
        chiTietRepository.saveAndFlush(ct);

        // Cập nhật trạng thái phiếu khám
        pk.setTrangThai("CHO_CLS");
        repository.save(pk);
        webSocketPublisher.publishPhieuKhamChange("UPDATED", pk);

        // Cập nhật DangKyKhamBenh
        dangKyRepository.findByMaPhieuKham(maPhieuKham).ifPresent(dk -> {
            dk.setTrangThai("CHO_CLS");
            dangKyRepository.save(dk);
            webSocketPublisher.publishDangKyKhamChange("UPDATED", dk.getId(), dk.getTrangThai());
        });

        return Map.of(
            "message", "Đã xác nhận thực hiện dịch vụ và tạo phiếu chỉ định thành công",
            "phieuChiDinhId", pcd.getMaPhieuChiDinh()
        );
    }

    @Override
    public List<Map<String, Object>> getPendingClsConfirmation(Integer maChuyenKhoa) {
        // Lấy danh sách bệnh nhân CLS đã có PhieuKham nhưng chưa có PhieuChiDinh
        // và đang chờ bác sĩ CLS xác nhận
        return repository.findPendingClsConfirmation(maChuyenKhoa);
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
