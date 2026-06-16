package com.qlpk.backend.repository;

import com.qlpk.backend.entity.PhieuKham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhieuKhamRepository extends JpaRepository<PhieuKham, Integer> {

    /**
     * Thống kê lượt khám theo tháng trong năm.
     * Returns: [thang, soLuotKham, soBenhNhanMoi]
     */
    @Query("""
        SELECT MONTH(p.ngayKham),
               COUNT(p.maPhieuKham),
               COUNT(DISTINCT p.maBenhNhan)
        FROM PhieuKham p
        WHERE YEAR(p.ngayKham) = :nam
        GROUP BY MONTH(p.ngayKham)
        ORDER BY MONTH(p.ngayKham)
    """)
    List<Object[]> thongKeLuotKhamTheoNam(@Param("nam") int nam);

    /** Các năm có phiếu khám */
    @Query("SELECT DISTINCT YEAR(p.ngayKham) FROM PhieuKham p WHERE p.ngayKham IS NOT NULL ORDER BY 1 DESC")
    List<Integer> findDistinctYears();

    /** Đếm số lịch hẹn/lượt khám hôm nay */
    @Query("SELECT COUNT(p) FROM PhieuKham p WHERE p.ngayKham >= :start AND p.ngayKham <= :end")
    long countByNgayKhamBetween(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    /** Lấy danh sách phiếu khám trong khoảng thời gian */
    List<PhieuKham> findByNgayKhamBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    /** Lấy danh sách phiếu khám theo mã bệnh nhân */
    @Query("SELECT p FROM PhieuKham p WHERE p.maBenhNhan = :maBenhNhan ORDER BY p.ngayKham DESC")
    List<PhieuKham> findByMaBenhNhan(@Param("maBenhNhan") Integer maBenhNhan);

    /** Lấy danh sách phiếu khám kèm tên bệnh nhân cho lịch sử */
    @Query(value = "SELECT p.ma_phieu_kham as maPhieuKham, p.ma_benh_nhan as maBenhNhan, b.ho_ten as hoTen, " +
                   "b.gioi_tinh as gioiTinh, b.ngay_sinh as ngaySinh, " +
                   "p.ngay_kham as ngayKham, p.trang_thai as trangThai, p.ghi_chu as ghiChu, p.ma_chuyen_khoa as maChuyenKhoa, " +
                   "kls.chan_doan_so_bo as chanDoan " +
                   "FROM phieu_kham p " +
                   "JOIN benh_nhan b ON p.ma_benh_nhan = b.ma_benh_nhan " +
                   "LEFT JOIN kham_lam_sang kls ON p.ma_phieu_kham = kls.ma_phieu_kham " +
                   "WHERE p.ma_nhan_vien = :maBacSi " +
                   "AND p.trang_thai = 'HOAN_THANH' " +
                   "AND DATE(p.ngay_kham) = CURRENT_DATE " +
                   "ORDER BY p.ngay_kham DESC", nativeQuery = true)
    List<java.util.Map<String, Object>> findHistoryDetailed(@Param("maBacSi") Integer maBacSi);

    @Query(value = "SELECT p.ma_phieu_kham as maPhieuKham, p.ma_benh_nhan as maBenhNhan, b.ho_ten as hoTen, " +
                   "b.gioi_tinh as gioiTinh, b.ngay_sinh as ngaySinh, " +
                   "p.ngay_kham as ngayKham, p.trang_thai as trangThai, p.ghi_chu as ghiChu, " +
                   "ck.ten_chuyen_khoa as tenChuyenKhoa " +
                   "FROM phieu_kham p " +
                   "JOIN benh_nhan b ON p.ma_benh_nhan = b.ma_benh_nhan " +
                   "JOIN chuyen_khoa ck ON p.ma_chuyen_khoa = ck.ma_chuyen_khoa " +
                   "WHERE p.ma_chuyen_khoa = :maChuyenKhoa " +
                   "AND p.trang_thai = 'CHO_BAC_SI' " +
                   "AND DATE(p.ngay_kham) = CURRENT_DATE " +
                   "ORDER BY p.ngay_kham DESC", nativeQuery = true)
    List<java.util.Map<String, Object>> findAssistantHistory(@Param("maChuyenKhoa") Integer maChuyenKhoa);

    /** Lấy danh sách bệnh nhân đã hoàn thành khám (HOAN_THANH) để thu ngân thanh toán */
    @Query(value = "SELECT p.ma_phieu_kham as maPhieuKham, p.ma_benh_nhan as maBenhNhan, " +
                   "b.ho_ten as hoTen, b.gioi_tinh as gioiTinh, b.ngay_sinh as ngaySinh, b.so_dien_thoai as soDienThoai, " +
                   "p.ngay_kham as ngayKham, p.trang_thai as trangThai, p.ma_chuyen_khoa as maChuyenKhoa, " +
                   "ck.ten_chuyen_khoa as tenChuyenKhoa " +
                   "FROM phieu_kham p " +
                   "JOIN benh_nhan b ON p.ma_benh_nhan = b.ma_benh_nhan " +
                   "JOIN chuyen_khoa ck ON p.ma_chuyen_khoa = ck.ma_chuyen_khoa " +
                   "WHERE p.trang_thai = 'HOAN_THANH' " +
                   "AND DATE(p.ngay_kham) = CURRENT_DATE " +
                   "ORDER BY p.ngay_kham DESC", nativeQuery = true)
    List<java.util.Map<String, Object>> findCompletedPatientsToday();

    /** Tìm kiếm bệnh nhân đã khám hôm nay theo keyword (SQL LIKE) */
    @Query(value = "SELECT p.ma_phieu_kham as maPhieuKham, p.ma_benh_nhan as maBenhNhan, " +
                   "b.ho_ten as hoTen, b.gioi_tinh as gioiTinh, b.ngay_sinh as ngaySinh, b.so_dien_thoai as soDienThoai, " +
                   "p.ngay_kham as ngayKham, p.trang_thai as trangThai, p.ma_chuyen_khoa as maChuyenKhoa, " +
                   "ck.ten_chuyen_khoa as tenChuyenKhoa " +
                   "FROM phieu_kham p " +
                   "JOIN benh_nhan b ON p.ma_benh_nhan = b.ma_benh_nhan " +
                   "JOIN chuyen_khoa ck ON p.ma_chuyen_khoa = ck.ma_chuyen_khoa " +
                   "WHERE p.trang_thai = 'HOAN_THANH' " +
                   "AND DATE(p.ngay_kham) = CURRENT_DATE " +
                   "AND (:keyword IS NULL OR :keyword = '' " +
                   "     OR b.ho_ten LIKE CONCAT('%', :keyword, '%') " +
                   "     OR b.so_dien_thoai LIKE CONCAT('%', :keyword, '%') " +
                   "     OR CAST(p.ma_phieu_kham AS CHAR) LIKE CONCAT('%', :keyword, '%') " +
                   "     OR ck.ten_chuyen_khoa LIKE CONCAT('%', :keyword, '%')) " +
                   "ORDER BY p.ngay_kham DESC", nativeQuery = true)
    List<java.util.Map<String, Object>> findCompletedPatientsTodayWithSearch(@Param("keyword") String keyword);

    @Query(value = "SELECT p.ma_phieu_kham as maPhieuKham, p.ma_benh_nhan as maBenhNhan, b.ho_ten as hoTen, " +
                   "b.gioi_tinh as gioiTinh, b.ngay_sinh as ngaySinh, b.so_dien_thoai as soDienThoai, " +
                   "p.ngay_kham as ngayKham, p.trang_thai as trangThai, p.ghi_chu as ghiChu, p.ma_chuyen_khoa as maChuyenKhoa, " +
                   "ck.ten_chuyen_khoa as tenChuyenKhoa, kls.chan_doan_so_bo as chanDoan " +
                   "FROM phieu_kham p " +
                   "JOIN benh_nhan b ON p.ma_benh_nhan = b.ma_benh_nhan " +
                   "JOIN chuyen_khoa ck ON p.ma_chuyen_khoa = ck.ma_chuyen_khoa " +
                   "LEFT JOIN kham_lam_sang kls ON p.ma_phieu_kham = kls.ma_phieu_kham " +
                   "WHERE p.ma_chuyen_khoa = :maChuyenKhoa " +
                   "AND p.trang_thai = 'HOAN_THANH' " +
                   "ORDER BY p.ngay_kham DESC", nativeQuery = true)
    List<java.util.Map<String, Object>> findHistoryByChuyenKhoaAllDays(@Param("maChuyenKhoa") Integer maChuyenKhoa);
}
