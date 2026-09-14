import 'package:flutter/material.dart';
import '../../../data/entities/lich_kham_entity.dart';
import '../../profile/widgets/status_badge.dart';

class AppointmentCard extends StatelessWidget {
  final LichKhamEntity appointment;
  final VoidCallback? onTap;

  const AppointmentCard({
    super.key,
    required this.appointment,
    this.onTap,
  });

  // Medical color palette
  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _accentGreen = Color(0xFF16A34A);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);

  /// Format "HH:mm:ss" -> "HH:mm"
  String _formatTime(String time) {
    if (time.length >= 5) {
      return time.substring(0, 5);
    }
    return time;
  }

  String _shiftLabel() {
    final start = appointment.gioBatDau;
    final end = appointment.gioKetThuc;
    final range = [
      if (start != null && start.isNotEmpty) _formatTime(start),
      if (end != null && end.isNotEmpty) _formatTime(end),
    ].join(' – ');
    final name = appointment.tenCa?.trim();
    if (name != null && name.isNotEmpty) {
      return range.isEmpty ? name : '$name · $range';
    }
    if (range.isNotEmpty) return 'Ca khám · $range';
    return 'Ca khám';
  }

  /// Format "yyyy-MM-dd" -> "dd/MM/yyyy"
  String _formatDate(String date) {
    if (date.length >= 10) {
      final parts = date.split('-');
      if (parts.length == 3) {
        return '${parts[2]}/${parts[1]}/${parts[0]}';
      }
    }
    return date;
  }

  /// Get day of week in Vietnamese
  String _getDayOfWeek(String dateStr) {
    try {
      final parts = dateStr.split('-');
      if (parts.length == 3) {
        final date = DateTime(
          int.parse(parts[0]),
          int.parse(parts[1]),
          int.parse(parts[2]),
        );
        switch (date.weekday) {
          case DateTime.monday: return 'Thứ Hai';
          case DateTime.tuesday: return 'Thứ Ba';
          case DateTime.wednesday: return 'Thứ Tư';
          case DateTime.thursday: return 'Thứ Năm';
          case DateTime.friday: return 'Thứ Sáu';
          case DateTime.saturday: return 'Thứ Bảy';
          case DateTime.sunday: return 'Chủ Nhật';
        }
      }
    } catch (_) {}
    return '';
  }

  Color _statusIconColor() {
    switch (appointment.trangThai) {
      case 'CHUA_DEN': return const Color(0xFFF59E0B);
      case 'DA_CHECK_IN': return const Color(0xFF8B5CF6);
      case 'HOAN_THANH': return _accentGreen;
      case 'HUY': return const Color(0xFFEF4444);
      case 'QUA_HEN': return const Color(0xFF6B7280);
      case 'HOAN': return const Color(0xFF2563EB);
      default: return _mutedForeground;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _cardColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _borderColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row: Date + Status
            Row(
              children: [
                // Date badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: _primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.calendar_today_rounded, size: 14, color: _primaryColor),
                      const SizedBox(width: 6),
      Text(
        _formatDate(appointment.ngayKham),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Container(
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                  decoration: BoxDecoration(
                    color: appointment.nguonTao == 'TAI_KHAM'
                        ? const Color(0xFF7C3AED).withValues(alpha: 0.1)
                        : _primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    appointment.nguonTaoDisplay,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: appointment.nguonTao == 'TAI_KHAM'
                          ? const Color(0xFF7C3AED)
                          : _primaryColor,
                    ),
                  ),
                ),
                // Status badge
                StatusBadge(status: appointment.trangThai),
              ],
            ),

            const SizedBox(height: 14),

            // Doctor name
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.person_rounded, size: 22, color: _primaryColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        appointment.tenBacSi ?? 'Chưa có thông tin',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: _foregroundColor,
                        ),
                      ),
                      if (appointment.tenChuyenKhoa != null)
                        Text(
                          appointment.tenChuyenKhoa!,
                          style: const TextStyle(
                            fontSize: 12,
                            color: _mutedForeground,
                          ),
                        ),
                    ],
                  ),
                ),
                // Time
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _borderColor),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.access_time_rounded, size: 14, color: _statusIconColor()),
                      const SizedBox(width: 4),
                      Text(
                        _formatTime(appointment.gioBatDau ?? '--:--'),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: _statusIconColor(),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Day of week & Service
            Row(
              children: [
                Icon(Icons.today_rounded, size: 14, color: _mutedForeground),
                const SizedBox(width: 4),
      Text(
        _getDayOfWeek(appointment.ngayKham),
                  style: const TextStyle(fontSize: 12, color: _mutedForeground),
                ),
                const SizedBox(width: 16),
                if (appointment.tenDichVu != null) ...[
                  const Icon(Icons.medical_services_outlined, size: 14, color: _mutedForeground),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      appointment.tenDichVu!,
                      style: const TextStyle(fontSize: 12, color: _mutedForeground),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),

            const SizedBox(height: 10),

            // Shift information
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDFA),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFCCFBF1)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.work_history_outlined, size: 16, color: _primaryColor),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _shiftLabel(),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _primaryColor,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),
            const Divider(height: 1, color: _borderColor),
            const SizedBox(height: 10),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.headset_mic_rounded, size: 16, color: _primaryColor),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Để đổi hoặc hủy lịch, vui lòng liên hệ lễ tân qua hotline 1900 6000 để được hướng dẫn.',
                    style: const TextStyle(
                      fontSize: 12,
                      color: _mutedForeground,
                      height: 1.45,
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