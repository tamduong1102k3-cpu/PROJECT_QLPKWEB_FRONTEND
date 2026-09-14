import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/thong_bao_api_service.dart';
import '../../services/websocket_notification_service.dart';
import '../../services/auth_service.dart';
import '../../services/benh_nhan_service.dart';
import '../../models/thong_bao_model.dart';
import 'widgets/notification_card.dart';
import '../../repositories/lich_kham_repository.dart';
import '../appointment/appointment_detail_screen.dart';
import '../examination/invoice_detail_screen.dart';
import 'package:toastification/toastification.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  int _selectedTab = 0;
  final _apiService = ThongBaoApiService();
  final _authService = AuthService();
  final _wsService = WebSocketNotificationService();
  StreamSubscription<void>? _wsReloadSub;
  Timer? _pollingTimer;

  List<ThongBaoModel> _allNotifications = [];
  bool _isLoading = true;
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    // Load dữ liệu ngay lập tức (token đã được load từ SplashScreen)
    _checkLoginAndLoad();

    // Lắng nghe sự kiện WebSocket để reload danh sách thông báo ngay lập tức
    _wsReloadSub = _wsService.onNotificationReload.listen((_) {
      debugPrint('NotificationScreen: WebSocket reload event received');
      _loadNotifications();
    });

    // Polling backup mỗi 30 giây (khi WebSocket không kết nối được)
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _loadNotifications();
    });
  }

  @override
  void dispose() {
    _wsReloadSub?.cancel();
    _pollingTimer?.cancel();
    super.dispose();
  }

  /// Kiểm tra JWT token trước khi fetch, nếu chưa login thì không fetch
  void _checkLoginAndLoad() {
    _isLoggedIn = _authService.isLoggedIn;
    debugPrint('NotificationScreen - isLoggedIn: $_isLoggedIn');
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    // Kiểm tra JWT token trực tiếp từ AuthService (luôn mới nhất)
    final loggedIn = _authService.isLoggedIn;
    debugPrint('NotificationScreen._loadNotifications - isLoggedIn: $loggedIn');

    if (!loggedIn) {
      setState(() {
        _isLoggedIn = false;
        _allNotifications = [];
        _isLoading = false;
      });
      return;
    }

    // Cập nhật _isLoggedIn cho UI
    if (_isLoggedIn != loggedIn) {
      setState(() => _isLoggedIn = loggedIn);
    }

    setState(() => _isLoading = true);

    bool? chiChuaDoc;
    switch (_selectedTab) {
      case 1: // Chưa đọc
        chiChuaDoc = true;
        break;
      // case 0 (Tất cả): lấy tất cả thông báo
    }

    // Backend đã lọc sẵn theo chiChuaDoc khi chiChuaDoc=true
    try {
      final list = await _apiService.getThongBao(
        chiChuaDoc: chiChuaDoc,
      );

      if (!mounted) return;
      setState(() {
        _allNotifications = list;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('NotificationScreen._loadNotifications - lỗi tải thông báo: $e');
      if (!mounted) return;
      // Bắt lỗi (vd: 401 token hết hạn) để không kẹt màn hình loading vĩnh viễn
      setState(() {
        _allNotifications = [];
        _isLoading = false;
      });
    }
  }

  /// Danh sách thông báo hiển thị theo tab
  /// Backend đã lọc sẵn (chiChuaDoc) nên không cần filter client-side
  List<ThongBaoModel> get _visibleNotifications => _allNotifications;

  Future<void> _markAllAsRead() async {
    bool success;
    try {
      success = await _apiService.markAllAsRead();
    } catch (e) {
      debugPrint('NotificationScreen._markAllAsRead - lỗi: $e');
      return;
    }
    if (!mounted) return;

    if (success) {
      toastification.show(
        context: context,
        title: const Text('Đã đánh dấu tất cả là đã đọc'),
        autoCloseDuration: const Duration(seconds: 2),
      );
      _loadNotifications();
    }
  }

  /// Xóa 1 thông báo (xóa hẳn khỏi cơ sở dữ liệu)
  Future<void> _deleteNotification(ThongBaoModel notif) async {
    // Xác nhận trước khi xóa
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Xóa thông báo'),
        content: Text('Bạn có chắc muốn xóa thông báo "${notif.tieuDe}" không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Xóa', style: TextStyle(color: Color(0xFFDC2626))),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    bool success;
    try {
      success = await _apiService.deleteNotif(notif.id);
    } catch (e) {
      debugPrint('NotificationScreen._deleteNotification - lỗi: $e');
      return;
    }
    if (!mounted) return;

    if (success) {
      toastification.show(
        context: context,
        title: const Text('Đã xóa thông báo'),
        autoCloseDuration: const Duration(seconds: 2),
      );
      _loadNotifications();
    }
  }

  void _onNotificationTap(ThongBaoModel notif) async {
    // Đánh dấu đã đọc
    if (!notif.daDoc) {
      try {
        await _apiService.markAsRead(notif.id);
      } catch (e) {
        debugPrint('NotificationScreen._onNotificationTap - lỗi đánh dấu đã đọc: $e');
      }
      _loadNotifications();
    }

    // Deep linking - nếu có referenceType là LICH_KHAM và referenceId
    if (notif.referenceType == 'LICH_KHAM' && notif.referenceIdAsInt != null) {
      try {
        final lichKhamRepo = LichKhamRepository();
        final appointment = await lichKhamRepo.getById(notif.referenceIdAsInt!);
        if (!mounted) return;
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => AppointmentDetailScreen(appointment: appointment),
          ),
        );
      } catch (e) {
        debugPrint('Error navigating to appointment detail: $e');
      }
      return;
    }

    // Deep linking - nếu có referenceType là HOA_DON và referenceId (mã hóa đơn)
    if (notif.referenceType == 'HOA_DON' && notif.referenceIdAsInt != null) {
      try {
        final maHoaDon = notif.referenceIdAsInt!;
        debugPrint('NotificationScreen: navigating to invoice maHoaDon=$maHoaDon');

        // Gọi API lấy hóa đơn theo mã để lấy maPhieuKham
        final benhNhanService = BenhNhanService();
        final hoaDon = await benhNhanService.getHoaDonById(maHoaDon);
        final maPhieuKham = hoaDon['maPhieuKham'] as int?;

        if (maPhieuKham != null) {
          if (!mounted) return;
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => InvoiceDetailScreen(maPhieuKham: maPhieuKham),
            ),
          );
        } else {
          debugPrint('NotificationScreen: HoaDon $maHoaDon has no maPhieuKham');
        }
      } catch (e) {
        debugPrint('Error navigating to invoice detail: $e');
      }
      return;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFD4EAF7),
            Color(0xFFFFFFFF),
          ],
        ),
      ),
      child: Column(
        children: [
          _buildHeader(),
          _buildTabs(),
          Expanded(child: _buildContent()),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    // Nếu chưa đăng nhập
    if (!_isLoggedIn) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_off_rounded,
              size: 64,
              color: const Color(0xFF94A3B8).withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            const Text(
              'Vui lòng đăng nhập',
              style: TextStyle(
                fontSize: 16,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Đăng nhập để xem thông báo\nvề lịch hẹn, thanh toán',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: const Color(0xFF94A3B8).withValues(alpha: 0.8),
                height: 1.5,
              ),
            ),
          ],
        ),
      );
    }

    final visibleList = _visibleNotifications;

    if (visibleList.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadNotifications,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SizedBox(
            height: MediaQuery.of(context).size.height * 0.6,
            child: _buildEmptyState(),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadNotifications,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(top: 8, bottom: 20),
        itemCount: visibleList.length,
        itemBuilder: (context, index) {
          final notif = visibleList[index];
          return NotificationCard(
            title: notif.tieuDe,
            description: notif.noiDung,
            time: notif.timeAgo,
            isRead: notif.daDoc,
            referenceType: notif.referenceType ?? '',
            onTap: () => _onNotificationTap(notif),
            onDelete: () => _deleteNotification(notif),
          );
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 8, 0),
      child: Row(
        children: [
          const Text(
            'Thông báo',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const Spacer(),
          // Chỉ hiển thị các nút hành động khi đã login
          if (_isLoggedIn) _buildHeaderActions(),
        ],
      ),
    );
  }

  /// Header action: "Đã đọc tất cả"
  Widget _buildHeaderActions() {
    return FutureBuilder<int>(
      future: _apiService.getUnreadCount(),
      builder: (context, snapshot) {
        final unreadCount = snapshot.data ?? 0;
        final hasUnread = unreadCount > 0;
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (hasUnread)
              TextButton.icon(
                onPressed: _markAllAsRead,
                icon: const Icon(Icons.done_all_rounded, size: 18),
                label: const Text(
                  'Đã đọc tất cả',
                  style: TextStyle(fontSize: 13),
                ),
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF0F766E),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildTabs() {
    final tabs = ['Tất cả', 'Chưa đọc'];

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: List.generate(tabs.length, (index) {
          final isSelected = _selectedTab == index;
          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() => _selectedTab = index);
                _checkLoginAndLoad();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          ),
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      tabs[index],
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                        color: isSelected
                            ? const Color(0xFF0F766E)
                            : const Color(0xFF64748B),
                      ),
                    ),
                    // Chỉ hiển thị badge đếm khi đã login
                    if (index == 1 && _isLoggedIn)
                      FutureBuilder<int>(
                        future: _apiService.getUnreadCount(),
                        builder: (context, snapshot) {
                          final count = snapshot.data ?? 0;
                          if (count > 0) {
                            return Padding(
                              padding: const EdgeInsets.only(left: 6),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF3B82F6),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '$count',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off_rounded,
            size: 64,
            color: const Color(0xFF94A3B8).withValues(alpha: 0.5),
          ),
          const SizedBox(height: 16),
          Text(
            _selectedTab == 1
                ? 'Không có thông báo chưa đọc'
                : 'Chưa có thông báo nào',
            style: const TextStyle(
              fontSize: 16,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Các thông báo về lịch hẹn, thanh toán\nsẽ hiển thị tại đây',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: const Color(0xFF94A3B8).withValues(alpha: 0.8),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}