package com.qlpk.backend.service;

import com.qlpk.backend.entity.HoaDon;
import java.util.List;

public interface HoaDonService {
    List<HoaDon> getAll();
    HoaDon getById(Integer id);
    HoaDon create(HoaDon entity);
    HoaDon update(Integer id, HoaDon entity);
    void delete(Integer id);
}