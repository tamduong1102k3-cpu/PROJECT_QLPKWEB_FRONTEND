import 'package:flutter/material.dart';
import '../../providers/benh_nhan_provider.dart';
import '../../models/hoa_don.dart';
import '../../services/patient_service.dart';
import '../../widgets/shimmer_loading.dart';
import '../patient/search_patient_screen.dart';
import '../patient/create_patient_screen.dart';
import 'invoice_detail_screen.dart';

class ExaminationScreen extends StatefulWidget {
  const ExaminationScreen({super.key});

  @override
  State<ExaminationScreen> createState() => _ExaminationScreenState();
}

class _ExaminationScreenState extends State<ExaminationScreen> {
  final _patientService = PatientService();
  bool _isLoading = true;
  bool _hasProfile = false;
  late final BenhNhanProvider _provider;

  // Healthcare App color palette (Medical style)
  static const Color _primaryColor = Color(0xFF0F766E); // Deep Teal / Medical Blue
  static const Color _accentGreen = Color(0xFF16A34A); // Safe Green
  static const Color _foregroundColor = Color(0xFF1E293B); // Slate-800 for readability
  static const Color _mutedColor = Color(0xFFF1F5F9); // Slate-100
  static const Color _mutedForeground = Color(0xFF64748B); // Slate-500
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0); // Slate-200 (Clean, thin borders)

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    _provider = BenhNhanProvider();
    await _checkProfileStatus();
  }

  Future<void> _checkProfileStatus() async {
    setState(() => _isLoading = true);
    final hasProfile = await _patientService.checkHasProfile();
    if (mounted) {
      setState(() {
        _hasProfile = hasProfile;
        _isLoading = false;
      });
      if (hasProfile) {
        _loadData();
      }
    }
  }

  Future<void> _loadData() async {
    await _provider.loadHoaDonList();
    if (mounted) setState(() {});
  }

  Future<void> _navigateToSearch() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => SearchPatientScreen(
          onLinked: () => Navigator.of(context).pop(true),
        ),
      ),
    );
    if (result == true) _checkProfileStatus();
  }

  Future<void> _navigateToCreate() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => CreatePatientScreen(
          onCreated: () => Navigator.of(context).pop(true),
        ),
      ),
    );
    if (result == true) _checkProfileStatus();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (!_hasProfile) {
      return _buildMandatorySelection();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Danh sách hóa đơn',
          style: TextStyle(fontWeight: FontWeight.w600, color: _foregroundColor, fontSize: 18),
        ),
        centerTitle: true,
        backgroundColor: _cardColor,
        foregroundColor: _foregroundColor,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _borderColor, height: 1.0),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: _foregroundColor),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _provider.isLoadingHoaDonList
          ? const ShimmerLoading()
          : _provider.hoaDonList.isEmpty
              ? _buildEmpty()
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _provider.hoaDonList.length,
                    itemBuilder: (context, index) {
                      return _buildInvoiceCard(_provider.hoaDonList[index]);
                    },
                  ),
                ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: _mutedColor,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.receipt_long_outlined, size: 48, color: _mutedForeground),
            ),
            const SizedBox(height: 20),
            const Text(
              'Bệnh nhân chưa khám nên chưa có dữ liệu',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: _foregroundColor),
            ),
            const SizedBox(height: 8),
            const Text(
              'Các hóa đơn khám bệnh đã thanh toán sẽ hiển thị tại đây',
              textAlign: TextAlign.center,
              style: TextStyle(color: _mutedForeground, fontSize: 13),
            ),
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
        ),
      ),
    );
  }

  Widget _buildMandatorySelection() {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Hóa đơn',
          style: TextStyle(fontWeight: FontWeight.w600, color: _foregroundColor, fontSize: 18),
        ),
        centerTitle: true,
        backgroundColor: _cardColor,
        foregroundColor: _foregroundColor,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _borderColor, height: 1.0),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.receipt_long_outlined, size: 80, color: _primaryColor),
            const SizedBox(height: 24),
            const Text(
              'Yêu cầu hồ sơ bệnh nhân',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _foregroundColor),
            ),
            const SizedBox(height: 12),
            const Text(
              'Vui lòng liên kết hồ sơ hiện có hoặc tạo mới để xem hóa đơn.',
              textAlign: TextAlign.center,
              style: TextStyle(color: _mutedForeground),
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: _navigateToSearch,
              icon: const Icon(Icons.link, color: Colors.white),
              label: const Text('Tôi đã có hồ sơ (Liên kết ngay)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _primaryColor,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.all(16),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _navigateToCreate,
              icon: const Icon(Icons.add_circle_outline, color: _primaryColor),
              label: const Text('Tôi chưa có hồ sơ (Tạo mới và liên kết)'),
              style: OutlinedButton.styleFrom(
                foregroundColor: _primaryColor,
                side: const BorderSide(color: _primaryColor),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                padding: const EdgeInsets.all(16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInvoiceCard(HoaDon hoaDon) {
    final ngayThanhToan = hoaDon.ngayThanhToan ?? '';
    final tenNhanVien = hoaDon.tenNhanVien ?? '';
    final tenDichVu = hoaDon.tenDichVu ?? '';
    final tongTien = hoaDon.tongTien ?? 0.0;

    String day = '--';
    String monthYear = '--/--';
    if (ngayThanhToan.length >= 10) {
      final parts = ngayThanhToan.substring(0, 10).split('-');
      if (parts.length == 3) {
        day = parts[2];
        monthYear = 'T${parts[1]}/${parts[0].substring(2)}';
      }
    }

    // Luôn hiển thị "Đã thanh toán" vì chỉ lấy hóa đơn có trang_thai = 'da thanh toan'
    const invoiceStatus = 'Đã thanh toán';
    final bg = _accentGreen.withValues(alpha: 0.1);
    final fg = _accentGreen;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _borderColor),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          final maPhieuKham = hoaDon.maPhieuKham ?? 0;
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => InvoiceDetailScreen(
                maPhieuKham: maPhieuKham,
              ),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Date column
              Container(
                width: 60,
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                decoration: BoxDecoration(
                  color: _mutedColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      day,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: _primaryColor,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      monthYear,
                      style: TextStyle(
                        fontSize: 10,
                        color: _mutedForeground,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              // Main info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hóa đơn #${hoaDon.maHoaDon ?? 0}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: _foregroundColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (tenDichVu.isNotEmpty)
                      Text(
                        'Dịch vụ: $tenDichVu',
                        style: const TextStyle(fontSize: 12, color: _foregroundColor),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    if (tenNhanVien.isNotEmpty)
                      Text(
                        'Bác sĩ: $tenNhanVien',
                        style: TextStyle(fontSize: 12, color: _mutedForeground),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    if (ngayThanhToan.isNotEmpty)
                      Text(
                        'Thanh toán: ${_formatMoney(tongTien)}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: _primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Status column
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: bg,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      invoiceStatus.toUpperCase(),
                      style: TextStyle(
                        fontSize: 9,
                        color: fg,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Icon(Icons.chevron_right_rounded, color: _mutedForeground, size: 20),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatMoney(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} đ';
  }
}