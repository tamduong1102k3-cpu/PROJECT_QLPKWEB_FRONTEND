import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../services/auth_service.dart';

/// Interceptor chịu trách nhiệm xử lý lỗi 401 (access token hết hạn).
///
/// QUAN TRỌNG:
/// - Retry lỗi mạng/timeout KHÔNG nằm ở đây — do RetryInterceptor (dio_client)
///   xử lý, tránh nhân chồng request (Ví dụ: Dio retry × 3 + Interceptor retry × 3).
/// - Chỉ xử lý 401:
///   1. Gọi refreshAccessToken()
///   2. success → retry request gốc 1 lần với token mới
///   3. networkError → giữ phiên, KHÔNG logout (backend ngủ / timeout / 5xx)
///   4. invalid → SESSION_EXPIRED (backend xác nhận refresh token thực sự hết hạn)
class TokenInterceptor extends QueuedInterceptor {
  final AuthService _authService;
  final Dio _dio;

  /// Cờ kiểm tra có đang refresh token không
  bool _isRefreshing = false;

  /// Danh sách các request đang chờ khi refresh token
  final List<({
    RequestOptions options,
    ErrorInterceptorHandler handler,
  })> _pendingRequests = [];

  TokenInterceptor({
    required AuthService authService,
    required Dio dio,
  })  : _authService = authService,
        _dio = dio;

  /// Danh sách API path public - không cần auth, nếu 401 thì bỏ qua, không logout
  /// Lưu ý: paths là relative (không có /api/ prefix) vì RequestOptions.path của Dio
  /// là relative path, không bao gồm baseUrl. Ví dụ: dio.get('/server-time') → path = '/server-time'
  static const List<String> _publicApiPaths = [
    '/server-time',
    '/tai-khoan-benh-nhan/login',
    '/tai-khoan-benh-nhan/forgot-password',
    '/tai-khoan-benh-nhan/verify-email',
    '/tai-khoan-benh-nhan/refresh-token',
    '/tai-khoan-benh-nhan/logout',
    '/benh-nhan/search',
    '/benh-nhan/exact-match',
    '/benh-nhan/find-flexible',
    '/lich-hen',
    '/appointments',
    '/chuyen-khoa',
    '/dich-vu',
    '/phan-cong',
    '/nhan-vien',
    '/nhan_vien',
    '/danh-muc-benh-ly',
    '/device-tokens',
    '/test-notification',
    '/thong-bao',
    '/payment',
  ];

  bool _isPublicApi(RequestOptions options) {
    final path = options.path;
    if (options.method == 'POST' && path == '/tai-khoan-benh-nhan') {
      return true;
    }
    for (final publicPath in _publicApiPaths) {
      if (path.contains(publicPath)) {
        return true;
      }
    }
    return false;
  }

  bool _isAuthEndpoint(RequestOptions options) {
    final path = options.path;
    return path.contains('/refresh-token') ||
        path.contains('/login') ||
        path.contains('/logout') ||
        path.contains('/verify-email') ||
        path.contains('/forgot-password');
  }

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (_isAuthEndpoint(options)) {
      return handler.next(options);
    }

    final accessToken = _authService.token;
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }

    return handler.next(options);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    if (err.requestOptions.path.contains('/refresh-token')) {
      return handler.next(err);
    }

    if (_isPublicApi(err.requestOptions) && _authService.token == null) {
      return handler.next(err);
    }

    final options = err.requestOptions;

    if (!_authService.isTokenLoaded) {
      debugPrint('TokenInterceptor: Token chưa load xong, chờ đợi...');
      final loggedIn = await _authService.ensureTokenLoaded();

      if (loggedIn && _authService.token != null) {
        options.headers['Authorization'] = 'Bearer ${_authService.token}';
        try {
          final response = await _dio.fetch(options);
          return handler.resolve(response);
        } catch (retryError) {
          return handler.next(retryError is DioException ? retryError : err);
        }
      } else {
        if (_authService.status == AuthStatus.sessionExpired) {
          debugPrint('TokenInterceptor: Session expired sau khi load, notify');
          _authService.notifySessionExpired();
        }
        return handler.next(err);
      }
    }

    if (!_isRefreshing) {
      _isRefreshing = true;

      try {
        final result = await _authService.refreshAccessToken();

        if (result == RefreshResult.success) {
          final newToken = _authService.token;

          if (newToken != null) {
            _isRefreshing = false;

            options.headers['Authorization'] = 'Bearer $newToken';
            try {
              final response = await _dio.fetch(options);
              return handler.resolve(response);
            } catch (retryError) {
              return handler.next(retryError is DioException ? retryError : err);
            } finally {
              _processPendingRequests(newToken);
            }
          }
        }

        _isRefreshing = false;

        if (result == RefreshResult.invalid) {
          debugPrint('TokenInterceptor: Refresh invalid → session expired');
          _authService.handleSessionExpired();
        } else {
          debugPrint(
              'TokenInterceptor: Không phát session-expired (network error), giữ phiên');
        }

        // QUAN TRỌNG: Trả lỗi cho TỪNG request đang chờ thay vì clear() mất hẳn.
        // Nếu không làm, Future của các request pending không hoàn thành
        // → UI kéo spinner "loading" vô hạn (Home/Thông báo/Hồ sơ).
        _failPendingRequests(err);

        return handler.next(err);
      } catch (e) {
        _isRefreshing = false;
        debugPrint('TokenInterceptor: Exception khi refresh: $e');
        _failPendingRequests(err);
        return handler.next(err);
      }
    } else {
      _pendingRequests.add((options: options, handler: handler));
    }
  }

  /// Trả lỗi 401 cho TOÀN BỘ các request đang chờ.
  /// Đảm bảo không có request nào bị treo vĩnh viễn khi refresh thất bại.
  void _failPendingRequests(DioException error) {
    final pending = List<({
      RequestOptions options,
      ErrorInterceptorHandler handler,
    })>.from(_pendingRequests);
    _pendingRequests.clear();

    for (final request in pending) {
      try {
        request.handler.next(error);
      } catch (e) {
        debugPrint('TokenInterceptor: Lỗi khi trả lỗi pending request: $e');
      }
    }
  }

  /// Xử lý các request đang chờ sau khi refresh token thành công
  ///
  /// QUAN TRỌNG: Mỗi handler phải LUÔN được resolve/next để Future gốc hoàn
  /// thành. Nếu bỏ sót, screen đang await (Home/Thông báo/Hồ sơ) sẽ giữ
  /// spinner "loading" vô hạn.
  void _processPendingRequests(String newToken) {
    final pending = List<({
      RequestOptions options,
      ErrorInterceptorHandler handler,
    })>.from(_pendingRequests);
    _pendingRequests.clear();

    for (final request in pending) {
      request.options.headers['Authorization'] = 'Bearer $newToken';
      _dio.fetch(request.options).then(
        (response) {
          try {
            request.handler.resolve(response);
          } catch (e) {
            debugPrint('TokenInterceptor: Lỗi resolve pending request: $e');
          }
        },
        onError: (Object error, StackTrace stackTrace) {
          // Chuyển mọi lỗi thành DioException hợp lệ rồi trả cho handler gốc,
          // đảm bảo Future của request đang chờ luôn hoàn thành.
          final dioError = error is DioException
              ? error
              : DioException(
                  requestOptions: request.options,
                  error: error,
                  stackTrace: stackTrace,
                  type: DioExceptionType.unknown,
                );
          try {
            request.handler.next(dioError);
          } catch (e) {
            debugPrint('TokenInterceptor: Lỗi khi trả lỗi pending request: $e');
          }
        },
      );
    }
  }
}