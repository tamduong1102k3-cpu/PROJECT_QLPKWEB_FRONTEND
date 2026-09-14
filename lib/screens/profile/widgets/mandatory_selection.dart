import 'package:flutter/material.dart';
import '../profile_constants.dart';

class MandatorySelection extends StatelessWidget {
  final VoidCallback onSearch;
  final VoidCallback onCreate;

  const MandatorySelection({
    super.key,
    required this.onSearch,
    required this.onCreate,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ProfileColors.scaffoldBackground,
      appBar: AppBar(
        title: const Text(
          'Hồ sơ bệnh nhân',
          style: TextStyle(fontWeight: FontWeight.w600, color: ProfileColors.foreground, fontSize: 18),
        ),
        centerTitle: true,
        backgroundColor: ProfileColors.card,
        foregroundColor: ProfileColors.foreground,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: ProfileColors.border, height: 1.0),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: ProfileColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.assignment_ind_outlined,
                  size: 48,
                  color: ProfileColors.primary,
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Yêu cầu liên kết hồ sơ',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: ProfileColors.foreground,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Bạn chưa có hồ sơ bệnh nhân liên kết\nvới tài khoản này. Vui lòng chọn:',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: ProfileColors.mutedForeground,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: onSearch,
                  icon: const Icon(Icons.person_search_rounded, size: 20, color: Colors.white),
                  label: const Text(
                    'Tôi đã có hồ sơ (Liên kết ngay)',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ProfileColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: onCreate,
                  icon: const Icon(Icons.person_add_alt_1_rounded, size: 20),
                  label: const Text(
                    'Tôi chưa có hồ sơ (Tạo mới)',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: ProfileColors.primary,
                    side: const BorderSide(color: ProfileColors.primary),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}