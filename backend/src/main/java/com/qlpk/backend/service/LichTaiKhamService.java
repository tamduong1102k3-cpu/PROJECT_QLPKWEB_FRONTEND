package com.qlpk.backend.service;

import com.qlpk.backend.entity.LichTaiKham;
import java.util.List;
import java.util.Map;

public interface LichTaiKhamService {
    List<LichTaiKham> getAll();
    LichTaiKham getById(Integer id);
    LichTaiKham create(LichTaiKham entity);
    LichTaiKham update(Integer id, LichTaiKham entity);
    void delete(Integer id);

    List<Map<String, Object>> getAllDetailed();
    LichTaiKham updateAppointment(Integer id, LichTaiKham updated);
}