class LoginResponseModel {
  final String token;
  final String refreshToken;
  final int maTaiKhoanBn;
  final int? maBenhNhan;
  final String username;
  final String email;
  final String? soDienThoai;
  final bool emailVerified;
  final String? message;

  LoginResponseModel({
    required this.token,
    required this.refreshToken,
    required this.maTaiKhoanBn,
    this.maBenhNhan,
    required this.username,
    required this.email,
    this.soDienThoai,
    required this.emailVerified,
    this.message,
  });

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      token: json['token'] as String,
      refreshToken: json['refreshToken'] as String? ?? '',
      maTaiKhoanBn: json['maTaiKhoanBn'] as int,
      maBenhNhan: json['maBenhNhan'] as int?,
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      soDienThoai: json['soDienThoai'] as String?,
      emailVerified: json['emailVerified'] as bool? ?? false,
      message: json['message'] as String?,
    );
  }
}
