package com.qlpk.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "lich_tai_kham")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichTaiKham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_benh_nhan")
    private Integer maBenhNhan;

    @Column(name = "ma_chuyen_khoa")
    private Integer maChuyenKhoa;

    @Column(name = "ma_phieu_kham")
    private Integer maPhieuKham;

    @Column(name = "ma_nhan_vien")
    private Integer maNhanVien;

    @Column(name = "ngay_tai_kham")
    private LocalDate ngayTaiKham;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "trang_thai")
    private String trangThai; // CHUA_DEN, DA_DEN, HOAN

    @Column(name = "da_gui_thong_bao")
    private Boolean daGuiThongBao;
}
