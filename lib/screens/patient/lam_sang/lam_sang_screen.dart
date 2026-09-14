import 'package:flutter/material.dart';
import '../../../models/chi_tiet_ca_kham.dart';
import '../../../constants/chuyen_khoa_chi_so_config.dart';

class LamSangScreen extends StatelessWidget {
  final ChiTietCaKham data;

  const LamSangScreen({super.key, required this.data});

  // Healthcare App color palette (Medical style)
  static const Color _bgColor = Color(0xFFF8FAFC);
  static const Color _cardColor = Color(0xFFFFFFFF);
  static const Color _foregroundColor = Color(0xFF111827); // Near-black for values
  static const Color _mutedForeground = Color(0xFF6B7280); // Grey for ref range
  static const Color _borderColor = Color(0xFFE5E7EB);
  static const Color _primaryColor = Color(0xFF0F766E);
  static const Color _accentOrange = Color(0xFFF59E0B);
  static const Color _accentBlue = Color(0xFF3B82F6);
  static const Color _greenOk = Color(0xFF10B981); // Green: Bình thường
  static const Color _redBad = Color(0xFFEF4444); // Red: Bất thường

  @override
  Widget build(BuildContext context) {
    return Container(
      color: _bgColor,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeaderText(),
            const SizedBox(height: 16),
            // Triệu chứng & Chẩn đoán
            _buildClinicalInfoSection(),
            const SizedBox(height: 16),
            // Chỉ số theo chuyên khoa
            _buildChiSoTheoKhoa(data),
            if (data.ghiChu?.isNotEmpty == true) ...[
              const SizedBox(height: 16),
              _buildGhiChuSection(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderText() {
    final hasTrieuChung = data.trieuChung?.isNotEmpty == true;
    final hasChanDoan = data.chanDoan?.isNotEmpty == true;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF0F766E), Color(0xFF14B8A6)],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: _primaryColor.withValues(alpha: 0.2),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  Icon(Icons.medical_services_rounded, size: 22, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'KHÁM LÂM SÀNG',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Kết quả khám bệnh & chỉ số lâm sàng của bệnh nhân',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withValues(alpha: 0.85),
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
        if (hasTrieuChung || hasChanDoan) const SizedBox(height: 16),
        if (hasTrieuChung) ...[
          _buildContentCard(
            icon: Icons.healing_rounded,
            iconColor: _accentOrange,
            title: 'Triệu chứng',
            value: data.trieuChung!,
          ),
          const SizedBox(height: 12),
        ],
        if (hasChanDoan) ...[
          _buildContentCard(
            icon: Icons.assignment_rounded,
            iconColor: _accentBlue,
            title: 'Chẩn đoán',
            value: data.chanDoan!,
          ),
        ],
      ],
    );
  }

  Widget _buildClinicalInfoSection() {
    final hasTrieuChung = data.trieuChung?.isNotEmpty == true;
    final hasChanDoan = data.chanDoan?.isNotEmpty == true;

    // Nếu đã hiển thị trong header thì không hiển thị lại
    if (hasTrieuChung || hasChanDoan) return const SizedBox.shrink();

    // Nếu cả hai đều rỗng thì hiển thị 2 card đầy đủ
    return Row(
      children: [
        Expanded(
          child: _buildContentCard(
            icon: Icons.healing_rounded,
            iconColor: _accentOrange,
            title: 'Triệu chứng',
            value: 'Không có',
            compact: true,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildContentCard(
            icon: Icons.assignment_rounded,
            iconColor: _accentBlue,
            title: 'Chẩn đoán',
            value: 'Không có',
            compact: true,
          ),
        ),
      ],
    );
  }

  /// Card nội dung dạng text hiện đại
  Widget _buildContentCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
    bool compact = false,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(compact ? 14 : 16),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: _mutedForeground,
                    letterSpacing: 0.6,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(height: 1, color: _borderColor),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13.5,
              color: _foregroundColor,
              height: 1.5,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }

  /// Render form chỉ số theo đúng chuyên khoa dựa trên maChuyenKhoa
  Widget _buildChiSoTheoKhoa(ChiTietCaKham data) {
    final maKhoa = data.maChuyenKhoa;
    final fields = chiSoFieldsCuaKhoa(maKhoa);

    // Trường hợp không xác định khoa hoặc không có config -> không hiện phần chỉ số
    if (fields.isEmpty) return const SizedBox.shrink();

    final tenKhoa = tenChuyenKhoaMap[maKhoa] ?? (data.tenChuyenKhoa ?? 'Chuyên khoa');
    final mauKhoa = chuyenKhoaMau[maKhoa] ?? Colors.teal;

    // Lọc chỉ hiện các field có dữ liệu
    final available = fields.where((f) {
      final value = _fieldValue(data, f.key);
      return value != null && value.trim().isNotEmpty;
    }).toList();

    if (available.isEmpty) {
      return _buildChuyenKhoaCard(
        tenKhoa: tenKhoa,
        mauKhoa: mauKhoa,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Row(
            children: [
              Icon(Icons.info_outline_rounded, size: 18, color: mauKhoa.withValues(alpha: 0.7)),
              const SizedBox(width: 8),
              const Text(
                'Chưa có chỉ số khám',
                style: TextStyle(fontSize: 13, color: _mutedForeground),
              ),
            ],
          ),
        ),
      );
    }

    // ==== GROUP BY nhom (sub-header) ====
    // Nếu có nhóm thì gom theo nhóm; nếu không (vitals, khoa text) thì gom thành 1 nhóm duy nhất
    final groups = <String, List<ChiSoField>>{};
    for (final f in available) {
      final nhom = f.nhom?.isNotEmpty == true ? f.nhom! : 'Chỉ số';
      groups.putIfAbsent(nhom, () => []).add(f);
    }

    final groupNames = groups.keys.toList();

    return _buildChuyenKhoaCard(
      tenKhoa: tenKhoa,
      mauKhoa: mauKhoa,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final nhom in groupNames) ...[
            if (nhom != groupNames.first) const SizedBox(height: 16),
            // Chỉ hiện sub-header khi có nhiều nhóm (VD: Xét nghiệm máu, CĐHA)
            if (groupNames.length > 1) ...[
              _buildGroupHeader(nhom, mauKhoa),
              const SizedBox(height: 8),
            ],
            ...groups[nhom]!.map((f) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _buildListRow(f, _fieldValue(data, f.key), mauKhoa),
              );
            }),
          ],
        ],
      ),
    );
  }

  /// Header nhỏ cho từng nhóm chỉ số (VD: "Xét nghiệm máu", "Chẩn đoán hình ảnh")
  Widget _buildGroupHeader(String nhom, Color mauKhoa) {
    return Container(
      padding: const EdgeInsets.only(bottom: 4),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB), width: 1)),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 14,
            decoration: BoxDecoration(
              color: mauKhoa,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            nhom.toUpperCase(),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: Color(0xFF374151),
              letterSpacing: 0.6,
            ),
          ),
        ],
      ),
    );
  }

  /// Row danh sách chuyên nghiệp:
  /// - Trái: icon + tên (đầy đủ) + đơn vị + khoảng tham chiếu (xám nhỏ)
  /// - Phải: giá trị (màu tối #111827) + chấm trạng thái màu
  Widget _buildListRow(ChiSoField f, String? value, Color accentColor) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();

    final label = f.unit.isNotEmpty ? '${f.label} (${f.unit})' : f.label;
    final refText = f.refText;
    final icon = f.icon ?? (_laSoField(f) ? Icons.analytics_outlined : Icons.check_circle_outline);

    // === Đánh giá trạng thái ===
    final (statusText, statusColor) = _evaluateStatus(f, value);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Icon chuyên dụng
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: accentColor),
          ),
          const SizedBox(width: 12),
          // Cột trái: Tên + đơn vị + Ref
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _foregroundColor,
                    height: 1.3,
                  ),
                ),
                if (refText != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    refText,
                    style: const TextStyle(
                      fontSize: 11,
                      color: _mutedForeground,
                      height: 1.3,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Cột phải: Giá trị + Chấm trạng thái
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: _foregroundColor,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: statusColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    statusText,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Xác định trạng thái dựa trên refMin/refMax
  (String, Color) _evaluateStatus(ChiSoField f, String value) {
    final numValue = _tryParseDouble(value);
    if (numValue != null) {
      if (f.refMin != null && f.refMax != null) {
        if (numValue < f.refMin! || numValue > f.refMax!) {
          return ('Bất thường', _redBad);
        }
        return ('Bình thường', _greenOk);
      }
      if (f.refMin != null) {
        if (numValue < f.refMin!) return ('Thấp', _redBad);
        return ('Bình thường', _greenOk);
      }
      if (f.refMax != null) {
        if (numValue > f.refMax!) return ('Cao', _redBad);
        return ('Bình thường', _greenOk);
      }
    } else {
      // Chỉ số dạng text (ECG, siêu âm) - dựa vào từ khoá
      final lower = value.toLowerCase();
      if (lower.contains('bình thường') || lower.contains('bình thg') || lower.contains('normal')) {
        return ('Bình thường', _greenOk);
      }
      if (lower.contains('bất thường') || lower.contains('bất thg') || lower.contains('abnormal') ||
          lower.contains('bệnh lý') || lower.contains('bệnh lí')) {
        return ('Bất thường', _redBad);
      }
    }
    return ('N/A', _mutedForeground);
  }

  double? _tryParseDouble(String value) {
    return double.tryParse(value.replaceAll(',', '.'));
  }

  bool _laSoField(ChiSoField f) => f.laSo;

  /// Card khung chuyên khoa (section header + content)
  Widget _buildChuyenKhoaCard({
    required String tenKhoa,
    required Color mauKhoa,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _borderColor),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: mauKhoa.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.medical_services_outlined, size: 20, color: mauKhoa),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tenKhoa.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: _foregroundColor,
                        letterSpacing: 0.6,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Chỉ số khám lâm sàng',
                      style: TextStyle(
                        fontSize: 11,
                        color: _mutedForeground.withValues(alpha: 0.8),
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
          child,
        ],
      ),
    );
  }

  /// Section ghi chú
  Widget _buildGhiChuSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBF0),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFDE68A).withValues(alpha: 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.sticky_note_2_rounded, size: 18, color: Color(0xFFD97706)),
              SizedBox(width: 8),
              Text(
                'GHI CHÚ',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFD97706),
                  letterSpacing: 0.6,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            data.ghiChu!,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFF78350F),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  /// Lấy giá trị của field từ object ChiTietCaKham theo key
  String? _fieldValue(ChiTietCaKham data, String key) {
    switch (key) {
      case 'nhietDo': return data.nhietDo;
      case 'nhipTim': return data.mach;
      case 'nhipTho': return data.nhipTho;
      case 'huyetAp': return data.huyetAp;
      case 'canNang': return data.canNang;
      case 'chieuCao': return data.chieuCao;
      case 'spo2': return data.spo2;
      case 'vongDau': return data.vongDau;
      case 'tinhTrangDinhDuong': return data.tinhTrangDinhDuong;
      case 'tamLyHanhVi': return data.tamLyHanhVi;
      case 'khamTaiMuiHongNhi': return data.khamTaiMuiHongNhi;
      case 'khamHoHapNhi': return data.khamHoHapNhi;
      case 'khamDaNiemMacNhi': return data.khamDaNiemMacNhi;
      case 'khamDuNiemMacNhi': return data.khamDuNiemMacNhi;
      case 'coQuanKhacNhi': return data.coQuanKhacNhi;
      case 'tinhTrangRang': return data.tinhTrangRang;
      case 'sauRang': return data.sauRang;
      case 'caoRang': return data.caoRang;
      case 'viemNuou': return data.viemNuou;
      case 'khopCan': return data.khopCan;
      case 'niemMacMieng': return data.niemMacMieng;
      case 'doLungLay': return data.doLungLay;
      case 'phuHinhCu': return data.phuHinhCu;
      case 'benhLyKhacRhm': return data.benhLyKhacRhm;
      case 'thinhLucTaiTrai': return data.thinhLucTaiTrai;
      case 'thinhLucTaiPhai': return data.thinhLucTaiPhai;
      case 'tinhTrangMui': return data.tinhTrangMui;
      case 'tinhTrangHong': return data.tinhTrangHong;
      case 'soiTaiMuiHong': return data.soiTaiMuiHong;
      case 'ongTai': return data.ongTai;
      case 'mangNhiPhai': return data.mangNhiPhai;
      case 'mangNhiTrai': return data.mangNhiTrai;
      case 'vachNgan': return data.vachNgan;
      case 'cuonMui': return data.cuonMui;
      case 'kheMui': return data.kheMui;
      case 'amidan': return data.amidan;
      case 'thanhQuan': return data.thanhQuan;
      case 'cholesterol': return data.cholesterol;
      case 'hdlCholesterol': return data.hdlCholesterol;
      case 'ldlCholesterol': return data.ldlCholesterol;
      case 'triglyceride': return data.triglyceride;
      case 'duongHuyet': return data.duongHuyet;
      case 'ecgKetQua': return data.ecgKetQua;
      case 'sieuAmTim': return data.sieuAmTim;
      default: return null;
    }
  }
}