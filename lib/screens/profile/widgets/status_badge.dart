import 'package:flutter/material.dart';
import '../profile_constants.dart';

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String displayText;

    switch (status.toLowerCase().replaceAll('_', ' ')) {
      case 'chua den':
      case 'chưa đến':
        bg = const Color(0xFFFFFBEB);
        fg = const Color(0xFFD97706);
        displayText = 'Chưa đến';
        break;
      case 'cho xac nhan':
      case 'chờ xác nhận':
      case 'pending':
        bg = const Color(0xFFFFFBEB);
        fg = const Color(0xFFD97706);
        displayText = 'Chờ xác nhận';
        break;
      case 'da xac nhan':
      case 'đã xác nhận':
      case 'confirmed':
        bg = const Color(0xFF3B82F6).withValues(alpha: 0.1);
        fg = const Color(0xFF3B82F6);
        displayText = 'Đã xác nhận';
        break;
      case 'da check in':
      case 'đã check-in':
        bg = const Color(0xFF8B5CF6).withValues(alpha: 0.1);
        fg = const Color(0xFF8B5CF6);
        displayText = 'Đã check-in';
        break;
      case 'hoan thanh':
      case 'hoàn thành':
      case 'completed':
        bg = ProfileColors.accentGreen.withValues(alpha: 0.1);
        fg = ProfileColors.accentGreen;
        displayText = 'Hoàn thành';
        break;
      case 'da thanh toan':
      case 'đã thanh toán':
        bg = ProfileColors.accentGreen.withValues(alpha: 0.1);
        fg = ProfileColors.accentGreen;
        displayText = 'Đã thanh toán';
        break;
      case 'chua thanh toan':
      case 'chưa thanh toán':
      case 'chua xac dinh':
        bg = ProfileColors.destructive.withValues(alpha: 0.15);
        fg = ProfileColors.destructive;
        displayText = 'Chưa thanh toán';
        break;
      case 'dang kham':
      case 'đang khám':
        bg = const Color(0xFFFFFBEB);
        fg = const Color(0xFFD97706);
        displayText = 'Đang khám';
        break;
      case 'cho kham':
      case 'chờ khám':
        bg = ProfileColors.primary.withValues(alpha: 0.1);
        fg = ProfileColors.primary;
        displayText = 'Chờ khám';
        break;
      case 'cho bac si':
      case 'chờ bác sĩ':
        bg = const Color(0xFFFFFBEB);
        fg = const Color(0xFFD97706);
        displayText = 'Chờ bác sĩ';
        break;
      case 'cho cls':
      case 'chờ cls':
        bg = const Color(0xFFFFFBEB);
        fg = const Color(0xFFD97706);
        displayText = 'Chờ CLS';
        break;
      case 'da kham lam sang':
      case 'đã khám lâm sàng':
        bg = ProfileColors.accentGreen.withValues(alpha: 0.1);
        fg = ProfileColors.accentGreen;
        displayText = 'Đã khám lâm sàng';
        break;
      case 'khong den':
      case 'không đến':
        bg = const Color(0xFF6B7280).withValues(alpha: 0.1);
        fg = const Color(0xFF6B7280);
        displayText = 'Không đến';
        break;
      case 'huy':
      case 'hủy':
      case 'cancelled':
        bg = ProfileColors.destructive.withValues(alpha: 0.15);
        fg = ProfileColors.destructive;
        displayText = 'Đã hủy';
        break;
      case 'hoan':
      case 'hoãn':
        bg = const Color(0xFF2563EB).withValues(alpha: 0.1);
        fg = const Color(0xFF2563EB);
        displayText = 'Hoãn';
        break;
      case 'qua hen':
      case 'quá hẹn':
        bg = const Color(0xFF6B7280).withValues(alpha: 0.1);
        fg = const Color(0xFF6B7280);
        displayText = 'Quá hẹn';
        break;
      default:
        bg = ProfileColors.muted;
        fg = ProfileColors.mutedForeground;
        displayText = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 10,
          color: fg,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}