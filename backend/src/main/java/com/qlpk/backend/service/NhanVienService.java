package com.qlpk.backend.service;

import com.qlpk.backend.entity.NhanVien;
import com.qlpk.backend.dto.NhanVienRequestDTO;
import java.util.List;

public interface NhanVienService {
    List<NhanVien> getAllNhanVien();
    void addNhanVienViaProcedure(NhanVienRequestDTO dto);
    void updateNhanVien(Integer id, NhanVienRequestDTO dto);
    void deleteNhanVien(Integer id);
}
