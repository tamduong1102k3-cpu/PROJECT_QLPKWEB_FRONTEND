import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:dio/dio.dart';
import '../repositories/tai_khoan_benh_nhan_repository.dart';
import '../models/login_response_model.dart';

/// Trạng thái xác thực của ứng dụng
enum AuthStatus {
  /// Đang load token từ storage (chưa biết đăng nhập hay chưa)
  loading,

  /// Đã đăng nhập (backend đã xác nhận refresh token hợp lệ)
  authenticated,

  /// CÓ token trong máy NHƯNG backend chưa xác nhận được (network error/sleep).
  /// KHÔNG coi là SESSION_EXPIRED, KHÔNG xóa token, KHÔNG bắt đăng nhập lại.
  /// Chỉ khi backend refresh SUCCESS mới chuyển sang authenticated.
  unverified,

  /// Chưa đăng nhập (guest mode) — không có refresh token
  guest,

  /// Phiên đăng nhập đã hết hạn (backend xác nhận refresh token invalid)
  sessionExpired,

  /// Không có kết nối mạng — không tự logout, giữ token
  networkUnavailable,
}

/// Kết quả refresh token
enum RefreshResult {
  /// Refresh thành công, đã có token mới
  success,

  /// Refresh token JWT đã hết hạn hoặc không hợp lệ (server trả 401/403)
  /// → Cần logout
  invalid,

  /// Lỗi mạng / server không phản hồi → KHÔNG logout, giữ token để thử lại sau
  /// → Không được logout người dùng
  networkError,
}

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final _repository = TaiKhoanBenhNhanRepository();
  final _secureStorage = FlutterSecureStorage(
    aOptions: const AndroidOptions(
      encryptedSharedPreferences: true, // Giữ token bền vững trên Android
      resetOnError: true, // Tự động reset key nếu Keystore lỗi, tránh crash
    ),
  );

  String? _token;
  String? _refreshToken;
  LoginResponseModel? _currentUser;

  /// Clock Skew: offset giữa thời gian server và thời gian thiết bị
  /// Dương nếu server nhanh hơn, âm nếu server chậm hơn
  Duration? _serverTimeOffset;

  /// Callback để TokenInterceptor có thể yêu cầu logout khi refresh token thất bại
  VoidCallback? onLogoutRequired;

  /// Sự kiện phiên đăng nhập hết hạn (refresh token invalid).
  /// MainScreen lắng nghe để hiển thị thông báo tại Home — KHÔNG navigate.
  final StreamController<void> _sessionExpiredController =
      StreamController<void>.broadcast();
  Stream<void> get sessionExpiredStream => _sessionExpiredController.stream;

  /// Trạng thái xác thực hiện tại
  AuthStatus _status = AuthStatus.loading;
  AuthStatus get status => _status;

  /// Flag cho biết loadToken() đã hoàn thành chưa
  /// Dùng để các thành phần khác (MainScreen, ...) biết khi nào có thể gọi API
  bool get isTokenLoaded => _status != AuthStatus.loading;

  String? get token => _token;
  String? get refreshToken => _refreshToken;
  LoginResponseModel? get currentUser => _currentUser;

  /// Lấy maTaiKhoanBn từ JWT token
  int? get maTaiKhoanBn {
    if (_token == null) return null;
    try {
      final decoded = JwtDecoder.decode(_token!);
      return decoded['maTaiKhoanBn'] as int?;
    } catch (e) {
      return null;
    }
  }

  /// Lấy maBenhNhan từ JWT token
  int? get maBenhNhan {
    if (_token == null) return null;
    try {
      final decoded = JwtDecoder.decode(_token!);
      final value = decoded['maBenhNhan'] as int?;
      // Backend set 0 khi chưa có hồ sơ bệnh nhân, coi như null
      if (value == null || value == 0) return null;
      return value;
    } catch (e) {
      return null;
    }
  }

  /// Kiểm tra xem tài khoản đã có hồ sơ bệnh nhân chưa
  bool get hasPatientProfile => maBenhNhan != null;

  /// Thời gian hiện tại đã hiệu chỉnh theo server (Clock Skew)
  DateTime get _correctedNow {
    if (_serverTimeOffset == null) return DateTime.now();
    return DateTime.now().add(_serverTimeOffset!);
  }

  /// Cập nhật time offset từ thời gian server (gọi sau mỗi API response thành công)
  void updateTimeOffset(DateTime serverTime) {
    _serverTimeOffset = serverTime.difference(DateTime.now());
    debugPrint('Server time offset updated: ${_serverTimeOffset!.inSeconds}s');
    _saveOffsetToPrefs();
  }

  /// Lấy thời gian server hiệu chỉnh (cho các class khác nếu cần)
  DateTime? get correctedNow {
    if (_serverTimeOffset == null) return null;
    return _correctedNow;
  }

  /// Lưu offset vào SharedPreferences để dùng khi offline
  Future<void> _saveOffsetToPrefs() async {
    if (_serverTimeOffset == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(
        'server_time_offset_ms', _serverTimeOffset!.inMilliseconds);
  }

  /// Đọc offset từ SharedPreferences (dùng khi offline không gọi được server)
  Future<void> _loadOffsetFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final offsetMs = prefs.getInt('server_time_offset_ms');
      if (offsetMs != null) {
        _serverTimeOffset = Duration(milliseconds: offsetMs);
        debugPrint(
            'Loaded saved server time offset: ${_serverTimeOffset!.inSeconds}s');
      }
    } catch (e) {
      debugPrint('Load offset error: $e');
    }
  }

  /// Đăng nhập - trả về LoginResponseModel nếu thành công, throw Exception nếu thất bại
  Future<LoginResponseModel> login(String identity, String password) async {
    final data = await _repository.login(identity, password);
    final loginResponse = LoginResponseModel.fromJson(data);
    _token = loginResponse.token;
    _refreshToken = loginResponse.refreshToken;
    _currentUser = loginResponse;
    _status = AuthStatus.authenticated;
    await _saveToken();
    await _saveRefreshToken();
    return loginResponse;
  }

  /// Đăng ký tài khoản mới
  Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String password,
    String? phone,
  }) async {
    final data = await _repository.register(
      username: username,
      email: email,
      matKhau: password,
      soDienThoai: phone,
    );
    return data;
  }

  /// Gửi OTP xác thực email (dùng endpoint /verify-email/send-otp)
  Future<Map<String, dynamic>> sendOtpVerifyEmail(String email) async {
    return await _repository.sendOtpVerifyEmail(email);
  }

  /// Xác thực email bằng OTP (endpoint /verify-email/confirm-otp)
  Future<Map<String, dynamic>> confirmOtpVerifyEmail(String email, String otp) async {
    return await _repository.confirmOtpVerifyEmail(email, otp);
  }

  /// Xác thực email (cũ - deprecated). Ne plus utiliser : utilisez confirmOtpVerifyEmail(email, otp).
  /// Ne masque plus l'erreur en renvoyant false : si l'API échoue, une exception est levée.
  Future<bool> verifyEmail(String email) async {
    final result = await _repository.verifyEmail(email);
    return result['message'] != null;
  }

  /// Gửi OTP quên mật khẩu
  Future<Map<String, dynamic>?> sendOtpForgotPassword(String email) async {
    try {
      return await _repository.sendOtpForgotPassword(email);
    } catch (e) {
      debugPrint('Send OTP error: $e');
      return null;
    }
  }

  /// Xác thực OTP
  Future<bool> verifyOtp(String email, String otp) async {
    try {
      final result = await _repository.verifyOtp(email, otp);
      return result['message'] != null;
    } catch (e) {
      debugPrint('Verify OTP error: $e');
      return false;
    }
  }

  /// Đổi mật khẩu
  Future<bool> forgotPassword(String email, String newPassword) async {
    try {
      final result = await _repository.forgotPassword(email, newPassword);
      return result['message'] != null;
    } catch (e) {
      debugPrint('Forgot password error: $e');
      return false;
    }
  }

  /// Xác định refresh token có THỰC SỰ không hợp lệ hay không dựa trên response.
  ///
  /// QUAN TRỌNG: Không chỉ dựa vào status code — phải kiểm tra message body
  /// theo contract backend POST /refresh-token. Khi backend đổi message,
  /// chỉ cần sửa một chỗ duy nhất tại đây.
  ///
  /// Contract backend hiện tại:
  /// - 400 "Thiếu refresh token!" → KHÔNG phải session expired
  /// - 401 "Refresh token không hợp lệ hoặc đã hết hạn!" → session expired
  /// - 401 "Token không phải là refresh token!" → session expired
  /// - 401 "Refresh token đã bị thu hồi hoặc không tồn tại..." → session expired
  /// - 403 "Yêu cầu không hợp lệ (thiếu CSRF header)!" → chỉ web, mobile bỏ qua
  bool isRefreshTokenInvalidResponse(Object? response) {
    if (response is! DioException) return false;
    final statusCode = response.response?.statusCode;
    // Chỉ xem xét khi có HTTP response (không phải lỗi mạng/timeout)
    if (statusCode == null) return false;

    // Đọc message từ body (có thể là Map hoặc String)
    final data = response.response?.data;
    String message = '';
    if (data is Map) {
      message = (data['message'] as String? ?? '').toLowerCase();
    } else if (data is String) {
      message = data.toLowerCase();
    }

    // Kiểm tra message xác nhận refresh token thực sự không hợp lệ/hết hạn/thu hồi
    // (401/403 + message phù hợp contract — không dựa riêng vào status code)
    if (statusCode == 401 || statusCode == 403) {
      return message.contains('không hợp lệ') ||
          message.contains('đã hết hạn') ||
          message.contains('thu hồi') ||
          message.contains('không tồn tại') ||
          message.contains('không phải là refresh token');
    }

    return false;
  }

  void setToken(String token) {
    _token = token;
    try {
      final decoded = JwtDecoder.decode(token);
      _currentUser = LoginResponseModel(
        token: token,
        refreshToken: _refreshToken ?? '',
        maTaiKhoanBn: decoded['maTaiKhoanBn'] as int? ?? 0,
        maBenhNhan: decoded['maBenhNhan'] as int?,
        username: decoded['sub'] as String? ?? '',
        email: decoded['email'] as String? ?? '',
        soDienThoai: decoded['soDienThoai'] as String?,
        emailVerified: decoded['emailVerified'] as bool? ?? false,
      );
    } catch (e) {
      debugPrint('Error decoding token: $e');
    }
  }

  /// Lưu access token vào storage (SecureStorage + SharedPreferences fallback)
  Future<void> _saveToken() async {
    if (_token == null) return;
    try {
      await _secureStorage.write(key: 'auth_token', value: _token!);
    } catch (e) {
      debugPrint('SecureStorage write token error: $e');
      // Nếu lỗi Keystore, thử xóa toàn bộ rồi ghi lại
      try {
        await _secureStorage.deleteAll();
        await _secureStorage.write(key: 'auth_token', value: _token!);
      } catch (e2) {
        debugPrint('SecureStorage retry write token error: $e2');
      }
    }
    // Fallback: luôn ghi vào SharedPreferences (backup quan trọng)
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', _token!);
  }

  /// Lưu refresh token vào storage (SecureStorage + SharedPreferences fallback)
  Future<void> _saveRefreshToken() async {
    if (_refreshToken == null) return;
    try {
      await _secureStorage.write(
          key: 'auth_refresh_token', value: _refreshToken!);
    } catch (e) {
      debugPrint('SecureStorage write refresh token error: $e');
      try {
        await _secureStorage.deleteAll();
        await _secureStorage.write(
            key: 'auth_refresh_token', value: _refreshToken!);
      } catch (e2) {
        debugPrint('SecureStorage retry write refresh token error: $e2');
      }
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_refresh_token', _refreshToken!);
  }

  /// Đọc access token từ storage (SecureStorage ưu tiên, fallback SharedPreferences)
  Future<String?> _readTokenFromStorage() async {
    try {
      final token = await _secureStorage.read(key: 'auth_token');
      if (token != null) {
        debugPrint('Token found in SecureStorage');
        return token;
      }
    } catch (e) {
      debugPrint('SecureStorage read token error: $e');
      try {
        await _secureStorage.deleteAll();
      } catch (_) {}
    }
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token != null) {
      debugPrint('Token found in SharedPreferences fallback');
    }
    return token;
  }

  /// Đọc refresh token từ storage (SecureStorage ưu tiên, fallback SharedPreferences)
  Future<String?> _readRefreshTokenFromStorage() async {
    try {
      final token = await _secureStorage.read(key: 'auth_refresh_token');
      if (token != null) {
        debugPrint('Refresh token found in SecureStorage');
        return token;
      }
    } catch (e) {
      debugPrint('SecureStorage read refresh token error: $e');
      try {
        await _secureStorage.deleteAll();
      } catch (_) {}
    }
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_refresh_token');
    if (token != null) {
      debugPrint('Refresh token found in SharedPreferences fallback');
    }
    return token;
  }

  /// Xóa toàn bộ token khỏi storage
  Future<void> _clearStorage() async {
    try {
      await _secureStorage.delete(key: 'auth_token');
      await _secureStorage.delete(key: 'auth_refresh_token');
    } catch (e) {
      debugPrint('SecureStorage delete error: $e');
      try {
        await _secureStorage.deleteAll();
      } catch (_) {}
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_refresh_token');
  }

  /// Lấy thời gian hết hạn của JWT token từ claim 'exp' (Unix timestamp)
  DateTime? _getExpiryDate(String jwtToken) {
    try {
      final decoded = JwtDecoder.decode(jwtToken);
      final exp = decoded['exp'] as int?;
      if (exp == null) return null;
      return DateTime.fromMillisecondsSinceEpoch(exp * 1000, isUtc: true);
    } catch (e) {
      return null;
    }
  }

  /// Kiểm tra token hiện tại có hết hạn không
  bool get isTokenExpired {
    if (_token == null) return true;
    try {
      final expiryTime = _getExpiryDate(_token!);
      if (expiryTime == null) return true;
      return expiryTime.isBefore(_correctedNow);
    } catch (e) {
      return true;
    }
  }

  /// Kiểm tra refresh token có hết hạn không
  bool get isRefreshTokenExpired {
    if (_refreshToken == null) return true;
    try {
      final expiryTime = _getExpiryDate(_refreshToken!);
      if (expiryTime == null) return true;
      return expiryTime.isBefore(_correctedNow);
    } catch (e) {
      return true;
    }
  }

  /// Track thời điểm refresh cuối cùng để tránh loop khi mạng yếu
  DateTime? _lastRefreshAttempt;

  /// Cooldown 3s giữa các lần thử refresh (tránh loop 401 → refresh → fail).
  static const Duration refreshCooldown = Duration(seconds: 3);

  /// Kiểm tra có thể thử refresh token không (tôn trọng cooldown)
  bool get _canAttemptRefresh {
    if (_lastRefreshAttempt == null) return true;
    return DateTime.now().difference(_lastRefreshAttempt!) >= refreshCooldown;
  }

  /// Làm mới token bằng refresh token
  Future<RefreshResult> refreshAccessToken() async {
    // Không còn kiểm tra isRefreshTokenExpired ở client.
    // Phải gửi request tới backend để backend xác thực refresh token.
    if (_refreshToken == null) return RefreshResult.invalid;

    if (!_canAttemptRefresh) {
      debugPrint('refreshAccessToken: In cooldown, skipping refresh attempt');
      return RefreshResult.networkError;
    }

    try {
      _lastRefreshAttempt = DateTime.now();
      final data = await _repository.refreshToken(_refreshToken!);
      final newToken = data['token'] as String?;
      final newRefreshToken = data['refreshToken'] as String?;

      if (newToken != null) {
        _token = newToken;
        _refreshToken = newRefreshToken ?? _refreshToken;
        await _saveToken();
        if (newRefreshToken != null) {
          await _saveRefreshToken();
        }
        try {
          final decoded = JwtDecoder.decode(newToken);
          _currentUser = LoginResponseModel(
            token: newToken,
            refreshToken: _refreshToken ?? '',
            maTaiKhoanBn: decoded['maTaiKhoanBn'] as int? ?? 0,
            maBenhNhan: decoded['maBenhNhan'] as int?,
            username: decoded['sub'] as String? ?? '',
            email: decoded['email'] as String? ?? '',
            soDienThoai: decoded['soDienThoai'] as String?,
            emailVerified: decoded['emailVerified'] as bool? ?? false,
          );
        } catch (_) {}
        _status = AuthStatus.authenticated;
        _lastRefreshAttempt = null;
        return RefreshResult.success;
      }
      return RefreshResult.invalid;
    } on DioException catch (e) {
      debugPrint('Refresh token error: $e');

      if (isRefreshTokenInvalidResponse(e)) {
        return RefreshResult.invalid;
      }
      return RefreshResult.networkError;
    } catch (e) {
      debugPrint('Refresh token error: $e');
      return RefreshResult.networkError;
    }
  }

  void _completeTokenLoad() {
    if (!_isTokenLoadCompleter.isCompleted) {
      _isTokenLoadCompleter.complete();
    }
  }

  /// Load token từ storage khi khởi động app.
  Future<void> loadToken() async {
    try {
      await _loadOffsetFromPrefs();

      final savedToken = await _readTokenFromStorage();
      final savedRefreshToken = await _readRefreshTokenFromStorage();

      if (savedToken == null && savedRefreshToken == null) {
        debugPrint('No saved token found, app starts in guest mode');
        _status = AuthStatus.guest;
        _completeTokenLoad();
        return;
      }

      _refreshToken = savedRefreshToken;
      if (savedToken != null) {
        setToken(savedToken);
      }

      if (_refreshToken == null) {
        debugPrint('No refresh token found, app starts in guest mode');
        _status = AuthStatus.guest;
        _completeTokenLoad();
        return;
      }

      debugPrint('Has refresh token, verifying with backend...');
      final result = await refreshAccessToken();

      if (result == RefreshResult.success) {
        debugPrint('Token refreshed successfully');
        _status = AuthStatus.authenticated;
        _completeTokenLoad();
        return;
      }

      if (result == RefreshResult.invalid) {
        debugPrint('Refresh token expired or invalid, session expired');
        notifySessionExpired(fromAppStart: true);
        _completeTokenLoad();
        return;
      }

      debugPrint(
          'Network error during refresh → UNVERIFIED (keep token, NOT authenticated, NOT logout)');
      _status = AuthStatus.unverified;
      _completeTokenLoad();
    } catch (e) {
      debugPrint('Load token error: $e');
      if (_refreshToken == null && _token == null) {
        _status = AuthStatus.guest;
      } else {
        _status = AuthStatus.unverified;
      }
      _completeTokenLoad();
    }
  }

  final _isTokenLoadCompleter = Completer<void>();

  Future<bool> ensureTokenLoaded() async {
    if (isTokenLoaded) return isLoggedIn;
    await _isTokenLoadCompleter.future;
    return isLoggedIn;
  }

  /// Xóa token local + set guest + phát sự kiện session expired.
  /// CHỈ được gọi khi backend XÁC NHẬN refresh token thực sự hết hạn/invalid
  /// (401 + message phù hợp contract).
  void notifySessionExpired({bool fromAppStart = false}) {
    _token = null;
    _refreshToken = null;
    _currentUser = null;
    _status = AuthStatus.sessionExpired;
    _clearStorage();
    if (!_sessionExpiredController.isClosed) {
      _sessionExpiredController.add(null);
    }
  }

  /// Xử lý tập trung khi phiên đăng nhập hết hạn (refresh token invalid/revoked).
  /// Clear session + chuyển GUEST + phát sự kiện để MainScreen/Home xử lý.
  /// Đây là NGUỒN DUY NHẤT xử lý hết phiên — các màn hình không tự xử lý riêng.
  void handleSessionExpired() {
    _token = null;
    _refreshToken = null;
    _currentUser = null;
    _status = AuthStatus.sessionExpired;
    _clearStorage();
    if (!_sessionExpiredController.isClosed) {
      _sessionExpiredController.add(null);
    }
  }

  Future<void> logout() async {
    _token = null;
    _refreshToken = null;
    _currentUser = null;
    _status = AuthStatus.guest;
    await _clearStorage();
  }

  /// Đã đăng nhập: có token trong memory. Bao gồm cả UNVERIFIED
  bool get isLoggedIn =>
      (_status == AuthStatus.authenticated ||
          _status == AuthStatus.unverified) &&
      _token != null;
}