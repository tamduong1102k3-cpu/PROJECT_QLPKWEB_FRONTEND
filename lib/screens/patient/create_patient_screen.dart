import 'package:flutter/material.dart';
import '../../services/patient_service.dart';
import '../../services/auth_service.dart';
import '../../utils/toast_helper.dart';

class CreatePatientScreen extends StatefulWidget {
  final VoidCallback? onCreated;

  const CreatePatientScreen({super.key, this.onCreated});

  @override
  State<CreatePatientScreen> createState() => _CreatePatientScreenState();
}

class _CreatePatientScreenState extends State<CreatePatientScreen> {
  final _formKey = GlobalKey<FormState>();
  final _hoTenController = TextEditingController();
  final _soDienThoaiController = TextEditingController();
  final _cccdController = TextEditingController();
  final _diaChiController = TextEditingController();
  final _emailController = TextEditingController();
  final _ngaySinhController = TextEditingController();
  final _tienSuBenhController = TextEditingController();
  final _patientService = PatientService();
  final _authService = AuthService();
  bool _isLoading = false;
  String? _gioiTinh;
  DateTime? _ngaySinh;

  @override
  void initState() {
    super.initState();
    // Pre-fill email from auth if available
    if (_authService.currentUser?.email != null) {
      _emailController.text = _authService.currentUser?.email ?? '';
    }
  }

  @override
  void dispose() {
    _hoTenController.dispose();
    _soDienThoaiController.dispose();
    _cccdController.dispose();
    _diaChiController.dispose();
    _emailController.dispose();
    _ngaySinhController.dispose();
    _tienSuBenhController.dispose();
    super.dispose();
  }

  Future<void> _createPatient() async {
    // Validate toàn bộ form, nếu lỗi sẽ hiện cảnh báo trên từng trường
    if (!_formKey.currentState!.validate()) {
      ToastHelper.warning(
        context: context,
        title: 'Thiếu / Sai thông tin',
        description: 'Vui lòng kiểm tra lại các trường có dấu * và đáp ứng đúng định dạng yêu cầu.',
      );
      return;
    }

    // Kiểm tra giới tính có được chọn chưa
    if (_gioiTinh == null) {
      ToastHelper.warning(
        context: context,
        title: 'Thiếu thông tin',
        description: 'Vui lòng chọn giới tính.',
      );
      return;
    }

    setState(() => _isLoading = true);

    final hoTen = _hoTenController.text.trim();
    final soDienThoai = _soDienThoaiController.text.trim();
    final cccd = _cccdController.text.trim();

    try {
      final patient = await _patientService.createAndLinkPatient(
        hoTen: hoTen,
        soDienThoai: soDienThoai,
        cccd: cccd,
        diaChi: _diaChiController.text.trim().isNotEmpty
            ? _diaChiController.text.trim()
            : null,
        email: _emailController.text.trim().isNotEmpty
            ? _emailController.text.trim()
            : null,
        gioiTinh: _gioiTinh,
        ngaySinh: _ngaySinh,
        tienSuBenh: _tienSuBenhController.text.trim().isNotEmpty
            ? _tienSuBenhController.text.trim()
            : null,
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (patient != null && patient.maBenhNhan != null) {
        ToastHelper.success(context: context, title: 'Tạo hồ sơ thành công!', description: 'Mã BN: ${patient.maBenhNhan}');
        if (widget.onCreated != null) {
          widget.onCreated!();
        } else {
          Navigator.of(context).pop(true);
        }
      } else {
        ToastHelper.error(context: context, title: 'Tạo hồ sơ thất bại', description: 'Vui lòng thử lại.');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      final message = e.toString().replaceFirst('Exception: ', '');
      ToastHelper.error(
        context: context,
        title: 'Tạo hồ sơ thất bại',
        description: message,
      );
    }
  }

  Future<void> _selectNgaySinh() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _ngaySinh ?? DateTime(now.year - 30, 1, 1),
      firstDate: DateTime(1900),
      lastDate: now,
      locale: const Locale('vi', 'VN'),
    );
    if (picked != null) {
      setState(() {
        _ngaySinh = picked;
        _ngaySinhController.text =
            '${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}';
      });
    }
  }

  /// Validate họ tên: không rỗng, độ dài hợp lý
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

  /// Validate email: đúng định dạng
  String? _validateEmail(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập email';
    final regex = RegExp(r'^[\w\.\-]+@([\w\-]+\.)+[a-zA-Z]{2,}$');
    if (!regex.hasMatch(v)) {
      return 'Email không đúng định dạng';
    }
    return null;
  }

  /// Validate địa chỉ
  String? _validateDiaChi(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập địa chỉ';
    if (v.length < 5) return 'Địa chỉ quá ngắn';
    if (v.length > 255) return 'Địa chỉ tối đa 255 ký tự';
    return null;
  }

  /// Validate ngày sinh đã chọn
  String? _validateNgaySinh(String? value) {
    if (_ngaySinh == null) return 'Vui lòng chọn ngày sinh';
    final now = DateTime.now();
    if (_ngaySinh!.isAfter(now)) return 'Ngày sinh không được ở tương lai';
    if (now.year - _ngaySinh!.year > 150) return 'Ngày sinh không hợp lệ';
    return null;
  }

  /// Validate tiền sử bệnh
  String? _validateTienSuBenh(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập tiền sử bệnh';
    if (v.length > 255) return 'Tiền sử bệnh tối đa 255 ký tự';
    return null;
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
    bool readOnly = false,
    VoidCallback? onTap,
    String? hint,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
      readOnly: readOnly,
      onTap: onTap,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: const OutlineInputBorder(),
        prefixIcon: Icon(icon),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tạo hồ sơ mới'),
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
                Icons.person_add,
                size: 72,
                color: Colors.blue,
              ),
              const SizedBox(height: 16),
              const Text(
                'Tạo hồ sơ bệnh nhân mới',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Vui lòng nhập đầy đủ thông tin. Các trường có dấu * là bắt buộc.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.red[700],
                ),
              ),
              const SizedBox(height: 32),

              // Họ và tên
              _buildTextField(
                controller: _hoTenController,
                label: 'Họ và tên *',
                icon: Icons.person_outline,
                validator: _validateHoTen,
              ),
              const SizedBox(height: 16),

              // Số điện thoại
              _buildTextField(
                controller: _soDienThoaiController,
                label: 'Số điện thoại *',
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
                validator: _validateSoDienThoai,
              ),
              const SizedBox(height: 16),

              // CCCD
              _buildTextField(
                controller: _cccdController,
                label: 'CCCD/CMND *',
                icon: Icons.credit_card_outlined,
                keyboardType: TextInputType.number,
                validator: _validateCccd,
              ),
              const SizedBox(height: 16),

              // Ngày sinh
              _buildTextField(
                controller: _ngaySinhController,
                label: 'Ngày sinh *',
                icon: Icons.calendar_today,
                hint: 'Chọn ngày sinh',
                readOnly: true,
                onTap: _selectNgaySinh,
                validator: _validateNgaySinh,
              ),
              const SizedBox(height: 16),

              // Giới tính
              DropdownButtonFormField<String>(
                initialValue: _gioiTinh,
                decoration: const InputDecoration(
                  labelText: 'Giới tính *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.wc),
                ),
                items: const [
                  DropdownMenuItem(value: 'Nam', child: Text('Nam')),
                  DropdownMenuItem(value: 'Nữ', child: Text('Nữ')),
                ],
                onChanged: (value) {
                  setState(() => _gioiTinh = value);
                },
                validator: (value) =>
                    value == null ? 'Vui lòng chọn giới tính' : null,
              ),
              const SizedBox(height: 16),

              // Email
              _buildTextField(
                controller: _emailController,
                label: 'Email *',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: _validateEmail,
              ),
              const SizedBox(height: 16),

              // Địa chỉ
              _buildTextField(
                controller: _diaChiController,
                label: 'Địa chỉ *',
                icon: Icons.location_on_outlined,
                maxLines: 2,
                validator: _validateDiaChi,
              ),
              const SizedBox(height: 16),

              // Tiền sử bệnh
              _buildTextField(
                controller: _tienSuBenhController,
                label: 'Tiền sử bệnh *',
                icon: Icons.folder_special_outlined,
                maxLines: 3,
                validator: _validateTienSuBenh,
              ),
              const SizedBox(height: 24),

              // Nút tạo
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _createPatient,
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
                          'Tạo hồ sơ',
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