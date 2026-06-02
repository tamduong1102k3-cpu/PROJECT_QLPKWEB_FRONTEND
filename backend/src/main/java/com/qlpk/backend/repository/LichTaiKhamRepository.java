package com.qlpk.backend.repository;

import com.qlpk.backend.entity.LichTaiKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichTaiKhamRepository extends JpaRepository<LichTaiKham, Integer> {
}
