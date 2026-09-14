import 'package:flutter/material.dart';
import '../../../../models/doctor_model.dart';

import 'doctor_detail_screen.dart';

class DoctorCardWidget extends StatelessWidget {
  final DoctorModel doctor;
  final VoidCallback? onBookPressed;

  const DoctorCardWidget({super.key, required this.doctor, this.onBookPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => DoctorDetailScreen(doctorId: doctor.id),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar section
            Container(
              height: 80,
              width: double.infinity,
              decoration: const BoxDecoration(
                color: Color(0xFFF5F9FF),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Center(
                child: ClipOval(
                  child: Image.asset(
                    _getAvatarAsset(doctor.gioiTinh),
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 60,
                        height: 60,
                        decoration: const BoxDecoration(
                          color: Colors.blue,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            doctor.name.isNotEmpty
                                ? doctor.name[0].toUpperCase()
                                : '?',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
            // Info section
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name
                    Text(
                      doctor.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A2B4E),
                      ),
                    ),
                    const SizedBox(height: 4),
                    // Title
                    Row(
                      children: [
                        Image.asset(
                          'assets/images/stethoscope.png',
                          width: 12,
                          height: 12,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            doctor.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.black54,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    // Specialty
                    Row(
                      children: [
                        Image.asset(
                          'assets/images/first-aid-kit.png',
                          width: 12,
                          height: 12,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            doctor.specialty,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.black54,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    // Price
                    Row(
                      children: [
                        Image.asset(
                          'assets/images/money.png',
                          width: 12,
                          height: 12,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            doctor.price,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 10,
                              color: Colors.black54,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    // Schedule section
                    if (doctor.schedules.isNotEmpty)
                      _buildScheduleSection()
                    else
                      _buildNoSchedule(),
                    const Spacer(),
                    // CTA Button
                    SizedBox(
                      width: double.infinity,
                      height: 32,
                      child: ElevatedButton(
                        onPressed: onBookPressed,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 0,
                          padding: EdgeInsets.zero,
                        ),
                        child: const Text(
                          'ĐẶT LỊCH NGAY',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Lấy asset avatar dựa trên giới tính (1 = Nam, null = mặc định female, khác = Nữ)
  String _getAvatarAsset(int? gioiTinh) {
    return gioiTinh == 1
        ? 'assets/images/employee/doctor male.png'
        : 'assets/images/employee/doctor female.png';
  }

  /// Chuyển "THU_2" -> "T2", "THU_3" -> "T3", "CHU_NHAT" -> "CN"
  String _shortThu(String? thu) {
    switch (thu) {
      case 'THU_2':
        return 'T2';
      case 'THU_3':
        return 'T3';
      case 'THU_4':
        return 'T4';
      case 'THU_5':
        return 'T5';
      case 'THU_6':
        return 'T6';
      case 'THU_7':
        return 'T7';
      case 'CHU_NHAT':
        return 'CN';
      default:
        return thu ?? '';
    }
  }

  /// Định dạng "08:00:00" -> "08:00"
  String _formatGioDisplay(String? time) {
    if (time == null || time.length < 5) return '';
    return time.substring(0, 5);
  }

  /// Sắp xếp lịch theo thứ tự thứ trong tuần
  List<dynamic> _sortSchedules() {
    const thuOrder = {
      'THU_2': 2,
      'THU_3': 3,
      'THU_4': 4,
      'THU_5': 5,
      'THU_6': 6,
      'THU_7': 7,
      'CHU_NHAT': 8,
    };

    final sorted = List<dynamic>.from(doctor.schedules);
    sorted.sort((a, b) {
      final aOrder = thuOrder[a.thu] ?? 9;
      final bOrder = thuOrder[b.thu] ?? 9;
      if (aOrder != bOrder) return aOrder.compareTo(bOrder);
      // Cùng thứ thì sắp theo giờ
      if (a.gioLam != null && b.gioLam != null) {
        return a.gioLam!.compareTo(b.gioLam!);
      }
      return 0;
    });
    return sorted;
  }

  /// Hiển thị danh sách lịch làm việc dạng badge
  Widget _buildScheduleSection() {
    final sortedSchedules = _sortSchedules();
    final displaySchedules = sortedSchedules.take(2).toList();
    final hasMore = sortedSchedules.length > 2;
    final moreCount = sortedSchedules.length - 2;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          children: [
            Image.asset(
              'assets/images/calendar.png',
              width: 12,
              height: 12,
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                'Lịch làm việc${hasMore ? " (+$moreCount)" : ""}:',
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        // List schedule badges
        ...displaySchedules.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 3),
              child: _buildScheduleBadge(s),
            )),
      ],
    );
  }

  /// Badge cho từng ca: T3 | 08:00 - 17:00, Phòng ở dòng dưới để không tràn dòng
  Widget _buildScheduleBadge(dynamic schedule) {
    final thuShort = _shortThu(schedule.thu);
    final phong = schedule.phong ?? '';
    final gioBatDau = _formatGioDisplay(schedule.gioLam);
    final gioKetThuc = _formatGioDisplay(schedule.gioKetThuc);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F7FF),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFD0E4FF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Badge [ T3 ]
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                decoration: BoxDecoration(
                  color: Colors.blue,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  thuShort,
                  style: const TextStyle(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
              // Giờ
              Flexible(
                child: Text(
                  '$gioBatDau - $gioKetThuc',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF1A2B4E),
                  ),
                ),
              ),
            ],
          ),
          if (phong.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              phong,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 8,
                fontWeight: FontWeight.w400,
                color: Colors.grey[600],
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Không có lịch
  Widget _buildNoSchedule() {
    return Row(
      children: [
        Image.asset(
          'assets/images/clock.png',
          width: 11,
          height: 11,
        ),
        const SizedBox(width: 4),
        const Expanded(
          child: Text(
            'Chưa có lịch khám',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 10, color: Colors.grey),
          ),
        ),
      ],
    );
  }
}