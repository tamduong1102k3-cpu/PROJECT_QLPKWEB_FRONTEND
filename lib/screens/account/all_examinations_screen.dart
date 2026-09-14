import 'package:flutter/material.dart';
import '../../services/benh_nhan_service.dart';
import '../../models/phieu_kham.dart';
import '../patient/ca_kham_detail_screen.dart';
import '../profile/widgets/status_badge.dart';
import '../../widgets/shimmer_loading.dart';

class AllExaminationsScreen extends StatefulWidget {
  const AllExaminationsScreen({super.key});

  @override
  State<AllExaminationsScreen> createState() => _AllExaminationsScreenState();
}

class _AllExaminationsScreenState extends State<AllExaminationsScreen> {
  final _benhNhanService = BenhNhanService();
  List<PhieuKham> _allPhieuKham = [];
  bool _isLoading = true;
  String? _error;

  // Filters
  DateTime? _fromDate;
  DateTime? _toDate;
  String _searchQuery = '';
  final _searchController = TextEditingController();
  int _selectedTabIndex = 0;

  static const Color _primaryColor = Color(0xFF0891B2);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);
  static const Color _mutedColor = Color(0xFFF1F5F9);

  static const List<_TabFilter> _tabs = [
    _TabFilter(label: 'Tất cả', filterHoanThanh: false),
    _TabFilter(label: 'Hoàn thành', filterHoanThanh: true),
  ];

  List<PhieuKham> get _filteredList {
    return _allPhieuKham.where((pk) {
      // Filter by tab
      if (_tabs[_selectedTabIndex].filterHoanThanh) {
        if (pk.trangThai?.toUpperCase() != 'HOAN_THANH') return false;
      }

      // Filter by date range
      if (_fromDate != null || _toDate != null) {
        final ngay = pk.ngayKham ?? '';
        if (ngay.length >= 10) {
          final dateStr = ngay.substring(0, 10);
          final dateParts = dateStr.split('-');
          if (dateParts.length == 3) {
            try {
              final pkDate = DateTime(
                int.parse(dateParts[0]),
                int.parse(dateParts[1]),
                int.parse(dateParts[2]),
              );
              if (_fromDate != null && pkDate.isBefore(_fromDate!)) return false;
              if (_toDate != null) {
                final toDateEnd = DateTime(_toDate!.year, _toDate!.month, _toDate!.day, 23, 59, 59);
                if (pkDate.isAfter(toDateEnd)) return false;
              }
            } catch (_) {}
          }
        }
      }

      // Filter by search
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final id = pk.maPhieuKham.toString();
        final tenCk = (pk.tenChuyenKhoa ?? '').toLowerCase();
        final tenBs = (pk.tenNhanVien ?? '').toLowerCase();
        final tenDv = (pk.tenDichVu ?? '').toLowerCase();
        if (!id.contains(q) && !tenCk.contains(q) && !tenBs.contains(q) && !tenDv.contains(q)) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await _benhNhanService.getAllPhieuKhamAllStatus();
      if (mounted) {
        setState(() {
          _allPhieuKham = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
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
              end: DateTime.now(),
            ),
      locale: const Locale('vi', 'VN'),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: Theme.of(context).colorScheme.copyWith(primary: _primaryColor),
        ),
        child: child!,
      ),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Tất cả phiếu khám',
          style: TextStyle(fontWeight: FontWeight.w600, color: _foregroundColor, fontSize: 18),
        ),
        centerTitle: true,
        backgroundColor: _cardColor,
        foregroundColor: _foregroundColor,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: _foregroundColor),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh_rounded, color: _isLoading ? _mutedForeground : _primaryColor),
            onPressed: _isLoading ? null : _loadData,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const ShimmerLoading();
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.error_outline_rounded, size: 40, color: Color(0xFFDC2626)),
              ),
              const SizedBox(height: 16),
              const Text('Không thể tải dữ liệu', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _foregroundColor)),
              const SizedBox(height: 8),
              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: _mutedForeground, fontSize: 14)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadData,
                icon: const Icon(Icons.refresh_rounded, size: 20),
                label: const Text('Thử lại'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _primaryColor, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        // Search bar
        Container(
          color: _cardColor,
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
          child: TextField(
            controller: _searchController,
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Tìm kiếm (mã phiếu, chuyên khoa, bác sĩ...)',
              hintStyle: const TextStyle(fontSize: 13, color: _mutedForeground),
              prefixIcon: const Icon(Icons.search_rounded, size: 20, color: _mutedForeground),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18, color: _mutedForeground),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              filled: true,
              fillColor: _mutedColor,
              contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),

        // Date range + Tab bar
        Container(
          color: _cardColor,
          padding: const EdgeInsets.fromLTRB(16, 6, 16, 4),
          child: Row(
            children: [
              // Date range picker
              Expanded(
                child: GestureDetector(
                  onTap: _selectDateRange,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: _mutedColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _borderColor),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.date_range_rounded, size: 16, color: _primaryColor),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            '${_formatDate(_fromDate)} - ${_formatDate(_toDate)}',
                            style: const TextStyle(fontSize: 12, color: _foregroundColor),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (_fromDate != null || _toDate != null)
                          GestureDetector(
                            onTap: () => setState(() { _fromDate = null; _toDate = null; }),
                            child: const Icon(Icons.close_rounded, size: 16, color: _mutedForeground),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Tab filters
              ..._tabs.asMap().entries.map((entry) {
                final idx = entry.key;
                final tab = entry.value;
                final isSelected = _selectedTabIndex == idx;
                return Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedTabIndex = idx),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? _primaryColor : _mutedColor,
                        borderRadius: BorderRadius.circular(10),
                        border: !isSelected ? Border.all(color: _borderColor) : null,
                      ),
                      child: Text(
                        tab.label,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isSelected ? Colors.white : _mutedForeground,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),

        // Divider
        Container(height: 1, color: _borderColor),

        // List
        Expanded(child: _buildList()),
      ],
    );
  }

  Widget _buildList() {
    final filtered = _filteredList;

    if (filtered.isEmpty) {
      return RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: SizedBox(
            height: MediaQuery.of(context).size.height * 0.4,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(color: _mutedColor, shape: BoxShape.circle),
                    child: Icon(Icons.inbox_rounded, size: 40, color: _mutedForeground),
                  ),
                  const SizedBox(height: 16),
                  const Text('Không tìm thấy phiếu khám', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: _mutedForeground)),
                  const SizedBox(height: 8),
                  Text(
                    _searchQuery.isNotEmpty ? 'Thử thay đổi từ khóa tìm kiếm' : 'Không có phiếu khám phù hợp',
                    style: const TextStyle(fontSize: 14, color: _mutedForeground),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final pk = filtered[index];
          return _buildPhieuKhamCard(pk);
        },
      ),
    );
  }

  Widget _buildPhieuKhamCard(PhieuKham pk) {
    String formattedNgay = pk.ngayKham ?? '';
    if (formattedNgay.length >= 10) {
      formattedNgay = formattedNgay.substring(0, 10);
    }

    final loaiDichVu = pk.loaiDichVu ?? '';
    final isCls = loaiDichVu.contains('CLS_XET_NGHIEM') ||
        loaiDichVu.contains('CLS_CHAN_DOAN_HINH_ANH');

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _borderColor),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => CaKhamDetailScreen(
                maPhieuKham: pk.maPhieuKham,
                loaiDichVu: loaiDichVu.isNotEmpty ? loaiDichVu : null,
              ),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 36, height: 36,
                        decoration: BoxDecoration(color: _primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                        child: Icon(isCls ? Icons.science_outlined : Icons.description_outlined, color: _primaryColor, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        isCls
                            ? (loaiDichVu.contains('CLS_XET_NGHIEM')
                                ? 'Phiếu XN #${pk.maPhieuKham}'
                                : 'Phiếu CĐHA #${pk.maPhieuKham}')
                            : 'Phiếu #${pk.maPhieuKham}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: _foregroundColor),
                      ),
                    ],
                  ),
                  StatusBadge(status: pk.trangThai ?? ''),
                ],
              ),
              const SizedBox(height: 12),
              Container(height: 1, color: _borderColor),
              const SizedBox(height: 12),
              if (isCls) _buildInfoRow(Icons.science_outlined, 'Loại phiếu', loaiDichVu),
              if (formattedNgay.isNotEmpty) _buildInfoRow(Icons.calendar_today_outlined, 'Ngày khám', formattedNgay),
              if ((pk.tenDichVu ?? '').isNotEmpty) _buildInfoRow(Icons.medical_services_outlined, 'Dịch vụ', pk.tenDichVu!),
              if ((pk.tenChuyenKhoa ?? '').isNotEmpty) _buildInfoRow(Icons.local_hospital_outlined, 'Chuyên khoa', pk.tenChuyenKhoa!),
              if ((pk.tenNhanVien ?? '').isNotEmpty) _buildInfoRow(Icons.person_outline_rounded, 'Bác sĩ', pk.tenNhanVien!),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: const [
                  Text('Xem chi tiết', style: TextStyle(color: _primaryColor, fontWeight: FontWeight.bold, fontSize: 13)),
                  SizedBox(width: 2),
                  Icon(Icons.chevron_right_rounded, color: _primaryColor, size: 18),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Icon(icon, size: 15, color: _mutedForeground),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 13, height: 1.3),
                children: [
                  TextSpan(text: '$label: ', style: const TextStyle(fontWeight: FontWeight.w600, color: _mutedForeground)),
                  TextSpan(text: value, style: const TextStyle(color: _foregroundColor)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TabFilter {
  final String label;
  final bool filterHoanThanh;
  const _TabFilter({required this.label, required this.filterHoanThanh});
}