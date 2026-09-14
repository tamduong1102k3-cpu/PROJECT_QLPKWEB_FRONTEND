import 'package:flutter/material.dart';
import 'search_patient_screen.dart';
import 'create_patient_screen.dart';

class PatientSelectionScreen extends StatefulWidget {
  final int targetIndex;

  const PatientSelectionScreen({super.key, required this.targetIndex});

  @override
  State<PatientSelectionScreen> createState() => _PatientSelectionScreenState();
}

class _PatientSelectionScreenState extends State<PatientSelectionScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.targetIndex == 1 ? 'Hồ sơ bệnh nhân' : 'Phiếu khám',
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 40),
            Icon(
              widget.targetIndex == 1
                  ? Icons.folder_open
                  : Icons.description,
              size: 80,
              color: Colors.blue,
            ),
            const SizedBox(height: 24),
            Text(
              widget.targetIndex == 1
                  ? 'Quản lý hồ sơ bệnh nhân'
                  : 'Quản lý phiếu khám',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Bạn cần có hồ sơ bệnh nhân để sử dụng chức năng này.\nVui lòng chọn một trong các tùy chọn bên dưới:',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
                height: 1.5,
              ),
            ),
            const SizedBox(height: 48),

            // Option 1: Đã có hồ sơ
            _buildOptionCard(
              icon: Icons.search,
              title: 'Đã có hồ sơ',
              subtitle: 'Liên kết hồ sơ bệnh nhân đã có với tài khoản của bạn',
              color: Colors.blue,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => SearchPatientScreen(
                      onLinked: () {
                        Navigator.of(context).pop(true);
                      },
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 20),

            // Option 2: Tạo hồ sơ mới
            _buildOptionCard(
              icon: Icons.person_add,
              title: 'Tạo hồ sơ mới',
              subtitle:
                  'Tạo hồ sơ bệnh nhân mới và tự động liên kết với tài khoản',
              color: Colors.green,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => CreatePatientScreen(
                      onCreated: () {
                        Navigator.of(context).pop(true);
                      },
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: color.withValues(alpha: 0.3),
          width: 1.5,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  icon,
                  size: 32,
                  color: color,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 18,
                color: color,
              ),
            ],
          ),
        ),
      ),
    );
  }
}