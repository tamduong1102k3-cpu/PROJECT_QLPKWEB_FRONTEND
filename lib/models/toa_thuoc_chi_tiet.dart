import 'chi_tiet_thuoc.dart';

class ToaThuocChiTiet {
  final int maToaThuoc;
  final String? ngayKeToa;
  final String? bacSiKeToa;
  final String? chanDoan;
  final String? ghiChu;
  final List<ChiTietThuoc> chiTietThuoc;

  ToaThuocChiTiet({
    required this.maToaThuoc,
    this.ngayKeToa,
    this.bacSiKeToa,
    this.chanDoan,
    this.ghiChu,
    required this.chiTietThuoc,
  });

  factory ToaThuocChiTiet.fromJson(Map<String, dynamic> json) {
    // Parse nested toaThuoc entity (ToaThuoc)
    final toaThuoc = json['toaThuoc'] as Map<String, dynamic>? ?? {};
    return ToaThuocChiTiet(
      maToaThuoc: toaThuoc['maToaThuoc'] as int? ?? 0,
      ngayKeToa: toaThuoc['ngayTao']?.toString(),
      bacSiKeToa: null, // ToaThuoc entity doesn't have bacSiKeToa field
      chanDoan: null, // ToaThuoc entity doesn't have chanDoan field
      ghiChu: toaThuoc['ghiChu'] as String?,
      chiTietThuoc: (json['chiTietThuoc'] as List<dynamic>?)
              ?.map((e) => ChiTietThuoc.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maToaThuoc': maToaThuoc,
      'ngayKeToa': ngayKeToa,
      'bacSiKeToa': bacSiKeToa,
      'chanDoan': chanDoan,
      'ghiChu': ghiChu,
      'chiTietThuoc': chiTietThuoc.map((e) => e.toJson()).toList(),
    };
  }
}