package com.qlpk.backend.service;

import com.qlpk.backend.entity.BangPhanCongCaLam;
import java.util.List;
import java.util.Map;

public interface BangPhanCongCaLamService {
    List<BangPhanCongCaLam> getAll();
    BangPhanCongCaLam getById(Integer id);
    BangPhanCongCaLam create(BangPhanCongCaLam entity);
    BangPhanCongCaLam update(Integer id, BangPhanCongCaLam entity);
    void delete(Integer id);
    
    List<BangPhanCongCaLam> getWorkingToday();
    Map<String, String> getCurrentRoom(Integer maNhanVien);
}