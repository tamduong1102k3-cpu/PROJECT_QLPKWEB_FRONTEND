package com.qlpk.backend.service;

import com.qlpk.backend.dto.HoSoBenhNhanDTO;
import com.qlpk.backend.entity.BenhNhan;
import java.util.List;

public interface BenhNhanService {
    List<BenhNhan> getAll();
    BenhNhan getById(Integer id);
    BenhNhan create(BenhNhan entity) throws Exception;
    BenhNhan update(Integer id, BenhNhan entity);
    void delete(Integer id);

    List<BenhNhan> search(String keyword);
    List<HoSoBenhNhanDTO> getHoSo(Integer id);
}