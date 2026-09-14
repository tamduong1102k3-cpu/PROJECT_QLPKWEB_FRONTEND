import 'package:flutter/material.dart';
import '../../data/entities/lich_kham_entity.dart';
import '../../data/entities/chuyen_khoa_entity.dart';
import '../../data/entities/dich_vu_entity.dart';
import '../../data/entities/nhan_vien_entity.dart';
import '../../repositories/lich_kham_repository.dart';
import '../../repositories/chuyen_khoa_repository.dart';
import '../../repositories/dich_vu_repository.dart';
import '../../repositories/nhan_vien_repository.dart';
import '../../utils/toast_helper.dart';

class AppointmentEditScreen extends StatefulWidget {
  final LichKhamEntity appointment;

  const AppointmentEditScreen({super.key, required this.appointment});

  @override
  State<AppointmentEditScreen> createState() => _AppointmentEditScreenState();
}

class _AppointmentEditScreenState extends State<AppointmentEditScreen> {
  final _lichKhamRepo = LichKhamRepository();
  final _chuyenKhoaRepo = ChuyenKhoaRepository();
  final _dichVuRepo = DichVuRepository();
  final _nhanVienRepo = NhanVienRepository();
  final _ghiChuController = TextEditingController();

  ChuyenKhoaEntity? _selectedChuyenKhoa;
  DichVuEntity? _selectedDichVu;
  NhanVienEntity? _selectedBacSi;
  String _selectedNgayKham = '';
  bool _isLoading = false;
  bool _isLoadingData = true;

  List<ChuyenKhoaEntity> _chuyenKhoaList = [];
  List<DichVuEntity> _allDichVuList = [];
  List<DichVuEntity> _filteredDichVuList = [];
  List<NhanVienEntity> _bacSiList = [];

  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);

  @override
  void initState() {
    super.initState();
    _ghiChuController.text = widget.appointment.ghiChu ?? '';
    _initFromAppointment();
    _loadData();
  }

  void _initFromAppointment() {
    _selectedNgayKham = widget.appointment.ngayKham;
  }

  Future<void> _loadData() async {
    setState(() => _isLoadingData = true);
    try {
      final results = await Future.wait([
        _chuyenKhoaRepo.getAll(),
        _dichVuRepo.getAll(),
      ]);
      if (!mounted) return;

      final chuyenKhoaList = results[0] as List<ChuyenKhoaEntity>;
      final allDichVuList = results[1] as List<DichVuEntity>;

      // Find matching entities for pre-selection
      ChuyenKhoaEntity? matchingChuyenKhoa;
      try {
        matchingChuyenKhoa = chuyenKhoaList.firstWhere(
          (ck) => ck.maChuyenKhoa == widget.appointment.maChuyenKhoa,
        );
      } catch (_) {}

      // Load doctors for this specialty
      List<NhanVienEntity> bacSiList = [];
      if (matchingChuyenKhoa != null) {
        try {
          bacSiList = await _nhanVienRepo.getBacSiByChuyenKhoa(matchingChuyenKhoa.maChuyenKhoa);
        } catch (_) {}
      }

      // Filter services by specialty
      final int? maChuyenKhoaId = matchingChuyenKhoa?.maChuyenKhoa;
      final List<DichVuEntity> filteredDichVu = maChuyenKhoaId != null
          ? allDichVuList.where((dv) => dv.maChuyenKhoa == maChuyenKhoaId).toList()
          : [];

      // Find matching doctor
      NhanVienEntity? matchingBacSi;
      if (widget.appointment.maBacSi != null) {
        try {
          matchingBacSi = bacSiList.firstWhere(
            (bs) => bs.maNhanVien == widget.appointment.maBacSi,
          );
        } catch (_) {}
      }

      // Find matching service
      DichVuEntity? matchingDichVu;
      try {
        matchingDichVu = filteredDichVu.firstWhere(
          (dv) => dv.maDichVu == widget.appointment.maDichVu,
        );
      } catch (_) {}

      if (!mounted) return;
      setState(() {
        _chuyenKhoaList = chuyenKhoaList;
        _allDichVuList = allDichVuList;
        _filteredDichVuList = filteredDichVu;
        _bacSiList = bacSiList;
        _selectedChuyenKhoa = matchingChuyenKhoa;
        _selectedBacSi = matchingBacSi;
        _selectedDichVu = matchingDichVu;
        _isLoadingData = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoadingData = false);
      ToastHelper.error(
        context: context,
        title: 'Không thể tải dữ liệu',
        description: 'Vui lòng kiểm tra kết nối và thử lại.',
      );
    }
  }

  void _onChuyenKhoaChanged(ChuyenKhoaEntity? chuyenKhoa) async {
    setState(() {
      _selectedChuyenKhoa = chuyenKhoa;
      _selectedDichVu = null;
      _selectedBacSi = null;
      _bacSiList = [];
      if (chuyenKhoa != null) {
        _filteredDichVuList = _allDichVuList
            .where((dv) => dv.maChuyenKhoa == chuyenKhoa.maChuyenKhoa)
            .toList();
      } else {
        _filteredDichVuList = [];
      }
    });

    if (chuyenKhoa != null) {
      try {
        final bacSiList = await _nhanVienRepo.getBacSiByChuyenKhoa(chuyenKhoa.maChuyenKhoa);
        if (!mounted) return;
        setState(() => _bacSiList = bacSiList);
      } catch (e) {
        if (!mounted) return;
        ToastHelper.error(
          context: context,
          title: 'Không thể tải danh sách bác sĩ',
        );
      }
    }
  }

  Future<void> _pickDate() async {
    // Parse existing date
    DateTime initialDate = DateTime.now().add(const Duration(days: 1));
    if (_selectedNgayKham.length >= 10) {
      final parts = _selectedNgayKham.split('-');
      if (parts.length == 3) {
        initialDate = DateTime(
          int.parse(parts[0]),
          int.parse(parts[1]),
          int.parse(parts[2]),
        );
      }
    }

    final date = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      locale: const Locale('vi', 'VN'),
    );
    if (date != null) {
      setState(() {
        _selectedNgayKham =
            '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      });
    }
  }

  String _formatDateDisplay(String dateStr) {
    if (dateStr.length >= 10) {
      final parts = dateStr.split('-');
      if (parts.length == 3) {
        return '${parts[2]}/${parts[1]}/${parts[0]}';
      }
    }
    return dateStr;
  }

  Future<void> _submitUpdate() async {
    if (_selectedChuyenKhoa == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn chuyên khoa');
      return;
    }
    if (_selectedBacSi == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn bác sĩ');
      return;
    }
    if (_selectedDichVu == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn dịch vụ');
      return;
    }
    if (_selectedNgayKham.isEmpty) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn ngày khám');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final updatedEntity = LichKhamEntity(
        id: widget.appointment.id,
        maBenhNhan: widget.appointment.maBenhNhan,
        maChuyenKhoa: _selectedChuyenKhoa!.maChuyenKhoa,
        maBacSi: _selectedBacSi!.maNhanVien,
        maDichVu: _selectedDichVu!.maDichVu,
        maCa: widget.appointment.maCa,
        ngayKham: _selectedNgayKham,
        ghiChu: _ghiChuController.text.trim().isNotEmpty
            ? _ghiChuController.text.trim()
            : null,
        trangThai: widget.appointment.trangThai,
      );

      await _lichKhamRepo.update(widget.appointment.id!, updatedEntity);

      if (!mounted) return;
      setState(() => _isLoading = false);
      ToastHelper.success(context: context, title: 'Cập nhật lịch khám thành công');
      Navigator.of(context).pop(true); // Return true to indicate changes
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ToastHelper.error(
        context: context,
        title: 'Cập nhật thất bại',
        description: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  @override
  void dispose() {
    _ghiChuController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Chỉnh sửa lịch hẹn',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: _foregroundColor),
        ),
        backgroundColor: _cardColor,
        elevation: 0,
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _borderColor, height: 1.0),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: _foregroundColor, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _isLoadingData
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Thông báo
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _primaryColor.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _primaryColor.withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.info_outline_rounded, size: 18, color: _primaryColor),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Chỉnh sửa thông tin lịch khám #${widget.appointment.id}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: _primaryColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Form
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _cardColor,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _borderColor),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Chuyên khoa
                        _buildLabel('Chuyên khoa khám *'),
                        const SizedBox(height: 6),
                        _buildChuyenKhoaDropdown(),
                        const SizedBox(height: 16),

                        // Bác sĩ
                        _buildLabel('Bác sĩ khám *'),
                        const SizedBox(height: 6),
                        _buildBacSiDropdown(),
                        const SizedBox(height: 16),

                        // Dịch vụ
                        _buildLabel('Dịch vụ khám *'),
                        const SizedBox(height: 6),
                        _buildDichVuDropdown(),
                        const SizedBox(height: 16),

                        // Ngày khám
                        _buildLabel('Ngày khám *'),
                        const SizedBox(height: 6),
                        InkWell(
                          onTap: _pickDate,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: _borderColor),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today_rounded, size: 18, color: _primaryColor),
                                const SizedBox(width: 8),
                                Text(
                                  _formatDateDisplay(_selectedNgayKham),
                                  style: const TextStyle(fontSize: 14, color: _foregroundColor),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Ghi chú
                        _buildLabel('Ghi chú'),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _ghiChuController,
                          maxLines: 3,
                          style: const TextStyle(fontSize: 14, color: _foregroundColor),
                          decoration: InputDecoration(
                            hintText: 'Mô tả triệu chứng hoặc ghi chú thêm',
                            hintStyle: const TextStyle(color: _mutedForeground, fontSize: 13),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: _borderColor),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: _borderColor),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: _primaryColor, width: 1.5),
                            ),
                            prefixIcon: const Icon(Icons.note_outlined, size: 18, color: _mutedForeground),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Buttons
                  Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 48,
                          child: OutlinedButton(
                            onPressed: () => Navigator.of(context).pop(),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: _mutedForeground,
                              side: const BorderSide(color: _borderColor),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: const Text('Hủy', style: TextStyle(fontWeight: FontWeight.w600)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: SizedBox(
                          height: 48,
                          child: ElevatedButton.icon(
                            onPressed: _isLoading ? null : _submitUpdate,
                            icon: _isLoading
                                ? const SizedBox(
                                    width: 18, height: 18,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Icon(Icons.save_outlined, size: 18, color: Colors.white),
                            label: Text(
                              _isLoading ? 'Đang lưu...' : 'Lưu thay đổi',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _primaryColor,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              elevation: 0,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: _foregroundColor),
    );
  }

  Widget _buildChuyenKhoaDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<ChuyenKhoaEntity>(
          value: _selectedChuyenKhoa,
          isExpanded: true,
          hint: const Row(
            children: [
              Icon(Icons.local_hospital_outlined, size: 18, color: _mutedForeground),
              SizedBox(width: 10),
              Text('Chọn chuyên khoa', style: TextStyle(fontSize: 14, color: _mutedForeground)),
            ],
          ),
          icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
          style: const TextStyle(fontSize: 14, color: _foregroundColor),
          items: _chuyenKhoaList.map((ck) {
            return DropdownMenuItem(
              value: ck,
              child: Row(
                children: [
                  const Icon(Icons.local_hospital_outlined, size: 18, color: _primaryColor),
                  const SizedBox(width: 10),
                  Expanded(child: Text(ck.tenChuyenKhoa)),
                ],
              ),
            );
          }).toList(),
          onChanged: _onChuyenKhoaChanged,
        ),
      ),
    );
  }

  Widget _buildBacSiDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<NhanVienEntity>(
          value: _selectedBacSi,
          isExpanded: true,
          hint: const Row(
            children: [
              Icon(Icons.person_outline_rounded, size: 18, color: _mutedForeground),
              SizedBox(width: 10),
              Text('Chọn bác sĩ', style: TextStyle(fontSize: 14, color: _mutedForeground)),
            ],
          ),
          icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
          style: const TextStyle(fontSize: 14, color: _foregroundColor),
          items: _bacSiList.map((bs) {
            return DropdownMenuItem(
              value: bs,
              child: Row(
                children: [
                  const Icon(Icons.person_rounded, size: 18, color: _primaryColor),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(bs.hoTen, overflow: TextOverflow.ellipsis),
                        if (bs.chucVu != null)
                          Text(bs.chucVu!, style: const TextStyle(fontSize: 11, color: _mutedForeground)),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          onChanged: _selectedChuyenKhoa == null
              ? null
              : (value) {
                  if (value != null) setState(() => _selectedBacSi = value);
                },
        ),
      ),
    );
  }

  Widget _buildDichVuDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<DichVuEntity>(
          value: _selectedDichVu,
          isExpanded: true,
          hint: const Row(
            children: [
              Icon(Icons.medical_services_outlined, size: 18, color: _mutedForeground),
              SizedBox(width: 10),
              Text('Chọn dịch vụ', style: TextStyle(fontSize: 14, color: _mutedForeground)),
            ],
          ),
          icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
          style: const TextStyle(fontSize: 14, color: _foregroundColor),
          items: _filteredDichVuList.map((dv) {
            return DropdownMenuItem(
              value: dv,
              child: Row(
                children: [
                  const Icon(Icons.medical_services_outlined, size: 18, color: _primaryColor),
                  const SizedBox(width: 10),
                  Expanded(child: Text(dv.tenDichVu, overflow: TextOverflow.ellipsis)),
                ],
              ),
            );
          }).toList(),
          onChanged: _selectedChuyenKhoa == null
              ? null
              : (value) {
                  if (value != null) setState(() => _selectedDichVu = value);
                },
        ),
      ),
    );
  }
}