class NhanVienEntity {
  final int maNhanVien;
  final String hoTen;
  final int? gioiTinh;
  final DateTime? ngaySinh;
  final String cccd;
  final String? diaChi;
  final String? soDienThoai;
  final String? email;
  final int? chuyenKhoa;
  final String? bangCap;
  final String? chucVu;
  final DateTime? ngayVaoLam;

  NhanVienEntity({
    required this.maNhanVien,
    required this.hoTen,
    this.gioiTinh,
    this.ngaySinh,
    required this.cccd,
    this.diaChi,
    this.soDienThoai,
    this.email,
    this.chuyenKhoa,
    this.bangCap,
    this.chucVu,
    this.ngayVaoLam,
  });

  factory NhanVienEntity.fromJson(Map<String, dynamic> json) {
    return NhanVienEntity(
      maNhanVien: json['maNhanVien'] as int,
      hoTen: json['hoTen'] as String,
      gioiTinh: json['gioiTinh'] as int?,
      ngaySinh: json['ngaySinh'] != null ? DateTime.parse(json['ngaySinh'] as String) : null,
      cccd: json['cccd'] as String,
      diaChi: json['diaChi'] as String?,
      soDienThoai: json['soDienThoai'] as String?,
      email: json['email'] as String?,
      chuyenKhoa: json['chuyenKhoa'] as int?,
      bangCap: json['bangCap'] as String?,
      chucVu: json['chucVu'] as String?,
      ngayVaoLam: json['ngayVaoLam'] != null ? DateTime.parse(json['ngayVaoLam'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maNhanVien': maNhanVien,
      'hoTen': hoTen,
      'gioiTinh': gioiTinh,
      'ngaySinh': ngaySinh?.toIso8601String(),
      'cccd': cccd,
      'diaChi': diaChi,
      'soDienThoai': soDienThoai,
      'email': email,
      'chuyenKhoa': chuyenKhoa,
      'bangCap': bangCap,
      'chucVu': chucVu,
      'ngayVaoLam': ngayVaoLam?.toIso8601String(),
    };
  }
}