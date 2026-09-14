import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

/// Khởi tạo Firebase và lấy FCM Token
class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  bool _initialized = false;
  String? _fcmToken;

  String? get fcmToken => _fcmToken;
  set fcmToken(String? value) => _fcmToken = value;
  bool get isInitialized => _initialized;

  /// Khởi tạo Firebase
  Future<void> initialize() async {
    if (_initialized) return;
    try {
      await Firebase.initializeApp();
      _initialized = true;
      debugPrint('Firebase initialized successfully');
    } catch (e) {
      debugPrint('Firebase initialization error: $e');
    }
  }

  /// Lấy FCM Token từ Firebase
  Future<String?> getFcmToken() async {
    if (!_initialized) {
      await initialize();
    }
    try {
      final messaging = FirebaseMessaging.instance;
      final token = await messaging.getToken();
      _fcmToken = token;
      debugPrint('FCM Token: $token');
      return token;
    } catch (e) {
      debugPrint('Error getting FCM token: $e');
      return null;
    }
  }

  /// Lắng nghe sự thay đổi của FCM Token
  void onTokenRefresh(Function(String) onNewToken) {
    FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
      debugPrint('FCM Token refreshed: $newToken');
      _fcmToken = newToken;
      onNewToken(newToken);
    });
  }

  /// Yêu cầu quyền thông báo
  Future<bool> requestNotificationPermission() async {
    if (!_initialized) return false;
    try {
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        announcement: true,
        carPlay: false,
        criticalAlert: true,
        provisional: false,
      );
      debugPrint('Notification permission status: ${settings.authorizationStatus}');
      return settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional;
    } catch (e) {
      debugPrint('Error requesting notification permission: $e');
      return false;
    }
  }
}