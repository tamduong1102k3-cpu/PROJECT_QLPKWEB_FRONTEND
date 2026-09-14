import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/dich_vu_entity.dart';

class DichVuRepository {
  Dio get _dio => DioClient().dio;

  /// GET /api/dich-vu
  Future<List<DichVuEntity>> getAll({List<String>? loaiDichVu}) async {
    final queryParams = <String, dynamic>{};
    if (loaiDichVu != null && loaiDichVu.isNotEmpty) {
      queryParams['loaiDichVu'] = loaiDichVu.join(',');
    }
    final response = await _dio.get('/dich-vu', queryParameters: queryParams.isNotEmpty ? queryParams : null);
    final List<dynamic> data = response.data;
    return data.map((json) => DichVuEntity.fromJson(json)).toList();
  }

  /// GET /api/dich-vu/{id}
  Future<DichVuEntity> getById(int id) async {
    try {
      final response = await _dio.get('/dich-vu/$id');
      return DichVuEntity.fromJson(response.data);
    } on DioException {
      throw Exception('Không tìm thấy dịch vụ với ID: $id');
    }
  }

  /// POST /api/dich-vu
  Future<DichVuEntity> create(DichVuEntity entity) async {
    try {
      final response = await _dio.post('/dich-vu', data: entity.toJson());
      return DichVuEntity.fromJson(response.data);
    } on DioException catch (e) {
      throw Exception('Lỗi khi thêm dịch vụ: ${e.response?.statusCode}');
    }
  }

  /// PUT /api/dich-vu/{id}
  Future<DichVuEntity> update(int id, DichVuEntity entity) async {
    try {
      final response = await _dio.put('/dich-vu/$id', data: entity.toJson());
      return DichVuEntity.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('Không tìm thấy dịch vụ với ID: $id');
      }
      throw Exception('Lỗi khi cập nhật dịch vụ: ${e.response?.statusCode}');
    }
  }

  /// DELETE /api/dich-vu/{id}
  Future<void> delete(int id) async {
    try {
      await _dio.delete('/dich-vu/$id');
    } on DioException catch (e) {
      throw Exception('Lỗi khi xóa dịch vụ: ${e.response?.statusCode}');
    }
  }
}