import 'package:flutter/material.dart';
import '../../data/entities/benh_nhan_entity.dart';
import '../../services/patient_service.dart';
import '../../utils/toast_helper.dart';
import 'create_patient_screen.dart';

class PatientDetailConfirmScreen extends StatefulWidget {
  final BenhNhanEntity patient;
  final VoidCallback? onLinked;

  const PatientDetailConfirmScreen({
    super.key,
    required this.patient,
    this.onLinked,
  });

  @override
  State<PatientDetailConfirmScreen> createState() => _PatientDetailConfirmScreenState();
}

class _PatientDetailConfirmScreenState extends State<PatientDetailConfirmScreen> {
  final _patientService = PatientService();
  bool _isLinking = false;

  /// Danh sách các trường bắt buộc và cách kiểm tra
  List<Map<String, String>> get _missingRequiredFields {
    final p = widget.patient;
    final missing = <Map<String, String>>[];

    if (p.hoTen.trim().isEmpty) {
      missing.add({'field': 'Họ và tên', 'detail': 'Chưa có họ tên'});
    }
    if (p.ngaySinh == null) {
      missing.add({'field': 'Ngày sinh', 'detail': 'Chưa cập nhật'});
    }
    if (p.gioiTinh == null) {
      missing.add({'field': 'Giới tính', 'detail': 'Chưa xác định'});
    }
    if (p.cccd == null || p.cccd!.trim().isEmpty) {
      missing.add({'field': 'CCCD/CMND', 'detail': 'Chưa cập nhật'});
    }
    if (p.soDienThoai == null || p.soDienThoai!.trim().isEmpty) {
      missing.add({'field': 'Số điện thoại', 'detail': 'Chưa cập nhật'});
    }
    if (p.email == null || p.email!.trim().isEmpty) {
      missing.add({'field': 'Email', 'detail': 'Chưa cập nhật'});
    }
    if (p.diaChi == null || p.diaChi!.trim().isEmpty) {
      missing.add({'field': 'Địa chỉ', 'detail': 'Chưa cập nhật'});
    }
    if (p.tienSuBenh == null || p.tienSuBenh!.trim().isEmpty) {
      missing.add({'field': 'Tiền sử bệnh', 'detail': 'Chưa cập nhật'});
    }

    return missing;
  }

  bool get _isProfileComplete => _missingRequiredFields.isEmpty;

  String get _ngaySinhDisplay {
    final ngaySinh = widget.patient.ngaySinh;
    if (ngaySinh == null) return 'Chưa cập nhật';
    final dt = ngaySinh.toDateTime();
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  Future<void> _linkPatient() async {
    // Kiểm tra hồ sơ đầy đủ thông tin trước khi liên kết
    if (!_isProfileComplete) {
      ToastHelper.warning(
        context: context,
        title: 'Hồ sơ thiếu thông tin',
        description:
            'Hồ sơ này chưa đầy đủ thông tin bắt buộc (${_missingRequiredFields.map((e) => e['field']).join(', ')}). Vui lòng chọn hồ sơ khác hoặc tạo hồ sơ mới.',
      );
      return;
    }

    setState(() => _isLinking = true);

    final linkedPatient = await _patientService.linkPatient(widget.patient);

    if (!mounted) return;
    setState(() => _isLinking = false);

    if (linkedPatient != null) {
      ToastHelper.success(
        context: context,
        title: 'Liên kết hồ sơ thành công!',
        description: 'Mã BN: ${linkedPatient.maBenhNhan}',
      );
      if (widget.onLinked != null) {
        widget.onLinked!();
      } else {
        Navigator.of(context).pop(true);
      }
    } else {
      ToastHelper.error(
        context: context,
        title: 'Liên kết thất bại',
        description: 'Vui lòng thử lại.',
      );
    }
  }

  void _notMyProfile() {
    Navigator.of(context).pop();
  }

  Future<void> _goCreateNewProfile() async {
    // Đóng màn hình xác nhận chi tiết hiện tại
    Navigator.of(context).pop();
    // Đóng màn kết quả tìm kiếm (quay về màn tìm kiếm chính)
    Navigator.of(context).pop();
    // Điều hướng sang màn tạo hồ sơ mới đầy đủ thông tin
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CreatePatientScreen(
          onCreated: () {
            // Tạo thành công → trở về trang chủ (đã có hồ sơ liên kết)
            Navigator.of(context).popUntil((route) => route.isFirst);
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final patient = widget.patient;
    final missingFields = _missingRequiredFields;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết hồ sơ'),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: Colors.blue.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            patient.gioiTinh == null
                                ? Icons.person_outline
                                : (patient.gioiTinh! ? Icons.man : Icons.woman),
                            size: 44,
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          patient.hoTen,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.withValues(alpha: 0.2)),
                    ),
                    child: Column(
                      children: [
                        _buildInfoRow(
                          icon: Icons.badge_outlined,
                          label: 'Mã bệnh nhân',
                          value: patient.maBenhNhan?.toString() ?? '--',
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.person_outline,
                          label: 'Họ và tên',
                          value: patient.hoTen,
                          isMissing: patient.hoTen.trim().isEmpty,
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.cake_outlined,
                          label: 'Ngày sinh',
                          value: _ngaySinhDisplay,
                          isMissing: patient.ngaySinh == null,
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.wc,
                          label: 'Giới tính',
                          value: patient.gioiTinhDisplay,
                          isMissing: patient.gioiTinh == null,
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.phone_outlined,
                          label: 'Số điện thoại',
                          value: patient.soDienThoai ?? '--',
                          isMissing: patient.soDienThoai == null || patient.soDienThoai!.trim().isEmpty,
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.credit_card_outlined,
                          label: 'CCCD/CMND',
                          value: patient.cccd ?? '--',
                          isMissing: patient.cccd == null || patient.cccd!.trim().isEmpty,
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.email_outlined,
                          label: 'Email',
                          value: patient.email ?? '--',
                          isMissing: patient.email == null || patient.email!.trim().isEmpty,
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.location_on_outlined,
                          label: 'Địa chỉ',
                          value: patient.diaChi ?? '--',
                          isMissing: patient.diaChi == null || patient.diaChi!.trim().isEmpty,
                        ),
                        _buildDivider(),
                        _buildInfoRow(
                          icon: Icons.folder_special_outlined,
                          label: 'Tiền sử bệnh',
                          value: patient.tienSuBenh ?? '--',
                          isMissing: patient.tienSuBenh == null || patient.tienSuBenh!.trim().isEmpty,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Warning: hồ sơ thiếu thông tin
                  if (!_isProfileComplete) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(
                                Icons.error_outline,
                                color: Colors.red,
                                size: 20,
                              ),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Hồ sơ này thiếu thông tin bắt buộc',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ...missingFields.map(
                            (item) => Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.cancel_outlined,
                                    color: Colors.red,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      '${item['field']}: ${item['detail']}',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Colors.red,
                                        height: 1.3,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Vui lòng chọn hồ sơ khác hoặc tạo hồ sơ mới với đầy đủ thông tin.',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.red,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: Colors.orange,
                            size: 20,
                          ),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Vui lòng kiểm tra kỹ thông tin. Đây có phải là hồ sơ của bạn không?',
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.orange,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ],
              ),
            ),
          ),

          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Colors.grey, width: 0.5),
              ),
            ),
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: _isLinking ? null : _linkPatient,
                    icon: _isLinking
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.link_rounded, size: 20),
                    label: Text(
                      _isLinking ? 'Đang liên kết...' : 'Liên kết hồ sơ',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isProfileComplete ? Colors.blue : Colors.grey,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton.icon(
                    onPressed: _isLinking
                        ? null
                        : (_isProfileComplete ? _notMyProfile : _goCreateNewProfile),
                    icon: const Icon(Icons.close_rounded, size: 20),
                    label: Text(
                      _isProfileComplete
                          ? 'Đây không phải là hồ sơ của tôi'
                          : 'Tạo hồ sơ mới với đầy đủ thông tin',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.grey[700],
                      side: BorderSide(color: Colors.grey.withValues(alpha: 0.4)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    bool isMissing = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            size: 20,
            color: isMissing ? Colors.red : Colors.grey[600],
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: isMissing ? Colors.red : Colors.grey[600],
                fontWeight: isMissing ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isMissing ? Colors.red : const Color(0xFF1E293B),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Divider(
      height: 1,
      thickness: 0.5,
      color: Colors.grey.withValues(alpha: 0.15),
    );
  }
}