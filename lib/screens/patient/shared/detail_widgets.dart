import 'package:flutter/material.dart';

// ==================== SHARED WIDGETS ====================

String _capitalizeFirstLetter(String text) {
  if (text.isEmpty) return text;
  final trimmed = text.trim();
  if (trimmed.isEmpty) return '';
  return trimmed[0].toUpperCase() + trimmed.substring(1);
}

Widget buildSectionCard({
  required IconData icon,
  required Color iconColor,
  required String title,
  String? content,
  Widget? child,
  double leftPadding = 28.0,
}) {
  final displayContent = content != null ? _capitalizeFirstLetter(content) : null;

  return Container(
    margin: const EdgeInsets.only(bottom: 12),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: const Color(0xFFE2E8F0)), // Slate-200 flat border
    ),
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 18),
              const SizedBox(width: 8),
              Text(
                title.toUpperCase(),
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B), // Slate-800
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          if (displayContent != null || child != null) ...[
            const SizedBox(height: 8),
            Container(height: 1, color: const Color(0xFFE2E8F0)),
            const SizedBox(height: 12),
          ],
          if (displayContent != null)
            Padding(
              padding: EdgeInsets.only(left: leftPadding),
              child: Text(
                displayContent,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF334155), // Slate-700
                  height: 1.4,
                ),
              ),
            ),
          if (child != null)
            Padding(
              padding: EdgeInsets.only(left: leftPadding),
              child: child,
            ),
        ],
      ),
    ),
  );
}

Widget buildStatusBadge(String trangThai) {
  Color bg;
  Color fg;
  String displayText;

  final normalized = trangThai.trim().toLowerCase();
  switch (normalized) {
    case 'hoan_thanh':
    case 'hoàn thành':
    case 'da_kham':
    case 'đã khám':
    case 'complete':
      bg = const Color(0xFFDCFCE7); // Green-100
      fg = const Color(0xFF16A34A); // Green-600
      displayText = 'Hoàn thành';
      break;
    case 'dang_kham':
    case 'đang khám':
    case 'đang thực hiện':
    case 'dang_thuc_hien':
      bg = const Color(0xFFFFFBEB); // Amber-50
      fg = const Color(0xFFD97706); // Amber-600
      displayText = 'Đang khám';
      break;
    case 'da_thuc_hien':
    case 'đã thực hiện':
      bg = const Color(0xFFDCFCE7); // Green-100
      fg = const Color(0xFF16A34A); // Green-600
      displayText = 'Đã thực hiện';
      break;
    case 'chua_thuc_hien':
    case 'chưa thực hiện':
      bg = const Color(0xFFF1F5F9); // Slate-100
      fg = const Color(0xFF64748B); // Slate-500
      displayText = 'Chưa thực hiện';
      break;
    case 'cho_kham':
    case 'chờ khám':
    case 'pending':
    case 'chờ kết quả':
      bg = const Color(0xFFF1F5F9); // Slate-100
      fg = const Color(0xFF0F766E); // Teal-700
      displayText = 'Chờ khám';
      break;
    case 'cho_bac_si':
    case 'chờ bác sĩ':
      bg = const Color(0xFFFFFBEB);
      fg = const Color(0xFFD97706);
      displayText = 'Chờ bác sĩ';
      break;
    case 'cho_cls':
    case 'chờ cls':
      bg = const Color(0xFFFFFBEB);
      fg = const Color(0xFFD97706);
      displayText = 'Chờ CLS';
      break;
    case 'da_kham_lam_sang':
    case 'đã khám lâm sàng':
      bg = const Color(0xFFDCFCE7);
      fg = const Color(0xFF16A34A);
      displayText = 'Đã khám lâm sàng';
      break;
    case 'cho':
    case 'chờ':
      bg = const Color(0xFFF1F5F9);
      fg = const Color(0xFF0F766E);
      displayText = 'Chờ';
      break;
    case 'huy':
    case 'hủy':
      bg = const Color(0xFFFEE2E2); // Red-100
      fg = const Color(0xFFEF4444); // Red-500
      displayText = 'Đã hủy';
      break;
    default:
      bg = const Color(0xFFF1F5F9);
      fg = const Color(0xFF64748B);
      displayText = trangThai;
  }

  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(
      color: bg,
      borderRadius: BorderRadius.circular(6),
    ),
    child: Text(
      displayText.toUpperCase(),
      style: TextStyle(
        fontSize: 10,
        color: fg,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
      ),
    ),
  );
}

Widget buildTrangThaiChip(String trangThai) {
  return buildStatusBadge(trangThai);
}

Widget buildInfoRow(String text) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Text(
      text,
      style: const TextStyle(fontSize: 13, color: Color(0xFF334155)),
    ),
  );
}

Widget buildInfoRow2(String label, String? value) {
  if (value == null || value.isEmpty) return const SizedBox.shrink();
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B), fontWeight: FontWeight.w500),
          ),
        ),
      ],
    ),
  );
}