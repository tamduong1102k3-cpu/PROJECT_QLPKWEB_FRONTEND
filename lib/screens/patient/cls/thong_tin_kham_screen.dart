import 'package:flutter/material.dart';
import '../../../models/chi_tiet_ca_kham.dart';

/// Màn hình "Thông tin khám" cho phiếu CLS (Xét nghiệm & CĐHA)
/// Hiển thị tên dịch vụ, bác sĩ, kỹ thuật viên, ngày thực hiện
class ThongTinKhamScreen extends StatelessWidget {
  final ChiTietCaKham data;
  final String tenDichVu;
  final String? tenBacSi;
  final String? tenKyThuatVien;
  final String? ngayThucHien;
  final Color? mauSacDichVu;

  const ThongTinKhamScreen({
    super.key,
    required this.data,
    required this.tenDichVu,
    this.tenBacSi,
    this.tenKyThuatVien,
    this.ngayThucHien,
    this.mauSacDichVu = const Color(0xFF0F766E),
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Tên dịch vụ
        _infoCard(
          icon: Icons.biotech,
          color: mauSacDichVu!,
          label: 'Tên dịch vụ',
          value: tenDichVu,
          bold: true,
        ),
        const SizedBox(height: 12),
        // Bác sĩ
        _infoCard(
          icon: Icons.medical_services_outlined,
          color: const Color(0xFF1070EE),
          label: 'Bác sĩ',
          value: tenBacSi,
        ),
        const SizedBox(height: 12),
        // Kỹ thuật viên
        _infoCard(
          icon: Icons.badge_outlined,
          color: const Color(0xFF7C3AED),
          label: 'Kỹ thuật viên',
          value: tenKyThuatVien,
        ),
        const SizedBox(height: 12),
        // Ngày thực hiện
        _infoCard(
          icon: Icons.event_available_outlined,
          color: const Color(0xFF059669),
          label: 'Ngày thực hiện',
          value: _formatNgay(ngayThucHien ?? data.ngayKham),
        ),
        const SizedBox(height: 12),
        // Chuyên khoa
        _infoCard(
          icon: Icons.medical_information_outlined,
          color: const Color(0xFFF59E0B),
          label: 'Chuyên khoa',
          value: data.tenChuyenKhoa,
        ),
      ],
    );
  }

  String _formatNgay(String? s) {
    if (s == null || s.length < 10) return '—';
    final ngay = s.substring(0, 10);
    final parts = ngay.split('-');
    if (parts.length == 3) {
      return '${parts[2]}/${parts[1]}/${parts[0]}';
    }
    return ngay;
  }

  Widget _infoCard({
    required IconData icon,
    required Color color,
    required String label,
    String? value,
    bool bold = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEDF2F7)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value?.isNotEmpty == true ? value! : '—',
                  style: TextStyle(
                    fontSize: bold ? 17 : 15,
                    color: const Color(0xFF1A202C),
                    fontWeight: bold ? FontWeight.bold : FontWeight.w500,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}