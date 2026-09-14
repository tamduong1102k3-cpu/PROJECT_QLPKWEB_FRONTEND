import 'package:flutter/material.dart';
import '../profile_constants.dart';
import '../profile_helpers.dart';

class PatientInfoSection extends StatelessWidget {
  final Map<String, dynamic>? profile;

  const PatientInfoSection({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    final soDienThoai = ProfileHelpers.getProfileValue(profile, 'soDienThoai') ?? '';
    final email = ProfileHelpers.getProfileValue(profile, 'email') ?? '';
    final diaChi = ProfileHelpers.getProfileValue(profile, 'diaChi') ?? '';
    final tienSuBenh = ProfileHelpers.getProfileValue(profile, 'tienSuBenh') ?? '';
    final diUngThuoc = ProfileHelpers.getProfileValue(profile, 'diUngThuoc') ?? '';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Thông tin liên hệ
          Container(
            decoration: BoxDecoration(
              color: ProfileColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ProfileColors.border),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.contact_phone_outlined, color: ProfileColors.primary, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'THÔNG TIN LIÊN HỆ',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: ProfileColors.foreground,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(height: 1, color: ProfileColors.border),
                const SizedBox(height: 12),
                _buildInfoRow('Số điện thoại:', soDienThoai.isNotEmpty ? soDienThoai : 'Chưa cập nhật'),
                const SizedBox(height: 8),
                _buildInfoRow('Email:', email.isNotEmpty ? email : 'Chưa cập nhật'),
                const SizedBox(height: 8),
                _buildInfoRow('Địa chỉ:', diaChi.isNotEmpty ? diaChi : 'Chưa cập nhật'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Thông tin y tế
          Container(
            decoration: BoxDecoration(
              color: ProfileColors.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ProfileColors.border),
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.medical_information_outlined, color: ProfileColors.primary, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'THÔNG TIN Y TẾ',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: ProfileColors.foreground,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(height: 1, color: ProfileColors.border),
                const SizedBox(height: 12),
                _buildInfoRow(
                  'Tiền sử bệnh:',
                  tienSuBenh.isNotEmpty ? tienSuBenh : 'Chưa cập nhật',
                  multiline: true,
                ),
                const SizedBox(height: 8),
                _buildInfoRow(
                  'Dị ứng thuốc:',
                  diUngThuoc.isNotEmpty ? diUngThuoc : 'Chưa cập nhật',
                  multiline: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool multiline = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: ProfileColors.mutedForeground),
            ),
          ),
          Expanded(
            child: multiline
                ? Container(
                    padding: const EdgeInsets.only(top: 1),
                    child: Text(
                      value,
                      style: const TextStyle(fontSize: 13, color: ProfileColors.foreground, fontWeight: FontWeight.w500),
                    ),
                  )
                : Text(
                    value,
                    style: const TextStyle(fontSize: 13, color: ProfileColors.foreground, fontWeight: FontWeight.w500),
                  ),
          ),
        ],
      ),
    );
  }
}