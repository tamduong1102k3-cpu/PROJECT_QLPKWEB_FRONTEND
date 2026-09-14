import 'dart:io';

import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../services/auth_service.dart';
import 'retry_interceptor.dart';
import 'token_interceptor.dart';

class DioClient {
  static final DioClient _instance = DioClient._internal();
  factory DioClient() => _instance;
  DioClient._internal();

  late final Dio dio;
  late final TokenInterceptor tokenInterceptor;
  late final RetryInterceptor retryInterceptor;
  AuthService? _authService;

  void init({required AuthService authService}) {
    _authService = authService;

    // Tạo Dio instance
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        // Tăng timeout để chịu được mạng 4G yếu / chập chờn
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 45),
        sendTimeout: const Duration(seconds: 45),
        headers: {
          'Content-Type': 'application/json',
          // QUAN TRỌNG: Báo backend đây là client mobile (Flutter) để khi refresh token,
          // backend TRẢ KÈM refreshToken mới trong body. Nếu thiếu header này, backend
          // coi như web → revoke token cũ nhưng KHÔNG trả token mới → client giữ token
          // đã bị thu hồi → lần sau refresh trả 401 → bị đăng xuất định kỳ (10-20 phút).
          'X-Client': 'mobile',
        },
      ),
    );

    // Thêm interceptor để cập nhật Clock Skew từ response headers
    dio.interceptors.add(InterceptorsWrapper(
      onResponse: (response, handler) {
        _updateClockSkew(response);
        handler.next(response);
      },
      onError: (error, handler) {
        // Vẫn thử đọc header Date từ error response nếu có
        if (error.response != null) {
          _updateClockSkew(error.response!);
        }
        handler.next(error);
      },
    ));

    // QUAN TRỌNG: RetryInterceptor là NƠI DUY NHẤT retry lỗi mạng/timeout.
    // Đặt TRƯỚC TokenInterceptor để:
    //  - Lỗi mạng/timeout → RetryInterceptor xử lý (tự retry khi backend thức dậy)
    //  - Lỗi 401 → không phải network error → bỏ qua → chảy sang TokenInterceptor
    //    để xử lý refresh-token flow
    // KHÔNG retry network ở TokenInterceptor — tránh nhân chồng 9 request.
    retryInterceptor = RetryInterceptor(
      maxRetries: 2, // Tổng 3 attempt: 1 lần đầu + 2 lần retry
    );
    dio.interceptors.add(retryInterceptor);

    // Tạo TokenInterceptor với reference đến Dio instance để retry request
    // sau khi refresh token thành công
    tokenInterceptor = TokenInterceptor(
      authService: authService,
      dio: dio,
    );

    // Thêm TokenInterceptor (QueuedInterceptor) - tự động xếp hàng khi refresh token
    dio.interceptors.add(tokenInterceptor);

    // Log interceptor (chỉ trong debug)
    dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => print('[DIO] $obj'),
      ),
    );
  }

  /// Cập nhật Clock Skew từ header Date của response
  void _updateClockSkew(Response response) {
    if (_authService == null) return;
    try {
      final dateValues = response.headers['date'];
      if (dateValues != null && dateValues.isNotEmpty) {
        // HttpDate.parse trả về DateTime ở UTC, cần .toLocal() để so sánh với device time
        final serverTimeUtc = HttpDate.parse(dateValues.first);
        final serverTimeLocal = serverTimeUtc.toLocal();
        _authService!.updateTimeOffset(serverTimeLocal);
      }
    } catch (e) {
      // Silent fail - không làm ảnh hưởng request
    }
  }
}