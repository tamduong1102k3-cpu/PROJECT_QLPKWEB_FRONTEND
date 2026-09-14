class DichVuEntity {
  final int maDichVu;
  final String tenDichVu;
  final double donGia;
  final String? loaiDichVu;
  final int? phong;
  final int? maChuyenKhoa;

  DichVuEntity({
    required this.maDichVu,
    required this.tenDichVu,
    required this.donGia,
    this.loaiDichVu,
    this.phong,
    this.maChuyenKhoa,
  });

  factory DichVuEntity.fromJson(Map<String, dynamic> json) {
    return DichVuEntity(
      maDichVu: json['maDichVu'] as int,
      tenDichVu: json['tenDichVu'] as String,
      donGia: (json['donGia'] as num).toDouble(),
      loaiDichVu: json['loaiDichVu'] as String?,
      phong: json['phong'] as int?,
      maChuyenKhoa: json['maChuyenKhoa'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maDichVu': maDichVu,
      'tenDichVu': tenDichVu,
      'donGia': donGia,
      'loaiDichVu': loaiDichVu,
      'phong': phong,
      'maChuyenKhoa': maChuyenKhoa,
    };
  }
}