package com.qlpk.backend.repository;

import com.qlpk.backend.entity.KhoThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KhoThuocRepository extends JpaRepository<KhoThuoc, Integer> {
    List<KhoThuoc> findBySoLuongTonLessThan(Integer threshold);
    List<KhoThuoc> findBySoLuongTonLessThanOrderBySoLuongTonAsc(Integer threshold);
    java.util.Optional<KhoThuoc> findByMaThuoc(Integer maThuoc);
}
