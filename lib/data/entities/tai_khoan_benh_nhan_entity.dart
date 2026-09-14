
class TaiKhoanBenhNhanEntity {
  final int maTaiKhoanBn;
  final int? maBenhNhan;
  final String username;
  final String email;
  final String? soDienThoai;
  final String matKhau;
  final bool emailVerified;
  final String vaiTro;
  final DateTime ngayTao;
  final DateTime? lanDangNhapCuoi;

  TaiKhoanBenhNhanEntity({
    required this.maTaiKhoanBn,
    this.maBenhNhan,
    required this.username,
    required this.email,
    this.soDienThoai,
    required this.matKhau,
    this.emailVerified = false,
    this.vaiTro = 'BENH_NHAN',
    required this.ngayTao,
    this.lanDangNhapCuoi,
  });

  factory TaiKhoanBenhNhanEntity.fromJson(Map<String, dynamic> json) {
    return TaiKhoanBenhNhanEntity(
      maTaiKhoanBn: json['maTaiKhoanBn'] as int,
      maBenhNhan: json['maBenhNhan'] as int?,
      username: json['username'] as String,
      email: json['email'] as String,
      soDienThoai: json['soDienThoai'] as String?,
      matKhau: json['matKhau'] as String,
      emailVerified: json['emailVerified'] as bool? ?? false,
      vaiTro: json['vaiTro'] as String? ?? 'BENH_NHAN',
      ngayTao: DateTime.parse(json['ngayTao'] as String),
      lanDangNhapCuoi: json['lanDangNhapCuoi'] != null
          ? DateTime.parse(json['lanDangNhapCuoi'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maTaiKhoanBn': maTaiKhoanBn,
      'maBenhNhan': maBenhNhan,
      'username': username,
      'email': email,
      'soDienThoai': soDienThoai,
      'matKhau': matKhau,
      'emailVerified': emailVerified,
      'vaiTro': vaiTro,
      'ngayTao': ngayTao.toIso8601String(),
      'lanDangNhapCuoi': lanDangNhapCuoi?.toIso8601String(),
    };
  }
}
