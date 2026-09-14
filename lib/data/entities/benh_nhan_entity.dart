class BenhNhanEntity {
  final int? maBenhNhan;
  final String hoTen;
  final LocalDate? ngaySinh;
  final String? diaChi;
  final String? soDienThoai;
  final String? email;
  final String? ngheNghiep;
  final String? nhomMau;
  final String? diUngThuoc;
  final String? tienSuBenh;
  final String? nguoiGiamHo;
  final String? soDienThoaiNguoiGiamHo;
  final String? ghiChu;
  final String? cccd;
  final bool? gioiTinh;
  final bool? daXacMinhDanhTinh;
  // Backend: true = Nam, false = Nữ

  BenhNhanEntity({
    this.maBenhNhan,
    required this.hoTen,
    this.ngaySinh,
    this.diaChi,
    this.soDienThoai,
    this.email,
    this.ngheNghiep,
    this.nhomMau,
    this.diUngThuoc,
    this.tienSuBenh,
    this.nguoiGiamHo,
    this.soDienThoaiNguoiGiamHo,
    this.ghiChu,
    this.cccd,
    this.gioiTinh,
    this.daXacMinhDanhTinh,
  });

  factory BenhNhanEntity.fromJson(Map<String, dynamic> json) {
    return BenhNhanEntity(
      maBenhNhan: json['maBenhNhan'] as int?,
      hoTen: json['hoTen'] as String? ?? '',
      ngaySinh: json['ngaySinh'] != null
          ? LocalDate.parse(json['ngaySinh'] as String)
          : null,
      diaChi: json['diaChi'] as String?,
      soDienThoai: json['soDienThoai'] as String?,
      email: json['email'] as String?,
      ngheNghiep: json['ngheNghiep'] as String?,
      nhomMau: json['nhomMau'] as String?,
      diUngThuoc: json['diUngThuoc'] as String?,
      tienSuBenh: json['tienSuBenh'] as String?,
      nguoiGiamHo: json['nguoiGiamHo'] as String?,
      soDienThoaiNguoiGiamHo: json['soDienThoaiNguoiGiamHo'] as String?,
      ghiChu: json['ghiChu'] as String?,
      cccd: json['cccd'] as String?,
      gioiTinh: json['gioiTinh'] as bool?,
      daXacMinhDanhTinh: json['daXacMinhDanhTinh'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (maBenhNhan != null) 'maBenhNhan': maBenhNhan,
      'hoTen': hoTen,
      if (ngaySinh != null) 'ngaySinh': ngaySinh.toString(),
      if (diaChi != null) 'diaChi': diaChi,
      if (soDienThoai != null) 'soDienThoai': soDienThoai,
      if (email != null) 'email': email,
      if (ngheNghiep != null) 'ngheNghiep': ngheNghiep,
      if (nhomMau != null) 'nhomMau': nhomMau,
      if (diUngThuoc != null) 'diUngThuoc': diUngThuoc,
      if (tienSuBenh != null) 'tienSuBenh': tienSuBenh,
      if (nguoiGiamHo != null) 'nguoiGiamHo': nguoiGiamHo,
      if (soDienThoaiNguoiGiamHo != null)
        'soDienThoaiNguoiGiamHo': soDienThoaiNguoiGiamHo,
      if (ghiChu != null) 'ghiChu': ghiChu,
      if (cccd != null) 'cccd': cccd,
      if (gioiTinh != null) 'gioiTinh': gioiTinh,
      if (daXacMinhDanhTinh != null) 'daXacMinhDanhTinh': daXacMinhDanhTinh,
    };
  }

  /// Helper: trả về tên giới tính từ boolean backend
  String get gioiTinhDisplay {
    if (gioiTinh == null) return 'Chưa xác định';
    return gioiTinh! ? 'Nam' : 'Nữ';
  }

  /// Helper: trả về trạng thái xác minh danh tính
  String get trangThaiXacMinhDanhTinh {
    if (daXacMinhDanhTinh == true) return 'Đã xác minh danh tính';
    return 'Chưa xác minh danh tính';
  }
}

/// LocalDate implementation để parse ngày tháng từ JSON mà không cần thư viện
class LocalDate {
  final int year;
  final int month;
  final int day;

  LocalDate(this.year, this.month, this.day);

  factory LocalDate.parse(String date) {
    final parts = date.split('-');
    if (parts.length != 3) throw FormatException('Invalid date format: $date');
    return LocalDate(
      int.parse(parts[0]),
      int.parse(parts[1]),
      int.parse(parts[2]),
    );
  }

  factory LocalDate.fromDateTime(DateTime dateTime) {
    return LocalDate(dateTime.year, dateTime.month, dateTime.day);
  }

  DateTime toDateTime() => DateTime(year, month, day);

  @override
  String toString() =>
      '${year.toString().padLeft(4, '0')}-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
}