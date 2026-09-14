import '../data/entities/chuyen_khoa_entity.dart';

class ServiceItemModel {
  final int id;
  final String assetPath;
  final String label;
  final String? moTa;
  final int? soLuongToiDa;

  ServiceItemModel({
    required this.id,
    required this.assetPath,
    required this.label,
    this.moTa,
    this.soLuongToiDa,
  });

  factory ServiceItemModel.fromEntity(ChuyenKhoaEntity entity, int index) {
    return ServiceItemModel(
      id: entity.maChuyenKhoa,
      assetPath: _mapToFileName(entity.tenChuyenKhoa),
      label: entity.tenChuyenKhoa,
      moTa: entity.moTa,
      soLuongToiDa: entity.soLuongToiDa,
    );
  }

  static const String _basePath = 'assets/images/specialty/';

  static String _mapToFileName(String tenChuyenKhoa) {
    // Chuẩn hoá: trim, lowercase
    final key = tenChuyenKhoa.trim().toLowerCase();
    switch (key) {
      case 'nội tổng quát':
      case 'nội tổng hợp':
      case 'nội khoa':
        return '${_basePath}noi-tong-quat.png';
      case 'nhi khoa':
        return '${_basePath}nhi-khoa.png';
      case 'tai - mũi - họng':
        return '${_basePath}tai-mui-hong.png';
      case 'răng - hàm - mặt':
        return '${_basePath}rang-ham-mat.png';
      case 'chẩn đoán hình ảnh':
      case 'hình ảnh y học':
        return '${_basePath}chan-doan-hinh-anh.png';
      case 'xét nghiệm':
        return '${_basePath}xet-nghiem.png';
      case 'tim mạch':
        return '${_basePath}tim-mach.png';
      default:
        return fallbackAssetPath;
    }
  }

  static const String fallbackAssetPath = 'assets/images/error-404.png';
}
