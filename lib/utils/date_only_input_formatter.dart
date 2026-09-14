import 'package:flutter/services.dart';

/// Formatter cho ô nhập ngày dạng dd/MM/yyyy.
///
/// - Chỉ cho phép nhập SỐ (loại bỏ mọi ký tự khác, kể cả dán).
/// - Tự động chèn "/" sau 2 chữ số đầu (ngày) và sau 2 chữ số tiếp (tháng):
///   gõ `20052000` → `20/05/2000`, gõ `20` → `20/`, gõ `2005` → `20/05/`.
/// - Giới hạn tối đa 8 chữ số (ddMMyyyy).
class DateOnlyInputFormatter extends TextInputFormatter {
  /// Số chữ số tối đa = 8 (2 ngày + 2 tháng + 4 năm).
  static const int _maxDigits = 8;

  static String format(String raw) {
    // Chỉ giữ lại chữ số
    final digits = raw.replaceAll(RegExp(r'\D'), '');
    final limited = digits.length > _maxDigits
        ? digits.substring(0, _maxDigits)
        : digits;

    // Chèn "/" sau vị trí 2 (ngày) và 4 (tháng) — luôn thêm cả khi ở cuối,
    // để người dùng thấy ngay: gõ "20" → "20/", gõ "2005" → "20/05/".
    final buffer = StringBuffer();
    for (var i = 0; i < limited.length; i++) {
      buffer.write(limited[i]);
      if (i == 1 || i == 3) {
        buffer.write('/');
      }
    }
    return buffer.toString();
  }

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final formatted = format(newValue.text);

    // Giữ con trỏ ở cuối chuỗi sau khi auto-format
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
