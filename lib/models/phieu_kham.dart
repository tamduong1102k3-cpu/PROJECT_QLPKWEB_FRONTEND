class PhieuKham {
  final int maPhieuKham;
  final String? ngayKham;
  final String? trieuChung;
  final String? chanDoan;
  final String? ghiChu;
  final String? trangThai;
  final String? tenChuyenKhoa;
  final String? tenNhanVien;
  final String? tenDichVu;
  final int? maDichVu;
  final String? loaiDichVu;
  final int? maChuyenKhoa;

  PhieuKham({
    required this.maPhieuKham,
    this.ngayKham,
    this.trieuChung,
    this.chanDoan,
    this.ghiChu,
    this.trangThai,
    this.tenChuyenKhoa,
    this.tenNhanVien,
    this.tenDichVu,
    this.maDichVu,
    this.loaiDichVu,
    this.maChuyenKhoa,
  });

  factory PhieuKham.fromJson(Map<String, dynamic> json) {
    return PhieuKham(
      maPhieuKham: json['maPhieuKham'] as int,
      ngayKham: json['ngayKham'] as String?,
      trieuChung: json['trieuChung'] as String?,
      chanDoan: json['chanDoan'] as String?,
      ghiChu: json['ghiChu'] as String?,
      trangThai: json['trangThai'] as String?,
      tenChuyenKhoa: json['tenChuyenKhoa'] as String?,
      tenNhanVien: json['tenNhanVien'] as String?,
      tenDichVu: json['tenDichVu'] as String?,
      maDichVu: json['maDichVu'] as int?,
      loaiDichVu: json['loaiDichVu'] as String?,
      maChuyenKhoa: json['maChuyenKhoa'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maPhieuKham': maPhieuKham,
      'ngayKham': ngayKham,
      'trieuChung': trieuChung,
      'chanDoan': chanDoan,
      'ghiChu': ghiChu,
      'trangThai': trangThai,
      'tenChuyenKhoa': tenChuyenKhoa,
      'tenNhanVien': tenNhanVien,
      'tenDichVu': tenDichVu,
      'maDichVu': maDichVu,
      'loaiDichVu': loaiDichVu,
      'maChuyenKhoa': maChuyenKhoa,
    };
  }
}