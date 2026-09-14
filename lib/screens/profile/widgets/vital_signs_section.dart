import 'package:flutter/material.dart';
import '../../../models/vital_signs_model.dart';
import '../profile_constants.dart';

class VitalSignsSection extends StatelessWidget {
  final Map<String, dynamic>? profile;
  final VitalSignsModel? vitalSigns;
  final bool isLoading;

  const VitalSignsSection({
    super.key,
    required this.profile,
    this.vitalSigns,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          decoration: BoxDecoration(
            color: ProfileColors.card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: ProfileColors.border),
          ),
          padding: const EdgeInsets.all(16),
          child: const Center(
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        ),
      );
    }

    final nhietDo = vitalSigns?.nhietDo?.toStringAsFixed(1) ?? '--';
    final nhipTim = vitalSigns?.nhipTim?.toString() ?? '--';
    final nhipTho = vitalSigns?.nhipTho?.toString() ?? '--';
    final canNang = vitalSigns?.canNang?.toStringAsFixed(1) ?? '--';
    final chieuCao = vitalSigns?.chieuCao?.toStringAsFixed(0) ?? '--';

    final allEmpty = nhietDo == '--' && nhipTim == '--' && nhipTho == '--' && canNang == '--' && chieuCao == '--';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
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
                Icon(Icons.monitor_heart_outlined, color: ProfileColors.destructive, size: 18),
                SizedBox(width: 8),
                Text(
                  'CHỈ SỐ SỨC KHỎE GẦN NHẤT',
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
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildVitalItem(Icons.thermostat_outlined, 'Nhiệt độ', nhietDo, '°C'),
                _buildVitalItem(Icons.favorite_border, 'Nhịp tim', nhipTim, 'lần/ph'),
                _buildVitalItem(Icons.air_outlined, 'Nhịp thở', nhipTho, 'lần/ph'),
                _buildVitalItem(Icons.balance, 'Cân nặng', canNang, 'kg'),
                _buildVitalItem(Icons.height, 'Chiều cao', chieuCao, 'cm'),
              ],
            ),
            if (allEmpty) ...[
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  'Chưa có dữ liệu đo gần đây',
                  style: TextStyle(
                    fontSize: 12,
                    color: ProfileColors.mutedForeground,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildVitalItem(IconData icon, String label, String value, String unit) {
    final isEmpty = value == '--';
    return Opacity(
      opacity: isEmpty ? 0.4 : 1.0,
      child: Column(
        children: [
          Icon(
            icon,
            size: 20,
            color: isEmpty ? ProfileColors.mutedForeground : ProfileColors.primary,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: isEmpty ? ProfileColors.mutedForeground : ProfileColors.primary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            unit,
            style: const TextStyle(fontSize: 11, color: ProfileColors.mutedForeground),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: ProfileColors.foreground, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}