package com.qlpk.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ket_qua_xn_chi_so")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KetQuaXnChiSo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ket_qua_xet_nghiem_id", nullable = false)
    private Integer ketQuaXetNghiemId;

    @Column(name = "ma_chi_so", length = 50, nullable = false)
    private String maChiSo;

    @Column(name = "ten_chi_so", length = 255, nullable = false)
    private String tenChiSo;

    @Column(name = "gia_tri", length = 100)
    private String giaTri;

    @Column(name = "don_vi", length = 50)
    private String donVi;

    @Column(name = "chi_so_tham_chieu", length = 100)
    private String chiSoThamChieu;

    @Column(name = "bat_thuong")
    private Boolean batThuong;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.batThuong == null) {
            this.batThuong = false;
        }
    }
}
