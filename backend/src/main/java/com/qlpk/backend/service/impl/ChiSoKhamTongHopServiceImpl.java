package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.ChiSoKhamTongHop;
import com.qlpk.backend.repository.ChiSoKhamTongHopRepository;
import com.qlpk.backend.repository.PhieuKhamRepository;
import com.qlpk.backend.service.ChiSoKhamTongHopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ChiSoKhamTongHopServiceImpl implements ChiSoKhamTongHopService {

    @Autowired
    private ChiSoKhamTongHopRepository repository;

    @Autowired
    private PhieuKhamRepository phieuKhamRepository;

    @Override
    public List<ChiSoKhamTongHop> getAll() {
        return repository.findAll();
    }

    @Override
    public ChiSoKhamTongHop getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public ChiSoKhamTongHop create(ChiSoKhamTongHop entity) {
        return repository.save(entity);
    }

    @Override
    public ChiSoKhamTongHop update(Integer id, ChiSoKhamTongHop entity) {
        if (repository.existsById(id)) {
            return repository.save(entity);
        }
        return null;
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public ChiSoKhamTongHop saveAndUpdatePhieuKham(ChiSoKhamTongHop body) {
        ChiSoKhamTongHop saved = repository.findTopByMaPhieuKhamOrderByNgayTaoDesc(body.getMaPhieuKham())
                .map(existing -> {
                    if (body.getMaNhanVienNhap() != null) existing.setMaNhanVienNhap(body.getMaNhanVienNhap());
                    if (body.getNhietDo() != null) existing.setNhietDo(body.getNhietDo());
                    if (body.getNhipTim() != null) existing.setNhipTim(body.getNhipTim());
                    if (body.getNhipTho() != null) existing.setNhipTho(body.getNhipTho());
                    if (body.getHuyetApTamThu() != null) existing.setHuyetApTamThu(body.getHuyetApTamThu());
                    if (body.getHuyetApTamTruong() != null) existing.setHuyetApTamTruong(body.getHuyetApTamTruong());
                    if (body.getCanNang() != null) existing.setCanNang(body.getCanNang());
                    if (body.getChieuCao() != null) existing.setChieuCao(body.getChieuCao());
                    if (body.getSpo2() != null) existing.setSpo2(body.getSpo2());
                    if (body.getVongDau() != null) existing.setVongDau(body.getVongDau());
                    if (body.getTinhTrangDinhDuong() != null) existing.setTinhTrangDinhDuong(body.getTinhTrangDinhDuong());
                    if (body.getTamLyHanhVi() != null) existing.setTamLyHanhVi(body.getTamLyHanhVi());
                    
                    // Răng Hàm Mặt
                    if (body.getTinhTrangRang() != null) existing.setTinhTrangRang(body.getTinhTrangRang());
                    if (body.getSauRang() != null) existing.setSauRang(body.getSauRang());
                    if (body.getCaoRang() != null) existing.setCaoRang(body.getCaoRang());
                    if (body.getViemNuou() != null) existing.setViemNuou(body.getViemNuou());
                    if (body.getKhopCan() != null) existing.setKhopCan(body.getKhopCan());
                    if (body.getNiemMacMieng() != null) existing.setNiemMacMieng(body.getNiemMacMieng());
                    if (body.getDoLungLay() != null) existing.setDoLungLay(body.getDoLungLay());
                    if (body.getPhuHinhCu() != null) existing.setPhuHinhCu(body.getPhuHinhCu());
                    if (body.getBenhLyKhacRhm() != null) existing.setBenhLyKhacRhm(body.getBenhLyKhacRhm());

                    // Nhi khoa & Cận lâm sàng khác
                    if (body.getKhamTaiMuiHongNhi() != null) existing.setKhamTaiMuiHongNhi(body.getKhamTaiMuiHongNhi());
                    if (body.getKhamHoHapNhi() != null) existing.setKhamHoHapNhi(body.getKhamHoHapNhi());
                    if (body.getKhamDuNiemMacNhi() != null) existing.setKhamDuNiemMacNhi(body.getKhamDuNiemMacNhi());
                    if (body.getKhamDaNiemMacNhi() != null) existing.setKhamDaNiemMacNhi(body.getKhamDaNiemMacNhi());
                    if (body.getCoQuanKhacNhi() != null) existing.setCoQuanKhacNhi(body.getCoQuanKhacNhi());
                    if (body.getThinhLucTaiTrai() != null) existing.setThinhLucTaiTrai(body.getThinhLucTaiTrai());
                    if (body.getThinhLucTaiPhai() != null) existing.setThinhLucTaiPhai(body.getThinhLucTaiPhai());

                    // Tai Mũi Họng
                    if (body.getTinhTrangMui() != null) existing.setTinhTrangMui(body.getTinhTrangMui());
                    if (body.getTinhTrangHong() != null) existing.setTinhTrangHong(body.getTinhTrangHong());
                    if (body.getSoiTaiMuiHong() != null) existing.setSoiTaiMuiHong(body.getSoiTaiMuiHong());
                    if (body.getOngTai() != null) existing.setOngTai(body.getOngTai());
                    if (body.getMangNhiPhai() != null) existing.setMangNhiPhai(body.getMangNhiPhai());
                    if (body.getMangNhiTrai() != null) existing.setMangNhiTrai(body.getMangNhiTrai());
                    if (body.getVachNgan() != null) existing.setVachNgan(body.getVachNgan());
                    if (body.getCuonMui() != null) existing.setCuonMui(body.getCuonMui());
                    if (body.getKheMui() != null) existing.setKheMui(body.getKheMui());
                    if (body.getAmidan() != null) existing.setAmidan(body.getAmidan());
                    if (body.getThanhQuan() != null) existing.setThanhQuan(body.getThanhQuan());

                    // Lipids & Đường huyết & ECG & Siêu âm & Ghi chú
                    if (body.getCholesterol() != null) existing.setCholesterol(body.getCholesterol());
                    if (body.getHdlCholesterol() != null) existing.setHdlCholesterol(body.getHdlCholesterol());
                    if (body.getLdlCholesterol() != null) existing.setLdlCholesterol(body.getLdlCholesterol());
                    if (body.getTriglyceride() != null) existing.setTriglyceride(body.getTriglyceride());
                    if (body.getDuongHuyet() != null) existing.setDuongHuyet(body.getDuongHuyet());
                    if (body.getEcgKetQua() != null) existing.setEcgKetQua(body.getEcgKetQua());
                    if (body.getSieuAmTim() != null) existing.setSieuAmTim(body.getSieuAmTim());
                    if (body.getGhiChu() != null) existing.setGhiChu(body.getGhiChu());
                    
                    return repository.save(existing);
                })
                .orElseGet(() -> repository.save(body));

        if (saved.getMaPhieuKham() != null) {
            phieuKhamRepository.findById(saved.getMaPhieuKham()).ifPresent(pk -> {
                pk.setTrangThai("CHO_BAC_SI");
                phieuKhamRepository.save(pk);
            });
        }
        return saved;
    }

    @Override
    public Optional<ChiSoKhamTongHop> findByMaPhieuKham(Integer maPhieuKham) {
        return repository.findTopByMaPhieuKhamOrderByNgayTaoDesc(maPhieuKham);
    }
}