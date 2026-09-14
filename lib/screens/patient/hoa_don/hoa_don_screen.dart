import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/chi_tiet_ca_kham.dart';

class HoaDonScreen extends StatelessWidget {
  final ChiTietCaKham data;

  const HoaDonScreen({super.key, required this.data});

  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _foregroundColor = Color(0xFF1E293B);
  static const Color _mutedForeground = Color(0xFF64748B);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _borderColor = Color(0xFFE2E8F0);

  static final NumberFormat _moneyFormat =
      NumberFormat.decimalPattern('vi_VN');

  String _formatMoney(double? value) {
    if (value == null) return 'N/A';
    return '${_moneyFormat.format(value)} đ';
  }

  String _formatDateTime(String? value) {
    if (value == null || value.isEmpty) return '';
    // Backend trả về LocalDateTime dạng "2025-01-15T10:30:00"
    try {
      final dt = DateTime.parse(value);
      final date = DateFormat('dd/MM/yyyy').format(dt);
      final time = DateFormat('HH:mm').format(dt);
      return '$date $time';
    } catch (_) {
      return value;
    }
  }

  String _capitalizeFirstLetter(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) return trimmed;
    return trimmed[0].toUpperCase() + trimmed.substring(1);
  }

  String _phuongThucDisplay(String? value) {
    if (value == null || value.isEmpty) return 'N/A';
    switch (value.toLowerCase()) {
      case 'cash':
      case 'tien_mat':
        return 'Tiền mặt';
      case 'vnpay':
        return 'VNPay';
      case 'momo':
        return 'MoMo';
      case 'chuyen_khoan':
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'chua_xac_dinh':
        return 'Chưa xác định';
      default:
        return _capitalizeFirstLetter(value);
    }
  }

  Color _statusBg(String? trangThai) {
    switch ((trangThai ?? '').trim().toLowerCase()) {
      case 'da thanh toan':
      case 'đã thanh toán':
      case 'da_thanh_toan':
        return const Color(0xFFDCFCE7); // Green-100
      case 'chua thanh toan':
      case 'chưa thanh toán':
      case 'chua_thanh_toan':
        return const Color(0xFFFFFBEB); // Amber-50
      default:
        return const Color(0xFFF1F5F9); // Slate-100
    }
  }

  Color _statusFg(String? trangThai) {
    switch ((trangThai ?? '').trim().toLowerCase()) {
      case 'da thanh toan':
      case 'đã thanh toán':
      case 'da_thanh_toan':
        return const Color(0xFF16A34A); // Green-600
      case 'chua thanh toan':
      case 'chưa thanh toán':
      case 'chua_thanh_toan':
        return const Color(0xFFD97706); // Amber-600
      default:
        return const Color(0xFF64748B); // Slate-500
    }
  }

  String _statusText(String? trangThai) {
    switch ((trangThai ?? '').trim().toLowerCase()) {
      case 'da thanh toan':
      case 'đã thanh toán':
      case 'da_thanh_toan':
        return 'Đã thanh toán';
      case 'chua thanh toan':
      case 'chưa thanh toán':
      case 'chua_thanh_toan':
        return 'Chưa thanh toán';
      default:
        return trangThai?.isNotEmpty == true
            ? _capitalizeFirstLetter(trangThai!)
            : 'N/A';
    }
  }

  @override
  Widget build(BuildContext context) {
    final hoaDon = data.hoaDon;

    if (hoaDon == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.receipt_long_outlined,
              size: 64,
              color: Colors.grey[300],
            ),
            const SizedBox(height: 16),
            const Text(
              'Chưa có hóa đơn',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: _mutedForeground,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Hóa đơn sẽ được tạo sau khi\nca khám hoàn tất thanh toán',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: _mutedForeground,
              ),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(hoaDon),
          const SizedBox(height: 12),
          _buildThongTinThanhToan(hoaDon),
          if (data.chiTietHoaDon.isNotEmpty) ...[
            const SizedBox(height: 12),
            _buildChiTiet(),
          ],
          if (hoaDon.ghiChu != null && hoaDon.ghiChu!.isNotEmpty) ...[
            const SizedBox(height: 12),
            _buildGhiChu(hoaDon.ghiChu!),
          ],
          const SizedBox(height: 12),
          _buildTongCong(hoaDon),
        ],
      ),
    );
  }

  Widget _buildHeader(HoaDonInfo hoaDon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _primaryColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _primaryColor.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _primaryColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.receipt_long_rounded,
                  color: _primaryColor,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hoaDon.maHoaDon != null
                          ? 'Hóa đơn #${hoaDon.maHoaDon}'
                          : 'Hóa đơn',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: _foregroundColor,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${data.chiTietHoaDon.length} mục',
                      style: const TextStyle(
                        fontSize: 13,
                        color: _mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(height: 1, color: _borderColor),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Tổng tiền',
                    style: TextStyle(
                      fontSize: 13,
                      color: _mutedForeground,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatMoney(hoaDon.tongTien),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: _primaryColor,
                    ),
                  ),
                ],
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: _statusBg(hoaDon.trangThai),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _isDaThanhToan(hoaDon.trangThai)
                          ? Icons.check_circle_outline
                          : Icons.schedule_rounded,
                      size: 14,
                      color: _statusFg(hoaDon.trangThai),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _statusText(hoaDon.trangThai),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _statusFg(hoaDon.trangThai),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  bool _isDaThanhToan(String? trangThai) {
    final t = (trangThai ?? '').trim().toLowerCase();
    return t.contains('da') || t.contains('đã');
  }

  Widget _buildThongTinThanhToan(HoaDonInfo hoaDon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.payments_outlined, color: _primaryColor, size: 18),
              SizedBox(width: 8),
              Text(
                'THÔNG TIN THANH TOÁN',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: _foregroundColor,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(height: 1, color: _borderColor),
          const SizedBox(height: 12),
          _infoRow('Ngày thanh toán', _formatDateTime(hoaDon.ngayThanhToan)),
          _infoRow(
              'Phương thức', _phuongThucDisplay(hoaDon.phuongThucThanhToan)),
          if (hoaDon.maGiaoDich != null && hoaDon.maGiaoDich!.isNotEmpty)
            _infoRow('Mã giao dịch', hoaDon.maGiaoDich!),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, color: _mutedForeground),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                color: _foregroundColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _loaiMucIcon(String? loaiMuc) {
    switch ((loaiMuc ?? '').toLowerCase()) {
      case 'dich_vu':
      case 'kham':
        return Icons.medical_services_outlined;
      case 'thuoc':
        return Icons.medication_outlined;
      case 'xet_nghiem':
        return Icons.science_outlined;
      case 'cdha':
      case 'chan_doan_hinh_anh':
        return Icons.monitor_heart_outlined;
      default:
        return Icons.receipt_outlined;
    }
  }

  Widget _buildChiTiet() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.list_alt_rounded, color: _primaryColor, size: 18),
              SizedBox(width: 8),
              Text(
                'CHI TIẾT HÓA ĐƠN',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: _foregroundColor,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(height: 1, color: _borderColor),
          ...data.chiTietHoaDon.map(_buildChiTietItem),
        ],
      ),
    );
  }

  Widget _buildChiTietItem(ChiTietHoaDonInfo item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: _primaryColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _loaiMucIcon(item.loaiMuc),
              size: 17,
              color: _primaryColor,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.noiDung ?? 'N/A',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _foregroundColor,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 2),
                if (item.donGia != null && item.soLuong != null)
                  Text(
                    '${_formatMoney(item.donGia)} × ${item.soLuong}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: _mutedForeground,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            _formatMoney(item.thanhTien),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: _foregroundColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGhiChu(String ghiChu) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _borderColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.note_alt_outlined,
              size: 16, color: _mutedForeground),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ghi chú',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _mutedForeground,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  ghiChu,
                  style: const TextStyle(
                    fontSize: 13,
                    color: _foregroundColor,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTongCong(HoaDonInfo hoaDon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _primaryColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _primaryColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Tổng cộng',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: _foregroundColor,
            ),
          ),
          Text(
            _formatMoney(hoaDon.tongTien),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: _primaryColor,
            ),
          ),
        ],
      ),
    );
  }
}