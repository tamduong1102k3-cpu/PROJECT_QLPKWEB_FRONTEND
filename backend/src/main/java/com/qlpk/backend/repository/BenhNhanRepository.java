package com.qlpk.backend.repository;

import com.qlpk.backend.entity.BenhNhan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BenhNhanRepository extends JpaRepository<BenhNhan, Integer> {

    /** Tìm kiếm bệnh nhân theo tên, số điện thoại hoặc CCCD */
    @Query("""
        SELECT b FROM BenhNhan b
        WHERE LOWER(b.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR b.soDienThoai LIKE CONCAT('%', :keyword, '%')
           OR b.cccd LIKE CONCAT('%', :keyword, '%')
        ORDER BY b.maBenhNhan DESC
    """)
    List<BenhNhan> search(@Param("keyword") String keyword);

    boolean existsBySoDienThoai(String soDienThoai);
    boolean existsByCccd(String cccd);
    boolean existsByEmail(String email);
}
