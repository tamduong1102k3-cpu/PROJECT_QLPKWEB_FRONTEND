import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../utils/toast_helper.dart';
import '../patient/email_verification_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  static const Color _primaryColor = Color(0xFF2196F3);
  static const Color _inputBgColor = Color(0xFFF8FAFC);

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    final username = _usernameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (username.isEmpty) {
      ToastHelper.warning(context: context, title: 'Thiếu thông tin', description: 'Vui lòng nhập tên đăng nhập');
      return;
    }

    if (email.isEmpty) {
      ToastHelper.warning(context: context, title: 'Thiếu thông tin', description: 'Vui lòng nhập email');
      return;
    }

    if (!_isValidEmail(email)) {
      ToastHelper.warning(context: context, title: 'Email không hợp lệ');
      return;
    }

    if (password.isEmpty) {
      ToastHelper.warning(context: context, title: 'Thiếu thông tin', description: 'Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 6) {
      ToastHelper.warning(context: context, title: 'Mật khẩu yếu', description: 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password != confirmPassword) {
      ToastHelper.warning(context: context, title: 'Mật khẩu không khớp', description: 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (phone.isNotEmpty && !_isValidPhone(phone)) {
      ToastHelper.warning(context: context, title: 'Số điện thoại không hợp lệ');
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _authService.register(
        username: username,
        email: email,
        password: password,
        phone: phone.isNotEmpty ? phone : null,
      );

      // Đăng ký thành công, gửi OTP xác thực email
      try {
        await _authService.sendOtpVerifyEmail(email);
      } catch (e) {
        debugPrint('Send OTP verify email error after register: $e');
      }

      if (!mounted) return;
      setState(() => _isLoading = false);

      // Đăng ký thành công, chuyển đến màn hình xác thực email
      ToastHelper.success(
        context: context,
        title: 'Đăng ký thành công!',
        description: 'Vui lòng kiểm tra email để xác thực.',
      );
      // Sau khi xác thực email xong, quay lại màn hình đăng nhập để đăng nhập
      final verified = await Navigator.of(context).push<bool>(
        MaterialPageRoute(
          builder: (_) => EmailVerificationScreen(email: email),
        ),
      );
      if (!mounted) return;
      // Nếu xác thực email thành công, pop về LoginScreen
      if (verified == true) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ToastHelper.error(
        context: context,
        title: 'Đăng ký thất bại',
        description: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        .hasMatch(email);
  }

  bool _isValidPhone(String phone) {
    return RegExp(r'^0[0-9]{9,10}$').hasMatch(phone);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black87, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Đăng ký tài khoản',
          style: TextStyle(color: Colors.black87, fontSize: 18, fontWeight: FontWeight.w600),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 30),

              // Avatar icon hiện đại với shadow
              Center(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _primaryColor.withOpacity(0.1),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: _primaryColor.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.person_add_alt_1_rounded,
                    size: 54,
                    color: _primaryColor,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Tiêu đề chính
              const Text(
                'Tạo tài khoản mới',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Đăng ký để đặt lịch khám nhanh chóng',
                style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
              ),
              const SizedBox(height: 36),

              // Form fields
              _buildInputField(
                label: 'Tên đăng nhập *',
                icon: Icons.person_outline_rounded,
                controller: _usernameController,
              ),
              const SizedBox(height: 18),

              _buildInputField(
                label: 'Email *',
                icon: Icons.mail_outline_rounded,
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 18),

              _buildInputField(
                label: 'Số điện thoại',
                icon: Icons.phone_android_rounded,
                controller: _phoneController,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 18),

              _buildInputField(
                label: 'Mật khẩu *',
                icon: Icons.lock_outline_rounded,
                controller: _passwordController,
                isPassword: true,
                obscureText: _obscurePassword,
                onSuffixTap: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              const SizedBox(height: 18),

              _buildInputField(
                label: 'Xác nhận mật khẩu *',
                icon: Icons.lock_outline_rounded,
                controller: _confirmPasswordController,
                isPassword: true,
                obscureText: _obscureConfirmPassword,
                onSuffixTap: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),

              const Padding(
                padding: EdgeInsets.only(top: 10.0, left: 4.0),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Mật khẩu phải có ít nhất 6 ký tự',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // Nút Đăng ký hiện đại
              Container(
                width: double.infinity,
                height: 52,
                decoration: BoxDecoration(
                  boxShadow: [
                    BoxShadow(
                      color: _primaryColor.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryColor,
                    disabledBackgroundColor: _primaryColor.withOpacity(0.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Đăng ký',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 32),

              // Điều hướng sang Đăng nhập
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Đã có tài khoản? ',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Text(
                      'Đăng nhập ngay',
                      style: TextStyle(
                        color: _primaryColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required IconData icon,
    required TextEditingController controller,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onSuffixTap,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: const TextStyle(color: Color(0xFF1E293B), fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
        prefixIcon: Icon(icon, color: const Color(0xFF94A3B8), size: 22),
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(
                  obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: const Color(0xFF94A3B8),
                  size: 20,
                ),
                onPressed: onSuffixTap,
              )
            : null,
        filled: true,
        fillColor: _inputBgColor,
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: _primaryColor, width: 1.5),
        ),
      ),
    );
  }
}