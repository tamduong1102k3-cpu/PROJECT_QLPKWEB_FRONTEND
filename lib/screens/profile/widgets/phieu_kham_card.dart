import 'package:flutter/material.dart';
import '../profile_constants.dart';
import 'status_badge.dart';

class PhieuKhamCard extends StatelessWidget {
  final dynamic phieuKham;
  final VoidCallback onTap;

  const PhieuKhamCard({
    super.key,
    required this.phieuKham,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final ngayKham = phieuKham.ngayKham ?? '';
    final tenChuyenKhoa = phieuKham.tenChuyenKhoa ?? '';
    final tenNhanVien = phieuKham.tenNhanVien ?? '';
    final tenDichVu = phieuKham.tenDichVu ?? '';
    final chanDoan = phieuKham.chanDoan ?? '';
    final trangThai = phieuKham.trangThai ?? '';

    String formattedNgay = ngayKham;
    if (ngayKham.length >= 10) {
      formattedNgay = ngayKham.substring(0, 10);
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: ProfileColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ProfileColors.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.description_outlined, color: ProfileColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Phiếu khám #${phieuKham.maPhieuKham}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: ProfileColors.foreground,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  StatusBadge(status: trangThai),
                ],
              ),
              const SizedBox(height: 12),
              Container(height: 1, color: ProfileColors.border),
              const SizedBox(height: 12),
              if (formattedNgay.isNotEmpty)
                _buildDetailRow(Icons.calendar_today_outlined, 'Ngày khám: $formattedNgay'),
              if (tenDichVu.isNotEmpty)
                _buildDetailRow(Icons.medical_services_outlined, 'Dịch vụ: $tenDichVu'),
              if (tenChuyenKhoa.isNotEmpty)
                _buildDetailRow(Icons.local_hospital_outlined, 'Chuyên khoa: $tenChuyenKhoa'),
              if (tenNhanVien.isNotEmpty)
                _buildDetailRow(Icons.person_outline_rounded, 'Bác sĩ: $tenNhanVien'),
              if (chanDoan.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: ProfileColors.muted,
                    borderRadius: BorderRadius.all(Radius.circular(6)),
                  ),
                  child: Text(
                    'Chẩn đoán: $chanDoan',
                    style: const TextStyle(fontSize: 13, color: ProfileColors.foreground, height: 1.3),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: const [
                  Text(
                    'Xem chi tiết',
                    style: TextStyle(
                      color: ProfileColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  SizedBox(width: 2),
                  Icon(Icons.chevron_right_rounded, color: ProfileColors.primary, size: 18),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Icon(icon, size: 15, color: ProfileColors.mutedForeground),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: ProfileColors.foreground),
            ),
          ),
        ],
      ),
    );
  }
}