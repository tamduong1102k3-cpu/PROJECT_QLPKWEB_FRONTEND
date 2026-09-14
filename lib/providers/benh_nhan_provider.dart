import 'package:flutter/foundation.dart';
import '../services/benh_nhan_service.dart';
import '../models/phieu_kham.dart';
import '../models/chi_tiet_ca_kham.dart';
import '../models/phieu_chi_dinh_chi_tiet.dart';
import '../models/toa_thuoc_chi_tiet.dart';
import '../models/vital_signs_model.dart';
import '../models/hoa_don.dart';
import '../services/vital_signs_service.dart';
import '../services/auth_service.dart';

class BenhNhanProvider extends ChangeNotifier {
  final BenhNhanService _service = BenhNhanService();

  // Profile data
  Map<String, dynamic>? _profile;
  bool _isLoadingProfile = false;
  String? _profileError;

  // PhieuKham list
  List<PhieuKham> _phieuKhamList = [];
  bool _isLoadingPhieuKham = false;
  String? _phieuKhamError;

  // HoaDon list
  List<HoaDon> _hoaDonList = [];
  bool _isLoadingHoaDonList = false;
  String? _hoaDonListError;

  // Vital signs
  VitalSignsModel? _vitalSigns;
  bool _isLoadingVitalSigns = false;
  String? _vitalSignsError;

  // === Chi tiết ca khám - state riêng cho từng sub-endpoint ===
  
  // Thông tin cơ bản (phiếu khám, bệnh nhân, chuyên khoa, nhân viên)
  ChiTietCaKham? _chiTietCoBan;
  bool _isLoadingCoBan = false;
  String? _coBanError;

  // Khám lâm sàng
  Map<String, dynamic>? _khamLamSang;
  bool _isLoadingKhamLamSang = false;
  String? _khamLamSangError;

  // Chỉ số khám tổng hợp
  Map<String, dynamic>? _chiSoTongHop;
  bool _isLoadingChiSoTongHop = false;
  String? _chiSoTongHopError;

  // Danh sách chỉ số khám tổng hợp theo từng chuyên khoa (khi 1 phiếu khám có nhiều khoa)
  List<Map<String, dynamic>> _chiSoTongHopCacKhoa = [];

  // Hóa đơn + chi tiết hóa đơn
  Map<String, dynamic>? _hoaDon;
  bool _isLoadingHoaDon = false;
  String? _hoaDonError;

  // Lịch tái khám
  List<dynamic> _lichTaiKham = [];
  bool _isLoadingLichTaiKham = false;
  String? _lichTaiKhamError;

  // Phiếu chỉ định
  List<PhieuChiDinhChiTiet> _phieuChiDinh = [];
  bool _isLoadingPhieuChiDinh = false;
  String? _phieuChiDinhError;

  // Toa thuốc
  List<ToaThuocChiTiet> _toaThuoc = [];
  bool _isLoadingToaThuoc = false;
  String? _toaThuocError;

  // Getters
  Map<String, dynamic>? get profile => _profile;
  bool get isLoadingProfile => _isLoadingProfile;
  String? get profileError => _profileError;

  List<PhieuKham> get phieuKhamList => _phieuKhamList;
  bool get isLoadingPhieuKham => _isLoadingPhieuKham;
  String? get phieuKhamError => _phieuKhamError;

  List<HoaDon> get hoaDonList => _hoaDonList;
  bool get isLoadingHoaDonList => _isLoadingHoaDonList;
  String? get hoaDonListError => _hoaDonListError;

  VitalSignsModel? get vitalSigns => _vitalSigns;
  bool get isLoadingVitalSigns => _isLoadingVitalSigns;
  String? get vitalSignsError => _vitalSignsError;

  ChiTietCaKham? get chiTietCoBan => _chiTietCoBan;
  bool get isLoadingCoBan => _isLoadingCoBan;
  String? get coBanError => _coBanError;

  Map<String, dynamic>? get khamLamSang => _khamLamSang;
  bool get isLoadingKhamLamSang => _isLoadingKhamLamSang;
  String? get khamLamSangError => _khamLamSangError;

  Map<String, dynamic>? get chiSoTongHop => _chiSoTongHop;
  bool get isLoadingChiSoTongHop => _isLoadingChiSoTongHop;
  String? get chiSoTongHopError => _chiSoTongHopError;
  List<Map<String, dynamic>> get chiSoTongHopCacKhoa => _chiSoTongHopCacKhoa;

  Map<String, dynamic>? get hoaDon => _hoaDon;
  bool get isLoadingHoaDon => _isLoadingHoaDon;
  String? get hoaDonError => _hoaDonError;

  List<dynamic> get lichTaiKham => _lichTaiKham;
  bool get isLoadingLichTaiKham => _isLoadingLichTaiKham;
  String? get lichTaiKhamError => _lichTaiKhamError;

  List<PhieuChiDinhChiTiet> get phieuChiDinh => _phieuChiDinh;
  bool get isLoadingPhieuChiDinh => _isLoadingPhieuChiDinh;
  String? get phieuChiDinhError => _phieuChiDinhError;

  List<ToaThuocChiTiet> get toaThuoc => _toaThuoc;
  bool get isLoadingToaThuoc => _isLoadingToaThuoc;
  String? get toaThuocError => _toaThuocError;

  /// Trả về true nếu có bất kỳ phần nào đang loading
  bool get isLoadingChiTiet =>
      _isLoadingCoBan ||
      _isLoadingKhamLamSang ||
      _isLoadingChiSoTongHop ||
      _isLoadingHoaDon ||
      _isLoadingLichTaiKham ||
      _isLoadingPhieuChiDinh ||
      _isLoadingToaThuoc;

  /// Tổng hợp lỗi từ tất cả các phần
  String? get chiTietError {
    final errors = [
      if (_coBanError != null) 'Cơ bản: $_coBanError',
      if (_khamLamSangError != null) 'LS: $_khamLamSangError',
      if (_chiSoTongHopError != null) 'CSTH: $_chiSoTongHopError',
      if (_hoaDonError != null) 'HĐ: $_hoaDonError',
      if (_lichTaiKhamError != null) 'LTK: $_lichTaiKhamError',
      if (_phieuChiDinhError != null) 'PCD: $_phieuChiDinhError',
      if (_toaThuocError != null) 'TT: $_toaThuocError',
    ];
    if (errors.isEmpty) return null;
    return errors.join('\n');
  }

  /// Lấy thông tin hồ sơ bệnh nhân
  Future<void> loadProfile() async {
    _isLoadingProfile = true;
    _profileError = null;
    notifyListeners();

    try {
      _profile = await _service.getProfile();
    } catch (e) {
      _profileError = e.toString();
    } finally {
      _isLoadingProfile = false;
      notifyListeners();
    }
  }

  /// Lấy danh sách phiếu khám
  Future<void> loadPhieuKhamList() async {
    _isLoadingPhieuKham = true;
    _phieuKhamError = null;
    notifyListeners();

    try {
      _phieuKhamList = await _service.getPhieuKhamList();
    } catch (e) {
      _phieuKhamError = e.toString();
    } finally {
      _isLoadingPhieuKham = false;
      notifyListeners();
    }
  }

  /// Lấy danh sách hóa đơn đã thanh toán ('da thanh toan')
  Future<void> loadHoaDonList() async {
    _isLoadingHoaDonList = true;
    _hoaDonListError = null;
    notifyListeners();

    try {
      _hoaDonList = await _service.getHoaDonList();
    } catch (e) {
      _hoaDonListError = e.toString();
    } finally {
      _isLoadingHoaDonList = false;
      notifyListeners();
    }
  }

  /// Lấy chỉ số sức khỏe gần nhất từ endpoint vital-signs-latest
  Future<void> loadVitalSigns() async {
    final maBenhNhan = AuthService().maBenhNhan;
    if (maBenhNhan == null || maBenhNhan == 0) return;

    _isLoadingVitalSigns = true;
    _vitalSignsError = null;
    notifyListeners();

    try {
      _vitalSigns = await VitalSignsService().getLatestVitalSigns(maBenhNhan);
    } catch (e) {
      _vitalSignsError = e.toString();
    } finally {
      _isLoadingVitalSigns = false;
      notifyListeners();
    }
  }

  /// Load tất cả chi tiết ca khám song song từ các sub-endpoint
  Future<void> loadChiTietCaKham(int maPhieuKham) async {
    // Reset tất cả state
    _resetChiTietState();

    // Bắt đầu loading tất cả
    _isLoadingCoBan = true;
    _isLoadingKhamLamSang = true;
    _isLoadingChiSoTongHop = true;
    _isLoadingHoaDon = true;
    _isLoadingLichTaiKham = true;
    _isLoadingPhieuChiDinh = true;
    _isLoadingToaThuoc = true;
    notifyListeners();

    // Chạy song song tất cả các request
    await Future.wait([
      _loadCoBan(maPhieuKham),
      _loadKhamLamSang(maPhieuKham),
      _loadChiSoTongHop(maPhieuKham),
      _loadHoaDon(maPhieuKham),
      _loadLichTaiKham(maPhieuKham),
      _loadPhieuChiDinh(maPhieuKham),
      _loadToaThuoc(maPhieuKham),
    ]);

    notifyListeners();
  }

  Future<void> _loadCoBan(int maPhieuKham) async {
    try {
      _chiTietCoBan = await _service.getChiTietCaKhamCoBan(maPhieuKham);
      _coBanError = null;
    } catch (e) {
      _coBanError = e.toString();
    } finally {
      _isLoadingCoBan = false;
    }
  }

  Future<void> _loadKhamLamSang(int maPhieuKham) async {
    try {
      _khamLamSang = await _service.getKhamLamSang(maPhieuKham);
      _khamLamSangError = null;
    } catch (e) {
      _khamLamSangError = e.toString();
    } finally {
      _isLoadingKhamLamSang = false;
    }
  }

  Future<void> _loadChiSoTongHop(int maPhieuKham) async {
    try {
      _chiSoTongHop = await _service.getChiSoKhamTongHop(maPhieuKham);
      // Cũng tải danh sách theo chuyên khoa (nhiều khoa) để UI nhóm được đúng
      try {
        _chiSoTongHopCacKhoa = await _service.getChiSoKhamTongHopTheoCacKhoa(maPhieuKham);
        // Ưu tiên dữ liệu gộp: nếu có nhiều dòng theo khoa, merge tất cả field không null
        // vào 1 object để màn hình LamSang hiển thị đầy đủ các nhóm khoa
        final merged = <String, dynamic>{};
        for (final row in _chiSoTongHopCacKhoa) {
          for (final entry in row.entries) {
            if (entry.value != null && !merged.containsKey(entry.key)) {
              merged[entry.key] = entry.value;
            }
          }
        }
        if (merged.isNotEmpty) {
          _chiSoTongHop = merged;
        }
      } catch (e) {
        // Endpoint mới có thể chưa tồn tại ở môi trường cũ - giữ dữ liệu cơ bản
        _chiSoTongHopCacKhoa = [];
      }
      _chiSoTongHopError = null;
    } catch (e) {
      _chiSoTongHopError = e.toString();
    } finally {
      _isLoadingChiSoTongHop = false;
    }
  }

  Future<void> _loadHoaDon(int maPhieuKham) async {
    try {
      _hoaDon = await _service.getHoaDon(maPhieuKham);
      _hoaDonError = null;
    } catch (e) {
      _hoaDonError = e.toString();
    } finally {
      _isLoadingHoaDon = false;
    }
  }

  Future<void> _loadLichTaiKham(int maPhieuKham) async {
    try {
      _lichTaiKham = await _service.getLichTaiKham(maPhieuKham);
      _lichTaiKhamError = null;
    } catch (e) {
      _lichTaiKhamError = e.toString();
    } finally {
      _isLoadingLichTaiKham = false;
    }
  }

  Future<void> _loadPhieuChiDinh(int maPhieuKham) async {
    try {
      final rawList = await _service.getPhieuChiDinh(maPhieuKham);
      _phieuChiDinh = rawList
          .map((e) => PhieuChiDinhChiTiet.fromJson(e as Map<String, dynamic>))
          .toList();
      _phieuChiDinhError = null;
    } catch (e) {
      _phieuChiDinhError = e.toString();
    } finally {
      _isLoadingPhieuChiDinh = false;
    }
  }

  Future<void> _loadToaThuoc(int maPhieuKham) async {
    try {
      final rawList = await _service.getToaThuoc(maPhieuKham);
      _toaThuoc = rawList
          .map((e) => ToaThuocChiTiet.fromJson(e as Map<String, dynamic>))
          .toList();
      _toaThuocError = null;
    } catch (e) {
      _toaThuocError = e.toString();
    } finally {
      _isLoadingToaThuoc = false;
    }
  }

  /// Reset toàn bộ state chi tiết ca khám
  void _resetChiTietState() {
    _chiTietCoBan = null;
    _khamLamSang = null;
    _chiSoTongHop = null;
    _chiSoTongHopCacKhoa = [];
    _hoaDon = null;
    _lichTaiKham = [];
    _phieuChiDinh = [];
    _toaThuoc = [];

    _coBanError = null;
    _khamLamSangError = null;
    _chiSoTongHopError = null;
    _hoaDonError = null;
    _lichTaiKhamError = null;
    _phieuChiDinhError = null;
    _toaThuocError = null;
  }

  /// Reset chi tiết ca khám (khi rời trang)
  void resetChiTietCaKham() {
    _resetChiTietState();
    notifyListeners();
  }
}