package com.qlpk.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chuyen_khoa")
public class ChuyenKhoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_chuyen_khoa")
    private Integer maChuyenKhoa;

    @Column(name = "ten_chuyen_khoa", length = 30)
    private String tenChuyenKhoa;

    @Column(name = "mo_ta")
    private String moTa;

    // Getters and Setters
    public Integer getMaChuyenKhoa() { return maChuyenKhoa; }
    public void setMaChuyenKhoa(Integer maChuyenKhoa) { this.maChuyenKhoa = maChuyenKhoa; }

    public String getTenChuyenKhoa() { return tenChuyenKhoa; }
    public void setTenChuyenKhoa(String tenChuyenKhoa) { this.tenChuyenKhoa = tenChuyenKhoa; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
}
