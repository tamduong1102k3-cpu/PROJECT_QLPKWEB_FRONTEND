import 'package:flutter/material.dart';
import '../../data/entities/lich_kham_entity.dart';

class AppointmentDetailScreen extends StatefulWidget {
  final LichKhamEntity appointment;

  const AppointmentDetailScreen({super.key, required this.appointment});

  @override
  State<AppointmentDetailScreen> createState() => _AppointmentDetailScreenState();
}

class _AppointmentDetailScreenState extends State<AppointmentDetailScreen> {
  LichKhamEntity? _updatedAppointment;

  // Medical color palette
  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _accentGreen = Color(0xFF16A34A);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);
  static const Color _destructive = Color(0xFFEF4444);

  LichKhamEntity get _appointment => _updatedAppointment ?? widget.appointment;

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

  Color _statusColor() {
    switch (_appointment.trangThai) {
      case 'CHUA_DEN': return const Color(0xFFF59E0B);
      case 'DA_CHECK_IN': return const Color(0xFF8B5CF6);
      case 'HOAN_THANH': return _accentGreen;
      case 'HUY': return _destructive;
      case 'QUA_HEN': return const Color(0xFF6B7280);
      default: return _mutedForeground;
    }
  }

  IconData _statusIcon() {
    switch (_appointment.trangThai) {
      case 'CHUA_DEN': return Icons.hourglass_empty_rounded;
      case 'DA_CHECK_IN': return Icons.login_rounded;
      case 'HOAN_THANH': return Icons.task_alt_rounded;
      case 'HUY': return Icons.cancel_outlined;
      case 'QUA_HEN': return Icons.person_off_outlined;
      default: return Icons.circle_outlined;
    }
  }

  bool get _hasSupportNotice => _appointment.trangThai == 'CHUA_DEN';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Chi tiết lịch hẹn',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: _foregroundColor),
        ),
        backgroundColor: _cardColor,
        elevation: 0,
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _borderColor, height: 1.0),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: _foregroundColor, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Status Banner
            _buildStatusBanner(),

            const SizedBox(height: 16),

            // Main Info Card
            _buildInfoCard(),

            const SizedBox(height: 16),

            // Additional Details
            _buildDetailsCard(),

            if (_appointment.ghiChu != null && _appointment.ghiChu!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildNoteCard(),
            ],

            if (_hasSupportNotice) ...[
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDFA),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFCCFBF1)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.headset_mic_rounded, size: 20, color: _primaryColor),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Để đổi hoặc hủy lịch, vui lòng liên hệ lễ tân qua hotline 1900 6000 để được hướng dẫn.',
                        style: const TextStyle(
                          fontSize: 13,
                          color: _foregroundColor,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBanner() {
    final color = _statusColor();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Icon(_statusIcon(), size: 48, color: color),
          const SizedBox(height: 12),
          Text(
            _appointment.trangThaiDisplay,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Mã lịch hẹn: #${_appointment.id ?? '...'}',
            style: const TextStyle(fontSize: 13, color: _mutedForeground),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(16),
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
          const Row(
            children: [
              Icon(Icons.info_outline_rounded, size: 18, color: _primaryColor),
              SizedBox(width: 8),
              Text(
                'Thông tin lịch hẹn',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: _foregroundColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: _borderColor),
          const SizedBox(height: 16),

          // Date & Time
          _buildInfoRow(
            icon: Icons.calendar_month_rounded,
            label: 'Ngày khám',
            value: '${_formatDate(_appointment.ngayKham)} (${_getDayOfWeek(_appointment.ngayKham)})',
          ),

          const SizedBox(height: 14),
          _buildInfoRow(
            icon: Icons.person_rounded,
            label: 'Bác sĩ',
            value: _appointment.tenBacSi ?? 'Chưa có thông tin',
          ),
          const SizedBox(height: 14),
          _buildInfoRow(
            icon: Icons.local_hospital_outlined,
            label: 'Chuyên khoa',
            value: _appointment.tenChuyenKhoa ?? 'Chưa có thông tin',
          ),
          const SizedBox(height: 14),
          _buildInfoRow(
            icon: Icons.medical_services_outlined,
            label: 'Dịch vụ',
            value: _appointment.tenDichVu ?? 'Chưa có thông tin',
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(16),
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
          const Row(
            children: [
              Icon(Icons.description_outlined, size: 18, color: _primaryColor),
              SizedBox(width: 8),
              Text(
                'Chi tiết khác',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: _foregroundColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: _borderColor),
          const SizedBox(height: 16),
          _buildInfoRow(
            icon: Icons.person_outline_rounded,
            label: 'Bệnh nhân',
            value: _appointment.tenBenhNhan ?? '--',
          ),
          const SizedBox(height: 14),
          _buildInfoRow(
            icon: Icons.calendar_today_outlined,
            label: 'Ngày tạo',
            value: _appointment.ngayTao != null
                ? '${_appointment.ngayTao!.day.toString().padLeft(2, '0')}/${_appointment.ngayTao!.month.toString().padLeft(2, '0')}/${_appointment.ngayTao!.year}'
                : '--',
          ),
          if (_appointment.ngayCapNhat != null) ...[
            const SizedBox(height: 14),
            _buildInfoRow(
              icon: Icons.update_rounded,
              label: 'Cập nhật lần cuối',
              value: '${_appointment.ngayCapNhat!.day.toString().padLeft(2, '0')}/${_appointment.ngayCapNhat!.month.toString().padLeft(2, '0')}/${_appointment.ngayCapNhat!.year}',
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNoteCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.note_alt_outlined, size: 18, color: Color(0xFFD97706)),
              SizedBox(width: 8),
              Text(
                'Ghi chú',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF92400E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _appointment.ghiChu!,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF92400E),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: _primaryColor),
        const SizedBox(width: 12),
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: _mutedForeground,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: _foregroundColor,
            ),
          ),
        ),
      ],
    );
  }
}