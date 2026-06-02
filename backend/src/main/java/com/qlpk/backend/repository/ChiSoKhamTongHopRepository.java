package com.qlpk.backend.repository;

import com.qlpk.backend.entity.ChiSoKhamTongHop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ChiSoKhamTongHopRepository extends JpaRepository<ChiSoKhamTongHop, Integer> {
 // Sửa hàm cũ thành hàm này
java.util.Optional<ChiSoKhamTongHop> findTopByMaPhieuKhamOrderByNgayTaoDesc(Integer maPhieuKham);
}
