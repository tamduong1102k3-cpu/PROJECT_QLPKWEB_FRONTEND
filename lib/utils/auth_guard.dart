import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../screens/login/login_screen.dart';

/// Kiểm tra trạng thái đăng nhập trước khi cho phép navigate.
/// Trả về true nếu đã đăng nhập, false nếu chưa.
///
/// PHÂN BIỆT:
/// - AUTHENTICATED → cho phép truy cập
/// - UNVERIFIED (có token, backend chưa xác nhận do network/sleep)
///   → CHO PHÉP truy cập, KHÔNG bắt Login (người dùng vẫn có session/token)
/// - GUEST → "Vui lòng đăng nhập để sử dụng chức năng này."
/// - SESSION_EXPIRED → "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại."
Future<bool> requireLogin(BuildContext context) async {
  // Đảm bảo token đã load xong trước khi kiểm tra đăng nhập
  // (tránh trường hợp app vừa khởi động, token chưa đọc xong
  // nhưng đã check isLoggedIn → false → ép người dùng login lại)
  await AuthService().ensureTokenLoaded();

  // Kiểm tra context còn hợp lệ sau async gap
  if (!context.mounted) return false;

  final auth = AuthService();

  // AUTHENTICATED hoặc UNVERIFIED (có token) → cho phép truy cập,
  // không bắt Login. Tránh vòng lặp "network error → bắt Login".
  if (auth.isLoggedIn) {
    return true;
  }

  // Hiển thị thông báo khác nhau tùy trạng thái (GUEST vs SESSION_EXPIRED)
  String message;
  if (auth.status == AuthStatus.sessionExpired) {
    message = 'Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.';
  } else {
    message = 'Vui lòng đăng nhập để sử dụng chức năng này.';
  }

  // Hiện thông báo trước khi mở màn hình login
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      duration: const Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
    ),
  );

  // Chưa đăng nhập hoặc hết phiên → mở màn hình login
  final loggedIn = await Navigator.of(context).push<bool>(
    MaterialPageRoute(builder: (_) => const LoginScreen()),
  );

  return loggedIn == true;
}