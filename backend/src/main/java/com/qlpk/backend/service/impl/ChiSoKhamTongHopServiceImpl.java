package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.ChiSoKhamTongHop;
import com.qlpk.backend.payment.WebSocketPublisher;
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

    @Autowired
    private WebSocketPublisher webSocketPublisher;

    @Override
    public List<ChiSoKhamTongHop> getAll() {
        return repository.findAll();
    }

    @Override
    public ChiSoKhamTongHop getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Optional<ChiSoKhamTongHop> findByMaPhieuKham(Integer maPhieuKham) {
        return Optional.ofNullable(repository.findTopByMaPhieuKhamOrderByNgayTaoDesc(maPhieuKham).orElse(null));
    }

    @Override
    public ChiSoKhamTongHop create(ChiSoKhamTongHop entity) {
        ChiSoKhamTongHop saved = repository.save(entity);
        if (saved.getMaPhieuKham() != null) {
            webSocketPublisher.publishVitalsChange("CREATED", saved.getMaPhieuKham());
        }
        return saved;
    }

    @Override
    public ChiSoKhamTongHop update(Integer id, ChiSoKhamTongHop entity) {
        if (repository.existsById(id)) {
            ChiSoKhamTongHop saved = repository.save(entity);
            if (saved.getMaPhieuKham() != null) {
                webSocketPublisher.publishVitalsChange("UPDATED", saved.getMaPhieuKham());
            }
            return saved;
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
                    if (body.getTinhTrangRang() != null) existing.setTinhTrangRang(body.getTinhTrangRang());
                    if (body.getSauRang() != null) existing.setSauRang(body.getSauRang());
                    if (body.getCaoRang() != null) existing.setCaoRang(body.getCaoRang());
                    if (body.getViemNuou() != null) existing.setViemNuou(body.getViemNuou());
                    if (body.getKhopCan() != null) existing.setKhopCan(body.getKhopCan());
                    if (body.getNiemMacMieng() != null) existing.setNiemMacMieng(body.getNiemMacMieng());
                    if (body.getDoLungLay() != null) existing.setDoLungLay(body.getDoLungLay());
                    if (body.getPhuHinhCu() != null) existing.setPhuHinhCu(body.getPhuHinhCu());
                    if (body.getBenhLyKhacRhm() != null) existing.setBenhLyKhacRhm(body.getBenhLyKhacRhm());
                    if (body.getGhiChu() != null) existing.setGhiChu(body.getGhiChu());
                    if (body.getNgayTao() != null) existing.setNgayTao(body.getNgayTao());

                    return repository.save(existing);
                })
                .orElseGet(() -> repository.save(body));

        // Publish sự kiện WebSocket khi trợ lý lưu sinh hiệu
        if (saved.getMaPhieuKham() != null) {
            webSocketPublisher.publishVitalsChange("UPDATED", saved.getMaPhieuKham());
        }

        if (saved.getMaPhieuKham() != null) {
            phieuKhamRepository.findById(saved.getMaPhieuKham()).ifPresent(pk -> {
                if (!"CHO_BAC_SI".equals(pk.getTrangThai()) && !"HOAN_THANH".equals(pk.getTrangThai())) {
                    pk.setTrangThai("CHO_BAC_SI");
                    phieuKhamRepository.save(pk);
                    webSocketPublisher.publishPhieuKhamChange("UPDATED", pk);
                }
            });
        }
        return saved;
    }
}
