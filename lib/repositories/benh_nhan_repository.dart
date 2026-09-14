import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/benh_nhan_entity.dart';

class BenhNhanRepository {
  Dio get _dio => DioClient().dio;

  /// GET /api/benh-nhan - Lấy danh sách tất cả bệnh nhân
  Future<List<BenhNhanEntity>> getAll() async {
    final response = await _dio.get('/benh-nhan');
    final List<dynamic> data = response.data;
    return data.map((json) => BenhNhanEntity.fromJson(json)).toList();
  }

  /// GET /api/benh-nhan/search?keyword= - Tìm kiếm bệnh nhân theo từ khóa
  Future<List<BenhNhanEntity>> search(String keyword) async {
    final response = await _dio.get('/benh-nhan/search', queryParameters: {'keyword': keyword});
    final List<dynamic> data = response.data;
    return data.map((json) => BenhNhanEntity.fromJson(json)).toList();
  }

  /// GET /api/benh-nhan/exact-match?hoTen=...&soDienThoai=...&cccd=... - Tìm chính xác
  Future<BenhNhanEntity?> findExactMatch({
    required String hoTen,
    required String soDienThoai,
    required String cccd,
  }) async {
    try {
      final response = await _dio.get('/benh-nhan/exact-match', queryParameters: {
        'hoTen': hoTen,
        'soDienThoai': soDienThoai,
        'cccd': cccd,
      });
      return BenhNhanEntity.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      throw Exception('Lỗi khi tìm kiếm bệnh nhân: ${e.response?.statusCode}');
    }
  }

  /// GET /api/benh-nhan/find-flexible?hoTen=...&soDienThoai=...&cccd=... - Tìm linh hoạt
  /// Ưu tiên tìm theo CCCD trước (nếu đúng CCCD thì trả về kể cả tên/SĐT sai)
  Future<dynamic> findFlexible({
    String? hoTen,
    String? soDienThoai,
    String? cccd,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (hoTen != null && hoTen.isNotEmpty) queryParams['hoTen'] = hoTen;
      if (soDienThoai != null && soDienThoai.isNotEmpty) queryParams['soDienThoai'] = soDienThoai;
      if (cccd != null && cccd.isNotEmpty) queryParams['cccd'] = cccd;

      final response = await _dio.get('/benh-nhan/find-flexible', queryParameters: queryParams);
      return response.data;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      throw Exception('Lỗi khi tìm kiếm bệnh nhân: ${e.response?.statusCode}');
    }
  }

  /// GET /api/benh-nhan/{id} - Lấy chi tiết bệnh nhân theo ID
  Future<BenhNhanEntity> getById(int id) async {
    try {
      final response = await _dio.get('/benh-nhan/$id');
      return BenhNhanEntity.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('Không tìm thấy bệnh nhân với ID: $id');
      }
      throw Exception('Lỗi khi lấy bệnh nhân: ${e.response?.statusCode}');
    }
  }

  /// GET /api/benh-nhan/{id}/ho-so - Lấy hồ sơ bệnh nhân (lịch sử khám + hóa đơn)
  Future<List<dynamic>> getHoSo(int id) async {
    try {
      final response = await _dio.get('/benh-nhan/$id/ho-so');
      return response.data as List<dynamic>;
    } on DioException catch (e) {
      throw Exception('Lỗi khi lấy hồ sơ bệnh nhân: ${e.response?.statusCode}');
    }
  }

  /// POST /api/benh-nhan - Thêm bệnh nhân mới
  Future<BenhNhanEntity> create(BenhNhanEntity entity) async {
    try {
      final response = await _dio.post('/benh-nhan', data: entity.toJson());
      return BenhNhanEntity.fromJson(response.data);
    } on DioException catch (e) {
      final message = e.response?.data?['message'] ?? 'Thêm bệnh nhân thất bại';
      throw Exception(message);
    }
  }

  /// PUT /api/benh-nhan/{id} - Cập nhật thông tin bệnh nhân
  Future<BenhNhanEntity> update(int id, BenhNhanEntity entity) async {
    try {
      final response = await _dio.put('/benh-nhan/$id', data: entity.toJson());
      return BenhNhanEntity.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('Không tìm thấy bệnh nhân với ID: $id');
      }
      throw Exception('Lỗi khi cập nhật bệnh nhân: ${e.response?.statusCode}');
    }
  }

  /// DELETE /api/benh-nhan/{id} - Xóa bệnh nhân
  Future<void> delete(int id) async {
    try {
      await _dio.delete('/benh-nhan/$id');
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('Không tìm thấy bệnh nhân với ID: $id');
      }
      throw Exception('Lỗi khi xóa bệnh nhân: ${e.response?.statusCode}');
    }
  }
}