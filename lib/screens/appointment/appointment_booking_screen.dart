import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../data/entities/lich_kham_entity.dart';
import '../../data/entities/chuyen_khoa_entity.dart';
import '../../data/entities/dich_vu_entity.dart';
import '../../data/entities/nhan_vien_entity.dart';
import '../../data/entities/bang_phan_cong_ca_lam_entity.dart';
import '../../data/entities/lich_thang_entity.dart';
import '../../repositories/lich_kham_repository.dart';
import '../../repositories/chuyen_khoa_repository.dart';
import '../../repositories/dich_vu_repository.dart';
import '../../repositories/nhan_vien_repository.dart';
import '../../repositories/bang_phan_cong_repository.dart';
import '../../services/auth_service.dart';
import '../../utils/toast_helper.dart';
import '../main_screen.dart';

class AppointmentBookingScreen extends StatefulWidget {
  final ChuyenKhoaEntity? initialChuyenKhoa;
  final DichVuEntity? initialDichVu;
  final NhanVienEntity? initialBacSi;

  const AppointmentBookingScreen({
    super.key,
    this.initialChuyenKhoa,
    this.initialDichVu,
    this.initialBacSi,
  });

  @override
  State<AppointmentBookingScreen> createState() =>
      _AppointmentBookingScreenState();
}

class _AppointmentBookingScreenState extends State<AppointmentBookingScreen> {
  final _authService = AuthService();
  final _lichKhamRepo = LichKhamRepository();
  final _chuyenKhoaRepo = ChuyenKhoaRepository();
  final _dichVuRepo = DichVuRepository();
  final _nhanVienRepo = NhanVienRepository();
  final _bangPhanCongRepo = BangPhanCongRepository();
  final _ghiChuController = TextEditingController();

  ChuyenKhoaEntity? _selectedChuyenKhoa;
  DichVuEntity? _selectedDichVu;
  NhanVienEntity? _selectedBacSi;
  bool _isLoading = false;
  bool _isLoadingData = true;

  List<ChuyenKhoaEntity> _chuyenKhoaList = [];
  List<DichVuEntity> _allDichVuList = [];
  List<DichVuEntity> _filteredDichVuList = [];
  List<NhanVienEntity> _bacSiList = [];
  List<NgayCaLamEntity> _monthlyDays = [];
  DateTime _visibleMonth = DateTime(DateTime.now().year, DateTime.now().month);
  NgayCaLamEntity? _selectedDay;
  BangPhanCongCaLamEntity? _selectedCa;
  bool _isLoadingSchedule = false;

  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);

  @override
  void initState() {
    super.initState();
    _loadData();
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
      final dichVuList = results[1] as List<DichVuEntity>;

      // Lookup matching entities from local lists by ID to ensure object identity
      ChuyenKhoaEntity? matchedChuyenKhoa;
      DichVuEntity? matchedDichVu;
      int? initialChuyenKhoaId;

      // Xác định chuyên khoa: từ initialChuyenKhoa hoặc từ initialBacSi.chuyenKhoa
      if (widget.initialChuyenKhoa != null) {
        initialChuyenKhoaId = widget.initialChuyenKhoa!.maChuyenKhoa;
      } else if (widget.initialBacSi != null &&
          widget.initialBacSi!.chuyenKhoa != null) {
        initialChuyenKhoaId = widget.initialBacSi!.chuyenKhoa;
      }

      if (initialChuyenKhoaId != null) {
        try {
          matchedChuyenKhoa = chuyenKhoaList.firstWhere(
            (ck) => ck.maChuyenKhoa == initialChuyenKhoaId,
          );
        } catch (_) {}
      }

      if (widget.initialDichVu != null) {
        try {
          matchedDichVu = dichVuList.firstWhere(
            (dv) => dv.maDichVu == widget.initialDichVu!.maDichVu,
          );
        } catch (_) {}
      }

      setState(() {
        _chuyenKhoaList = chuyenKhoaList;
        _allDichVuList = dichVuList;
        _isLoadingData = false;
      });

      await _applyInitialValues(
        matchedChuyenKhoa,
        matchedDichVu,
        initialChuyenKhoaId,
      );
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

  Future<void> _applyInitialValues(
    ChuyenKhoaEntity? matchedChuyenKhoa,
    DichVuEntity? matchedDichVu,
    int? initialChuyenKhoaId,
  ) async {
    if (matchedChuyenKhoa != null) {
      // Dùng chính flow _onChuyenKhoaChanged để load bacSi + filter dichVu
      await _onChuyenKhoaChanged(matchedChuyenKhoa);
    } else if (matchedDichVu != null) {
      if (!mounted) return;
      setState(() {
        _selectedDichVu = matchedDichVu;
      });
    }

    // Nếu có initialBacSi, set nó sau khi _onChuyenKhoaChanged đã load bacSiList
    if (widget.initialBacSi != null && _bacSiList.isNotEmpty) {
      final bacSi = widget.initialBacSi!;
      final matchedBacSi = _bacSiList
          .where((bs) => bs.maNhanVien == bacSi.maNhanVien)
          .firstOrNull;

      if (matchedBacSi != null) {
        await _onBacSiChanged(matchedBacSi);
      } else {
        // Nếu không tìm thấy trong list, set trực tiếp với fallback list
        if (!mounted) return;
        setState(() {
          _bacSiList = [bacSi];
          _selectedBacSi = bacSi;
        });
        await _loadBacSiWorkingDays(bacSi);
      }
    }
  }

  Future<void> _loadBacSiWorkingDays(NhanVienEntity bacSi) async {
    await _loadMonthlySchedule(bacSi, _visibleMonth);
  }

  Future<void> _onChuyenKhoaChanged(ChuyenKhoaEntity? chuyenKhoa) async {
    setState(() {
      _selectedChuyenKhoa = chuyenKhoa;
      _selectedDichVu = null;
      _selectedBacSi = null;
      _bacSiList = [];
      _monthlyDays = [];
      _selectedDay = null;
      _selectedCa = null;
      if (chuyenKhoa != null) {
        final maCK = chuyenKhoa.maChuyenKhoa;
        _filteredDichVuList = _allDichVuList
            .where((dv) => dv.maChuyenKhoa == maCK)
            .toList();
      } else {
        _filteredDichVuList = [];
      }
    });

    if (chuyenKhoa != null) {
      final maCK = chuyenKhoa.maChuyenKhoa;
      try {
        final bacSiList = await _nhanVienRepo.getBacSiByChuyenKhoa(maCK);
        if (!mounted) return;
        setState(() => _bacSiList = bacSiList);
      } catch (e) {
        if (!mounted) return;
        ToastHelper.error(
          context: context,
          title: 'Không thể tải danh sách bác sĩ',
          description: e.toString().replaceFirst('Exception: ', ''),
        );
      }
    }
  }

  Future<void> _onBacSiChanged(NhanVienEntity? bacSi) async {
    setState(() {
      _selectedBacSi = bacSi;
      _monthlyDays = [];
      _selectedDay = null;
      _selectedCa = null;
    });

    if (bacSi != null) {
      await _loadMonthlySchedule(bacSi, _visibleMonth);
    }
  }

  Future<void> _loadMonthlySchedule(
    NhanVienEntity bacSi,
    DateTime month,
  ) async {
    setState(() => _isLoadingSchedule = true);
    try {
      final schedule = await _bangPhanCongRepo.getLichThang(
        bacSi.maNhanVien,
        month.year,
        month.month,
      );
      if (!mounted || _selectedBacSi?.maNhanVien != bacSi.maNhanVien) return;

      final today = DateTime.now();
      final todayOnly = DateTime(today.year, today.month, today.day);
      final maxDate = todayOnly.add(const Duration(days: 60));
      final availableDays = schedule.days.where((day) {
        final date = day.date;
        return date != null &&
            !date.isBefore(todayOnly) &&
            !date.isAfter(maxDate) &&
            day.resolved.isNotEmpty;
      }).toList();

      setState(() {
        _visibleMonth = DateTime(schedule.nam, schedule.thang);
        _monthlyDays = availableDays;
        _selectedDay = availableDays.isNotEmpty ? availableDays.first : null;
        _selectedCa = _selectedDay?.resolved.firstOrNull;
        _isLoadingSchedule = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _monthlyDays = [];
        _selectedDay = null;
        _selectedCa = null;
        _isLoadingSchedule = false;
      });
    }
  }

  Future<void> _changeMonth(int offset) async {
    if (_selectedBacSi == null || _isLoadingSchedule) return;
    final nextMonth = DateTime(
      _visibleMonth.year,
      _visibleMonth.month + offset,
    );
    final today = DateTime.now();
    final firstAllowedMonth = DateTime(today.year, today.month);
    final lastAllowedDate = DateTime(today.year, today.month, today.day)
        .add(const Duration(days: 60));
    final lastAllowedMonth = DateTime(
      lastAllowedDate.year,
      lastAllowedDate.month,
    );
    if (nextMonth.isBefore(firstAllowedMonth) ||
        nextMonth.isAfter(lastAllowedMonth)) {
      return;
    }
    await _loadMonthlySchedule(_selectedBacSi!, nextMonth);
  }

  @override
  void dispose() {
    _ghiChuController.dispose();
    super.dispose();
  }

  Future<void> _submitBooking() async {
    if (_selectedChuyenKhoa == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn chuyên khoa');
      return;
    }
    if (_selectedBacSi == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn bác sĩ');
      return;
    }
    if (_selectedDay == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn ngày khám');
      return;
    }
    if (_selectedCa?.ca?.id == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn ca khám');
      return;
    }
    if (_selectedDichVu == null) {
      ToastHelper.error(context: context, title: 'Vui lòng chọn dịch vụ');
      return;
    }

    final maBenhNhan = _authService.maBenhNhan;
    if (maBenhNhan == null) {
      ToastHelper.error(
        context: context,
        title: 'Chưa có hồ sơ bệnh nhân',
        description: 'Vui lòng tạo hồ sơ bệnh nhân trước khi đặt lịch.',
      );
      return;
    }

    setState(() => _isLoading = true);

    final actualDate = _selectedDay!.date!;
    final maCa = _selectedCa!.ca!.id;
    if (maCa == null) {
      ToastHelper.error(context: context, title: 'Ngày đã chọn chưa có ca khám hợp lệ');
      setState(() => _isLoading = false);
      return;
    }
    final ngayKhamStr =
        '${actualDate.year.toString().padLeft(4, '0')}-${actualDate.month.toString().padLeft(2, '0')}-${actualDate.day.toString().padLeft(2, '0')}';

    try {
      final entity = LichKhamEntity(
        maBenhNhan: maBenhNhan,
        maChuyenKhoa: _selectedChuyenKhoa!.maChuyenKhoa,
        maBacSi: _selectedBacSi!.maNhanVien,
        maDichVu: _selectedDichVu!.maDichVu,
        maCa: maCa,
        ngayKham: ngayKhamStr,
        ghiChu: _ghiChuController.text.trim().isNotEmpty
            ? _ghiChuController.text.trim()
            : null,
        trangThai: 'CHUA_DEN',
      );

      await _lichKhamRepo.create(entity);

      if (!mounted) return;
      setState(() => _isLoading = false);
      _showSuccessDialog(actualDate);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);

      // Lấy statusCode + errorCode + message từ response của backend (nếu có)
      final statusCode = e is DioException ? e.response?.statusCode : null;
      final data = e is DioException ? e.response?.data : null;
      final errorCode = data is Map ? data['errorCode'] as String? : null;
      String errorMsg;
      if (data is Map) {
        errorMsg = (data['message'] ?? data['error'] ?? '').toString();
        if (errorMsg.isEmpty) {
          errorMsg = e.toString().replaceFirst('Exception: ', '');
        }
      } else {
        errorMsg = e.toString().replaceFirst('Exception: ', '');
      }

      // SLOT_FULL: backend trả 409 + errorCode "SLOT_FULL" (GlobalExceptionHandler)
      if (statusCode == 409 && errorCode == 'SLOT_FULL') {
        _showSlotFullDialog();
      } else if (errorMsg.contains('quá nhiều lịch hẹn')) {
        _showCancellationLimitDialog();
      } else if (errorMsg.contains('đang chờ xử lý') ||
          errorMsg.contains('đã xác nhận') ||
          errorMsg.contains('đã được đặt') ||
          errorMsg.contains('trước đó rồi')) {
        _showActiveAppointmentDialog();
      } else if (errorMsg.contains('trùng') ||
          errorMsg.contains('ngày này') ||
          errorMsg.contains('thời gian này')) {
        _showDuplicateDateTimeDialog();
      } else if (errorMsg.contains('60 ngày') || errorMsg.contains('quá khứ')) {
        ToastHelper.error(
          context: context,
          title: 'Ngày khám không hợp lệ',
          description: errorMsg,
        );
      } else {
        ToastHelper.error(
          context: context,
          title: 'Đặt lịch thất bại',
          description: errorMsg,
        );
      }
    }
  }

  void _showCancellationLimitDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.warning_amber_rounded,
                size: 32,
                color: Color(0xFFF59E0B),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Giới hạn đặt lịch',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: _foregroundColor,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Bạn đã hủy quá nhiều lịch hẹn trong 30 ngày qua (tối đa 3 lần).\n\n'
              'Vui lòng liên hệ trực tiếp với phòng khám để được hỗ trợ đặt lịch.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: _mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton(
                onPressed: () => Navigator.of(ctx).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Đã hiểu',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSlotFullDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.event_busy,
                size: 32,
                color: Color(0xFFF59E0B),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Đã hết lượt khám',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: _foregroundColor,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Chuyên khoa này đã hết lượt khám trong ngày bạn chọn.\n\n'
              'Vui lòng chọn ngày khác hoặc chuyên khoa khác.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: _mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton(
                onPressed: () => Navigator.of(ctx).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Đã hiểu',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showActiveAppointmentDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.info_outline_rounded,
                size: 32,
                color: Color(0xFF3B82F6),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Đã có lịch hẹn đang hoạt động',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: _foregroundColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Bạn chỉ được có một lịch hẹn đang chờ xử lý hoặc đã xác nhận tại một thời điểm.\n\n'
              'Vui lòng đợi lịch hẹn hiện tại hoàn thành hoặc hủy lịch hẹn đó trước khi đặt lịch mới.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: _mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton(
                onPressed: () => Navigator.of(ctx).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Đã hiểu',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDuplicateDateTimeDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.access_time_filled_rounded,
                size: 32,
                color: Color(0xFFF59E0B),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Trùng lịch hẹn',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: _foregroundColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Bạn đã có lịch hẹn vào thời gian này.\n\n'
              'Vui lòng chọn ngày hoặc giờ khác để đặt lịch.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: _mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton(
                onPressed: () => Navigator.of(ctx).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Chọn lại',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSuccessDialog(DateTime actualDate) {
    final day = actualDate.day.toString().padLeft(2, '0');
    final month = actualDate.month.toString().padLeft(2, '0');
    final year = actualDate.year.toString();
    final dateStr = '$day/$month/$year';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle_outline_rounded,
                size: 36,
                color: Colors.green,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Đặt lịch thành công!',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _foregroundColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Lịch hẹn với bác sĩ ${_selectedBacSi?.hoTen ?? ''} vào $dateStr đã được ghi nhận.\nChúng tôi sẽ liên hệ xác nhận qua điện thoại.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: _mutedForeground,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const MainScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Đóng',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Đăng ký lịch hẹn',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: _foregroundColor,
          ),
        ),
        backgroundColor: _cardColor,
        elevation: 0,
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _borderColor, height: 1.0),
        ),
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_rounded,
            color: _foregroundColor,
            size: 18,
          ),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const MainScreen()),
                (route) => false,
              );
            }
          },
        ),
      ),
      body: _isLoadingData
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _cardColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _borderColor),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Chuyên khoa khám *'),
                        const SizedBox(height: 6),
                        _buildChuyenKhoaDropdown(),
                        const SizedBox(height: 16),
                        _buildLabel('Bác sĩ khám *'),
                        const SizedBox(height: 6),
                        _buildBacSiDropdown(),
                        if (_selectedBacSi != null) ...[
                          const SizedBox(height: 16),
                          _buildLabel('Chọn ngày khám *'),
                          const SizedBox(height: 8),
                          _buildMonthlyDaySelector(),
                          if (_selectedDay != null) ...[
                            const SizedBox(height: 10),
                            _buildShiftDropdown(),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: _primaryColor.withValues(alpha: 0.05),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: _primaryColor.withValues(alpha: 0.2),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.calendar_today_outlined,
                                    size: 16,
                                    color: _primaryColor,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Ngày khám: ${_formatDate(_selectedDay!.date!)}',
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
                          ],
                        ],
                        const SizedBox(height: 16),
                        _buildLabel('Dịch vụ khám *'),
                        const SizedBox(height: 6),
                        _buildDichVuDropdown(),
                        const SizedBox(height: 16),
                        _buildLabel('Ghi chú thêm'),
                        const SizedBox(height: 6),
                        _buildTextField(
                          controller: _ghiChuController,
                          hint: 'Mô tả triệu chứng hoặc ghi chú thêm nếu cần',
                          icon: Icons.note_outlined,
                          maxLines: 3,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _isLoading || !_canSubmit ? null : _submitBooking,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(
                              Icons.event_available_outlined,
                              size: 18,
                              color: Colors.white,
                            ),
                      label: Text(
                        _isLoading ? 'Đang xử lý...' : 'Đặt lịch hẹn',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  bool get _canSubmit =>
      !_isLoading &&
      _selectedChuyenKhoa != null &&
      _selectedBacSi != null &&
      _selectedDichVu != null &&
      _selectedDay?.date != null &&
      _selectedCa?.ca?.id != null;

  Widget _buildMonthlyDaySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Tháng ${_visibleMonth.month}/${_visibleMonth.year}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: _foregroundColor,
              ),
            ),
            Row(
              children: [
                IconButton(
                  onPressed: () => _changeMonth(-1),
                  icon: const Icon(Icons.chevron_left_rounded),
                  tooltip: 'Tháng trước',
                  visualDensity: VisualDensity.compact,
                ),
                IconButton(
                  onPressed: () => _changeMonth(1),
                  icon: const Icon(Icons.chevron_right_rounded),
                  tooltip: 'Tháng sau',
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (_isLoadingSchedule)
          const Center(child: CircularProgressIndicator(strokeWidth: 2))
        else if (_monthlyDays.isEmpty)
          const Text(
            'Bác sĩ chưa có ca khám trong khoảng thời gian này.',
            style: TextStyle(fontSize: 13, color: _mutedForeground),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _monthlyDays.map(_buildDayTile).toList(),
          ),
      ],
    );
  }

  Widget _buildDayTile(NgayCaLamEntity day) {
    final date = day.date!;
    final isSelected = identical(_selectedDay, day);
    final weekday = day.thu == 'Chủ Nhật' || day.thu == 'Chủ nhật'
        ? 'CN'
        : day.thu.replaceFirst('Thứ ', 'T');
    return InkWell(
      onTap: () => setState(() {
        _selectedDay = day;
        _selectedCa = day.resolved.firstOrNull;
      }),
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        width: 64,
        height: 64,
        decoration: BoxDecoration(
          color: isSelected ? _primaryColor : _cardColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? _primaryColor : _borderColor,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '$weekday/${date.day}',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : _foregroundColor,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              '${day.resolved.length} ca',
              style: TextStyle(
                fontSize: 10,
                color: isSelected ? Colors.white70 : _mutedForeground,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShiftDropdown() {
    final shifts = _selectedDay?.resolved ?? const <BangPhanCongCaLamEntity>[];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<BangPhanCongCaLamEntity>(
          value: shifts.contains(_selectedCa) ? _selectedCa : null,
          isExpanded: true,
          hint: const Text(
            'Chọn ca khám',
            style: TextStyle(fontSize: 14, color: _mutedForeground),
          ),
          icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
          items: shifts.map((shift) {
            return DropdownMenuItem(
              value: shift,
              child: Text(
                '${shift.caDisplay} · ${shift.gioDisplay}',
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
          onChanged: (value) => setState(() => _selectedCa = value),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  /// Legend giải thích màu sắc
  Widget _buildShiftLegend() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Chú thích ca làm việc:',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: _foregroundColor,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 6,
            children: [
              _buildLegendItem(const Color(0xFF0EA5E9), 'Ca sáng (< 12h)'),
              _buildLegendItem(const Color(0xFFF59E0B), 'Ca chiều (≥ 12h)'),
              _buildLegendItem(const Color(0xFFB91C1C), 'Nghỉ phép — khóa'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(3),
            border: Border.all(color: color.withValues(alpha: 0.5)),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: _mutedForeground),
        ),
      ],
    );
  }

  Widget _buildChuyenKhoaDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<ChuyenKhoaEntity>(
          value: _selectedChuyenKhoa,
          isExpanded: true,
          hint: const Row(
            children: [
              Icon(
                Icons.local_hospital_outlined,
                size: 18,
                color: _mutedForeground,
              ),
              SizedBox(width: 10),
              Text(
                'Chọn chuyên khoa',
                style: TextStyle(fontSize: 14, color: _mutedForeground),
              ),
            ],
          ),
          icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
          style: const TextStyle(fontSize: 14, color: _foregroundColor),
          items: _chuyenKhoaList.map((ck) {
            return DropdownMenuItem(
              value: ck,
              child: Row(
                children: [
                  const Icon(
                    Icons.local_hospital_outlined,
                    size: 18,
                    color: _primaryColor,
                  ),
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
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<NhanVienEntity>(
          value: _selectedBacSi,
          isExpanded: true,
          hint: const Row(
            children: [
              Icon(
                Icons.person_outline_rounded,
                size: 18,
                color: _mutedForeground,
              ),
              SizedBox(width: 10),
              Text(
                'Chọn bác sĩ',
                style: TextStyle(fontSize: 14, color: _mutedForeground),
              ),
            ],
          ),
          icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
          style: const TextStyle(fontSize: 14, color: _foregroundColor),
          items: _bacSiList.map((bs) {
            return DropdownMenuItem(
              value: bs,
              child: Row(
                children: [
                  const Icon(
                    Icons.person_rounded,
                    size: 18,
                    color: _primaryColor,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(bs.hoTen, overflow: TextOverflow.ellipsis),
                        if (bs.chucVu != null)
                          Text(
                            bs.chucVu!,
                            style: const TextStyle(
                              fontSize: 11,
                              color: _mutedForeground,
                            ),
                          ),
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
                  if (value != null) _onBacSiChanged(value);
                },
        ),
      ),
    );
  }

  Widget _buildDichVuDropdown() {
    final dvList = _selectedChuyenKhoa != null
        ? _filteredDichVuList
        : _allDichVuList;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _borderColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<DichVuEntity>(
          value: _selectedDichVu,
          isExpanded: true,
          hint: const Row(
            children: [
              Icon(
                Icons.medical_services_outlined,
                size: 18,
                color: _mutedForeground,
              ),
              SizedBox(width: 10),
              Text(
                'Chọn dịch vụ',
                style: TextStyle(fontSize: 14, color: _mutedForeground),
              ),
            ],
          ),
          icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
          style: const TextStyle(fontSize: 14, color: _foregroundColor),
          items: dvList.map((dv) {
            return DropdownMenuItem(
              value: dv,
              child: Row(
                children: [
                  const Icon(
                    Icons.medical_services_outlined,
                    size: 18,
                    color: _primaryColor,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(dv.tenDichVu, overflow: TextOverflow.ellipsis),
                  ),
                ],
              ),
            );
          }).toList(),
          onChanged: (value) {
            if (value != null) setState(() => _selectedDichVu = value);
          },
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.bold,
        color: _foregroundColor,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: const TextStyle(fontSize: 14, color: _foregroundColor),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: _mutedForeground, fontSize: 13),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: _borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: _borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: _primaryColor, width: 1.5),
        ),
        prefixIcon: Icon(icon, size: 18, color: _mutedForeground),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 12,
        ),
      ),
    );
  }
}
