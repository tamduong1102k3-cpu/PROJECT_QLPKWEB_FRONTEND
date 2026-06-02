package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.KetQuaXnChiSo;
import com.qlpk.backend.repository.KetQuaXnChiSoRepository;
import com.qlpk.backend.service.KetQuaXnChiSoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class KetQuaXnChiSoServiceImpl implements KetQuaXnChiSoService {

    @Autowired
    private KetQuaXnChiSoRepository repository;

    @Override
    public List<KetQuaXnChiSo> getAll() {
        return repository.findAll();
    }

    @Override
    public KetQuaXnChiSo getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public KetQuaXnChiSo create(KetQuaXnChiSo entity) {
        return repository.save(entity);
    }

    @Override
    public KetQuaXnChiSo update(Integer id, KetQuaXnChiSo entity) {
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