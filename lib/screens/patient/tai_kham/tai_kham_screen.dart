import 'package:flutter/material.dart';
import '../../../models/chi_tiet_ca_kham.dart';

class TaiKhamScreen extends StatelessWidget {
  final ChiTietCaKham data;

  const TaiKhamScreen({super.key, required this.data});

  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);

  @override
  Widget build(BuildContext context) {
    if (data.lichTaiKham.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.event_busy_rounded,
              size: 64,
              color: Colors.grey[300],
            ),
            const SizedBox(height: 16),
            const Text(
              'Chưa có lịch tái khám',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: _mutedForeground,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Bệnh nhân chưa được chỉ định\nlịch tái khám cho ca này',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: _mutedForeground,
              ),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _primaryColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _primaryColor.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _primaryColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.event_repeat_rounded,
                    color: _primaryColor,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Lịch tái khám',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: _foregroundColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${data.lichTaiKham.length} lịch hẹn',
                        style: const TextStyle(
                          fontSize: 13,
                          color: _mutedForeground,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // List of follow-up appointments
          ...data.lichTaiKham.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            return _buildTaiKhamCard(item, index);
          }),

          const SizedBox(height: 16),

          // Footer note
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFFBEB),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFFDE68A)),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.info_outline_rounded,
                  size: 16,
                  color: Color(0xFFD97706),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Lịch tái khám được bác sĩ chỉ định dựa trên tình trạng sức khỏe của bệnh nhân. Vui lòng tuân thủ lịch hẹn để đảm bảo hiệu quả điều trị.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF92400E),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaiKhamCard(LichTaiKhamInfo item, int index) {
    // Format date
    String formattedDate = item.ngayTaiKham ?? 'Chưa có ngày';
    if (formattedDate.length >= 10) {
      try {
        final parts = formattedDate.split('-');
        if (parts.length == 3) {
          formattedDate = '${parts[2]}/${parts[1]}/${parts[0]}';
        }
      } catch (_) {}
    }

    // Get day of week
    String dayOfWeek = '';
    if (item.ngayTaiKham != null && item.ngayTaiKham!.length >= 10) {
      try {
        final parts = item.ngayTaiKham!.split('-');
        if (parts.length == 3) {
          final date = DateTime(
            int.parse(parts[0]),
            int.parse(parts[1]),
            int.parse(parts[2]),
          );
          switch (date.weekday) {
            case DateTime.monday:
              dayOfWeek = 'Thứ Hai';
              break;
            case DateTime.tuesday:
              dayOfWeek = 'Thứ Ba';
              break;
            case DateTime.wednesday:
              dayOfWeek = 'Thứ Tư';
              break;
            case DateTime.thursday:
              dayOfWeek = 'Thứ Năm';
              break;
            case DateTime.friday:
              dayOfWeek = 'Thứ Sáu';
              break;
            case DateTime.saturday:
              dayOfWeek = 'Thứ Bảy';
              break;
            case DateTime.sunday:
              dayOfWeek = 'Chủ Nhật';
              break;
          }
        }
      } catch (_) {}
    }

    // Status color
    Color statusColor;
    String statusText;
    switch (item.trangThai?.toLowerCase()) {
      case 'cho_xac_nhan':
      case 'chờ xác nhận':
        statusColor = const Color(0xFFF59E0B);
        statusText = 'Chờ xác nhận';
        break;
      case 'da_xac_nhan':
      case 'đã xác nhận':
        statusColor = const Color(0xFF3B82F6);
        statusText = 'Đã xác nhận';
        break;
      case 'hoan_thanh':
      case 'hoàn thành':
        statusColor = const Color(0xFF16A34A);
        statusText = 'Hoàn thành';
        break;
      case 'huy':
      case 'hủy':
        statusColor = const Color(0xFFEF4444);
        statusText = 'Đã hủy';
        break;
      default:
        statusColor = const Color(0xFF6B7280);
        statusText = item.trangThai ?? 'Chưa xác định';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with index and status
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Row(
              children: [
                // Number badge
                Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: _primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      '${index + 1}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _primaryColor,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Lần tái khám ${index + 1}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _foregroundColor,
                    ),
                  ),
                ),
                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: statusColor.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),
          Container(height: 1, color: _borderColor),
          const SizedBox(height: 12),

          // Date info
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: _primaryColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        formattedDate.length >= 2
                            ? formattedDate.substring(0, 2)
                            : '',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: _primaryColor,
                        ),
                      ),
                      Text(
                        formattedDate.length >= 5
                            ? formattedDate.substring(3, 5)
                            : '',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: _primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        formattedDate,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: _foregroundColor,
                        ),
                      ),
                      if (dayOfWeek.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          dayOfWeek,
                          style: const TextStyle(
                            fontSize: 13,
                            color: _mutedForeground,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: _mutedForeground,
                  size: 20,
                ),
              ],
            ),
          ),

          // Notes if any
          if (item.ghiChu != null && item.ghiChu!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(height: 1, color: _borderColor),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.note_alt_outlined,
                    size: 16,
                    color: _mutedForeground,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      item.ghiChu!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: _mutedForeground,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            const SizedBox(height: 14),
          ],
        ],
      ),
    );
  }
}