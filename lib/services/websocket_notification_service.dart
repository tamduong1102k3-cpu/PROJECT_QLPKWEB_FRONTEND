import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../config/api_config.dart';
import 'auth_service.dart';
import 'push_notification_service.dart';

/// Service nhận thông báo realtime qua WebSocket (STOMP protocol).
/// Lắng nghe sự kiện từ /topic/thong-bao/{userId} khi backend tạo thông báo mới.
class WebSocketNotificationService {
  static final WebSocketNotificationService _instance =
      WebSocketNotificationService._internal();
  factory WebSocketNotificationService() => _instance;
  WebSocketNotificationService._internal();

  final AuthService _authService = AuthService();

  StompClient? _stompClient;
  bool _isConnected = false;
  Timer? _reconnectTimer;

  /// Exponential backoff cho reconnect khi mạng yếu/chập chờn.
  /// Lần đầu 5s, tăng dần: 5s → 10s → 20s → 40s → tối đa 2 phút.
  static const Duration _maxReconnectDelay = Duration(minutes: 2);
  Duration _currentReconnectDelay = const Duration(seconds: 5);

  /// Stream controller để thông báo cho UI khi có thông báo mới
  final StreamController<void> _notificationReloadController =
      StreamController<void>.broadcast();

  /// Stream controller cho số lượng chưa đọc thay đổi
  final StreamController<int> _unreadCountController =
      StreamController<int>.broadcast();

  /// Stream để UI subscribe nhận tín hiệu reload
  Stream<void> get onNotificationReload => _notificationReloadController.stream;

  /// Stream để UI subscribe nhận số lượng chưa đọc
  Stream<int> get onUnreadCountChanged => _unreadCountController.stream;

  /// Kết nối WebSocket STOMP (qua SockJS như backend config)
  void connect() {
    // Đảm bảo token đã load trước khi kết nối WebSocket
    if (!_authService.isLoggedIn) {
      debugPrint('WebSocket: User not logged in, skipping connection');
      return;
    }
    // Dùng maTaiKhoanBn (mã tài khoản) để subscribe topic thông báo
    // vì bảng thong_bao lưu theo ma_tai_khoan (maTaiKhoanBn)
    final userId = _authService.maTaiKhoanBn;
    if (userId == null) {
      debugPrint('WebSocket: maTaiKhoanBn is null, skipping connection');
      return;
    }
    debugPrint('WebSocket: Connecting with maTaiKhoanBn=$userId');

    // Ngắt kết nối cũ nếu có
    disconnect();

    // Chuyển đổi base URL từ HTTPS sang WSS cho WebSocket
    // https://qlpk-backend-spring-boot.onrender.com/api -> wss://qlpk-backend-spring-boot.onrender.com/ws
    final wsUrl = ApiConfig.baseUrl
        .replaceFirst('https://', 'wss://')
        .replaceFirst('http://', 'ws://')
        .replaceAll('/api', '');

    debugPrint('WebSocket connecting to: $wsUrl/ws');

    _stompClient = StompClient(
      config: StompConfig.sockJS(
        url: '$wsUrl/ws',
        onConnect: (StompFrame frame) {
          debugPrint('WebSocket STOMP connected successfully');
          _isConnected = true;

          // Reset backoff về mức thấp nhất sau khi kết nối thành công
          _currentReconnectDelay = const Duration(seconds: 5);

          // Subscribe vào topic thông báo của user này
          final topic = '/topic/thong-bao/$userId';
          _stompClient!.subscribe(
            destination: topic,
            callback: (StompFrame frame) {
              if (frame.body != null) {
                _handleNotificationEvent(frame.body!);
              }
            },
          );
          debugPrint('Subscribed to $topic');
        },
        onDisconnect: (StompFrame frame) {
          debugPrint('WebSocket STOMP disconnected');
          _isConnected = false;
          _scheduleReconnect();
        },
        onStompError: (StompFrame frame) {
          debugPrint('WebSocket STOMP error: ${frame.body}');
          _isConnected = false;
          _scheduleReconnect();
        },
        onWebSocketError: (dynamic error) {
          debugPrint('WebSocket error: $error');
          _isConnected = false;
          _scheduleReconnect();
        },
        onUnhandledFrame: (StompFrame frame) {
          debugPrint('Unhandled STOMP frame: ${frame.command} - ${frame.body}');
        },
        beforeConnect: () async {
          debugPrint('WebSocket STOMP beforeConnect...');
        },
        // Dùng SockJS để tương thích với backend .withSockJS()
        reconnectDelay: const Duration(seconds: 5),
        heartbeatIncoming: const Duration(seconds: 10),
        heartbeatOutgoing: const Duration(seconds: 10),
      ),
    );

    _stompClient!.activate();
  }

  /// Ngắt kết nối WebSocket
  void disconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    if (_stompClient != null && _isConnected) {
      try {
        _stompClient!.deactivate();
      } catch (e) {
        debugPrint('Error deactivating STOMP client: $e');
      }
    }
    _isConnected = false;
    _stompClient = null;
  }

  /// Lên lịch reconnect với exponential backoff.
  /// Mạng yếu/chập chờn sẽ không còn reconnect dồn dập mỗi 5 giây,
  /// thay vào đó thời gian tăng dần: 5s → 10s → 20s → 40s → 2 phút.
  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    final delay = _currentReconnectDelay;
    // Tăng gấp đôi cho lần sau (có giới hạn tối đa)
    _currentReconnectDelay = Duration(
      milliseconds: (_currentReconnectDelay.inMilliseconds * 2)
          .clamp(0, _maxReconnectDelay.inMilliseconds),
    );
    debugPrint(
        'WebSocket: scheduling reconnect in ${delay.inSeconds}s (backoff)');
    _reconnectTimer = Timer(delay, () {
      if (!_isConnected && _authService.isLoggedIn) {
        debugPrint('Attempting WebSocket reconnect...');
        connect();
      }
    });
  }

  /// Xử lý sự kiện thông báo nhận được từ WebSocket
  void _handleNotificationEvent(String body) {
    try {
      final data = jsonDecode(body) as Map<String, dynamic>;
      final action = data['action'] as String? ?? 'NEW';

      debugPrint('WebSocket notification event received: action=$action');

      // Gửi tín hiệu reload cho NotificationScreen
      _notificationReloadController.add(null);

      // Gửi tín hiệu cập nhật unread count
      if (action == 'NEW') {
        _unreadCountController.add(1);

        // Hiển thị local notification hệ thống (redundancy cho FCM)
        // Trường hợp FCM chưa kịp gửi hoặc gửi thất bại, user vẫn nhận được
        // thông báo đẩy trên điện thoại nhờ WebSocket
        final title = data['tieuDe'] as String? ?? 'Thông báo mới';
        final noiDung =
            data['noiDung'] as String? ?? 'Bạn có thông báo mới từ hệ thống';
        final referenceType = data['referenceType'] as String?;
        final referenceId = data['referenceId'];

        PushNotificationService().showNotification(
          id: DateTime.now().millisecondsSinceEpoch.remainder(2147483647),
          title: title,
          body: noiDung,
          payload: {
            'referenceType': referenceType ?? '',
            'referenceId': referenceId?.toString() ?? '',
          },
        );
      }
    } catch (e) {
      debugPrint('Error parsing notification event: $e');
    }
  }

  /// Gọi khi đăng nhập - kết nối WebSocket
  void onLogin() {
    connect();
  }

  /// Gọi khi đăng xuất - ngắt kết nối WebSocket
  void onLogout() {
    disconnect();
  }

  /// Dispose
  void dispose() {
    disconnect();
    _notificationReloadController.close();
    _unreadCountController.close();
  }
}