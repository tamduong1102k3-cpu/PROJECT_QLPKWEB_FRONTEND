import 'package:flutter/material.dart';
import '../profile_constants.dart';

class ProfileErrorView extends StatelessWidget {
  final String? errorMessage;
  final VoidCallback onRetry;

  const ProfileErrorView({
    super.key,
    this.errorMessage,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: ProfileColors.destructive.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline_rounded, size: 40, color: ProfileColors.destructive),
            ),
            const SizedBox(height: 20),
            const Text(
              'Không thể tải thông tin hồ sơ',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: ProfileColors.foreground),
            ),
            const SizedBox(height: 8),
            Text(
              errorMessage ?? '',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: ProfileColors.mutedForeground),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Thử lại'),
              style: FilledButton.styleFrom(
                backgroundColor: ProfileColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}