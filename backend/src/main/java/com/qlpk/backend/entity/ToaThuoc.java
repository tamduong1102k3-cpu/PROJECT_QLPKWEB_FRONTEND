package com.qlpk.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "toa_thuoc")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToaThuoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_toa_thuoc")
    private Integer maToaThuoc;

    @Column(name = "ma_phieu_kham")
    private Integer maPhieuKham;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "trang_thai", length = 30)
    private String trangThai; // CHO_THANH_TOAN, DA_THANH_TOAN
}
