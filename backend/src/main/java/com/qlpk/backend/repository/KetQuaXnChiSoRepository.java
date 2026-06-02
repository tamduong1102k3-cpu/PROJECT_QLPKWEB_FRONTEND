package com.qlpk.backend.repository;

import com.qlpk.backend.entity.KetQuaXnChiSo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KetQuaXnChiSoRepository extends JpaRepository<KetQuaXnChiSo, Integer> {
    List<KetQuaXnChiSo> findByKetQuaXetNghiemId(Integer ketQuaXetNghiemId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByKetQuaXetNghiemId(Integer ketQuaXetNghiemId);
}
