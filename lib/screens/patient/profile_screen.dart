import 'package:flutter/material.dart';
import '../../providers/benh_nhan_provider.dart';
import '../../widgets/shimmer_loading.dart';
import '../../utils/toast_helper.dart';
import 'ca_kham_detail_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
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

  Future<void> _loadData() async {
    await Future.wait([
      _provider.loadProfile(),
      _provider.loadPhieuKhamList(),
    ]);
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _refresh() async {
    await _loadData();
  }

  String? _getProfileValue(String key) {
    final value = _provider.profile?[key];
    if (value == null) return null;
    if (value is String) return value;
    return value.toString();
  }

  int? _getProfileInt(String key) {
    final value = _provider.profile?[key];
    if (value == null) return null;
    if (value is int) return value;
    return int.tryParse(value.toString());
  }

  /// Chuyển định dạng ngày từ "2000-05-02" thành "02/05/2000"
  String _formatDate(String dateStr) {
    String cleaned = dateStr.trim();
    if (cleaned.length >= 10) {
      try {
        if (cleaned.contains('-') || cleaned.contains('/')) {
          String separator = cleaned.contains('-') ? '-' : '/';
          List<String> parts = cleaned.substring(0, 10).split(separator);
          if (parts.length == 3) {
            if (parts[0].length == 4) {
              return '${parts[2].padLeft(2, '0')}/${parts[1].padLeft(2, '0')}/${parts[0]}';
            }
            return '${parts[0].padLeft(2, '0')}/${parts[1].padLeft(2, '0')}/${parts[2]}';
          }
        }
      } catch (_) {}
    }
    return cleaned;
  }

  /// Chuyển Boolean giới tính thành chữ: true -> Nam, false -> Nữ
  String _mapGender(dynamic gender) {
    if (gender == null) return '';
    if (gender is bool) return gender ? 'Nam' : 'Nữ';
    final g = gender.toString().toLowerCase();
    if (g == 'true' || g == '1') return 'Nam';
    if (g == 'false' || g == '0') return 'Nữ';
    return gender.toString();
  }

  /// Đọc trạng thái xác minh danh tính từ profile (backend trả Boolean)
  bool _daXacMinhDanhTinh() {
    final value = _provider.profile?['daXacMinhDanhTinh'];
    if (value is bool) return value;
    if (value is num) return value != 0;
    final s = value?.toString().toLowerCase();
    return s == 'true' || s == '1';
  }

  /// Badge trạng thái xác minh danh tính
  Widget _buildXacMinhDanhTinhBadge() {
    final daXacMinh = _daXacMinhDanhTinh();
    final Color bg = daXacMinh
        ? _accentGreen.withValues(alpha: 0.1)
        : const Color(0xFFFFFBEB);
    final Color fg = daXacMinh ? _accentGreen : const Color(0xFFD97706);
    final IconData icon = daXacMinh
        ? Icons.verified_user_outlined
        : Icons.help_outline;

    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: fg),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              daXacMinh
                  ? 'Đã xác minh danh tính'
                  : 'Chưa xác minh danh tính',
              style: TextStyle(
                fontSize: 11,
                color: fg,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Hồ sơ bệnh nhân',
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
      body: _provider.isLoadingProfile || _provider.isLoadingPhieuKham
          ? const ShimmerLoading()
          : _provider.profileError != null
              ? _buildError()
              : RefreshIndicator(
                  onRefresh: _refresh,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildProfileHeader(),
                        _buildPatientInfo(),
                        const SizedBox(height: 16),
                        _buildVitalSigns(),
                        const SizedBox(height: 16),
                        _buildExamHistory(),
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: _destructiveColor),
            const SizedBox(height: 16),
            const Text(
              'Không thể tải thông tin hồ sơ',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _foregroundColor),
            ),
            const SizedBox(height: 8),
            Text(
              _provider.profileError ?? '',
              textAlign: TextAlign.center,
              style: const TextStyle(color: _mutedForeground),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _refresh,
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _primaryColor,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    final tenBenhNhan = _getProfileValue('tenBenhNhan') ?? _getProfileValue('hoTen') ?? '';
    final maBenhNhan = _getProfileInt('maBenhNhan');
    final ngaySinhRaw = _provider.profile?['ngaySinh'];
    final gioiTinhRaw = _provider.profile?['gioiTinh'];

    String formattedNgaySinh = '';
    if (ngaySinhRaw != null) {
      formattedNgaySinh = _formatDate(ngaySinhRaw.toString());
    }

    final formattedGioiTinh = _mapGender(gioiTinhRaw);
    final hasName = tenBenhNhan.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: _cardColor,
        border: Border(bottom: BorderSide(color: _borderColor)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 36,
            backgroundColor: _primaryColor.withValues(alpha: 0.1),
            child: const Icon(
              Icons.person_outline_rounded,
              size: 38,
              color: _primaryColor,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (hasName)
                  Text(
                    tenBenhNhan,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: _foregroundColor,
                    ),
                  )
                else
                  GestureDetector(
                    onTap: () {
                      ToastHelper.info(
                        context: context,
                        title: 'Cập nhật hồ sơ',
                        description: 'Chức năng cập nhật hồ sơ',
                      );
                    },
                    child: Row(
                      children: const [
                        Text(
                          'Cập nhật họ tên',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: _primaryColor,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(
                          Icons.edit_outlined,
                          size: 16,
                          color: _primaryColor,
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 6),
                Text(
                  'Mã bệnh nhân: ${maBenhNhan ?? '--'}',
                  style: const TextStyle(fontSize: 13, color: _mutedForeground),
                ),
                if (formattedNgaySinh.isNotEmpty || formattedGioiTinh.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      '$formattedNgaySinh${formattedGioiTinh.isNotEmpty ? ' ($formattedGioiTinh)' : ''}',
                      style: const TextStyle(fontSize: 13, color: _mutedForeground),
                    ),
                  ),
                _buildXacMinhDanhTinhBadge(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPatientInfo() {
    final soDienThoai = _getProfileValue('soDienThoai') ?? '';
    final email = _getProfileValue('email') ?? '';
    final diaChi = _getProfileValue('diaChi') ?? '';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        decoration: BoxDecoration(
          color: _cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _borderColor),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.contact_phone_outlined, color: _primaryColor, size: 18),
                SizedBox(width: 8),
                Text(
                  'THÔNG TIN LIÊN HỆ',
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
            Container(height: 1, color: _borderColor),
            const SizedBox(height: 12),
            _buildInfoRow(
              'Số điện thoại:',
              soDienThoai.isNotEmpty ? soDienThoai : 'Chưa cập nhật',
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              'Email:',
              email.isNotEmpty ? email : 'Chưa cập nhật',
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              'Địa chỉ:',
              diaChi.isNotEmpty ? diaChi : 'Chưa cập nhật',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: _mutedForeground),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, color: _foregroundColor, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVitalSigns() {
    final mach = _getProfileValue('mach') ?? '--';
    final nhietDo = _getProfileValue('nhietDo') ?? '--';
    final huyetAp = _getProfileValue('huyetAp') ?? '--';
    final canNang = _getProfileValue('canNang') ?? '--';

    final allEmpty = mach == '--' && nhietDo == '--' && huyetAp == '--' && canNang == '--';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: _cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _borderColor),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Icon(Icons.monitor_heart_outlined, color: _destructiveColor, size: 18),
                SizedBox(width: 8),
                Text(
                  'CHỈ SỐ SỨC KHỎE GẦN NHẤT',
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
            Container(height: 1, color: _borderColor),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildVitalItem('Mạch', mach, 'lần/ph'),
                _buildVitalItem('Nhiệt độ', nhietDo, '°C'),
                _buildVitalItem('Huyết áp', huyetAp, 'mmHg'),
                _buildVitalItem('Cân nặng', canNang, 'kg'),
              ],
            ),
            if (allEmpty) ...[
              const SizedBox(height: 12),
              Center(
                child: Text(
                  'Chưa có dữ liệu đo gần đây',
                  style: TextStyle(
                    fontSize: 12,
                    color: _mutedForeground,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildVitalItem(String label, String value, String unit) {
    final isEmpty = value == '--';
    return Opacity(
      opacity: isEmpty ? 0.4 : 1.0,
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: isEmpty ? _mutedForeground : _primaryColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            unit,
            style: const TextStyle(fontSize: 11, color: _mutedForeground),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: _foregroundColor, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildExamHistory() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Row(
            children: const [
              Icon(Icons.history_toggle_off_rounded, color: _primaryColor, size: 18),
              SizedBox(width: 8),
              Text(
                'LỊCH SỬ KHÁM BỆNH',
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
          if (_provider.phieuKhamList.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Column(
                  children: [
                    Icon(Icons.inbox_outlined, size: 48, color: _mutedForeground),
                    SizedBox(height: 8),
                    Text(
                      'Chưa có phiếu khám nào',
                      style: TextStyle(color: _mutedForeground, fontSize: 14),
                    ),
                  ],
                ),
              ),
            )
          else
            ..._provider.phieuKhamList.map((pk) => _buildPhieuKhamCard(pk)),
        ],
      ),
    );
  }

  Widget _buildPhieuKhamCard(dynamic phieuKham) {
    final ngayKham = phieuKham.ngayKham ?? '';
    final tenChuyenKhoa = phieuKham.tenChuyenKhoa ?? '';
    final tenNhanVien = phieuKham.tenNhanVien ?? '';
    final tenDichVu = phieuKham.tenDichVu ?? '';
    final chanDoan = phieuKham.chanDoan ?? '';
    final trangThai = phieuKham.trangThai ?? '';
    final loaiDichVu = phieuKham.loaiDichVu ?? '';
    final isCls = loaiDichVu.contains('CLS_XET_NGHIEM') ||
        loaiDichVu.contains('CLS_CHAN_DOAN_HINH_ANH');

    final formattedNgay = ngayKham.isNotEmpty ? _formatDate(ngayKham) : '';

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
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => CaKhamDetailScreen(
                maPhieuKham: phieuKham.maPhieuKham,
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
                      const Icon(Icons.description_outlined, color: _primaryColor, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        isCls
                            ? (loaiDichVu.contains('CLS_XET_NGHIEM')
                                ? 'Phiếu Xét nghiệm #${phieuKham.maPhieuKham}'
                                : 'Phiếu CĐHA #${phieuKham.maPhieuKham}')
                            : 'Phiếu khám #${phieuKham.maPhieuKham}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: _foregroundColor,
                        ),
                      ),
                    ],
                  ),
                  _buildTrangThaiBadge(trangThai),
                ],
              ),
              const SizedBox(height: 12),
              Container(height: 1, color: _borderColor),
              const SizedBox(height: 12),
              if (isCls)
                _buildDetailRow(Icons.science_outlined, 'Loại phiếu: ${loaiDichVu}'),
              if (formattedNgay.isNotEmpty)
                _buildDetailRow(Icons.calendar_today_outlined, 'Ngày khám: $formattedNgay'),
              if (tenDichVu.isNotEmpty)
                _buildDetailRow(Icons.medical_services_outlined, 'Dịch vụ: $tenDichVu'),
              if (tenChuyenKhoa.isNotEmpty)
                _buildDetailRow(Icons.local_hospital_outlined, 'Chuyên khoa: $tenChuyenKhoa'),
              if (tenNhanVien.isNotEmpty)
                _buildDetailRow(Icons.person_outline_rounded, 'Bác sĩ: $tenNhanVien'),
              // Phiếu CLS không hiển thị chẩn đoán (không có triệu chứng/chẩn đoán)
              if (!isCls && chanDoan.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: _mutedColor,
                    borderRadius: BorderRadius.all(Radius.circular(6)),
                  ),
                  child: Text(
                    'Chẩn đoán: $chanDoan',
                    style: const TextStyle(fontSize: 13, color: _foregroundColor, height: 1.3),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: const [
                  Text(
                    'Xem chi tiết',
                    style: TextStyle(
                      color: _primaryColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  SizedBox(width: 2),
                  Icon(
                    Icons.chevron_right_rounded,
                    color: _primaryColor,
                    size: 18,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Icon(icon, size: 15, color: _mutedForeground),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: _foregroundColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrangThaiBadge(String trangThai) {
    Color bg;
    Color fg;
    String displayText;

    switch (trangThai.toLowerCase()) {
      case 'da_kham':
      case 'đã khám':
      case 'hoàn thành':
        bg = _accentGreen.withValues(alpha: 0.1);
        fg = _accentGreen;
        displayText = 'Hoàn thành';
        break;
      case 'dang_kham':
      case 'đang khám':
        bg = const Color(0xFFFFFBEB);
        fg = const Color(0xFFD97706);
        displayText = 'Đang khám';
        break;
      case 'cho_kham':
      case 'chờ khám':
        bg = _primaryColor.withValues(alpha: 0.1);
        fg = _primaryColor;
        displayText = 'Chờ khám';
        break;
      case 'huy':
      case 'hủy':
        bg = _destructiveColor.withValues(alpha: 0.15);
        fg = _destructiveColor;
        displayText = 'Đã hủy';
        break;
      default:
        bg = _mutedColor;
        fg = _mutedForeground;
        displayText = trangThai;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 10,
          color: fg,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}