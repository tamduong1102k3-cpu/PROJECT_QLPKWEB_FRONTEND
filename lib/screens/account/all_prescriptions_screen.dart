import 'package:flutter/material.dart';
import '../../services/benh_nhan_service.dart';
import '../../models/toa_thuoc_chi_tiet.dart';
import '../../widgets/shimmer_loading.dart';

class AllPrescriptionsScreen extends StatefulWidget {
  const AllPrescriptionsScreen({super.key});

  @override
  State<AllPrescriptionsScreen> createState() => _AllPrescriptionsScreenState();
}

class _AllPrescriptionsScreenState extends State<AllPrescriptionsScreen> {
  final _benhNhanService = BenhNhanService();
  List<ToaThuocChiTiet> _prescriptions = [];
  bool _isLoading = true;
  String? _error;
  final Set<int> _expandedCards = {};

  // Filters
  DateTime? _fromDate;
  DateTime? _toDate;
  String _searchQuery = '';
  final _searchController = TextEditingController();

  static const Color _primaryColor = Color(0xFF0891B2);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);
  static const Color _mutedColor = Color(0xFFF1F5F9);

  List<ToaThuocChiTiet> get _filteredList {
    return _prescriptions.where((prescription) {
      // Filter by date range
      if (_fromDate != null || _toDate != null) {
        final ngay = prescription.ngayKeToa ?? '';
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
        final id = prescription.maToaThuoc.toString();
        final ghiChu = (prescription.ghiChu ?? '').toLowerCase();
        final drugNames = prescription.chiTietThuoc
            .map((t) => t.tenThuoc.toLowerCase())
            .join(' ');
        if (!id.contains(q) && !drugNames.contains(q) && !ghiChu.contains(q)) {
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
      final rawList = await _benhNhanService.getToaThuocByPatient();
      if (mounted) {
        setState(() {
          _prescriptions = rawList
              .map((e) => ToaThuocChiTiet.fromJson(e as Map<String, dynamic>))
              .toList();
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
          'Tất cả toa thuốc',
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
                width: 80, height: 80,
                decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), shape: BoxShape.circle),
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
              hintText: 'Tìm kiếm (mã toa, tên thuốc...)',
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

        // Date range filter
        Container(
          color: _cardColor,
          padding: const EdgeInsets.fromLTRB(16, 6, 16, 4),
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
                      'Từ ngày: ${_formatDate(_fromDate)}  ➔  Đến ngày: ${_formatDate(_toDate)}',
                      style: const TextStyle(fontSize: 12, color: _foregroundColor, fontWeight: FontWeight.w500),
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
      // Nếu có bộ lọc tìm kiếm/ngày và danh sách gốc không rỗng → kết quả lọc không khớp
      final isFilteredEmpty = _prescriptions.isNotEmpty && (_searchQuery.isNotEmpty || _fromDate != null || _toDate != null);
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
                    width: 100, height: 100,
                    decoration: BoxDecoration(
                      color: _mutedColor,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isFilteredEmpty ? Icons.inbox_rounded : Icons.medication_outlined,
                      size: 48,
                      color: _mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    isFilteredEmpty
                        ? 'Không tìm thấy toa thuốc'
                        : 'Bệnh nhân chưa khám nên chưa có dữ liệu',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: _foregroundColor),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isFilteredEmpty
                        ? (_searchQuery.isNotEmpty ? 'Thử thay đổi từ khóa tìm kiếm' : 'Không có toa thuốc phù hợp')
                        : 'Các toa thuốc được kê khi khám bệnh sẽ hiển thị tại đây.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: _mutedForeground),
                  ),
                  if (!isFilteredEmpty) ...[
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _loadData,
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
          final prescription = filtered[index];
          return _buildPrescriptionCard(prescription);
        },
      ),
    );
  }

  Widget _buildPrescriptionCard(ToaThuocChiTiet prescription) {
    final isExpanded = _expandedCards.contains(prescription.maToaThuoc);
    String formattedNgay = prescription.ngayKeToa ?? '';
    if (formattedNgay.length >= 10) {
      formattedNgay = formattedNgay.substring(0, 10);
    }

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
          setState(() {
            if (isExpanded) {
              _expandedCards.remove(prescription.maToaThuoc);
            } else {
              _expandedCards.add(prescription.maToaThuoc);
            }
          });
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.medication_outlined, color: Color(0xFF10B981), size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Toa thuốc #${prescription.maToaThuoc}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: _foregroundColor)),
                        if (formattedNgay.isNotEmpty)
                          Text('Ngày kê: $formattedNgay', style: const TextStyle(fontSize: 12, color: _mutedForeground)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: _mutedColor, borderRadius: BorderRadius.circular(8)),
                    child: Text('${prescription.chiTietThuoc.length} loại', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _mutedForeground)),
                  ),
                  const SizedBox(width: 4),
                  Icon(isExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded, color: _mutedForeground, size: 20),
                ],
              ),

              // Ghi chú
              if ((prescription.ghiChu ?? '').isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: _mutedColor, borderRadius: BorderRadius.circular(8)),
                  child: Text(prescription.ghiChu!, style: const TextStyle(fontSize: 12, color: _mutedForeground, fontStyle: FontStyle.italic)),
                ),
              ],

              // Danh sách thuốc (expandable)
              if (isExpanded && prescription.chiTietThuoc.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(height: 1, color: _borderColor),
                const SizedBox(height: 8),
                ...prescription.chiTietThuoc.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final thuoc = entry.value;
                  return _buildDrugItem(idx + 1, thuoc);
                }),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrugItem(int index, dynamic thuoc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: _mutedColor, borderRadius: BorderRadius.circular(10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 24, height: 24,
                decoration: BoxDecoration(color: _primaryColor, borderRadius: BorderRadius.circular(6)),
                alignment: Alignment.center,
                child: Text('$index', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
              const SizedBox(width: 8),
              Expanded(child: Text(thuoc.tenThuoc, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _foregroundColor))),
            ],
          ),
          const SizedBox(height: 8),
          if (thuoc.hamLuong != null && thuoc.hamLuong!.isNotEmpty) _buildDrugDetail(Icons.speed_outlined, 'Hàm lượng', thuoc.hamLuong!),
          if (thuoc.lieuDung != null && thuoc.lieuDung!.isNotEmpty) _buildDrugDetail(Icons.straighten_outlined, 'Liều dùng', thuoc.lieuDung!),
          if (thuoc.tanSuat != null && thuoc.tanSuat!.isNotEmpty) _buildDrugDetail(Icons.schedule_outlined, 'Tần suất', thuoc.tanSuat!),
          if (thuoc.cachDung != null && thuoc.cachDung!.isNotEmpty) _buildDrugDetail(Icons.info_outline_rounded, 'Cách dùng', thuoc.cachDung!),
          if (thuoc.dangBaoChe != null && thuoc.dangBaoChe!.isNotEmpty) _buildDrugDetail(Icons.inventory_2_outlined, 'Dạng bào chế', thuoc.dangBaoChe!),
          if (thuoc.donViTinh != null && thuoc.donViTinh!.isNotEmpty) _buildDrugDetail(Icons.scale_outlined, 'Đơn vị tính', thuoc.donViTinh!),
          if (thuoc.ghiChu != null && thuoc.ghiChu!.isNotEmpty) _buildDrugDetail(Icons.notes_rounded, 'Ghi chú', thuoc.ghiChu!),
        ],
      ),
    );
  }

  Widget _buildDrugDetail(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(width: 32),
          Icon(icon, size: 14, color: _mutedForeground),
          const SizedBox(width: 6),
          Text('$label: ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: _mutedForeground)),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 12, color: _foregroundColor))),
        ],
      ),
    );
  }
}