package com.qlpk.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@Table(name = "bang_phan_cong_ca_lam")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BangPhanCongCaLam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_nhan_vien")
    private Integer maNhanVien;

    @Column(name = "thu", length = 20)   
    private String thu;

    @Column(name = "gio_lam")          
    private LocalTime gioLam;

    @Column(name = "gio_ket_thuc")
    private LocalTime gioKetThuc;

    @Column(name = "phong", length = 50)
    private String phong;
}
