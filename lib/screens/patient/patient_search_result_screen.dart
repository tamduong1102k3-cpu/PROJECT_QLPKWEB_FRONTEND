import 'package:flutter/material.dart';
import '../../data/entities/benh_nhan_entity.dart';
import 'patient_detail_confirm_screen.dart';

class PatientSearchResultScreen extends StatefulWidget {
  final List<BenhNhanEntity> patients;
  final VoidCallback? onLinked;

  const PatientSearchResultScreen({
    super.key,
    required this.patients,
    this.onLinked,
  });

  @override
  State<PatientSearchResultScreen> createState() => _PatientSearchResultScreenState();
}

class _PatientSearchResultScreenState extends State<PatientSearchResultScreen> {
  Future<void> _openPatientDetail(BenhNhanEntity patient) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => PatientDetailConfirmScreen(
          patient: patient,
          onLinked: () {
            Navigator.of(context).pop(true);
          },
        ),
      ),
    );
    if (result == true && mounted) {
      if (widget.onLinked != null) {
        widget.onLinked!();
      } else {
        Navigator.of(context).pop(true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kết quả tìm kiếm'),
      ),
      body: Column(
        children: [
          // Header thông báo đã tìm thấy
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: Colors.green.withValues(alpha: 0.1),
            child: Row(
              children: [
                const Icon(
                  Icons.check_circle_outline,
                  color: Colors.green,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Đã tìm thấy ${widget.patients.length} hồ sơ của bạn. Vui lòng chọn đúng hồ sơ của bạn:',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.green[900],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: widget.patients.length,
              itemBuilder: (context, index) {
                final patient = widget.patients[index];
                return _buildPatientCard(context, patient);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPatientCard(BuildContext context, BenhNhanEntity patient) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: Colors.blue.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: () => _openPatientDetail(patient),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.blue.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  patient.gioiTinh == null
                      ? Icons.person_outline
                      : (patient.gioiTinh! ? Icons.man : Icons.woman),
                  size: 28,
                  color: Colors.blue,
                ),
              ),
              const SizedBox(width: 16),
              // Thông tin
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      patient.hoTen,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(
                          Icons.phone_outlined,
                          size: 15,
                          color: Colors.grey,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          patient.soDienThoai ?? 'Chưa cập nhật',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.credit_card_outlined,
                          size: 15,
                          color: Colors.grey,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          patient.cccd ?? 'Chưa cập nhật',
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: Colors.blue,
                size: 24,
              ),
            ],
          ),
        ),
      ),
    );
  }
}