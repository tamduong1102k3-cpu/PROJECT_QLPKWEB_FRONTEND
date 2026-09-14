class OtpVerificationEntity {
  final int id;
  final String email;
  final String otp;
  final DateTime expiryTime;
  final bool used;
  final String role;

  OtpVerificationEntity({
    required this.id,
    required this.email,
    required this.otp,
    required this.expiryTime,
    required this.used,
    required this.role,
  });

  factory OtpVerificationEntity.fromJson(Map<String, dynamic> json) {
    return OtpVerificationEntity(
      id: json['id'] as int,
      email: json['email'] as String,
      otp: json['otp'] as String,
      expiryTime: DateTime.parse(json['expiryTime'] as String),
      used: json['used'] as bool,
      role: json['role'] as String? ?? 'BENH_NHAN',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'otp': otp,
      'expiryTime': expiryTime.toIso8601String(),
      'used': used,
      'role': role,
    };
  }

  bool get isExpired => DateTime.now().isAfter(expiryTime);
}