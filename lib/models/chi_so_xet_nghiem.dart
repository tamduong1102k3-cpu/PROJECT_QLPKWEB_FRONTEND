class ChiSoXetNghiem {
  final int id;
  final int? ketQuaXetNghiemId;
  final String? maChiSo;
  final String? tenChiSo;
  final String? giaTri;
  final String? donVi;
  final String? chiSoThamChieu;
  final bool? batThuong;
  final int? thuTu;
  final String? ghiChu;

  ChiSoXetNghiem({
    required this.id,
    this.ketQuaXetNghiemId,
    this.maChiSo,
    this.tenChiSo,
    this.giaTri,
    this.donVi,
    this.chiSoThamChieu,
    this.batThuong,
    this.thuTu,
    this.ghiChu,
  });

  factory ChiSoXetNghiem.fromJson(Map<String, dynamic> json) {
    // id lấy từ maChiSo nếu không có 'id' (backend gửi maChiSo)
    final idValue = json['id'] ?? json['maChiSo'];
    return ChiSoXetNghiem(
      id: idValue is int ? idValue : (int.tryParse(idValue?.toString() ?? '') ?? 0),
      ketQuaXetNghiemId: json['ketQuaXetNghiemId'] as int?,
      maChiSo: json['maChiSo']?.toString(),
      tenChiSo: json['tenChiSo'] as String?,
      giaTri: json['giaTri'] as String?,
      donVi: json['donVi'] as String?,
      // Backend gửi 'giaTriBinhThuong' -> ánh xạ sang chiSoThamChieu
      chiSoThamChieu: (json['chiSoThamChieu'] ?? json['giaTriBinhThuong'])?.toString(),
      batThuong: json['batThuong'] as bool?,
      thuTu: _toInt(json['thuTu']),
      ghiChu: json['ghiChu'] as String?,
    );
  }

  static int? _toInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ketQuaXetNghiemId': ketQuaXetNghiemId,
      'maChiSo': maChiSo,
      'tenChiSo': tenChiSo,
      'giaTri': giaTri,
      'donVi': donVi,
      'chiSoThamChieu': chiSoThamChieu,
      'batThuong': batThuong,
      'thuTu': thuTu,
      'ghiChu': ghiChu,
    };
  }
}