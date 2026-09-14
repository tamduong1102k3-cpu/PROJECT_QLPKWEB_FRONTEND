import 'package:flutter/material.dart';
import 'dart:async';
import 'home/home_screen.dart';
import 'profile/profile_screen.dart';
import 'appointment/appointment_booking_screen.dart';
import 'notification/notification_screen.dart';
import 'account/account_screen.dart';
import '../services/auth_service.dart';
import '../services/thong_bao_api_service.dart';
import '../services/websocket_notification_service.dart';
import '../utils/auth_guard.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> with WidgetsBindingObserver {
  int _selectedIndex = 0;
  int _unreadCount = 0;
  Timer? _unreadTimer;
  StreamSubscription<void>? _wsReloadSub;
  StreamSubscription<int>? _wsUnreadSub;
  StreamSubscription<void>? _sessionExpiredSub;
  final _authService = AuthService();
  final _wsService = WebSocketNotificationService();

  /// Tăng lên mỗi khi login/logout để force rebuild tất cả các screen con
  int _loginStateVersion = 0;

  /// Danh sách tab index yêu cầu đăng nhập để hiển thị nội dung
  static const List<int> _authRequiredTabs = [1, 2, 3, 4]; // profile, booking, notification, account

  List<Widget> get _screens {
    final key = _loginStateVersion;
    return [
      HomeScreen(key: ValueKey('home_$key')),
      ProfileScreen(key: ValueKey('profile_$key')),
      AppointmentBookingScreen(key: ValueKey('booking_$key')),
      NotificationScreen(key: ValueKey('notification_$key')),
      AccountScreen(key: ValueKey('account_$key')),
    ];
  }

  @override
  void initState() {
    super.initState();
    // Đăng ký lifecycle observer
    WidgetsBinding.instance.addObserver(this);

    // Lắng nghe sự kiện WebSocket thông báo để cập nhật số lượng chưa đọc
    _wsUnreadSub = _wsService.onUnreadCountChanged.listen((increment) {
      if (!mounted) return;
      setState(() {
        _unreadCount += increment;
      });
    });

    // Lắng nghe sự kiện reload để fetch lại số lượng chưa đọc chính xác
    _wsReloadSub = _wsService.onNotificationReload.listen((_) {
      _fetchUnreadCount();
    });

    // Lắng nghe sự kiện session expired
    _sessionExpiredSub = _authService.sessionExpiredStream.listen((_) {
      _handleSessionExpired();
    });

    // Poll unread count every 30 giấy (backup khi WebSocket không kết nối được)
    _unreadTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _fetchUnreadCount();
    });

    // Dùng post-frame callback để đảm bảo token đã load xong trước khi gọi API
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchUnreadCount();
      if (_authService.isLoggedIn) {
        _wsService.connect();
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _unreadTimer?.cancel();
    _wsReloadSub?.cancel();
    _wsUnreadSub?.cancel();
    _sessionExpiredSub?.cancel();
    super.dispose();
  }

  /// Xử lý khi session expired (refresh token invalid).
  /// Chuyển về trạng thái Guest: về Home, ép rebuild toàn bộ screens,
  /// hiển thị thông báo rõ ràng. KHÔNG navigate khỏi MainScreen.
  void _handleSessionExpired() {
    if (!mounted) return;

    // Ngắt kết nối WebSocket thông báo — session đã hết
    _wsService.disconnect();

    setState(() {
      // isLoggedIn đã là false do handleSessionExpired() → chuyển về Home
      _selectedIndex = 0;
      _loginStateVersion++; // Force rebuild screens để cập nhật trạng thái guest
      _unreadCount = 0;
    });

    // Hiện thông báo tại Home (UI chắc chắn đã mount → an toàn)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.'),
          duration: Duration(seconds: 5),
          behavior: SnackBarBehavior.floating,
        ),
      );
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      // Khi app từ background quay lại → kiểm tra session
      _checkSessionOnResume();
    }
  }

  /// Kiểm tra session khi app resume từ background
  Future<void> _checkSessionOnResume() async {
    // Đảm bảo token đã load xong trước khi quyết định
    await _authService.ensureTokenLoaded();
    if (!mounted) return;

    if (!_authService.isLoggedIn) {
      // Nếu đang ở tab cần auth nhưng session đã hết → chuyển về Home
      if (_authRequiredTabs.contains(_selectedIndex)) {
        setState(() {
          _selectedIndex = 0;
          _loginStateVersion++; // Force rebuild screens
        });
      }
      return;
    }

    // Nếu đã login, fetch lại unread count
    _fetchUnreadCount();
  }

  Future<void> _fetchUnreadCount() async {
    // Đảm bảo token đã load xong trước khi gọi API
    if (!_authService.isTokenLoaded) {
      await _authService.ensureTokenLoaded();
      if (!mounted) return;
    }

    // Nếu chưa đăng nhập thì không cần fetch unread count
    if (!_authService.isLoggedIn) return;

    // Gọi API lấy số thông báo chưa đọc
    try {
      final count = await ThongBaoApiService().getUnreadCount();
      if (!mounted) return;
      if (_unreadCount != count) {
        setState(() => _unreadCount = count);
      }
    } catch (e) {
      debugPrint('MainScreen._fetchUnreadCount error: $e');
    }
  }

  void _onItemTapped(int index) async {
    // Index 0 = Trang chủ (public), các index khác yêu cầu đăng nhập
    if (index > 0) {
      final loggedIn = await requireLogin(context);
      if (!loggedIn || !mounted) return;
    }

    setState(() {
      _selectedIndex = index;
    });

    // Refresh unread count when switching to notification tab
    if (index == 3) {
      _fetchUnreadCount();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Container(
          color: Colors.white,
          width: double.infinity,
          height: double.infinity,
          child: IndexedStack(
            index: _selectedIndex,
            children: _screens,
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Trang chủ',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.folder_outlined),
            activeIcon: Icon(Icons.folder),
            label: 'Hồ sơ',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month_outlined),
            activeIcon: Icon(Icons.calendar_month),
            label: 'Đặt lịch hẹn',
          ),
          BottomNavigationBarItem(
            icon: _unreadCount > 0
                ? Badge(
                    label: Text(
                      _unreadCount > 99 ? '99+' : '$_unreadCount',
                      style: const TextStyle(fontSize: 10, color: Colors.white),
                    ),
                    child: const Icon(Icons.notifications_outlined),
                  )
                : const Icon(Icons.notifications_outlined),
            activeIcon: _unreadCount > 0
                ? Badge(
                    label: Text(
                      _unreadCount > 99 ? '99+' : '$_unreadCount',
                      style: const TextStyle(fontSize: 10, color: Colors.white),
                    ),
                    child: const Icon(Icons.notifications),
                  )
                : const Icon(Icons.notifications),
            label: 'Thông báo',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Tài khoản',
          ),
        ],
      ),
    );
  }
}