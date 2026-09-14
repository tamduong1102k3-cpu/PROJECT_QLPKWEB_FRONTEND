import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import '../../data/entities/benh_nhan_entity.dart';
import '../../repositories/benh_nhan_repository.dart';
import '../../services/patient_service.dart';
import '../../utils/toast_helper.dart';

class UpdatePatientInfoScreen extends StatefulWidget {
  const UpdatePatientInfoScreen({super.key});

  @override
  State<UpdatePatientInfoScreen> createState() => _UpdatePatientInfoScreenState();
}

class _UpdatePatientInfoScreenState extends State<UpdatePatientInfoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _patientService = PatientService();
  final _benhNhanRepo = BenhNhanRepository();

  bool _isLoading = true;
  bool _isSaving = false;
  int? _maBenhNhan;

  // Controllers
  final _hoTenController = TextEditingController();
  final _ngaySinhController = TextEditingController();
  final _diaChiController = TextEditingController();
  final _soDienThoaiController = TextEditingController();
  final _emailController = TextEditingController();
  final _ngheNghiepController = TextEditingController();
  final _nhomMauController = TextEditingController();
  final _diUngThuocController = TextEditingController();
  final _tienSuBenhController = TextEditingController();
  final _nguoiGiamHoController = TextEditingController();
  final _sdtNguoiGiamHoController = TextEditingController();
  final _ghiChuController = TextEditingController();
  final _cccdController = TextEditingController();

  String? _gioiTinh;

  static const Color _primaryColor = Color(0xFF0891B2);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _borderColor = Color(0xFFE2E8F0);
  static const Color _bgSection = Color(0xFFF8FAFC);

  @override
  void initState() {
    super.initState();
    SchedulerBinding.instance.addPostFrameCallback((_) => _loadPatientInfo());
  }

  Future<void> _loadPatientInfo() async {
    setState(() => _isLoading = true);
    try {
      final patient = await _patientService.getMyProfile();
      if (patient != null && mounted) {
        _maBenhNhan = patient.maBenhNhan;
        _hoTenController.text = patient.hoTen;
        _ngaySinhController.text = patient.ngaySinh?.toString() ?? '';
        _diaChiController.text = patient.diaChi ?? '';
        _soDienThoaiController.text = patient.soDienThoai ?? '';
        _emailController.text = patient.email ?? '';
        _ngheNghiepController.text = patient.ngheNghiep ?? '';
        _nhomMauController.text = patient.nhomMau ?? '';
        _diUngThuocController.text = patient.diUngThuoc ?? '';
        _tienSuBenhController.text = patient.tienSuBenh ?? '';
        _nguoiGiamHoController.text = patient.nguoiGiamHo ?? '';
        _sdtNguoiGiamHoController.text = patient.soDienThoaiNguoiGiamHo ?? '';
        _ghiChuController.text = patient.ghiChu ?? '';
        _cccdController.text = patient.cccd ?? '';
        _gioiTinh = patient.gioiTinhDisplay;
      }
    } catch (e) {
      if (mounted) {
        ToastHelper.error(
          context: context,
          title: 'Lỗi tải thông tin',
          description: 'Không thể tải thông tin bệnh nhân: $e',
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _hoTenController.dispose();
    _ngaySinhController.dispose();
    _diaChiController.dispose();
    _soDienThoaiController.dispose();
    _emailController.dispose();
    _ngheNghiepController.dispose();
    _nhomMauController.dispose();
    _diUngThuocController.dispose();
    _tienSuBenhController.dispose();
    _nguoiGiamHoController.dispose();
    _sdtNguoiGiamHoController.dispose();
    _ghiChuController.dispose();
    _cccdController.dispose();
    super.dispose();
  }

  String? _validateHoTen(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập họ tên';
    if (v.length < 2) return 'Họ tên quá ngắn';
    if (v.length > 30) return 'Họ tên tối đa 30 ký tự';
    return null;
  }

  String? _validateNgaySinh(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập ngày sinh';
    try {
      String normalized = v;
      if (v.contains('/')) {
        final parts = v.split('/');
        if (parts.length == 3) {
          normalized = '${parts[2]}-${parts[1].padLeft(2, '0')}-${parts[0].padLeft(2, '0')}';
        } else {
          return 'Ngày sinh không đúng định dạng';
        }
      }
      final parsed = DateTime.parse(normalized);
      final now = DateTime.now();
      if (parsed.isAfter(now)) return 'Ngày sinh không được ở tương lai';
      if (now.year - parsed.year > 150) return 'Ngày sinh không hợp lệ';
    } catch (_) {
      return 'Ngày sinh không đúng định dạng (VD: 2000-01-15)';
    }
    return null;
  }

  String? _validateCccd(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập CCCD/CMND';
    final regex = RegExp(r'^\d{9}$|^\d{12}$');
    if (!regex.hasMatch(v)) {
      return 'CCCD/CMND phải gồm 9 hoặc 12 chữ số';
    }
    return null;
  }

  String? _validateSoDienThoai(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập số điện thoại';
    final regex = RegExp(r'^(0|\+84)[0-9]{9,10}$');
    if (!regex.hasMatch(v)) {
      return 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập email';
    final regex = RegExp(r'^[\w\.\-]+@([\w\-]+\.)+[a-zA-Z]{2,}$');
    if (!regex.hasMatch(v)) {
      return 'Email không đúng định dạng';
    }
    return null;
  }

  String? _validateDiaChi(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Vui lòng nhập địa chỉ';
    if (v.length < 5) return 'Địa chỉ quá ngắn';
    if (v.length > 255) return 'Địa chỉ tối đa 255 ký tự';
    return null;
  }

  String? _validateTienSuBenh(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) {
      return 'Vui lòng nhập tiền sử bệnh';
    }
    if (v.length > 255) {
      return 'Tiền sử bệnh tối đa 255 ký tự';
    }
    return null;
  }

  Future<void> _save() async {
    // Validate toàn bộ form - bắt buộc nhập đầy đủ và đúng định dạng
    if (!_formKey.currentState!.validate()) {
      ToastHelper.warning(
        context: context,
        title: 'Thiếu / Sai thông tin',
        description: 'Vui lòng nhập đầy đủ các trường bắt buộc (*) và đúng định dạng.',
      );
      return;
    }

    // Kiểm tra giới tính
    if (_gioiTinh == null || _gioiTinh == 'Chưa xác định') {
      ToastHelper.warning(
        context: context,
        title: 'Thiếu thông tin',
        description: 'Vui lòng chọn giới tính.',
      );
      return;
    }

    if (_maBenhNhan == null) {
      ToastHelper.error(context: context, title: 'Lỗi', description: 'Không tìm thấy mã bệnh nhân');
      return;
    }

    setState(() => _isSaving = true);

    try {
      // Parse ngaySinh
      LocalDate? ngaySinh;
      final ngaySinhText = _ngaySinhController.text.trim();
      if (ngaySinhText.isNotEmpty) {
        try {
          // Hỗ trợ cả định dạng dd/MM/yyyy và yyyy-MM-dd
          String normalized = ngaySinhText;
          if (ngaySinhText.contains('/')) {
            final parts = ngaySinhText.split('/');
            if (parts.length == 3) {
              normalized = '${parts[2]}-${parts[1].padLeft(2, '0')}-${parts[0].padLeft(2, '0')}';
            }
          }
          ngaySinh = LocalDate.parse(normalized);
        } catch (_) {
          // Nếu parse lỗi thì bỏ qua
        }
      }

      // Parse gioiTinh
      bool? gioiTinhBool;
      if (_gioiTinh == 'Nam') {
        gioiTinhBool = true;
      } else if (_gioiTinh == 'Nữ') {
        gioiTinhBool = false;
      }

      final entity = BenhNhanEntity(
        maBenhNhan: _maBenhNhan,
        hoTen: _hoTenController.text.trim(),
        ngaySinh: ngaySinh,
        diaChi: _diaChiController.text.trim(),
        soDienThoai: _soDienThoaiController.text.trim(),
        email: _emailController.text.trim(),
        ngheNghiep: _ngheNghiepController.text.trim().isEmpty ? null : _ngheNghiepController.text.trim(),
        nhomMau: _nhomMauController.text.trim().isEmpty ? null : _nhomMauController.text.trim(),
        diUngThuoc: _diUngThuocController.text.trim().isEmpty ? null : _diUngThuocController.text.trim(),
        tienSuBenh: _tienSuBenhController.text.trim(),
        nguoiGiamHo: _nguoiGiamHoController.text.trim().isEmpty ? null : _nguoiGiamHoController.text.trim(),
        soDienThoaiNguoiGiamHo: _sdtNguoiGiamHoController.text.trim().isEmpty ? null : _sdtNguoiGiamHoController.text.trim(),
        ghiChu: _ghiChuController.text.trim().isEmpty ? null : _ghiChuController.text.trim(),
        cccd: _cccdController.text.trim(),
        gioiTinh: gioiTinhBool,
      );

      await _benhNhanRepo.update(_maBenhNhan!, entity);

      if (mounted) {
        ToastHelper.success(
          context: context,
          title: 'Cập nhật thành công',
          description: 'Thông tin bệnh nhân đã được cập nhật.',
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        final raw = e.toString();
        // Trích xuất message từ exception (VD: "Exception: Vui lòng nhập ngày sinh")
        String message = raw;
        if (raw.contains('Exception: ')) {
          message = raw.split('Exception: ').last;
        }
        ToastHelper.error(
          context: context,
          title: 'Cập nhật thất bại',
          description: message,
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Cập nhật thông tin',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: _foregroundColor),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: false,
        foregroundColor: _foregroundColor,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Lưu ý bắt buộc
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.warning_amber_rounded, color: Colors.red, size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Các trường có dấu * là bắt buộc và phải đúng định dạng. Vui lòng nhập đầy đủ trước khi lưu.',
                              style: TextStyle(fontSize: 13, color: Colors.red, height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // === THÔNG TIN CƠ BẢN ===
                    _buildSectionHeader('Thông tin cơ bản'),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _hoTenController,
                      label: 'Họ và tên *',
                      icon: Icons.person_outline,
                      validator: _validateHoTen,
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _ngaySinhController,
                      label: 'Ngày sinh * (yyyy-MM-dd)',
                      icon: Icons.calendar_today_outlined,
                      hint: '2000-01-15',
                      validator: _validateNgaySinh,
                    ),
                    const SizedBox(height: 12),
                    _buildGenderSelector(),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _cccdController,
                      label: 'CCCD/CMND *',
                      icon: Icons.credit_card_outlined,
                      validator: _validateCccd,
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _soDienThoaiController,
                      label: 'Số điện thoại *',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                      validator: _validateSoDienThoai,
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _emailController,
                      label: 'Email *',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      validator: _validateEmail,
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _diaChiController,
                      label: 'Địa chỉ *',
                      icon: Icons.location_on_outlined,
                      maxLines: 2,
                      validator: _validateDiaChi,
                    ),

                    const SizedBox(height: 24),

                    // === THÔNG TIN Y TẾ ===
                    _buildSectionHeader('Thông tin y tế'),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _ngheNghiepController,
                      label: 'Nghề nghiệp',
                      icon: Icons.work_outline,
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _nhomMauController,
                      label: 'Nhóm máu',
                      icon: Icons.bloodtype_outlined,
                      hint: 'A+, B+, O+, AB+...',
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _diUngThuocController,
                      label: 'Dị ứng thuốc',
                      icon: Icons.warning_amber_outlined,
                      hint: 'Ghi rõ loại thuốc nếu có',
                      maxLines: 2,
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _tienSuBenhController,
                      label: 'Tiền sử bệnh *',
                      icon: Icons.folder_special_outlined,
                      maxLines: 3,
                      validator: _validateTienSuBenh,
                    ),

                    const SizedBox(height: 24),

                    // === NGƯỜI GIÁM HỘ ===
                    _buildSectionHeader('Người giám hộ (nếu có)'),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _nguoiGiamHoController,
                      label: 'Tên người giám hộ',
                      icon: Icons.people_outline,
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _sdtNguoiGiamHoController,
                      label: 'SĐT người giám hộ',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                    ),

                    const SizedBox(height: 24),

                    // === GHI CHÚ ===
                    _buildSectionHeader('Ghi chú'),
                    const SizedBox(height: 12),
                    _buildTextField(
                      controller: _ghiChuController,
                      label: 'Ghi chú',
                      icon: Icons.note_outlined,
                      maxLines: 3,
                    ),

                    const SizedBox(height: 32),

                    // === NÚT LƯU ===
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Lưu thông tin',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                              ),
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      children: [
        Container(
          width: 3,
          height: 18,
          decoration: BoxDecoration(
            color: _primaryColor,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: _foregroundColor,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: const TextStyle(fontSize: 14, color: _foregroundColor),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: TextStyle(color: _mutedForeground.withValues(alpha: 0.5), fontSize: 13),
        prefixIcon: Icon(icon, size: 20, color: _mutedForeground),
        filled: true,
        fillColor: _bgSection,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: _borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: _borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _primaryColor, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFDC2626)),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: const TextStyle(fontSize: 13, color: _mutedForeground),
      ),
    );
  }

  Widget _buildGenderSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          decoration: BoxDecoration(
            color: _bgSection,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: (_gioiTinh == null || _gioiTinh == 'Chưa xác định')
                  ? const Color(0xFFDC2626)
                  : _borderColor,
            ),
          ),
          child: Row(
            children: [
              Icon(Icons.wc_outlined, size: 20, color: _mutedForeground),
              const SizedBox(width: 14),
              const Text(
                'Giới tính *',
                style: TextStyle(fontSize: 13, color: _mutedForeground),
              ),
              const Spacer(),
              ChoiceChip(
                label: const Text('Nam'),
                selected: _gioiTinh == 'Nam',
                selectedColor: _primaryColor.withValues(alpha: 0.15),
                labelStyle: TextStyle(
                  color: _gioiTinh == 'Nam' ? _primaryColor : _mutedForeground,
                  fontWeight: _gioiTinh == 'Nam' ? FontWeight.w600 : FontWeight.w400,
                  fontSize: 13,
                ),
                onSelected: (selected) {
                  if (selected) setState(() => _gioiTinh = 'Nam');
                },
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                side: BorderSide.none,
                visualDensity: VisualDensity.compact,
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Nữ'),
                selected: _gioiTinh == 'Nữ',
                selectedColor: Colors.pink.withValues(alpha: 0.15),
                labelStyle: TextStyle(
                  color: _gioiTinh == 'Nữ' ? Colors.pink : _mutedForeground,
                  fontWeight: _gioiTinh == 'Nữ' ? FontWeight.w600 : FontWeight.w400,
                  fontSize: 13,
                ),
                onSelected: (selected) {
                  if (selected) setState(() => _gioiTinh = 'Nữ');
                },
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                side: BorderSide.none,
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ),
        if (_gioiTinh == null || _gioiTinh == 'Chưa xác định') ...[
          const SizedBox(height: 4),
          const Padding(
            padding: EdgeInsets.only(left: 16),
            child: Text(
              'Vui lòng chọn giới tính',
              style: TextStyle(fontSize: 12, color: Color(0xFFDC2626)),
            ),
          ),
        ],
      ],
    );
  }
}