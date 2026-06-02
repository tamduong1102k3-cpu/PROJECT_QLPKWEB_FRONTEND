package com.qlpk.backend.repository;

import com.qlpk.backend.entity.ToaThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface ToaThuocRepository extends JpaRepository<ToaThuoc, Integer> {
    List<ToaThuoc> findByMaPhieuKham(Integer maPhieuKham);

    @Query("SELECT t FROM ToaThuoc t WHERE t.maPhieuKham IN (SELECT p.maPhieuKham FROM PhieuKham p WHERE p.maBenhNhan = :maBenhNhan) ORDER BY t.ngayTao DESC")
    List<ToaThuoc> findByMaBenhNhan(@Param("maBenhNhan") Integer maBenhNhan);
}
