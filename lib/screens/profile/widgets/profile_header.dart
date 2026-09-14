import 'package:flutter/material.dart';
import '../profile_constants.dart';
import '../profile_helpers.dart';

class ProfileHeader extends StatelessWidget {
  final Map<String, dynamic>? profile;

  const ProfileHeader({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    final tenBenhNhan = ProfileHelpers.getPatientName(profile);
    final maBenhNhan = ProfileHelpers.getProfileInt(profile, 'maBenhNhan');
    final ngaySinhFormatted = ProfileHelpers.formatDate(
      ProfileHelpers.getProfileValue(profile, 'ngaySinh'),
    );
    final gioiTinhFormatted = ProfileHelpers.mapGender(profile?['gioiTinh']);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: ProfileColors.card,
        border: Border(bottom: BorderSide(color: ProfileColors.border)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 36,
            backgroundColor: ProfileColors.primary.withValues(alpha: 0.1),
            child: const Icon(
              Icons.person_outline_rounded,
              size: 38,
              color: ProfileColors.primary,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tenBenhNhan.isNotEmpty ? tenBenhNhan : 'Chưa cập nhật họ tên',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: ProfileColors.foreground,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Mã bệnh nhân: ${maBenhNhan ?? '--'}',
                  style: const TextStyle(fontSize: 13, color: ProfileColors.mutedForeground),
                ),
                if (ngaySinhFormatted.isNotEmpty || gioiTinhFormatted.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      '$ngaySinhFormatted${gioiTinhFormatted.isNotEmpty ? ' ($gioiTinhFormatted)' : ''}',
                      style: const TextStyle(fontSize: 13, color: ProfileColors.mutedForeground),
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