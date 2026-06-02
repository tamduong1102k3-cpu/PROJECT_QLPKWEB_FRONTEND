package com.qlpk.backend.repository;

import com.qlpk.backend.entity.PhieuChiDinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface PhieuChiDinhRepository extends JpaRepository<PhieuChiDinh, Integer> {
    List<PhieuChiDinh> findByMaPhieuKham(Integer maPhieuKham);

    @Query("SELECT p FROM PhieuChiDinh p WHERE p.maPhieuKham IN (SELECT pk.maPhieuKham FROM PhieuKham pk WHERE pk.maBenhNhan = :maBenhNhan) ORDER BY p.ngayChiDinh DESC")
    List<PhieuChiDinh> findByMaBenhNhan(@Param("maBenhNhan") Integer maBenhNhan);
@Query(value = 
    "SELECT ct.id as id, " +
    "p.ma_phieu_kham as maPhieuKham, " +
    "pk.ma_benh_nhan as maBenhNhan, " +
    "b.ho_ten as hoTen, " +
    "b.gioi_tinh as gioiTinh, " +
    "b.ngay_sinh as ngaySinh, " +
    "dv.ten_dich_vu as tenDichVu, " +
    "p.ngay_chi_dinh as ngayChiDinh, " +
    "ct.trang_thai_dv as trangThaiDv, " +
    "kq.ghi_chu_them as ghiChuThem, " +
    "kq.trang_thai as trangThaiKq " +
    "FROM chi_tiet_chi_dinh ct " +
    "JOIN phieu_chi_dinh p ON ct.ma_phieu_chi_dinh = p.ma_phieu_chi_dinh " +
    "JOIN phieu_kham pk ON p.ma_phieu_kham = pk.ma_phieu_kham " +
    "JOIN benh_nhan b ON pk.ma_benh_nhan = b.ma_benh_nhan " +
    "JOIN dich_vu dv ON ct.ma_dich_vu = dv.ma_dich_vu " +
    "LEFT JOIN ket_qua_xet_nghiem kq ON kq.ma_chi_tiet_chi_dinh = ct.id " +
    "WHERE (:maChuyenKhoa IS NULL OR dv.ma_chuyen_khoa = :maChuyenKhoa) " +
    "AND ct.trang_thai_dv = 'CHUA_THUC_HIEN' " +
    "AND DATE(p.ngay_chi_dinh) = CURDATE() " +
    "ORDER BY p.ngay_chi_dinh ASC",
    nativeQuery = true)
    List<java.util.Map<String, Object>> findPendingTests(@Param("maChuyenKhoa") Integer maChuyenKhoa);

    @Query(value = "SELECT ct.id as id, p.ma_phieu_kham as maPhieuKham, pk.ma_benh_nhan as maBenhNhan, " +
                   "b.ho_ten as hoTen, b.gioi_tinh as gioiTinh, b.ngay_sinh as ngaySinh, " +
                   "dv.ten_dich_vu as tenDichVu, p.ngay_chi_dinh as ngayChiDinh, ct.trang_thai_dv as trangThaiDv, " +
                   "ct.ma_nhan_vien_thuc_hien as maNhanVienThucHien " +
                   "FROM chi_tiet_chi_dinh ct " +
                   "JOIN phieu_chi_dinh p ON ct.ma_phieu_chi_dinh = p.ma_phieu_chi_dinh " +
                   "JOIN phieu_kham pk ON p.ma_phieu_kham = pk.ma_phieu_kham " +
                   "JOIN benh_nhan b ON pk.ma_benh_nhan = b.ma_benh_nhan " +
                   "JOIN dich_vu dv ON ct.ma_dich_vu = dv.ma_dich_vu " +
                   "WHERE (:maChuyenKhoa IS NULL OR dv.ma_chuyen_khoa = :maChuyenKhoa) " +
                   "AND ct.trang_thai_dv = 'DA_THUC_HIEN' " +
                   "AND DATE(p.ngay_chi_dinh) = CURRENT_DATE " +
                   "ORDER BY p.ngay_chi_dinh DESC", nativeQuery = true)
    List<java.util.Map<String, Object>> findCompletedTestsToday(@Param("maChuyenKhoa") Integer maChuyenKhoa);
}
