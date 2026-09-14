import 'package:flutter/material.dart';
import '../../services/patient_service.dart';
import '../../utils/toast_helper.dart';
import 'patient_search_result_screen.dart';

class SearchPatientScreen extends StatefulWidget {
  final VoidCallback? onLinked;

  const SearchPatientScreen({super.key, this.onLinked});

  @override
  State<SearchPatientScreen> createState() => _SearchPatientScreenState();
}

class _SearchPatientScreenState extends State<SearchPatientScreen> {
  final _formKey = GlobalKey<FormState>();
  final _hoTenController = TextEditingController();
  final _soDienThoaiController = TextEditingController();
  final _cccdController = TextEditingController();
  final _patientService = PatientService();
  bool _isLoading = false;

  @override
  void dispose() {
    _hoTenController.dispose();
    _soDienThoaiController.dispose();
    _cccdController.dispose();
    super.dispose();
  }

  /// Validate họ tên: không rỗng
  String? _validateHoTen(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập họ và tên';
    if (v.length < 2) return 'Họ tên quá ngắn';
    if (v.length > 30) return 'Họ tên tối đa 30 ký tự';
    return null;
  }

  /// Validate số điện thoại: 10-11 số, bắt đầu bằng 0
  String? _validateSoDienThoai(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập số điện thoại';
    final regex = RegExp(r'^(0|\+84)[0-9]{9,10}$');
    if (!regex.hasMatch(v)) {
      return 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }
    return null;
  }

  /// Validate CCCD/CMND: 9 hoặc 12 số
  String? _validateCccd(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập CCCD/CMND';
    final regex = RegExp(r'^\d{9}$|^\d{12}$');
    if (!regex.hasMatch(v)) {
      return 'CCCD/CMND phải gồm 9 hoặc 12 chữ số';
    }
    return null;
  }

  Future<void> _searchPatient() async {
    // Validate toàn bộ form - bắt buộc nhập đầy đủ và đúng định dạng
    if (!_formKey.currentState!.validate()) {
      ToastHelper.warning(
        context: context,
        title: 'Thiếu / Sai thông tin',
        description: 'Vui lòng nhập đầy đủ và đúng định dạng thông tin để tìm hồ sơ.',
      );
      return;
    }

    final hoTen = _hoTenController.text.trim();
    final soDienThoai = _soDienThoaiController.text.trim();
    final cccd = _cccdController.text.trim();

    setState(() => _isLoading = true);

    // Chỉ tìm kiếm, không liên kết (liên kết ở bước sau)
    final patients = await _patientService.searchPatients(
      hoTen: hoTen,
      soDienThoai: soDienThoai,
      cccd: cccd,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (patients.isNotEmpty) {
      // Điều hướng sang màn danh sách kết quả để người dùng chọn hồ sơ
      final result = await Navigator.of(context).push<bool>(
        MaterialPageRoute(
          builder: (_) => PatientSearchResultScreen(
            patients: patients,
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
    } else {
      ToastHelper.warning(
        context: context,
        title: 'Không tìm thấy hồ sơ',
        description: 'Vui lòng kiểm tra lại thông tin. Không có hồ sơ bệnh nhân nào khớp với thông tin đã nhập.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tìm hồ sơ bệnh nhân'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              const Icon(
                Icons.search,
                size: 72,
                color: Colors.blue,
              ),
              const SizedBox(height: 16),
              const Text(
                'Nhập thông tin để tìm hồ sơ',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Vui lòng nhập đầy đủ chính xác. Các trường có dấu * là bắt buộc.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.red[700],
                ),
              ),
              const SizedBox(height: 32),
              TextFormField(
                controller: _hoTenController,
                validator: _validateHoTen,
                decoration: const InputDecoration(
                  labelText: 'Họ và tên *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _soDienThoaiController,
                keyboardType: TextInputType.phone,
                validator: _validateSoDienThoai,
                decoration: const InputDecoration(
                  labelText: 'Số điện thoại *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _cccdController,
                keyboardType: TextInputType.number,
                validator: _validateCccd,
                decoration: const InputDecoration(
                  labelText: 'CCCD/CMND *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.credit_card_outlined),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _searchPatient,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Tìm hồ sơ',
                          style: TextStyle(fontSize: 16),
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