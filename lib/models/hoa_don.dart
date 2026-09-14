class HoaDon {
  final int? maHoaDon;
  final int? maPhieuKham;
  final double? tongTien;
  final String? ngayThanhToan;
  final String? trangThai;
  final String? phuongThucThanhToan;
  final String? maGiaoDich;
  final String? ghiChu;
  final String? ngayKham;
  final String? tenChuyenKhoa;
  final String? tenNhanVien;
  final String? tenDichVu;

  HoaDon({
    this.maHoaDon,
    this.maPhieuKham,
    this.tongTien,
    this.ngayThanhToan,
    this.trangThai,
    this.phuongThucThanhToan,
    this.maGiaoDich,
    this.ghiChu,
    this.ngayKham,
    this.tenChuyenKhoa,
    this.tenNhanVien,
    this.tenDichVu,
  });

  factory HoaDon.fromJson(Map<String, dynamic> json) {
    return HoaDon(
      maHoaDon: json['maHoaDon'] as int?,
      maPhieuKham: json['maPhieuKham'] as int?,
      tongTien: (json['tongTien'] as num?)?.toDouble(),
      ngayThanhToan: json['ngayThanhToan']?.toString(),
      trangThai: json['trangThai'] as String?,
      phuongThucThanhToan: json['phuongThucThanhToan'] as String?,
      maGiaoDich: json['maGiaoDich'] as String?,
      ghiChu: json['ghiChu'] as String?,
      ngayKham: json['ngayKham']?.toString(),
      tenChuyenKhoa: json['tenChuyenKhoa'] as String?,
      tenNhanVien: json['tenNhanVien'] as String?,
      tenDichVu: json['tenDichVu'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maHoaDon': maHoaDon,
      'maPhieuKham': maPhieuKham,
      'tongTien': tongTien,
      'ngayThanhToan': ngayThanhToan,
      'trangThai': trangThai,
      'phuongThucThanhToan': phuongThucThanhToan,
      'maGiaoDich': maGiaoDich,
      'ghiChu': ghiChu,
      'ngayKham': ngayKham,
      'tenChuyenKhoa': tenChuyenKhoa,
      'tenNhanVien': tenNhanVien,
      'tenDichVu': tenDichVu,
    };
  }
}