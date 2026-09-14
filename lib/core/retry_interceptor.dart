import 'dart:async';
import 'package:dio/dio.dart';

/// Interceptor chịu trách nhiệm DUY NHẤT retry các lỗi mạng/timeout.
///
/// QUAN TRỌNG:
/// - Không được có retry network ở nơi khác (TokenInterceptor, ...) để tránh
///   nhân chồng request (Ví dụ: Dio retry × 3 + Interceptor retry × 3 = 9 request).
/// - Chỉ retry các lỗi network/timeout (chưa có HTTP response).
/// - KHÔNG retry các HTTP 4xx thông thường.
/// - KHÔNG retry endpoint /refresh-token (tránh loop; refresh do AuthService xử lý).
/// - 401 được bỏ qua để chảy sang TokenInterceptor xử lý refresh-token flow.
class RetryInterceptor extends QueuedInterceptor {
  /// Số lần retry tối đa (tổng attempt = retryCount + 1 lần đầu)
  final int maxRetries;

  /// Danh sách các error type được phép retry (lỗi mạng/timeout)
  static const Set<DioExceptionType> _retryableTypes = {
    DioExceptionType.connectionTimeout,
    DioExceptionType.sendTimeout,
    DioExceptionType.receiveTimeout,
    DioExceptionType.connectionError,
    DioExceptionType.unknown,
    DioExceptionType.badCertificate,
  };

  /// Endpoint refresh token — KHÔNG retry ở đây
  static const String _refreshTokenPath = '/refresh-token';

  RetryInterceptor({this.maxRetries = 2});
  // Tối đa 2 lần retry (3 attempt tổng)

  /// Tính delay theo exponential backoff: 1s → 2s → 4s
  Duration _backoff(int attempt) {
    // attempt bắt đầu từ 1
    if (attempt <= 1) return const Duration(seconds: 1);
    if (attempt == 2) return const Duration(seconds: 2);
    return const Duration(seconds: 4);
  }

  /// Kiểm tra có phải lỗi network/timeout được phép retry không
  bool _isRetryableNetworkError(DioException err) {
    // Nếu CÓ HTTP response → không retry (đây là lỗi từ server, không phải mạng)
    if (err.response != null) return false;

    // Retry các loại lỗi mạng/timeout
    if (_retryableTypes.contains(err.type)) return true;

    return false;
  }

  /// Kiểm tra request có phải endpoint refresh token không
  bool _isRefreshTokenRequest(RequestOptions options) {
    return options.path.contains(_refreshTokenPath);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Chỉ retry lỗi mạng/timeout
    if (!_isRetryableNetworkError(err)) {
      return handler.next(err);
    }

    // Không retry endpoint refresh token (tránh loop, AuthService tự xử lý)
    if (_isRefreshTokenRequest(err.requestOptions)) {
      return handler.next(err);
    }

    // Lấy số lần đã retry từ extra (lưu trạng thái trên request)
    final extra = err.requestOptions.extra;
    int retryCount = extra['retry_count'] as int? ?? 0;

    // Nếu đã retry đủ số lần tối đa → dừng
    if (retryCount >= maxRetries) {
      return handler.next(err);
    }

    // Tăng retry_count và tính delay
    retryCount++;
    final newOptions = err.requestOptions;
    newOptions.extra['retry_count'] = retryCount;
    final delay = _backoff(retryCount);

    // Chờ backoff rồi thử lại
    Timer(delay, () async {
      try {
        final response = await _retryRequest(newOptions);
        handler.resolve(response);
      } catch (retryError) {
        // Lỗi retry lần nữa → tiếp tục vòng retry qua onError của lần request mới
        handler.next(retryError is DioException ? retryError : err);
      }
    });
  }

  /// Thực hiện request lại với cùng options (đã tăng retry_count).
  ///
  /// QUAN TRỌNG: KHÔNG dùng `_dio.fetch` vì sẽ đi qua chính interceptor này
  /// lần nữa → retry chồng/trùng lặp (timer gốc + onError cùng xử lý).
  /// Dùng một Dio độc lập (không có interceptor nào) để retry đúng 1 lần.
  /// Auth header (Authorization) đã được TokenInterceptor.onRequest gắn vào
  /// `options.headers` từ lần gửi ban đầu → vẫn được giữ khi retry.
  Future<Response> _retryRequest(RequestOptions options) async {
    final dio = Dio(BaseOptions(
      baseUrl: options.baseUrl,
      connectTimeout: options.connectTimeout,
      receiveTimeout: options.receiveTimeout,
      sendTimeout: options.sendTimeout,
      headers: options.headers,
    ));
    return dio.request<dynamic>(
      options.path,
      data: options.data,
      queryParameters: options.queryParameters,
      options: Options(
        method: options.method,
        headers: options.headers,
        extra: options.extra,
        responseType: options.responseType,
        contentType: options.contentType,
        validateStatus: options.validateStatus,
      ),
    );
  }
}
