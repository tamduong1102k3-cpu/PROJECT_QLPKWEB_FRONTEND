import 'bang_phan_cong_ca_lam_entity.dart';

class NgayCaLamEntity {
  final String ngay;
  final String thu;
  final List<BangPhanCongCaLamEntity> resolved;

  const NgayCaLamEntity({
    required this.ngay,
    required this.thu,
    required this.resolved,
  });

  factory NgayCaLamEntity.fromJson(Map<String, dynamic> json) {
    final resolvedJson = json['resolved'];
    final fallbackJson = json['theoNgay'];
    final rawResolved = resolvedJson is List
        ? resolvedJson
        : fallbackJson is List
        ? fallbackJson
        : const [];

    return NgayCaLamEntity(
      ngay: json['ngay'] as String? ?? '',
      thu: json['thu'] as String? ?? '',
      resolved: rawResolved
          .whereType<Map<String, dynamic>>()
          .map(BangPhanCongCaLamEntity.fromJson)
          .toList(),
    );
  }

  DateTime? get date => DateTime.tryParse(ngay);
}

class LichThangEntity {
  final int? maNhanVien;
  final int nam;
  final int thang;
  final List<NgayCaLamEntity> days;

  const LichThangEntity({
    required this.maNhanVien,
    required this.nam,
    required this.thang,
    required this.days,
  });

  factory LichThangEntity.fromJson(Map<String, dynamic> json) {
    final rawDays = json['days'];
    return LichThangEntity(
      maNhanVien: json['maNhanVien'] as int?,
      nam: json['nam'] as int? ?? 0,
      thang: json['thang'] as int? ?? 0,
      days: rawDays is List
          ? rawDays
              .whereType<Map<String, dynamic>>()
              .map(NgayCaLamEntity.fromJson)
              .toList()
          : const [],
    );
  }
}
