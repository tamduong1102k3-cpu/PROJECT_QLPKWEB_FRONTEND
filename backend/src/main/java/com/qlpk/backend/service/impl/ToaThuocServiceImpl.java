package com.qlpk.backend.service.impl;

import com.qlpk.backend.dto.PrescriptionRequest;
import com.qlpk.backend.entity.ChiTietToaThuoc;
import com.qlpk.backend.entity.ToaThuoc;
import com.qlpk.backend.repository.ChiTietToaThuocRepository;
import com.qlpk.backend.repository.ToaThuocRepository;
import com.qlpk.backend.service.ToaThuocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ToaThuocServiceImpl implements ToaThuocService {

    @Autowired
    private ToaThuocRepository repository;

    @Autowired
    private ChiTietToaThuocRepository chiTietRepository;

    @Override
    public List<ToaThuoc> getAll() {
        return repository.findAll();
    }

    @Override
    public ToaThuoc getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public ToaThuoc create(ToaThuoc entity) {
        return repository.save(entity);
    }

    @Override
    public ToaThuoc update(Integer id, ToaThuoc entity) {
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
    public ToaThuoc createPrescription(PrescriptionRequest request) throws Exception {
        ToaThuoc toa = request.getToaThuoc();
        List<ChiTietToaThuoc> details = request.getChiTietList();
        
        // Tránh trùng lặp: Tìm các toa thuốc đã có cho phiếu khám này
        if (toa.getMaPhieuKham() != null) {
            List<ToaThuoc> existingToas = repository.findByMaPhieuKham(toa.getMaPhieuKham());
            if (existingToas != null && !existingToas.isEmpty()) {
                for (ToaThuoc oldToa : existingToas) {
                    if ("CHO_THANH_TOAN".equals(oldToa.getTrangThai())) {
                        List<ChiTietToaThuoc> oldDetails = chiTietRepository.findByMaToaThuoc(oldToa.getMaToaThuoc());
                        if (oldDetails != null && !oldDetails.isEmpty()) {
                            chiTietRepository.deleteAll(oldDetails);
                        }
                        repository.delete(oldToa);
                    }
                }
            }
        }

        if (details == null || details.isEmpty()) {
            return null;
        }

        if (toa.getNgayTao() == null) toa.setNgayTao(LocalDateTime.now());
        if (toa.getTrangThai() == null) toa.setTrangThai("CHO_THANH_TOAN");
        
        ToaThuoc savedToa = repository.save(toa);
        
        for (ChiTietToaThuoc item : details) {
            item.setMaToaThuoc(savedToa.getMaToaThuoc());
            chiTietRepository.save(item);
        }
        return savedToa;
    }

    @Override
    public List<ToaThuoc> findByMaPhieuKham(Integer maPhieuKham) {
        return repository.findByMaPhieuKham(maPhieuKham);
    }

    @Override
    public List<ToaThuoc> findByMaBenhNhan(Integer maBenhNhan) {
        return repository.findByMaBenhNhan(maBenhNhan);
    }
}