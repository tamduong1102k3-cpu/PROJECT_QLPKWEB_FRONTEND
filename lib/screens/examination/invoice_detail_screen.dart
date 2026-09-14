import 'package:flutter/material.dart';
import '../../providers/benh_nhan_provider.dart';
import '../../widgets/shimmer_loading.dart';
import '../../models/chi_tiet_ca_kham.dart';

class InvoiceDetailScreen extends StatefulWidget {
  final int maPhieuKham;

  const InvoiceDetailScreen({super.key, required this.maPhieuKham});

  @override
  State<InvoiceDetailScreen> createState() => _InvoiceDetailScreenState();
}

class _InvoiceDetailScreenState extends State<InvoiceDetailScreen> {
  late final BenhNhanProvider _provider;

  // Healthcare App color palette (Medical style)
  static const Color _primaryColor = Color(0xFF0F766E); // Deep Teal / Medical Blue
  static const Color _accentGreen = Color(0xFF16A34A); // Safe Green
  static const Color _foregroundColor = Color(0xFF1E293B); // Slate-800 for readability
  static const Color _mutedColor = Color(0xFFF1F5F9); // Slate-100
  static const Color _mutedForeground = Color(0xFF64748B); // Slate-500
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0); // Slate-200 (Clean, thin borders)
  static const Color _destructiveColor = Color(0xFFEF4444); // Red

  @override
  void initState() {
    super.initState();
    _provider = BenhNhanProvider();
    _loadData();
  }

  @override
  void dispose() {
    _provider.resetChiTietCaKham();
    super.dispose();
  }

  Future<void> _loadData() async {
    await _provider.loadChiTietCaKham(widget.maPhieuKham);
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Chi tiết hóa đơn',
          style: const TextStyle(fontWeight: FontWeight.w600, color: _foregroundColor, fontSize: 18),
        ),
        centerTitle: true,
        backgroundColor: _cardColor,
        foregroundColor: _foregroundColor,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _borderColor, height: 1.0),
        ),
        iconTheme: const IconThemeData(color: _foregroundColor),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_provider.isLoadingChiTiet) {
      return const ShimmerLoading();
    }

    if (_provider.chiTietError != null) {
      return _buildErrorView();
    }

    final data = _buildTongHopData();
    if (data == null) {
      return _buildEmptyView();
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildInvoiceHeader(data),
            const SizedBox(height: 16),
            _buildInvoiceItems(data),
            const SizedBox(height: 16),
            _buildTotalSection(data),
            const SizedBox(height: 16),
            _buildPaymentInfo(data),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: _destructiveColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline_rounded, size: 40, color: _destructiveColor),
            ),
            const SizedBox(height: 20),
            const Text(
              'Không thể tải hóa đơn',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: _foregroundColor),
            ),
            const SizedBox(height: 8),
            Text(
              _provider.chiTietError ?? '',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: _mutedForeground),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _loadData,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Thử lại'),
              style: FilledButton.styleFrom(
                backgroundColor: _primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: const BoxDecoration(
              color: _mutedColor,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.receipt_long_outlined, size: 40, color: _mutedForeground),
          ),
          const SizedBox(height: 16),
          const Text(
            'Không có dữ liệu',
            style: TextStyle(fontSize: 16, color: _mutedForeground),
          ),
        ],
      ),
    );
  }

  Widget _buildInvoiceHeader(ChiTietCaKham data) {
    final hoaDon = data.hoaDon;
    final trangThaiHd = hoaDon?.trangThai ?? '';
    final ngayThanhToan = hoaDon?.ngayThanhToan ?? data.ngayKham ?? '';

    String formattedNgay = ngayThanhToan;
    if (ngayThanhToan.length >= 10) {
      formattedNgay = ngayThanhToan.substring(0, 10);
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Clinic branding & Invoice ID on two sides (Hospital paper receipt style)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                flex: 6,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PHÒNG KHÁM QLPK',
                      style: TextStyle(
                        color: _primaryColor,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Đ/c: ĐHQG TP.HCM, Thủ Đức',
                      style: TextStyle(color: _mutedForeground, fontSize: 11),
                    ),
                    const Text(
                      'SĐT: 1900.xxxx',
                      style: TextStyle(color: _mutedForeground, fontSize: 11),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 4,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'MÃ HĐ: #${hoaDon?.maHoaDon ?? data.maPhieuKham}',
                      style: const TextStyle(
                        color: _foregroundColor,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    _buildStatusBadge(trangThaiHd.isNotEmpty ? trangThaiHd : data.trangThai ?? ''),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Center(
            child: Text(
              'HÓA ĐƠN DỊCH VỤ Y TẾ',
              style: TextStyle(
                color: _foregroundColor,
                fontSize: 16,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.8,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            height: 1,
            color: _borderColor,
          ),
          const SizedBox(height: 12),
          // Info Grid
          _buildInfoRow('Họ và tên:', data.tenBenhNhan ?? 'N/A', 'Ngày sinh:', data.ngaySinh != null && data.ngaySinh!.length >= 10 ? data.ngaySinh!.substring(0, 10) : 'N/A'),
          _buildInfoRow('Giới tính:', data.gioiTinh ?? 'N/A', 'Số ĐT:', data.soDienThoai ?? 'N/A'),
          _buildInfoRow('Bác sĩ:', data.tenNhanVien ?? 'N/A', 'Chuyên khoa:', data.tenChuyenKhoa ?? 'N/A'),
          _buildInfoRow('Ngày lập:', formattedNgay, '', ''),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label1, String value1, String label2, String value2) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            flex: 5,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label1,
                  style: const TextStyle(color: _mutedForeground, fontSize: 13),
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    value1,
                    style: const TextStyle(
                      color: _foregroundColor,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 5,
            child: label2.isEmpty
                ? const SizedBox.shrink()
                : Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label2,
                        style: const TextStyle(color: _mutedForeground, fontSize: 13),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          value2,
                          style: const TextStyle(
                            color: _foregroundColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  /// Map raw status string to display text
  String _getDisplayStatus(String status) {
    switch (status.toLowerCase().trim()) {
      case 'da thanh toan':
      case 'đã thanh toán':
        return 'Đã thanh toán';
      case 'chua thanh toan':
      case 'chưa thanh toán':
      case 'chua_xac_dinh':
        return 'Chưa thanh toán';
      case 'dang_cho_thanh_toan':
      case 'đang chờ thanh toán':
        return 'Đang chờ thanh toán';
      case 'cho_thanh_toan':
      case 'chờ thanh toán':
        return 'Chờ thanh toán';
      case 'huy':
      case 'đã hủy':
        return 'Đã hủy';
      case 'hoan_thanh':
      case 'hoàn thành':
        return 'Hoàn thành';
      case 'dang_kham':
      case 'đang khám':
        return 'Đang khám';
      case 'cho_kham':
      case 'chờ khám':
        return 'Chờ khám';
      case 'cho':
      case 'chờ':
        return 'Chờ';
      case 'cho_bac_si':
      case 'chờ bác sĩ':
        return 'Chờ bác sĩ';
      case 'cho_cls':
      case 'chờ cls':
        return 'Chờ CLS';
      case 'da_kham_lam_sang':
      case 'đã khám lâm sàng':
        return 'Đã khám lâm sàng';
      case 'da_den':
      case 'đã đến':
        return 'Đã đến';
      case 'da_thuc_hien':
      case 'đã thực hiện':
        return 'Đã thực hiện';
      case 'chua_thuc_hien':
      case 'chưa thực hiện':
        return 'Chưa thực hiện';
      case 'cho_duyet':
      case 'chờ duyệt':
        return 'Chờ duyệt';
      case 'da_duyet':
      case 'đã duyệt':
        return 'Đã duyệt';
      case 'tu_choi':
      case 'từ chối':
        return 'Từ chối';
      case 'da_cap_thuoc':
      case 'đã cấp thuốc':
        return 'Đã cấp thuốc';
      default:
        return status;
    }
  }

  Widget _buildStatusBadge(String status) {
    final displayText = _getDisplayStatus(status);
    
    // Choose status colors based on status string
    Color bg = _mutedColor;
    Color fg = _mutedForeground;
    
    final lowerStatus = status.toLowerCase();
    if (lowerStatus.contains('da thanh toan') || lowerStatus.contains('đã thanh toán') || lowerStatus.contains('hoan_thanh') || lowerStatus.contains('hoàn thành') || lowerStatus.contains('da_cap_thuoc')) {
      bg = _accentGreen.withValues(alpha: 0.1);
      fg = _accentGreen;
    } else if (lowerStatus.contains('chua') || lowerStatus.contains('chờ thanh toán') || lowerStatus.contains('cho_thanh_toan')) {
      bg = _destructiveColor.withValues(alpha: 0.1);
      fg = _destructiveColor;
    } else {
      bg = _primaryColor.withValues(alpha: 0.1);
      fg = _primaryColor;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        displayText.toUpperCase(),
        style: TextStyle(
          color: fg,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildInvoiceItems(ChiTietCaKham data) {
    final items = <MapEntry<String, double>>[];

    for (var ct in data.chiTietHoaDon) {
      final noiDung = ct.noiDung ?? '';
      final thanhTien = ct.thanhTien ?? 0.0;
      items.add(MapEntry(noiDung, thanhTien));
    }

    if (items.isEmpty) {
      for (var pcd in data.phieuChiDinh) {
        for (var ct in pcd.chiTietDichVu) {
          items.add(MapEntry(ct.tenDichVu, 0.0));
        }
      }
      for (var tt in data.toaThuoc) {
        for (var ct in tt.chiTietThuoc) {
          items.add(MapEntry(
            'Thuốc: ${ct.tenThuoc} (${ct.soLuong ?? 0} ${ct.donViTinh ?? ''})',
            0.0,
          ));
        }
      }
    }

    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.assignment_outlined, size: 18, color: _primaryColor),
              SizedBox(width: 8),
              Text(
                'DANH SÁCH DỊCH VỤ & THUỐC',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: _foregroundColor,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Table Header
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            decoration: const BoxDecoration(
              color: _mutedColor,
              borderRadius: BorderRadius.all(Radius.circular(4)),
            ),
            child: Row(
              children: const [
                SizedBox(
                  width: 30,
                  child: Text(
                    'STT',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _mutedForeground),
                    textAlign: TextAlign.center,
                  ),
                ),
                Expanded(
                  child: Text(
                    'TÊN DỊCH VỤ / CHI TIẾT',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _mutedForeground),
                  ),
                ),
                SizedBox(
                  width: 90,
                  child: Text(
                    'THÀNH TIỀN',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _mutedForeground),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          // Table Body
          ...List.generate(items.length, (index) {
            final item = items[index];
            return Container(
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: index == items.length - 1 ? Colors.transparent : _borderColor,
                    width: 0.5,
                  ),
                ),
              ),
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 30,
                    child: Text(
                      '${index + 1}',
                      style: const TextStyle(fontSize: 13, color: _mutedForeground),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      item.key,
                      style: const TextStyle(
                        fontSize: 13,
                        color: _foregroundColor,
                        height: 1.3,
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 90,
                    child: Text(
                      item.value > 0 ? _formatMoney(item.value) : 'Miễn phí',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: item.value > 0 ? _foregroundColor : _accentGreen,
                      ),
                      textAlign: TextAlign.right,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTotalSection(ChiTietCaKham data) {
    final hoaDon = data.hoaDon;
    final tongTien = hoaDon?.tongTien ?? _calculateTotal(data);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'TỔNG TIỀN THANH TOÁN',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: _mutedForeground,
              letterSpacing: 0.5,
            ),
          ),
          Text(
            _formatMoney(tongTien),
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: _primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentInfo(ChiTietCaKham data) {
    final hoaDon = data.hoaDon;
    if (hoaDon == null) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.credit_card_outlined, size: 18, color: _primaryColor),
              SizedBox(width: 8),
              Text(
                'THÔNG TIN THANH TOÁN',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: _foregroundColor,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            height: 1,
            color: _borderColor,
          ),
          const SizedBox(height: 8),
          if (hoaDon.maHoaDon != null)
            _buildPaymentRow('Mã hóa đơn', '#${hoaDon.maHoaDon}'),
          if (hoaDon.phuongThucThanhToan != null)
            _buildPaymentRow('Phương thức', _getDisplayPaymentMethod(hoaDon.phuongThucThanhToan!)),
          if (hoaDon.ngayThanhToan != null)
            _buildPaymentRow(
              'Thời gian thanh toán',
              hoaDon.ngayThanhToan!.length >= 19
                  ? hoaDon.ngayThanhToan!.substring(0, 19).replaceAll('T', ' ')
                  : (hoaDon.ngayThanhToan!.length >= 10
                      ? hoaDon.ngayThanhToan!.substring(0, 10)
                      : hoaDon.ngayThanhToan!),
            ),
          // Chỉ hiển thị mã giao dịch ngân hàng khi thanh toán qua VNPAY / chuyển khoản
          if (_isBankPayment(hoaDon.phuongThucThanhToan) && hoaDon.maGiaoDich != null)
            _buildPaymentRow('Mã giao dịch ngân hàng', hoaDon.maGiaoDich!),
          if (hoaDon.ghiChu != null && hoaDon.ghiChu!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  color: _mutedColor,
                  borderRadius: BorderRadius.all(Radius.circular(6)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline_rounded, size: 16, color: _mutedForeground),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Ghi chú: ${hoaDon.ghiChu!}',
                        style: const TextStyle(fontSize: 12, color: _foregroundColor, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPaymentRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 13, color: _mutedForeground),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _foregroundColor,
            ),
          ),
        ],
      ),
    );
  }

  /// Chuyển đổi mã phương thức thanh toán từ backend sang chữ hiển thị
  String _getDisplayPaymentMethod(String method) {
    final m = method.trim().toLowerCase();
    switch (m) {
      case 'tien_mat':
      case 'tiền mặt':
      case 'cash':
        return 'Tiền mặt';
      case 'vnpay':
      case 'vn_pay':
      case 'chuyen_khoan':
      case 'chuyển khoản':
        return 'VNPAY / Chuyển khoản';
      case 'the':
      case 'thẻ':
      case 'credit_card':
        return 'Thẻ ngân hàng';
      case 'momo':
      case 'zalopay':
        return method.toUpperCase();
      case 'chua_xac_dinh':
      case '':
        return 'Chưa xác định';
      default:
        return method;
    }
  }

  /// Kiểm tra xem phương thức thanh toán có phải là ngân hàng/VNPAY không
  bool _isBankPayment(String? method) {
    if (method == null) return false;
    final m = method.trim().toLowerCase();
    return m == 'vnpay' || m == 'vn_pay' || m == 'chuyen_khoan' || m == 'chuyển khoản' || m == 'the' || m == 'thẻ';
  }

  /// Xây dựng đối tượng ChiTietCaKham từ dữ liệu các sub-endpoint
  ChiTietCaKham? _buildTongHopData() {
    final coBan = _provider.chiTietCoBan;
    if (coBan == null) return null;

    final kls = _provider.khamLamSang;
    final hd = _provider.hoaDon;

    // Parse hóa đơn
    HoaDonInfo? hoaDonInfo;
    List<ChiTietHoaDonInfo> chiTietHoaDonList = [];
    if (hd != null && hd['hoaDon'] != null) {
      hoaDonInfo = HoaDonInfo.fromJson(hd['hoaDon'] as Map<String, dynamic>);
      if (hd['chiTietHoaDon'] != null) {
        chiTietHoaDonList = (hd['chiTietHoaDon'] as List<dynamic>)
            .map((e) => ChiTietHoaDonInfo.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }

    final lichTaiKhamList = _provider.lichTaiKham
        .map((e) => LichTaiKhamInfo.fromJson(e as Map<String, dynamic>))
        .toList();

    return ChiTietCaKham(
      maPhieuKham: coBan.maPhieuKham,
      ngayKham: coBan.ngayKham,
      trieuChung: kls?['lyDoKham'] as String?,
      chanDoan: kls?['chanDoanSoBo'] as String?,
      ghiChu: coBan.ghiChu,
      trangThai: coBan.trangThai,
      tenChuyenKhoa: coBan.tenChuyenKhoa,
      tenNhanVien: coBan.tenNhanVien,
      maBenhNhan: coBan.maBenhNhan,
      tenBenhNhan: coBan.tenBenhNhan,
      ngaySinh: coBan.ngaySinh,
      gioiTinh: coBan.gioiTinh,
      soDienThoai: coBan.soDienThoai,
      email: coBan.email,
      diaChi: coBan.diaChi,
      // Hóa đơn
      hoaDon: hoaDonInfo,
      chiTietHoaDon: chiTietHoaDonList,
      // Lịch tái khám
      lichTaiKham: lichTaiKhamList,
      // Phiếu chỉ định
      phieuChiDinh: _provider.phieuChiDinh,
      // Toa thuốc
      toaThuoc: _provider.toaThuoc,
    );
  }

  double _calculateTotal(ChiTietCaKham data) {
    double total = 0;
    for (var ct in data.chiTietHoaDon) {
      total += (ct.thanhTien ?? 0);
    }
    return total;
  }

  String _formatMoney(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} đ';
  }
}