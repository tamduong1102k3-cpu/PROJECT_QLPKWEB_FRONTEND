package com.qlpk.backend.repository;

import com.qlpk.backend.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Date;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, Integer> {

    // Giả sử tên Procedure trong database của bạn là "sp_ThemNhanVienVaTaiKhoan"
    // Nếu tên khác, vui lòng đổi lại `procedureName = "tên_đúng"`
    @Procedure(procedureName = "sp_ThemNhanVienVaTaiKhoan")
    void themNhanVienVaTaiKhoan(
        @Param("p_HoTen") String p_HoTen,
        @Param("p_GioiTinh") Integer p_GioiTinh,
        @Param("p_NgaySinh") Date p_NgaySinh,
        @Param("p_CCCD") String p_CCCD,
        @Param("p_DiaChi") String p_DiaChi,
        @Param("p_SDT") String p_SDT,
        @Param("p_Email") String p_Email,
        @Param("p_BangCap") String p_BangCap,
        @Param("p_ChucVu") String p_ChucVu,
        @Param("p_ChuyenKhoa") String p_ChuyenKhoa,
        @Param("p_NgayVaoLam") Date p_NgayVaoLam,
        @Param("p_Username") String p_Username,
        @Param("p_Password") String p_Password,
        @Param("p_Role") String p_Role
    );
}
