import 'package:flutter/material.dart';
import '../../data/entities/lich_kham_entity.dart';
import '../../repositories/lich_kham_repository.dart';
import '../../services/auth_service.dart';
import '../../utils/toast_helper.dart';
import 'widgets/appointment_card.dart';
import 'appointment_detail_screen.dart';

class AppointmentManagementScreen extends StatefulWidget {
  const AppointmentManagementScreen({super.key});

  @override
  State<AppointmentManagementScreen> createState() => _AppointmentManagementScreenState();
}

class _AppointmentManagementScreenState extends State<AppointmentManagementScreen> {
  final _lichKhamRepo = LichKhamRepository();
  final _authService = AuthService();

  List<LichKhamEntity> _allAppointments = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _selectedFilterIndex = 0;

  DateTime? _fromDate;
  DateTime? _toDate;

  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);

  static const List<_AppointmentFilter> _filters = [
    _AppointmentFilter(label: 'Tất cả'),
    _AppointmentFilter(label: 'APP', nguonTao: 'DAT_LICH_APP'),
    _AppointmentFilter(label: 'Tái khám', nguonTao: 'TAI_KHAM'),
    _AppointmentFilter(label: 'Hoàn thành', status: 'HOAN_THANH'),
    _AppointmentFilter(label: 'Chưa đến', status: 'CHUA_DEN'),
    _AppointmentFilter(label: 'Đã hủy', status: 'HUY'),
    _AppointmentFilter(label: 'Hoãn', status: 'HOAN'),
  ];

  bool _matchesCurrentFilter(LichKhamEntity appointment) {
    final filter = _filters[_selectedFilterIndex];
    if (filter.nguonTao != null) {
      return appointment.nguonTao == filter.nguonTao;
    }
    return filter.status == null || appointment.trangThai == filter.status;
  }

  bool _matchesDateRange(LichKhamEntity appointment) {
    if (_fromDate == null && _toDate == null) return true;
    final dateParts = appointment.ngayKham.split('-');
    if (dateParts.length != 3) return true;
    try {
      final appointmentDate = DateTime(
        int.parse(dateParts[0]),
        int.parse(dateParts[1]),
        int.parse(dateParts[2]),
      );
      if (_fromDate != null && appointmentDate.isBefore(_fromDate!)) return false;
      if (_toDate != null) {
        final toDateEnd = DateTime(_toDate!.year, _toDate!.month, _toDate!.day, 23, 59, 59);
        if (appointmentDate.isAfter(toDateEnd)) return false;
      }
      return true;
    } catch (_) {
      return true;
    }
  }

  List<LichKhamEntity> get _filteredAppointments {
    return _allAppointments.where((a) {
      return _matchesCurrentFilter(a) && _matchesDateRange(a);
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final maBenhNhan = _authService.maBenhNhan;
      if (maBenhNhan == null) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Bạn chưa có hồ sơ bệnh nhân. Vui lòng tạo hồ sơ trước.';
        });
        return;
      }
      List<LichKhamEntity> appointments;
      try {
        appointments = await _lichKhamRepo.getByBenhNhan(maBenhNhan);
      } catch (_) {
        appointments = await _lichKhamRepo.getAll();
        appointments = appointments.where((a) => a.maBenhNhan == maBenhNhan).toList();
      }
      appointments.sort((a, b) => b.ngayKham.compareTo(a.ngayKham));
      if (!mounted) return;
      setState(() {
        _allAppointments = appointments;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = 'Không thể tải danh sách lịch hẹn. Vui lòng thử lại.';
      });
    }
  }

  Future<void> _selectDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDateRange: _fromDate != null && _toDate != null
          ? DateTimeRange(start: _fromDate!, end: _toDate!)
          : DateTimeRange(
              start: DateTime.now().subtract(const Duration(days: 30)),
              end: DateTime.now().add(const Duration(days: 7)),
            ),
      locale: const Locale('vi', 'VN'),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
              primary: _primaryColor,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _fromDate = picked.start;
        _toDate = picked.end;
      });
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return '...';
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  void _navigateToDetail(LichKhamEntity appointment) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => AppointmentDetailScreen(appointment: appointment),
      ),
    ).then((_) {
      _loadAppointments();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Lịch hẹn của tôi',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: _foregroundColor),
        ),
        backgroundColor: _cardColor,
        elevation: 0,
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _borderColor, height: 1.0),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: _foregroundColor),
            onPressed: _loadAppointments,
          ),
        ],
      ),
      body: Column(
        children: [
          _buildDateRangeBar(),
          _buildFilterDropdown(),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildDateRangeBar() {
    return Container(
      color: _cardColor,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: GestureDetector(
        onTap: _selectDateRange,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _borderColor),
          ),
          child: Row(
            children: [
              const Icon(Icons.calendar_month_rounded, size: 18, color: _primaryColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Từ ngày: ${_formatDate(_fromDate)}  ➔  Đến ngày: ${_formatDate(_toDate)}',
                  style: const TextStyle(
                    fontSize: 13,
                    color: _foregroundColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              if (_fromDate != null || _toDate != null)
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _fromDate = null;
                      _toDate = null;
                    });
                  },
                  child: const Icon(Icons.close_rounded, size: 18, color: _mutedForeground),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterDropdown() {
    final selectedFilter = _filters[_selectedFilterIndex];
    return Container(
      color: _cardColor,
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _borderColor),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<int>(
            value: _selectedFilterIndex,
            isExpanded: true,
            icon: const Icon(Icons.expand_more_rounded, color: _mutedForeground),
            hint: const Text('Lọc lịch khám'),
            selectedItemBuilder: (context) => _filters.map((filter) {
              final count = _countForFilter(filter);
              return Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  count > 0 ? '${filter.label} ($count)' : filter.label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: _foregroundColor,
                  ),
                ),
              );
            }).toList(),
            items: _filters.asMap().entries.map((entry) {
              final filter = entry.value;
              final count = _countForFilter(filter);
              return DropdownMenuItem(
                value: entry.key,
                child: Text(
                  count > 0 ? '${filter.label} ($count)' : filter.label,
                  style: const TextStyle(fontSize: 14, color: _foregroundColor),
                ),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null) setState(() => _selectedFilterIndex = value);
            },
          ),
        ),
      ),
    );
  }

  int _countForFilter(_AppointmentFilter filter) {
    return _allAppointments.where((appointment) {
      if (filter.nguonTao != null) return appointment.nguonTao == filter.nguonTao;
      return filter.status == null || appointment.trangThai == filter.status;
    }).length;
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: _primaryColor),
            SizedBox(height: 16),
            Text(
              'Đang tải lịch hẹn...',
              style: TextStyle(fontSize: 14, color: _mutedForeground),
            ),
          ],
        ),
      );
    }
    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.info_outline_rounded, size: 40, color: Color(0xFFF59E0B)),
              ),
              const SizedBox(height: 20),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 15, color: _mutedForeground, height: 1.4),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadAppointments,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Thử lại'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ),
        ),
      );
    }
    final filtered = _filteredAppointments;
    if (filtered.isEmpty) {
      return _buildEmptyState();
    }
    return RefreshIndicator(
      onRefresh: _loadAppointments,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(top: 12, bottom: 24),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final appointment = filtered[index];
          return AppointmentCard(
            appointment: appointment,
            onTap: () => _navigateToDetail(appointment),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    final filter = _filters[_selectedFilterIndex];
    IconData emptyIcon;
    String emptyMessage;
    String emptySubMessage;
    switch (filter.label) {
      case 'Chưa đến':
        emptyIcon = Icons.hourglass_empty_rounded;
        emptyMessage = 'Không có lịch hẹn chưa đến';
        emptySubMessage = 'Các lịch hẹn đang chờ bệnh nhân đến sẽ xuất hiện ở đây.';
        break;
      case 'APP':
        emptyIcon = Icons.phone_android_rounded;
        emptyMessage = 'Chưa có lịch đặt từ app';
        emptySubMessage = 'Các lịch hẹn bạn đặt trên ứng dụng sẽ xuất hiện ở đây.';
        break;
      case 'Tái khám':
        emptyIcon = Icons.repeat_rounded;
        emptyMessage = 'Chưa có lịch tái khám';
        emptySubMessage = 'Các lịch khám được bác sĩ chỉ định tái khám sẽ xuất hiện ở đây.';
        break;
      case 'Hoàn thành':
        emptyIcon = Icons.check_circle_outline_rounded;
        emptyMessage = 'Chưa có lịch đã hoàn thành';
        emptySubMessage = 'Các lịch khám đã hoàn thành sẽ xuất hiện ở đây.';
        break;
      case 'Đã hủy':
        emptyIcon = Icons.cancel_outlined;
        emptyMessage = 'Chưa có lịch đã hủy';
        emptySubMessage = 'Các lịch hẹn đã hủy sẽ xuất hiện ở đây.';
        break;
      case 'Hoãn':
        emptyIcon = Icons.event_repeat_outlined;
        emptyMessage = 'Chưa có lịch bị hoãn';
        emptySubMessage = 'Các lịch hẹn bị hoãn sẽ xuất hiện ở đây.';
        break;
      default:
        emptyIcon = Icons.event_busy_rounded;
        emptyMessage = 'Bệnh nhân chưa khám nên chưa có dữ liệu';
        emptySubMessage = 'Các lịch hẹn khám bệnh sẽ hiển thị tại đây.';
    }
    // Điều chỉnh thông báo cho các tab cụ thể để phù hợp với thông điệp chung
    if (_allAppointments.isEmpty) {
      emptyIcon = Icons.event_busy_rounded;
      emptyMessage = 'Bệnh nhân chưa khám nên chưa có dữ liệu';
      emptySubMessage = 'Khi bạn đặt lịch khám, thông tin sẽ hiển thị tại đây.';
    }
    if ((_fromDate != null || _toDate != null) && _allAppointments.isNotEmpty) {
      emptyMessage = 'Không tìm thấy lịch hẹn trong khoảng thời gian này';
      emptySubMessage = 'Thử chọn khoảng thời gian khác hoặc xoá bộ lọc ngày.';
    }
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: _primaryColor.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(emptyIcon, size: 48, color: _primaryColor.withValues(alpha: 0.5)),
            ),
            const SizedBox(height: 20),
            Text(
              emptyMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: _foregroundColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              emptySubMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: _mutedForeground, height: 1.4),
            ),
            if (_allAppointments.isEmpty) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadAppointments,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Thử lại'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
            ],
            if ((_fromDate != null || _toDate != null) && _allAppointments.isNotEmpty) ...[
              const SizedBox(height: 20),
              OutlinedButton.icon(
                onPressed: () {
                  setState(() {
                    _fromDate = null;
                    _toDate = null;
                  });
                },
                icon: const Icon(Icons.clear_rounded, size: 16),
                label: const Text('Xoá bộ lọc'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: _primaryColor,
                  side: const BorderSide(color: _primaryColor),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AppointmentFilter {
  final String label;
  final String? status;
  final String? nguonTao;
  const _AppointmentFilter({required this.label, this.status, this.nguonTao});
}
