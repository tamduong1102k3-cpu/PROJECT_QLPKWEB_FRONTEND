package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.DangKyKhamBenh;
import com.qlpk.backend.repository.DangKyKhamBenhRepository;
import com.qlpk.backend.service.DangKyKhamBenhService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class DangKyKhamBenhServiceImpl implements DangKyKhamBenhService {

    @Autowired
    private DangKyKhamBenhRepository repository;

    @Override
    public List<DangKyKhamBenh> getAll() {
        return repository.findAll();
    }

    @Override
    public DangKyKhamBenh getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public DangKyKhamBenh create(DangKyKhamBenh entity) {
        return repository.save(entity);
    }

    @Override
    public DangKyKhamBenh update(Integer id, DangKyKhamBenh entity) {
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
    public List<Map<String, Object>> getTodayRegistrationsDetailed() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return repository.findTodayRegistrationsDetailed(startOfDay);
    }

    @Override
    public List<Map<String, Object>> getTodayRegistrationsDetailedWithSearch(String keyword) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return repository.findTodayRegistrationsDetailedWithSearch(startOfDay, keyword);
    }

    @Override
    public DangKyKhamBenh updateStatus(Integer id, String status) {
        return repository.findById(id).map(dangKy -> {
            dangKy.setTrangThai(status);
            return repository.save(dangKy);
        }).orElse(null);
    }
}