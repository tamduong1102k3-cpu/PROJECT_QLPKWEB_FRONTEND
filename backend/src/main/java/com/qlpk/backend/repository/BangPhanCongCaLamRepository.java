package com.qlpk.backend.repository;

import com.qlpk.backend.entity.BangPhanCongCaLam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BangPhanCongCaLamRepository extends JpaRepository<BangPhanCongCaLam, Integer> {
    List<BangPhanCongCaLam> findByThu(String thu);
    List<BangPhanCongCaLam> findByMaNhanVien(Integer maNhanVien);
}
