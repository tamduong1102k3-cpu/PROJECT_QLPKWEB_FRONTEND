import 'package:flutter/foundation.dart';
import '../core/dio_client.dart';
import '../services/auth_service.dart';

/// Service gửi FCM Token lên backend để lưu trữ
class DeviceTokenApiService {
  static final DeviceTokenApiService _instance = DeviceTokenApiService._internal();
  factory DeviceTokenApiService() => _instance;
  DeviceTokenApiService._internal();

  final _dio = DioClient().dio;
  final _authService = AuthService();

  /// Đăng ký FCM Token lên backend
  Future<bool> registerToken(String fcmToken) async {
    final maTaiKhoanBn = _authService.maTaiKhoanBn;
    if (maTaiKhoanBn == null) {
      debugPrint('Cannot register token: User not logged in');
      return false;
    }
    try {
      final response = await _dio.post(
        '/device-tokens/register',
        data: {
          'maTaiKhoanBn': maTaiKhoanBn,
          'fcmToken': fcmToken,
          'deviceType': 'android',
        },
      );
      if (response.statusCode == 200) {
        debugPrint('Token registered successfully');
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error registering token: $e');
      return false;
    }
  }

  /// Xóa FCM Token khỏi backend
  Future<bool> removeToken(String fcmToken) async {
    final maTaiKhoanBn = _authService.maTaiKhoanBn;
    if (maTaiKhoanBn == null) return false;
    try {
      final response = await _dio.delete(
        '/device-tokens/remove',
        data: {
          'maTaiKhoanBn': maTaiKhoanBn,
          'fcmToken': fcmToken,
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error removing token: $e');
      return false;
    }
  }

  /// Xóa tất cả token của user
  Future<bool> removeAllTokens() async {
    final maTaiKhoanBn = _authService.maTaiKhoanBn;
    if (maTaiKhoanBn == null) return false;
    try {
      final response = await _dio.delete(
        '/device-tokens/remove-all/$maTaiKhoanBn',
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error removing all tokens: $e');
      return false;
    }
  }
}