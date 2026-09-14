import 'package:flutter/material.dart';
import '../../core/dio_client.dart';
import '../../services/auth_service.dart';
import '../../utils/toast_helper.dart';
import '../login/login_screen.dart';
import 'change_password_screen.dart';
import 'update_patient_info_screen.dart';
import '../appointment/appointment_management_screen.dart';
import '../examination/examination_screen.dart';
import 'all_examinations_screen.dart';
import 'all_prescriptions_screen.dart';

class AccountScreen extends StatefulWidget {
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  final _authService = AuthService();
  Map<String, dynamic>? _accountInfo;
  bool _isLoadingAccount = false;

  static const Color _primaryColor = Color(0xFF0891B2);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _dividerColor = Color(0xFFF1F5F9);
  static const Color _bgSection = Color(0xFFF8FAFC);
  static const Color _destructiveColor = Color(0xFFDC2626);
  static const Color _arrowColor = Color(0xFFCBD5E1);

  @override
  void initState() {
    super.initState();
    if (_authService.isLoggedIn) {
      _loadAccountInfo();
    }
  }

  /// Gọi API lấy thông tin tài khoản từ server qua Dio (có token tự động)
  Future<void> _loadAccountInfo() async {
    final maTaiKhoan = _authService.maTaiKhoanBn;
    if (maTaiKhoan == null) return;

    setState(() => _isLoadingAccount = true);
    try {
      final response = await DioClient().dio.get(
        '/tai-khoan-benh-nhan/$maTaiKhoan',
      );
      if (mounted) {
        setState(() {
          _accountInfo = response.data as Map<String, dynamic>;
          _isLoadingAccount = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingAccount = false);
      }
    }
  }

  /// Lấy giá trị từ API hoặc fallback từ JWT
  String? get _email =>
      _accountInfo?['email'] as String? ?? _authService.currentUser?.email;
  String? get _soDienThoai =>
      _accountInfo?['soDienThoai'] as String? ??
      _authService.currentUser?.soDienThoai;
  String? get _username =>
      _accountInfo?['username'] as String? ??
      _authService.currentUser?.username;
  bool get _emailVerified =>
      _accountInfo?['emailVerified'] as bool? ??
      _authService.currentUser?.emailVerified ??
      false;

  @override
  Widget build(BuildContext context) {
    if (!_authService.isLoggedIn) {
      return _buildNotLoggedInUI();
    }

    return _buildLoggedInUI();
  }

  // ===== GIAO DIỆN CHƯA ĐĂNG NHẬP =====
  Widget _buildNotLoggedInUI() {
    return SizedBox.expand(
      child: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFECFEFF), Color(0xFFF0FDFA), Colors.white],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [_primaryColor, Color(0xFF22D3EE)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.person_outline_rounded,
                      size: 56,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'Chào bạn!',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: _foregroundColor,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Đăng nhập để quản lý hồ sơ bệnh án,\nđặt lịch khám và theo dõi sức khỏe',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: _mutedForeground,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: const LinearGradient(
                          colors: [_primaryColor, Color(0xFF22D3EE)],
                        ),
                      ),
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context)
                              .push(
                                MaterialPageRoute(
                                  builder: (_) => const LoginScreen(),
                                ),
                              )
                              .then((loggedIn) {
                                if (loggedIn == true && mounted) {
                                  setState(() {});
                                  _loadAccountInfo();
                                }
                              });
                        },
                        icon: const Icon(Icons.login_rounded, size: 20),
                        label: const Text(
                          'Đăng nhập ngay',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          foregroundColor: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ===== GIAO DIỆN ĐÃ ĐĂNG NHẬP =====
  Widget _buildLoggedInUI() {
    final email = _email ?? 'Người dùng';
    final soDienThoai = _soDienThoai;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Thiết lập tài khoản',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: _foregroundColor,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: false,
        actions: [
          IconButton(
            icon: Icon(
              Icons.refresh_rounded,
              color: _isLoadingAccount ? _mutedForeground : _primaryColor,
            ),
            onPressed: _isLoadingAccount ? null : _loadAccountInfo,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadAccountInfo,
        child: SizedBox.expand(
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // === AVATAR + THÔNG TIN (có banner nền) ===
                      Container(
                        width: double.infinity,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Color(0xFF0891B2), Color(0xFF0E7490)],
                          ),
                        ),
                        padding: const EdgeInsets.only(top: 32, bottom: 24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Avatar + icon camera
                            Stack(
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.white,
                                      width: 3,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(
                                          alpha: 0.15,
                                        ),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: ClipOval(
                                    child: Image.asset(
                                      'assets/images/user.png',
                                      width: 100,
                                      height: 100,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(
                                            alpha: 0.1,
                                          ),
                                          blurRadius: 4,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt_rounded,
                                      size: 18,
                                      color: Color(0xFF0891B2),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            Text(
                              _username ?? email,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              email,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 13,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                      ),

                      Container(height: 8, color: _bgSection),

                      // === NHÓM: CÀI ĐẶT TÀI KHOẢN ===
                      _buildGroupHeader('Cài đặt tài khoản'),
                      _buildFlatMenuRow(
                        icon: Icons.edit_outlined,
                        title: 'Cập nhật thông tin',
                        onTap: _navigateToUpdatePatientInfo,
                      ),
                      _buildDivider(),
                      _buildFlatMenuRow(
                        icon: Icons.lock_outline_rounded,
                        title: 'Đổi mật khẩu',
                        onTap: _navigateToChangePassword,
                      ),
                      _buildDivider(),
                      _buildFlatMenuRow(
                        icon: Icons.calendar_month_outlined,
                        title: 'Xem lịch khám',
                        onTap: _navigateToAppointmentBooking,
                      ),
                      _buildDivider(),
                      _buildFlatMenuRow(
                        icon: Icons.receipt_long_outlined,
                        title: 'Xem hóa đơn',
                        onTap: _navigateToExamination,
                      ),
                      _buildDivider(),
                      _buildFlatMenuRow(
                        icon: Icons.list_alt_rounded,
                        title: 'Xem tất cả phiếu khám',
                        onTap: _navigateToAllExaminations,
                      ),
                      _buildDivider(),
                      _buildFlatMenuRow(
                        icon: Icons.medication_outlined,
                        title: 'Xem toa thuốc',
                        onTap: _navigateToAllPrescriptions,
                      ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),

              // === NÚT ĐĂNG XUẤT Ở DƯỚI ===
              Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    top: BorderSide(color: Color(0xFFE2E8F0), width: 1),
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: () => _showLogoutConfirmation(),
                    icon: const Icon(Icons.logout_rounded, size: 20),
                    label: const Text(
                      'Đăng xuất',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _destructiveColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGroupHeader(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
      color: _bgSection,
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: _mutedForeground,
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      margin: const EdgeInsets.only(left: 52),
      height: 1,
      color: _dividerColor,
    );
  }

  // === DÒNG MENU DẠNG PHẲNG (Flat List-style như Shopee) ===
  Widget _buildFlatMenuRow({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        color: Colors.white,
        child: Row(
          children: [
            Icon(icon, size: 22, color: _mutedForeground),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  color: _foregroundColor,
                ),
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios_rounded,
              size: 14,
              color: _arrowColor,
            ),
          ],
        ),
      ),
    );
  }

  // ===== CHỨC NĂNG ĐIỀU HƯỚNG =====

  void _navigateToAccountDetail() {
    final email = _email ?? 'Người dùng';
    final maTaiKhoan = _authService.maTaiKhoanBn;
    final soDienThoai = _soDienThoai;
    final maBenhNhan = _authService.maBenhNhan;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Center(
                child: Text(
                  'Thông tin tài khoản',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: _foregroundColor,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              _buildDetailRow(label: 'Tên đăng nhập', value: _username ?? '--'),
              _buildDetailRow(label: 'Email', value: email),
              if (soDienThoai != null && soDienThoai.isNotEmpty)
                _buildDetailRow(label: 'Số điện thoại', value: soDienThoai),
              if (maBenhNhan != null)
                _buildDetailRow(
                  label: 'Mã bệnh nhân',
                  value: maBenhNhan.toString(),
                ),
              _buildDetailRow(
                label: 'Mã tài khoản',
                value: maTaiKhoan.toString(),
              ),
              _buildDetailRow(
                label: 'Trạng thái xác thực',
                value: _emailVerified ? 'Đã xác thực' : 'Chưa xác thực',
                valueColor: _emailVerified ? Colors.green : Colors.orange,
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Đóng',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontSize: 14, color: _mutedForeground),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: valueColor ?? _foregroundColor,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _navigateToAllExaminations() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const AllExaminationsScreen()));
  }

  void _navigateToAllPrescriptions() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const AllPrescriptionsScreen()));
  }

  void _navigateToChangePassword() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const ChangePasswordScreen()));
  }

  void _navigateToAppointmentBooking() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const AppointmentManagementScreen()),
    );
  }

  void _navigateToExamination() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const ExaminationScreen()));
  }

  void _navigateToUpdatePatientInfo() {
    Navigator.of(context)
        .push(
          MaterialPageRoute(builder: (_) => const UpdatePatientInfoScreen()),
        )
        .then((updated) {
          if (updated == true && mounted) {
            setState(() {});
          }
        });
  }

  // ===== POPUP XÁC NHẬN ĐĂNG XUẤT =====
  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: _destructiveColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.logout_rounded,
                size: 28,
                color: _destructiveColor,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Đăng xuất',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: _foregroundColor,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: _mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 46,
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(ctx).pop(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: _mutedForeground,
                        side: BorderSide(
                          color: _mutedForeground.withValues(alpha: 0.3),
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: const Text(
                        'Hủy',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 46,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(ctx).pop();
                        _authService.logout();
                        setState(() {
                          _accountInfo = null;
                        });
                        ToastHelper.info(
                          context: context,
                          title: 'Đã đăng xuất',
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _destructiveColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Đăng xuất',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
