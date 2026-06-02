package com.qlpk.backend.repository;

import com.qlpk.backend.entity.ChiTietHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, Integer> {

    /** Top dịch vụ sử dụng nhiều nhất (loaiMuc = 'Dịch vụ') */
    @Query("""
        SELECT c.noiDung, SUM(c.soLuong)
        FROM ChiTietHoaDon c
        WHERE c.loaiMuc = 'Dịch vụ'
        GROUP BY c.noiDung
        ORDER BY SUM(c.soLuong) DESC
    """)
    List<Object[]> thongKeTopDichVu(org.springframework.data.domain.Pageable pageable);

    List<ChiTietHoaDon> findByMaHoaDon(Integer maHoaDon);
}
