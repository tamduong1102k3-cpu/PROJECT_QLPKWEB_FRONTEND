import 'package:flutter/material.dart';
import '../../providers/benh_nhan_provider.dart';
import '../../widgets/shimmer_loading.dart';
import '../../models/chi_tiet_ca_kham.dart';
import '../../models/chi_tiet_dich_vu.dart';
import 'shared/detail_widgets.dart';
import 'lam_sang/lam_sang_screen.dart';
import 'chi_dinh/chi_dinh_screen.dart';
import 'thuoc/thuoc_screen.dart';
import 'tai_kham/tai_kham_screen.dart';
import 'hoa_don/hoa_don_screen.dart';
import 'cls/thong_tin_kham_screen.dart';
import 'cls/ket_qua_xn_screen.dart';
import 'cls/ket_qua_cdha_screen.dart';

class CaKhamDetailScreen extends StatefulWidget {
  final int maPhieuKham;
  final String? loaiDichVu;

  const CaKhamDetailScreen({super.key, required this.maPhieuKham, this.loaiDichVu});

  @override
  State<CaKhamDetailScreen> createState() => _CaKhamDetailScreenState();
}

class _CaKhamDetailScreenState extends State<CaKhamDetailScreen>
    with SingleTickerProviderStateMixin {
  late final BenhNhanProvider _provider;
  late final TabController _tabController;

  // Healthcare App color palette (Medical style)
  static const Color _primaryColor = Color(0xFF0F766E); // Deep Teal / Medical Blue
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
    _tabController = TabController(length: 5, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _provider.resetChiTietCaKham();
    super.dispose();
  }

  Future<void> _loadData() async {
    await _provider.loadChiTietCaKham(widget.maPhieuKham);
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Chi tiết ca khám #${widget.maPhieuKham}',
          style: const TextStyle(fontWeight: FontWeight.w600, color: _foregroundColor, fontSize: 18),
        ),
        centerTitle: true,
        backgroundColor: _cardColor,
        foregroundColor: _foregroundColor,
        elevation: 0,
        bottom: _buildTabBar(),
        iconTheme: const IconThemeData(color: _foregroundColor),
      ),
      body: _buildBody(),
    );
  }

  PreferredSizeWidget? _buildTabBar() {
    if (_provider.chiTietCoBan == null) return null;
    final loai = _resolveLoai();
    // Phiếu CLS: không hiển thị tabbar ở AppBar, tabbar render trong body
    if (_isCls(loai)) return null;
    return PreferredSize(
      preferredSize: const Size.fromHeight(49.0),
      child: Column(
        children: [
          Container(color: _borderColor, height: 1.0),
          Container(
            color: _cardColor,
            child: TabBar(
              controller: _tabController,
              indicatorColor: _primaryColor,
              indicatorWeight: 3.0,
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: _primaryColor,
              unselectedLabelColor: _mutedForeground,
              labelPadding: const EdgeInsets.symmetric(horizontal: 2),
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12),
              tabs: const [
                Tab(icon: Icon(Icons.medical_services_outlined, size: 20), text: 'Lâm sàng'),
                Tab(icon: Icon(Icons.biotech_outlined, size: 20), text: 'Chỉ định'),
                Tab(icon: Icon(Icons.medication_outlined, size: 20), text: 'Thuốc'),
                Tab(icon: Icon(Icons.event_repeat_rounded, size: 20), text: 'Tái khám'),
                Tab(icon: Icon(Icons.receipt_long_outlined, size: 20), text: 'Hóa đơn'),
              ],
            ),
          ),
          Container(color: _borderColor, height: 1.0),
        ],
      ),
    );
  }

  bool _isCls(String loai) {
    return loai.contains('CLS_XET_NGHIEM') || loai.contains('CLS_CHAN_DOAN_HINH_ANH');
  }

  /// Ưu tiên loaiDichVu truyền từ danh sách phiếu khám; nếu thiếu thì dùng từ co-ban
  String _resolveLoai() {
    if (widget.loaiDichVu?.isNotEmpty == true) return widget.loaiDichVu!;
    return _provider.chiTietCoBan?.loaiDichVu ?? '';
  }

  Widget _buildBody() {
    if (_provider.isLoadingChiTiet) {
      return const ShimmerLoading();
    }

    if (_provider.chiTietError != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: _destructiveColor),
              const SizedBox(height: 16),
              const Text(
                'Không thể tải chi tiết ca khám',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _foregroundColor),
              ),
              const SizedBox(height: 8),
              Text(
                _provider.chiTietError ?? '',
                textAlign: TextAlign.center,
                style: const TextStyle(color: _mutedForeground),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadData,
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

    final coBan = _provider.chiTietCoBan;
    if (coBan == null) {
      return const Center(child: Text('Không có dữ liệu'));
    }

    final tongHopData = _buildTongHopData(coBan);
    final loai = _resolveLoai();

    // ---- PHIẾU CLS: 2 TAB MỚI ----
    if (_isCls(loai)) {
      return _buildClsLayout(tongHopData, loai);
    }

    // ---- PHIẾU THƯỜNG: 4 TAB CŨ ----
    return Column(
      children: [
        _buildGeneralInfo(tongHopData),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              LamSangScreen(data: tongHopData),
              ChiDinhScreen(data: tongHopData),
              ThuocScreen(data: tongHopData),
              TaiKhamScreen(data: tongHopData),
              HoaDonScreen(data: tongHopData),
            ],
          ),
        ),
      ],
    );
  }

  /// Layout mới cho phiếu CLS: 2 tab (Thông tin khám | Kết quả)
  Widget _buildClsLayout(ChiTietCaKham data, String loai) {
    final chiTietDichVu = _flattenChiTietDichVu(data);
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          _buildGeneralInfo(data),
          Container(
            color: _cardColor,
            child: TabBar(
              indicatorColor: _primaryColor,
              indicatorWeight: 3.0,
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: _primaryColor,
              unselectedLabelColor: _mutedForeground,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 13),
              tabs: [
                const Tab(icon: Icon(Icons.info_outline, size: 20), text: 'Thông tin khám'),
                Tab(
                  icon: const Icon(Icons.science_outlined, size: 20),
                  text: loai.contains('CLS_XET_NGHIEM')
                      ? 'Kết quả xét nghiệm'
                      : 'Kết quả CĐHA',
                ),
              ],
            ),
          ),
          Container(color: _borderColor, height: 1.0),
          Expanded(
            child: TabBarView(
              children: [
                ThongTinKhamScreen(
                  data: data,
                  tenDichVu: data.tenDichVu ?? _firstServiceName(chiTietDichVu),
                  tenBacSi: loai.contains('CLS_XET_NGHIEM')
                      ? _firstBs(chiTietDichVu, isXN: true)
                      : _firstBs(chiTietDichVu, isXN: false),
                  tenKyThuatVien: _firstKtv(chiTietDichVu),
                  ngayThucHien: _firstNgay(chiTietDichVu),
                  mauSacDichVu: loai.contains('CLS_XET_NGHIEM')
                      ? const Color(0xFF0F766E)
                      : const Color(0xFF1070EE),
                ),
                loai.contains('CLS_XET_NGHIEM')
                    ? KetQuaXNScreen(chiTietDichVu: chiTietDichVu)
                    : KetQuaCDHAScreen(chiTietDichVu: chiTietDichVu),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<ChiTietDichVu> _flattenChiTietDichVu(ChiTietCaKham data) {
    final result = <ChiTietDichVu>[];
    for (final pcd in data.phieuChiDinh) {
      result.addAll(pcd.chiTietDichVu);
    }
    return result;
  }

  String _firstServiceName(List<ChiTietDichVu> list) {
    if (list.isEmpty) return '';
    return list.first.tenDichVu;
  }

  String? _firstBs(List<ChiTietDichVu> list, {required bool isXN}) {
    for (final c in list) {
      if (isXN && c.tenBsKetLuan != null) return c.tenBsKetLuan;
      if (!isXN && c.tenBsCdha != null) return c.tenBsCdha;
    }
    return null;
  }

  String? _firstKtv(List<ChiTietDichVu> list) {
    for (final c in list) {
      if (c.tenKyThuatVien != null) return c.tenKyThuatVien;
    }
    return null;
  }

  String? _firstNgay(List<ChiTietDichVu> list) {
    for (final c in list) {
      if (c.ngayDocKetQua != null) return c.ngayDocKetQua;
    }
    return null;
  }

  /// Xây dựng đối tượng ChiTietCaKham đầy đủ từ dữ liệu các sub-endpoint
  ChiTietCaKham _buildTongHopData(ChiTietCaKham coBan) {
    final kls = _provider.khamLamSang;
    final csth = _provider.chiSoTongHop;
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

    // Parse lịch tái khám
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
      maChuyenKhoa: coBan.maChuyenKhoa,
      tenChuyenKhoa: coBan.tenChuyenKhoa,
      tenNhanVien: coBan.tenNhanVien,
      tenDichVu: coBan.tenDichVu,
      loaiDichVu: coBan.loaiDichVu,
      maBenhNhan: coBan.maBenhNhan,
      tenBenhNhan: coBan.tenBenhNhan,
      ngaySinh: coBan.ngaySinh,
      gioiTinh: coBan.gioiTinh,
      soDienThoai: coBan.soDienThoai,
      email: coBan.email,
      diaChi: coBan.diaChi,
      // Chỉ số sinh tồn
      mach: _toInt(csth?['nhipTim'])?.toString(),
      nhietDo: _toDouble(csth?['nhietDo'])?.toString(),
      huyetAp: _buildHuyetApStr(csth),
      nhipTho: _toInt(csth?['nhipTho'])?.toString(),
      canNang: _toDouble(csth?['canNang'])?.toString(),
      chieuCao: _toDouble(csth?['chieuCao'])?.toString(),
      // Chỉ số bổ sung
      spo2: _toDouble(csth?['spo2'])?.toString(),
      vongDau: _toDouble(csth?['vongDau'])?.toString(),
      tinhTrangDinhDuong: csth?['tinhTrangDinhDuong'] as String?,
      tamLyHanhVi: csth?['tamLyHanhVi'] as String?,
      khamTaiMuiHongNhi: csth?['khamTaiMuiHongNhi'] as String?,
      khamHoHapNhi: csth?['khamHoHapNhi'] as String?,
      khamDuNiemMacNhi: csth?['khamDuNiemMacNhi'] as String?,
      coQuanKhacNhi: csth?['coQuanKhacNhi'] as String?,
      khamDaNiemMacNhi: csth?['khamDaNiemMacNhi'] as String?,
      tinhTrangRang: csth?['tinhTrangRang'] as String?,
      sauRang: csth?['sauRang'] as String?,
      caoRang: csth?['caoRang'] as String?,
      viemNuou: csth?['viemNuou'] as String?,
      khopCan: csth?['khopCan'] as String?,
      niemMacMieng: csth?['niemMacMieng'] as String?,
      doLungLay: csth?['doLungLay'] as String?,
      phuHinhCu: csth?['phuHinhCu'] as String?,
      benhLyKhacRhm: csth?['benhLyKhacRhm'] as String?,
      thinhLucTaiTrai: csth?['thinhLucTaiTrai'] as String?,
      thinhLucTaiPhai: csth?['thinhLucTaiPhai'] as String?,
      tinhTrangMui: csth?['tinhTrangMui'] as String?,
      tinhTrangHong: csth?['tinhTrangHong'] as String?,
      soiTaiMuiHong: csth?['soiTaiMuiHong'] as String?,
      ongTai: csth?['ongTai'] as String?,
      mangNhiPhai: csth?['mangNhiPhai'] as String?,
      mangNhiTrai: csth?['mangNhiTrai'] as String?,
      vachNgan: csth?['vachNgan'] as String?,
      cuonMui: csth?['cuonMui'] as String?,
      kheMui: csth?['kheMui'] as String?,
      amidan: csth?['amidan'] as String?,
      thanhQuan: csth?['thanhQuan'] as String?,
      cholesterol: _toDouble(csth?['cholesterol'])?.toString(),
      hdlCholesterol: _toDouble(csth?['hdlCholesterol'])?.toString(),
      ldlCholesterol: _toDouble(csth?['ldlCholesterol'])?.toString(),
      triglyceride: _toDouble(csth?['triglyceride'])?.toString(),
      duongHuyet: _toDouble(csth?['duongHuyet'])?.toString(),
      ecgKetQua: csth?['ecgKetQua'] as String?,
      sieuAmTim: csth?['sieuAmTim'] as String?,
      ghiChuChiSo: csth?['ghiChu'] as String?,
      hoaDon: hoaDonInfo,
      chiTietHoaDon: chiTietHoaDonList,
      lichTaiKham: lichTaiKhamList,
      phieuChiDinh: _provider.phieuChiDinh,
      toaThuoc: _provider.toaThuoc,
    );
  }

  String? _buildHuyetApStr(Map<String, dynamic>? csth) {
    if (csth == null) return null;
    final tamThu = _toInt(csth['huyetApTamThu']);
    final tamTruong = _toInt(csth['huyetApTamTruong']);
    if (tamThu != null && tamTruong != null) {
      return '$tamThu/$tamTruong';
    } else if (tamThu != null) {
      return '$tamThu';
    } else if (tamTruong != null) {
      return '$tamTruong';
    }
    return null;
  }

  int? _toInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  String _capitalizeName(String? name) {
    if (name == null || name.isEmpty) return 'N/A';
    return name.trim().split(RegExp(r'\s+')).map((word) {
      if (word.isEmpty) return '';
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
  }

  Widget _buildGeneralInfo(ChiTietCaKham data) {
    String formattedNgay = data.ngayKham ?? '';
    if (formattedNgay.length >= 10) {
      formattedNgay = formattedNgay.substring(0, 10);
    }

    final capitalizedName = _capitalizeName(data.tenBenhNhan);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        color: _cardColor,
        border: Border(bottom: BorderSide(color: _borderColor, width: 1.0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  capitalizedName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: _foregroundColor,
                  ),
                ),
              ),
              buildStatusBadge(data.trangThai ?? ''),
            ],
          ),
          const SizedBox(height: 10),
          Container(height: 1, color: _borderColor),
          const SizedBox(height: 10),
          _buildInfoText('Ngày khám', formattedNgay),
          const SizedBox(height: 4),
          _buildInfoText('Chuyên khoa', data.tenChuyenKhoa ?? 'N/A'),
          const SizedBox(height: 4),
          _buildInfoText('Bác sĩ', data.tenNhanVien ?? 'N/A'),
          if (data.tenDichVu?.isNotEmpty == true) ...[
            const SizedBox(height: 4),
            _buildInfoText('Dịch vụ', data.tenDichVu!),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoText(String label, String value) {
    return RichText(
      text: TextSpan(
        style: const TextStyle(fontSize: 13, height: 1.3),
        children: [
          TextSpan(
            text: '$label: ',
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              color: _mutedForeground,
            ),
          ),
          TextSpan(
            text: value,
            style: const TextStyle(
              color: _foregroundColor,
            ),
          ),
        ],
      ),
    );
  }
}