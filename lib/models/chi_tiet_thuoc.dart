class ChiTietThuoc {
  final int maChiTietToa;
  final String tenThuoc;
  final String? dangBaoChe;
  final String? hamLuong;
  final String? lieuDung;
  final String? tanSuat;
  final String? cachDung;
  final int? soLuong;
  final String? donViTinh;
  final String? ghiChu;

  ChiTietThuoc({
    required this.maChiTietToa,
    required this.tenThuoc,
    this.dangBaoChe,
    this.hamLuong,
    this.lieuDung,
    this.tanSuat,
    this.cachDung,
    this.soLuong,
    this.donViTinh,
    this.ghiChu,
  });

  factory ChiTietThuoc.fromJson(Map<String, dynamic> json) {
    // Parse nested chiTietToaThuoc entity (ChiTietToaThuoc)
    final chiTietToaThuoc =
        json['chiTietToaThuoc'] as Map<String, dynamic>? ?? {};
    // Parse nested thuoc entity (Thuoc)
    final thuoc = json['thuoc'] as Map<String, dynamic>?;

    // Build tần suất từ sáng/trưa/chiều/tối
    final sang = chiTietToaThuoc['sang'] as String?;
    final trua = chiTietToaThuoc['trua'] as String?;
    final chieu = chiTietToaThuoc['chieu'] as String?;
    final toi = chiTietToaThuoc['toi'] as String?;
    final soNgay = chiTietToaThuoc['soNgay'] as int?;

    String? tanSuatStr;
    if (sang != null || trua != null || chieu != null || toi != null) {
      tanSuatStr =
          'S: ${sang ?? "-"} | T: ${trua ?? "-"} | C: ${chieu ?? "-"} | T: ${toi ?? "-"}';
      if (soNgay != null) {
        tanSuatStr += ' ($soNgay ngày)';
      }
    }

    return ChiTietThuoc(
      maChiTietToa: chiTietToaThuoc['id'] as int? ??
          chiTietToaThuoc['maChiTietToa'] as int? ??
          0,
      tenThuoc: thuoc?['tenThuoc'] as String? ?? '',
      dangBaoChe: thuoc?['dangThuoc'] as String?,
      hamLuong: thuoc?['hamLuong'] as String?,
      lieuDung: chiTietToaThuoc['lieuDung'] as String?,
      tanSuat: tanSuatStr,
      cachDung: chiTietToaThuoc['cachDung'] as String?,
      soLuong: chiTietToaThuoc['soNgay'] as int?,
      donViTinh: thuoc?['donViTinh'] as String?,
      ghiChu: thuoc?['ghiChu'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maChiTietToa': maChiTietToa,
      'tenThuoc': tenThuoc,
      'dangBaoChe': dangBaoChe,
      'hamLuong': hamLuong,
      'lieuDung': lieuDung,
      'tanSuat': tanSuat,
      'cachDung': cachDung,
      'soLuong': soLuong,
      'donViTinh': donViTinh,
      'ghiChu': ghiChu,
    };
  }
}