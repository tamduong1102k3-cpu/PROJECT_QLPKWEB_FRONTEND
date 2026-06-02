package com.qlpk.backend.service;

import com.qlpk.backend.entity.KetQuaXnChiSo;
import java.util.List;

public interface KetQuaXnChiSoService {
    List<KetQuaXnChiSo> getAll();
    KetQuaXnChiSo getById(Integer id);
    KetQuaXnChiSo create(KetQuaXnChiSo entity);
    KetQuaXnChiSo update(Integer id, KetQuaXnChiSo entity);
    void delete(Integer id);
}