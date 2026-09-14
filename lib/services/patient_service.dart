import 'package:flutter/foundation.dart';
import '../repositories/benh_nhan_repository.dart';
import '../repositories/tai_khoan_benh_nhan_repository.dart';
import '../data/entities/benh_nhan_entity.dart';
import '../services/auth_service.dart';

class PatientService {
  static final PatientService _instance = PatientService._internal();
  factory PatientService() => _instance;
  PatientService._internal();

  final _benhNhanRepo = BenhNhanRepository();
  final _taiKhoanRepo = TaiKhoanBenhNhanRepository();
  final _authService = AuthService();

  /// Kiểm tra xem tài khoản hiện tại đã có mã bệnh nhân chưa (dùng JWT decode cục bộ)
  Future<bool> checkHasProfile() async {
    return _authService.hasPatientProfile;
  }

  /// Tìm kiếm hồ sơ bệnh nhân theo thông tin (KHÔNG liên kết)
  /// Ưu tiên tìm theo CCCD trước: nếu nhập đúng CCCD thì trả về kết quả
  /// kể cả tên hay số điện thoại có sai. Nếu không tìm thấy theo CCCD
  /// thì fallback tìm theo cả 3 trường.
  /// Trả về danh sách các hồ sơ phù hợp để người dùng chọn.
  Future<List<BenhNhanEntity>> searchPatients({
    required String hoTen,
    required String soDienThoai,
    required String cccd,
  }) async {
    try {
      // Trim tất cả input trước khi tìm kiếm
      final trimmedHoTen = hoTen.trim();
      final trimmedSdt = soDienThoai.trim();
      final trimmedCccd = cccd.trim();

      // 1. Tìm linh hoạt: ưu tiên theo CCCD ở backend
      //    Nếu có CCCD -> backend tìm chính xác theo CCCD trước (bỏ qua tên/SĐT sai)
      //    Nếu không có CCCD -> backend tìm kết hợp các trường còn lại
      final results = <BenhNhanEntity>[];

      final flexibleResult = await _benhNhanRepo.findFlexible(
        hoTen: trimmedHoTen.isNotEmpty ? trimmedHoTen : null,
        soDienThoai: trimmedSdt.isNotEmpty ? trimmedSdt : null,
        cccd: trimmedCccd.isNotEmpty ? trimmedCccd : null,
      );
      if (flexibleResult != null) {
        // Nếu API trả về 1 object (tìm thấy chính xác theo CCCD hoặc 1 kết quả duy nhất)
        if (flexibleResult is Map<String, dynamic>) {
          final patient = BenhNhanEntity.fromJson(flexibleResult);
          if (patient.maBenhNhan != null) {
            results.add(patient);
          }
        }
        // Nếu API trả về list (nhiều kết quả)
        else if (flexibleResult is List) {
          for (final item in flexibleResult) {
            if (item is Map<String, dynamic>) {
              final patient = BenhNhanEntity.fromJson(item);
              if (patient.maBenhNhan != null) {
                results.add(patient);
              }
            }
          }
        }
      }

      // 2. Nếu không tìm thấy qua findFlexible, fallback về exact-match (khớp cả 3 trường)
      if (results.isEmpty && trimmedHoTen.isNotEmpty && trimmedSdt.isNotEmpty && trimmedCccd.isNotEmpty) {
        final patient = await _benhNhanRepo.findExactMatch(
          hoTen: trimmedHoTen,
          soDienThoai: trimmedSdt,
          cccd: trimmedCccd,
        );
        if (patient != null && patient.maBenhNhan != null) {
          results.add(patient);
        }
      }

      return results;
    } catch (e) {
      debugPrint('Search patients error: $e');
      return [];
    }
  }

  /// Liên kết hồ sơ bệnh nhân đã chọn với tài khoản đang đăng nhập
  /// Chỉ cập nhật maBenhNhan vào bảng tai_khoan_benh_nhan
  Future<BenhNhanEntity?> linkPatient(BenhNhanEntity patient) async {
    try {
      if (patient.maBenhNhan == null) {
        return null;
      }

      // Cập nhật maBenhNhan vào tài khoản đang đăng nhập (yêu cầu JWT)
      final maTaiKhoanBn = _authService.maTaiKhoanBn;
      final token = _authService.token;
      if (maTaiKhoanBn == null || token == null) {
        debugPrint('No logged in account found');
        return null;
      }

      // Gọi endpoint chuyên biệt link-patient — CHỈ gửi maBenhNhan,
      // KHÔNG gửi matKhau → tránh double-hash làm hỏng mật khẩu.
      final updateResult = await _taiKhoanRepo.linkPatient(
        id: maTaiKhoanBn,
        maBenhNhan: patient.maBenhNhan!,
        token: token,
      );

      // Lưu token mới (có chứa maBenhNhan) vào AuthService
      if (updateResult['token'] != null) {
        _authService.setToken(updateResult['token'] as String);
      } else {
        // Fallback: refresh token để lấy JWT mới chứa maBenhNhan từ DB
        await _authService.refreshAccessToken();
      }

      return patient;
    } catch (e) {
      debugPrint('Link patient error: $e');
      return null;
    }
  }

  /// Tìm kiếm hồ sơ bệnh nhân theo thông tin, sau đó cập nhật maBenhNhan vào tài khoản
  /// Giữ lại để tương thích ngược - kết hợp searchPatients + linkPatient
  Future<BenhNhanEntity?> searchAndLinkPatient({
    required String hoTen,
    required String soDienThoai,
    required String cccd,
  }) async {
    final patients = await searchPatients(
      hoTen: hoTen,
      soDienThoai: soDienThoai,
      cccd: cccd,
    );
    if (patients.isEmpty) return null;
    // Liên kết hồ sơ đầu tiên tìm được (tương thích hành vi cũ)
    return linkPatient(patients.first);
  }

  /// Tạo hồ sơ bệnh nhân mới, sau đó liên kết với tài khoản đang đăng nhập
  Future<BenhNhanEntity?> createAndLinkPatient({
    required String hoTen,
    required String soDienThoai,
    required String cccd,
    String? diaChi,
    String? email,
    String? gioiTinh,
    DateTime? ngaySinh,
    String? tienSuBenh,
  }) async {
    // 1. Tạo hồ sơ bệnh nhân mới (TokenInterceptor tự động gắn JWT)
    // QUAN TRỌNG: daXacMinhDanhTinh luôn = false (0) khi tạo hồ sơ mới,
    // chỉ được chuyển thành true (1) khi bệnh nhân xác minh danh tính (VD: nhập CCCD bằng NFC)
    final newPatient = BenhNhanEntity(
      hoTen: hoTen,
      soDienThoai: soDienThoai,
      cccd: cccd,
      diaChi: diaChi,
      email: email,
      gioiTinh: gioiTinh == 'Nam' ? true : (gioiTinh == 'Nữ' ? false : null),
      ngaySinh: ngaySinh != null
          ? LocalDate(ngaySinh.year, ngaySinh.month, ngaySinh.day)
          : null,
      tienSuBenh: tienSuBenh,
      daXacMinhDanhTinh: false,
    );
    final createdPatient = await _benhNhanRepo.create(newPatient);

    if (createdPatient.maBenhNhan == null) {
      return null;
    }

    // 2. Cập nhật maBenhNhan vào tài khoản đang đăng nhập
    final maTaiKhoanBn = _authService.maTaiKhoanBn;
    final token = _authService.token;
    if (maTaiKhoanBn == null || token == null) {
      debugPrint('No logged in account found');
      return null;
    }

    // QUAN TRỌNG: Dùng endpoint chuyên biệt link-patient — CHỈ gửi maBenhNhan,
    // KHÔNG gửi matKhau → tránh double-hash làm hỏng mật khẩu.
    final updateResult = await _taiKhoanRepo.linkPatient(
      id: maTaiKhoanBn,
      maBenhNhan: createdPatient.maBenhNhan!,
      token: token,
    );

    // Lưu token mới (có chứa maBenhNhan) vào AuthService
    if (updateResult['token'] != null) {
      _authService.setToken(updateResult['token'] as String);
    } else {
      // Fallback: refresh token để lấy JWT mới chứa maBenhNhan từ DB
      await _authService.refreshAccessToken();
    }

    return createdPatient;
  }

  /// Lấy thông tin bệnh nhân theo maBenhNhan từ JWT
  Future<BenhNhanEntity?> getMyProfile() async {
    final maBenhNhan = _authService.maBenhNhan;
    if (maBenhNhan == null) return null;

    try {
      return await _benhNhanRepo.getById(maBenhNhan);
    } catch (e) {
      debugPrint('Get my profile error: $e');
      rethrow;
    }
  }

  /// Lấy hồ sơ bệnh nhân của tôi (lịch sử khám)
  Future<List<dynamic>> getMyMedicalRecords() async {
    final maBenhNhan = _authService.maBenhNhan;
    if (maBenhNhan == null) return [];

    try {
      return await _benhNhanRepo.getHoSo(maBenhNhan);
    } catch (e) {
      debugPrint('Get my medical records error: $e');
      rethrow;
    }
  }
}