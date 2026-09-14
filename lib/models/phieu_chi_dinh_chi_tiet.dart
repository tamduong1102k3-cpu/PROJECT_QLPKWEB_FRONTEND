import 'chi_tiet_dich_vu.dart';

class PhieuChiDinhChiTiet {
  final int maPhieuChiDinh;
  final String? ngayChiDinh;
  final String? bacSiChiDinh;
  final String? ghiChu;
  final List<ChiTietDichVu> chiTietDichVu;

  PhieuChiDinhChiTiet({
    required this.maPhieuChiDinh,
    this.ngayChiDinh,
    this.bacSiChiDinh,
    this.ghiChu,
    required this.chiTietDichVu,
  });

  factory PhieuChiDinhChiTiet.fromJson(Map<String, dynamic> json) {
    // Parse nested phieuChiDinh object
    final phieuChiDinh = json['phieuChiDinh'] as Map<String, dynamic>? ?? {};
    return PhieuChiDinhChiTiet(
      maPhieuChiDinh: phieuChiDinh['maPhieuChiDinh'] as int? ?? 0,
      ngayChiDinh: phieuChiDinh['ngayChiDinh'] as String?,
      bacSiChiDinh: phieuChiDinh['bacSiChiDinh'] as String?,
      ghiChu: phieuChiDinh['ghiChu'] as String?,
      chiTietDichVu: (json['chiTietDichVu'] as List<dynamic>?)
              ?.map((e) => ChiTietDichVu.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maPhieuChiDinh': maPhieuChiDinh,
      'ngayChiDinh': ngayChiDinh,
      'bacSiChiDinh': bacSiChiDinh,
      'ghiChu': ghiChu,
      'chiTietDichVu': chiTietDichVu.map((e) => e.toJson()).toList(),
    };
  }
}