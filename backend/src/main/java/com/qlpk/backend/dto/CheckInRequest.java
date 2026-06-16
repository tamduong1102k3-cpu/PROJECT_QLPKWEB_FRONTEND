package com.qlpk.backend.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private Integer maBenhNhan;
    private Integer maNhanVienLeTan;
    private Integer maNhanVienBacSi;
    private Integer maChuyenKhoa;
    private Integer maDichVu;
    private Integer appointmentId;
    private String ghiChu;
}
