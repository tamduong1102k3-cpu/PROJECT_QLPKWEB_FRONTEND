import 'package:flutter/material.dart';
import '../data/entities/dich_vu_entity.dart';

class DichVuModel {
  final int maDichVu;
  final String tenDichVu;
  final String donGiaStr;
  final double donGia;
  final String? loaiDichVu;
  final int? phong;
  final int? maChuyenKhoa;
  final String tenChuyenKhoa;
  final IconData icon;
  final Color color;

  DichVuModel({
    required this.maDichVu,
    required this.tenDichVu,
    required this.donGiaStr,
    required this.donGia,
    this.loaiDichVu,
    this.phong,
    this.maChuyenKhoa,
    this.tenChuyenKhoa = '',
    this.icon = Icons.medical_services_outlined,
    this.color = Colors.teal,
  });

  factory DichVuModel.fromEntity(DichVuEntity entity, {int index = 0, String tenChuyenKhoa = ''}) {
    final iconColors = [
      Colors.teal,
      Colors.blue,
      Colors.purple,
      Colors.orange,
      Colors.pink,
      Colors.indigo,
      Colors.red,
      Colors.green,
    ];
    final icons = [
      Icons.medical_services_outlined,
      Icons.science_outlined,
      Icons.videocam_outlined,
      Icons.vaccines_outlined,
      Icons.health_and_safety,
      Icons.biotech_outlined,
      Icons.local_hospital_outlined,
      Icons.favorite_outline,
    ];

    return DichVuModel(
      maDichVu: entity.maDichVu,
      tenDichVu: entity.tenDichVu,
      donGia: entity.donGia,
      donGiaStr: _formatDonGia(entity.donGia),
      loaiDichVu: entity.loaiDichVu,
      phong: entity.phong,
      maChuyenKhoa: entity.maChuyenKhoa,
      tenChuyenKhoa: tenChuyenKhoa,
      icon: icons[index % icons.length],
      color: iconColors[index % iconColors.length],
    );
  }

  static String _formatDonGia(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (match) => '${match[1]}.',
    )}đ';
  }

  /// Chuyển mã loại dịch vụ (VD: CLS_XET_NGHIEM) sang tiếng Việt
  static String loaiDichVuToVietnamese(String? loaiDichVu) {
    if (loaiDichVu == null) return '';
    switch (loaiDichVu) {
      case 'CLS_XET_NGHIEM':
        return 'Cận lâm sàng Xét nghiệm';
      case 'CLS_CDHA':
      case 'CLS_CHAN_DOAN_HINH_ANH':
        return 'Cận lâm sàng Chẩn đoán hình ảnh';
      case 'CLS_TDC_NANG':
        return 'Cận lâm sàng Thăm dò chức năng';
      case 'CLS_NOI_SOI':
        return 'Cận lâm sàng Nội soi';
      case 'DV_KHAM':
      case 'KHAM':
      case 'KHAM_BENH':
        return 'Dịch vụ Khám';
      case 'DV_KHAC':
        return 'Dịch vụ Khác';
      default:
        return loaiDichVu;
    }
  }
}
