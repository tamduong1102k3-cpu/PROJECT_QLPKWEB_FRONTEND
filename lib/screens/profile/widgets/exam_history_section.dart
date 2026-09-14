import 'package:flutter/material.dart';
import '../profile_constants.dart';
import 'phieu_kham_card.dart';

class ExamHistorySection extends StatelessWidget {
  final List<dynamic> phieuKhamList;
  final void Function(dynamic phieuKham) onPhieuKhamTap;

  const ExamHistorySection({
    super.key,
    required this.phieuKhamList,
    required this.onPhieuKhamTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 12),
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: ProfileColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.history_rounded, size: 16, color: ProfileColors.primary),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Lịch sử khám bệnh',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: ProfileColors.foreground),
                ),
              ],
            ),
          ),
          if (phieuKhamList.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 40),
              decoration: BoxDecoration(
                color: ProfileColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ProfileColors.border.withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: ProfileColors.muted,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.inbox_rounded, size: 32, color: ProfileColors.mutedForeground),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Chưa có phiếu khám nào',
                    style: TextStyle(color: ProfileColors.mutedForeground, fontSize: 15),
                  ),
                ],
              ),
            )
          else
            ...phieuKhamList.map((pk) => PhieuKhamCard(
              phieuKham: pk,
              onTap: () => onPhieuKhamTap(pk),
            )),
        ],
      ),
    );
  }
}