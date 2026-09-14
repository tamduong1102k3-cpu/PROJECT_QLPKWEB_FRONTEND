import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/tai_khoan_benh_nhan_entity.dart';

class TaiKhoanBenhNhanRepository {
  Dio get _dio => DioClient().dio;

  /// GET /api/tai-khoan-benh-nhan - Lấy tất cả tài khoản bệnh nhân
  Future<List<TaiKhoanBenhNhanEntity>> getAll() async {
    final response = await _dio.get('/tai-khoan-benh-nhan');
    final List<dynamic> data = response.data;
    return data.map((json) => TaiKhoanBenhNhanEntity.fromJson(json)).toList();
  }

  /// GET /api/tai-khoan-benh-nhan/{id} - Lấy tài khoản theo ID
  Future<TaiKhoanBenhNhanEntity> getById(int id, {String? token}) async {
    try {
      final response = await _dio.get('/tai-khoan-benh-nhan/$id');
      return TaiKhoanBenhNhanEntity.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('Không tìm thấy tài khoản với ID: $id');
      }
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy tài khoản: ${e.response?.statusCode}';
      throw Exception(message);
    }
  }

  /// POST /api/tai-khoan-benh-nhan - Đăng ký tài khoản bệnh nhân mới
  Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String matKhau,
    String? soDienThoai,
  }) async {
    final body = <String, dynamic>{
      'username': username,
      'email': email,
      'matKhau': matKhau,
    };
    if (soDienThoai != null && soDienThoai.isNotEmpty) {
      body['soDienThoai'] = soDienThoai;
    }

    try {
      final response = await _dio.post('/tai-khoan-benh-nhan', data: body);
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Đăng ký thất bại';
      throw Exception(message);
    }
  }

  /// POST /api/tai-khoan-benh-nhan/login - Đăng nhập
  Future<Map<String, dynamic>> login(String identity, String password) async {
    try {
      final response = await _dio.post('/tai-khoan-benh-nhan/login', data: {
        'identity': identity,
        'password': password,
      });
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Đăng nhập thất bại';
      throw Exception(message);
    }
  }

  /// POST /api/tai-khoan-benh-nhan/forgot-password/send-otp - Gửi OTP quên mật khẩu
  Future<Map<String, dynamic>> sendOtpForgotPassword(String email) async {
    try {
      final response = await _dio.post(
        '/tai-khoan-benh-nhan/forgot-password/send-otp',
        data: {'email': email},
      );
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Gửi OTP thất bại';
      throw Exception(message);
    }
  }

  /// POST /api/tai-khoan-benh-nhan/forgot-password/verify-otp - Xác thực OTP
  Future<Map<String, dynamic>> verifyOtp(String email, String otp) async {
    try {
      final response = await _dio.post(
        '/tai-khoan-benh-nhan/forgot-password/verify-otp',
        data: {'email': email, 'otp': otp},
      );
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Xác thực OTP thất bại';
      throw Exception(message);
    }
  }

  /// POST /api/tai-khoan-benh-nhan/forgot-password - Đổi mật khẩu
  Future<Map<String, dynamic>> forgotPassword(String email, String newPassword) async {
    try {
      final response = await _dio.post(
        '/tai-khoan-benh-nhan/forgot-password',
        data: {'email': email, 'newPassword': newPassword},
      );
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Đổi mật khẩu thất bại';
      throw Exception(message);
    }
  }

  /// POST /api/tai-khoan-benh-nhan/verify-email - Xác thực email
  Future<Map<String, dynamic>> verifyEmail(String email) async {
    try {
      final response = await _dio.post('/tai-khoan-benh-nhan/verify-email', data: {'email': email});
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Xác thực email thất bại';
      throw Exception(message);
    }
  }

  /// POST /api/tai-khoan-benh-nhan/refresh-token - Làm mới token
  ///
  /// QUAN TRỌNG: KHÔNG bọc DioException thành Exception thường.
  /// AuthService.refreshAccessToken() cần DioException (kèm statusCode + body)
  /// để phân biệt:
  ///   - 401 "Refresh token đã bị thu hồi / không hợp lệ / hết hạn"
  ///     → RefreshResult.invalid → thông báo hết phiên đăng nhập.
  ///   - Lỗi mạng / server ngủ → RefreshResult.networkError → giữ phiên.
  /// Nếu bọc lại thành Exception thường, mọi 401 đều bị coi là lỗi mạng
  /// → không bao giờ thông báo hết phiên đăng nhập, home cứ "loading" mãi.
  Future<Map<String, dynamic>> refreshToken(String refreshToken) async {
    final response = await _dio.post(
      '/tai-khoan-benh-nhan/refresh-token',
      data: {'refreshToken': refreshToken},
    );
    return response.data;
  }

  /// POST /api/tai-khoan-benh-nhan/verify-email/send-otp - Gửi OTP xác thực email
  Future<Map<String, dynamic>> sendOtpVerifyEmail(String email) async {
    try {
      final response = await _dio.post(
        '/tai-khoan-benh-nhan/verify-email/send-otp',
        data: {'email': email},
      );
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Gửi mã OTP thất bại';
      throw Exception(message);
    }
  }
/// POST /api/tai-khoan-benh-nhan/verify-email/confirm-otp - Xác thực email bằng OTP
  Future<Map<String, dynamic>> confirmOtpVerifyEmail(String email, String otp) async {
    try {
      final response = await _dio.post(
        '/tai-khoan-benh-nhan/verify-email/confirm-otp',
        data: {'email': email, 'otp': otp},
      );
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Xác thực email thất bại';
      throw Exception(message);
    }
  }

  /// PUT /api/tai-khoan-benh-nhan/{id} - Cập nhật tài khoản (yêu cầu JWT)
  /// Trả về Map chứa token mới nếu thành công
  Future<Map<String, dynamic>> updateWithToken({
    required int id,
    required TaiKhoanBenhNhanEntity entity,
    required String token,
  }) async {
    try {
      final response = await _dio.put(
        '/tai-khoan-benh-nhan/$id',
        data: entity.toJson(),
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;
      final message = e.response?.data?['message'] ?? 'Lỗi khi cập nhật tài khoản';
      if (statusCode == 401) throw Exception(message);
      if (statusCode == 403) throw Exception(message);
      if (statusCode == 404) throw Exception('Không tìm thấy tài khoản với ID: $id');
      throw Exception(message);
    }
  }

  /// PUT /api/tai-khoan-benh-nhan/{id}/link-patient - Liên kết hồ sơ bệnh nhân
  /// CHỈ cập nhật maBenhNhan, KHÔNG đụng tới mật khẩu → tránh double-hash password.
  /// Trả về Map chứa token mới (có maBenhNhan) nếu thành công
  Future<Map<String, dynamic>> linkPatient({
    required int id,
    required int maBenhNhan,
    required String token,
  }) async {
    try {
      final response = await _dio.put(
        '/tai-khoan-benh-nhan/$id/link-patient',
        data: {'maBenhNhan': maBenhNhan},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi liên kết hồ sơ';
      throw Exception(message);
    }
  }

  /// DELETE /api/tai-khoan-benh-nhan/{id} - Xóa tài khoản
  Future<void> delete(int id) async {
    try {
      await _dio.delete('/tai-khoan-benh-nhan/$id');
      // 204 hoặc 200 là thành công
    } on DioException catch (e) {
      throw Exception('Lỗi khi xóa tài khoản: ${e.response?.statusCode}');
    }
  }

  // ==================== Các endpoint tìm kiếm ====================

  /// GET /api/tai-khoan-benh-nhan/by-username?username= - Tìm theo username
  Future<TaiKhoanBenhNhanEntity> findByUsername(String username) async {
    try {
      final response = await _dio.get('/tai-khoan-benh-nhan/by-username', queryParameters: {'username': username});
      return TaiKhoanBenhNhanEntity.fromJson(response.data);
    } on DioException {
      throw Exception('Không tìm thấy tài khoản với username: $username');
    }
  }

  /// GET /api/tai-khoan-benh-nhan/by-email?email= - Tìm theo email
  Future<TaiKhoanBenhNhanEntity> findByEmail(String email) async {
    try {
      final response = await _dio.get('/tai-khoan-benh-nhan/by-email', queryParameters: {'email': email});
      return TaiKhoanBenhNhanEntity.fromJson(response.data);
    } on DioException {
      throw Exception('Không tìm thấy tài khoản với email: $email');
    }
  }

  /// GET /api/tai-khoan-benh-nhan/by-ma-benh-nhan?maBenhNhan= - Tìm theo mã BN
  Future<TaiKhoanBenhNhanEntity> findByMaBenhNhan(int maBenhNhan) async {
    try {
      final response = await _dio.get('/tai-khoan-benh-nhan/by-ma-benh-nhan', queryParameters: {'maBenhNhan': maBenhNhan});
      return TaiKhoanBenhNhanEntity.fromJson(response.data);
    } on DioException {
      throw Exception('Không tìm thấy tài khoản với mã bệnh nhân: $maBenhNhan');
    }
  }

  /// GET /api/tai-khoan-benh-nhan/check-ma-benh-nhan - Kiểm tra mã bệnh nhân
  Future<Map<String, dynamic>> checkMaBenhNhan(String token) async {
    try {
      final response = await _dio.get(
        '/tai-khoan-benh-nhan/check-ma-benh-nhan',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi kiểm tra mã bệnh nhân';
      throw Exception(message);
    }
  }
}