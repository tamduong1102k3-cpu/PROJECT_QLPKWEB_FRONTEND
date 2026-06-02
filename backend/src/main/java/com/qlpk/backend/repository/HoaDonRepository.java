package com.qlpk.backend.repository;

import com.qlpk.backend.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {

    /**
     * Doanh thu theo tháng trong năm.
     * Returns: [thang, tongTien]
     */
    @Query("""
        SELECT MONTH(h.ngayThanhToan),
               SUM(h.tongTien)
        FROM HoaDon h
        WHERE YEAR(h.ngayThanhToan) = :nam
          AND h.ngayThanhToan IS NOT NULL
        GROUP BY MONTH(h.ngayThanhToan)
        ORDER BY MONTH(h.ngayThanhToan)
    """)
    List<Object[]> thongKeDoanhThuTheoNam(@Param("nam") int nam);

    /** Các năm có hóa đơn */
    @Query("SELECT DISTINCT YEAR(h.ngayThanhToan) FROM HoaDon h WHERE h.ngayThanhToan IS NOT NULL ORDER BY 1 DESC")
    List<Integer> findDistinctYears();

    /** Lấy hóa đơn theo mã phiếu khám */
    @Query("SELECT h FROM HoaDon h WHERE h.maPhieuKham = :maPhieuKham")
    List<HoaDon> findByMaPhieuKham(@Param("maPhieuKham") Integer maPhieuKham);

    /** Tổng doanh thu trong tháng */
    @Query("SELECT SUM(h.tongTien) FROM HoaDon h WHERE MONTH(h.ngayThanhToan) = :thang AND YEAR(h.ngayThanhToan) = :nam")
    java.math.BigDecimal sumRevenueByMonth(@Param("thang") int thang, @Param("nam") int nam);

    /** Doanh thu 7 ngày gần nhất */
    @Query("""
        SELECT CAST(h.ngayThanhToan AS date), SUM(h.tongTien)
        FROM HoaDon h
        WHERE h.ngayThanhToan >= :since
        GROUP BY CAST(h.ngayThanhToan AS date)
        ORDER BY CAST(h.ngayThanhToan AS date) ASC
    """)
    List<Object[]> thongKeDoanhThu7Ngay(@Param("since") java.time.LocalDateTime since);
}
