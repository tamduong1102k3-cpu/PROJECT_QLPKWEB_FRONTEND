package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.HoaDon;
import com.qlpk.backend.repository.HoaDonRepository;
import com.qlpk.backend.service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HoaDonServiceImpl implements HoaDonService {

    @Autowired
    private HoaDonRepository repository;

    @Override
    public List<HoaDon> getAll() {
        return repository.findAll();
    }

    @Override
    public HoaDon getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public HoaDon create(HoaDon entity) {
        return repository.save(entity);
    }

    @Override
    public HoaDon update(Integer id, HoaDon entity) {
        if (repository.existsById(id)) {
            return repository.save(entity);
        }
        return null;
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }
}