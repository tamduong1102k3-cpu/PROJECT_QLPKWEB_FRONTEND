package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.KhoThuoc;
import com.qlpk.backend.entity.Thuoc;
import com.qlpk.backend.repository.KhoThuocRepository;
import com.qlpk.backend.repository.ThuocRepository;
import com.qlpk.backend.service.KhoThuocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class KhoThuocServiceImpl implements KhoThuocService {

    @Autowired
    private KhoThuocRepository repository;

    @Autowired
    private ThuocRepository thuocRepository;

    @Override
    public List<KhoThuoc> getAll() {
        return repository.findAll();
    }

    @Override
    public KhoThuoc getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public KhoThuoc create(KhoThuoc entity) {
        return repository.save(entity);
    }

    @Override
    public KhoThuoc update(Integer id, KhoThuoc entity) {
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
    public List<Map<String, Object>> getSapHet(Integer threshold) {
        List<KhoThuoc> lowStock = repository.findBySoLuongTonLessThanOrderBySoLuongTonAsc(threshold);

        Map<Integer, Thuoc> thuocMap = new HashMap<>();
        thuocRepository.findAll().forEach(t -> thuocMap.put(t.getMaThuoc(), t));

        List<Map<String, Object>> result = new ArrayList<>();
        for (KhoThuoc k : lowStock) {
            Thuoc t = thuocMap.get(k.getMaThuoc());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("idKho",       k.getIdKho());
            row.put("maThuoc",     k.getMaThuoc());
            row.put("tenThuoc",    t != null ? t.getTenThuoc()  : "N/A");
            row.put("donViTinh",   t != null ? t.getDonViTinh() : "");
            row.put("soLuongTon",  k.getSoLuongTon());
            row.put("hanSuDung",   t != null ? t.getHanSuDung() : null);
            result.add(row);
        }
        return result;
    }
}