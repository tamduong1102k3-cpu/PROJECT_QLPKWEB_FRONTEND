import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../models/phieu_kham.dart';
import '../models/chi_tiet_ca_kham.dart';
import '../models/hoa_don.dart';

class BenhNhanService {
  Dio get _dio => DioClient().dio;

  /// GET /api/benh-nhan/profile - Lấy thông tin hồ sơ bệnh nhân từ token
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _dio.get('/benh-nhan/profile');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy thông tin hồ sơ';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/phieu-kham - Lấy danh sách phiếu khám (chỉ HOAN_THANH)
  Future<List<PhieuKham>> getPhieuKhamList() async {
    try {
      final response = await _dio.get('/benh-nhan/profile/phieu-kham');
      final List<dynamic> data = response.data;
      return data
          .map((json) => PhieuKham.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy danh sách phiếu khám';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/hoa-don - Lấy danh sách hóa đơn đã thanh toán ('da thanh toan')
  Future<List<HoaDon>> getHoaDonList() async {
    try {
      final response = await _dio.get('/benh-nhan/profile/hoa-don');
      final List<dynamic> data = response.data;
      return data
          .map((json) => HoaDon.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy danh sách hóa đơn';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/phieu-kham/all - Lấy tất cả phiếu khám (tất cả trạng thái)
  Future<List<PhieuKham>> getAllPhieuKhamAllStatus() async {
    try {
      final response = await _dio.get('/benh-nhan/profile/phieu-kham/all');
      final List<dynamic> data = response.data;
      return data
          .map((json) => PhieuKham.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy danh sách phiếu khám';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/co-ban
  Future<ChiTietCaKham> getChiTietCaKhamCoBan(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/co-ban');
      return ChiTietCaKham.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy thông tin cơ bản ca khám';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/kham-lam-sang
  Future<Map<String, dynamic>> getKhamLamSang(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/kham-lam-sang');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy khám lâm sàng';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/chi-so-tong-hop
  /// (giữ nguyên - lấy 1 bản ghi mới nhất, tương thích điền sẵn form)
  Future<Map<String, dynamic>> getChiSoKhamTongHop(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/chi-so-tong-hop');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy chỉ số khám tổng hợp';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/chi-so-tong-hop/all
  /// Lấy danh sách tất cả chỉ số theo phiếu khám (nhiều chuyên khoa) - để mobile nhóm theo khoa
  Future<List<Map<String, dynamic>>> getChiSoKhamTongHopTheoCacKhoa(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/chi-so-tong-hop/all');
      final List<dynamic> data = response.data ?? [];
      return data
          .map((e) => e as Map<String, dynamic>)
          .cast<Map<String, dynamic>>()
          .toList();
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy danh sách chỉ số khám tổng hợp';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/hoa-don
  Future<Map<String, dynamic>> getHoaDon(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/hoa-don');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy hóa đơn';
      throw Exception(message);
    }
  }

  /// GET /api/hoa-don/{maHoaDon} - Lấy hóa đơn theo mã hóa đơn (chứa maPhieuKham)
  Future<Map<String, dynamic>> getHoaDonById(int maHoaDon) async {
    try {
      final response = await _dio.get('/hoa-don/$maHoaDon');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy hóa đơn theo mã';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/lich-kham
  Future<List<dynamic>> getLichTaiKham(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/lich-kham');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy lịch tái khám';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/phieu-chi-dinh
  Future<List<dynamic>> getPhieuChiDinh(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/phieu-chi-dinh');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy phiếu chỉ định';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/ca-kham/{maPhieuKham}/toa-thuoc
  Future<List<dynamic>> getToaThuoc(int maPhieuKham) async {
    try {
      final response = await _dio.get('/benh-nhan/profile/ca-kham/$maPhieuKham/toa-thuoc');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy toa thuốc';
      throw Exception(message);
    }
  }

  /// GET /api/benh-nhan/profile/toa-thuoc - Lấy tất cả toa thuốc của bệnh nhân từ token
  Future<List<dynamic>> getToaThuocByPatient() async {
    try {
      final response = await _dio.get('/benh-nhan/profile/toa-thuoc');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Lỗi khi lấy toàn bộ toa thuốc';
      throw Exception(message);
    }
  }
}