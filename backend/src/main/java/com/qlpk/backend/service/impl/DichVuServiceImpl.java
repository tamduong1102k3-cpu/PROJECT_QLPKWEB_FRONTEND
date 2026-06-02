package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.DichVu;
import com.qlpk.backend.repository.DichVuRepository;
import com.qlpk.backend.service.DichVuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DichVuServiceImpl implements DichVuService {

    @Autowired
    private DichVuRepository repository;

    @Override
    public List<DichVu> getAll() {
        return repository.findAll();
    }

    @Override
    public DichVu getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public DichVu create(DichVu entity) {
        return repository.save(entity);
    }

    @Override
    public DichVu update(Integer id, DichVu entity) {
        if (repository.existsById(id)) {
            entity.setMaDichVu(id);
            return repository.save(entity);
        }
        return null;
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }
}