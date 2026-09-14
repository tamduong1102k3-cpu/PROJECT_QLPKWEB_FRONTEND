class CaLamEntity {
  final int? id;
  final String? tenCa;
  final String? gioBatDau; // LocalTime as String "HH:mm:ss"
  final String? gioKetThuc; // LocalTime as String "HH:mm:ss"

  CaLamEntity({this.id, this.tenCa, this.gioBatDau, this.gioKetThuc});

  factory CaLamEntity.fromJson(Map<String, dynamic> json) {
    return CaLamEntity(
      id: json['id'] as int?,
      tenCa: json['tenCa'] as String?,
      gioBatDau: json['gioBatDau'] as String?,
      gioKetThuc: json['gioKetThuc'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      if (tenCa != null) 'tenCa': tenCa,
      if (gioBatDau != null) 'gioBatDau': gioBatDau,
      if (gioKetThuc != null) 'gioKetThuc': gioKetThuc,
    };
  }

  String _hourOf(String? time) {
    if (time == null || time.isEmpty) return '';
    final parts = time.split(':');
    return parts.isNotEmpty ? parts.first : '';
  }

  /// Hiển thị tên ca (Ca sáng / Ca chiều) — ưu tiên tenCa, fallback theo giờ bắt đầu
  String get tenCaDisplay {
    final ten = _normalizeTen(tenCa);
    if (ten.isNotEmpty) return ten;

    final hour = int.tryParse(_hourOf(gioBatDau)) ?? -1;
    if (hour >= 0 && hour < 12) return 'Ca sáng';
    if (hour >= 12) return 'Ca chiều';
    return 'Ca';
  }

  String get iconLabel {
    final ten = _normalizeTen(tenCa).toLowerCase();
    if (ten.contains('sang') || ten.contains('sáng')) return 'Sáng';
    if (ten.contains('chieu') || ten.contains('chiều')) return 'Chiều';
    final hour = int.tryParse(_hourOf(gioBatDau)) ?? -1;
    if (hour >= 0 && hour < 12) return 'Sáng';
    if (hour >= 12) return 'Chiều';
    return 'Ca';
  }

  /// Hiển thị khoảng giờ dạng "07:00 – 11:30"
  String get gioRange {
    final start = _fmtGio(gioBatDau);
    final end = _fmtGio(gioKetThuc);
    if (start.isEmpty && end.isEmpty) return '';
    if (start.isEmpty) return end;
    if (end.isEmpty) return start;
    return '$start – $end';
  }

  /// Lấy giờ bắt đầu dạng "HH:mm" — dùng để sắp xếp ca trong ngày
  String get gioBatDauHhmm => _fmtGio(gioBatDau);

  String _fmtGio(String? time) {
    if (time == null || time.isEmpty) return '';
    final parts = time.split(':');
    if (parts.length < 2) return parts.first;
    return '${parts[0].padLeft(2, '0')}:${parts[1].padLeft(2, '0')}';
  }

  String _normalizeTen(String? ten) => (ten ?? '').trim();
}
