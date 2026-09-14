import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/chuyen_khoa_entity.dart';

class ChuyenKhoaRepository {
  Dio get _dio => DioClient().dio;

  /// GET /api/chuyen-khoa
  Future<List<ChuyenKhoaEntity>> getAll() async {
    final response = await _dio.get('/chuyen-khoa');
    final List<dynamic> data = response.data;
    return data.map((json) => ChuyenKhoaEntity.fromJson(json)).toList();
  }

  /// GET /api/chuyen-khoa/{id}
  Future<ChuyenKhoaEntity> getById(int id) async {
    try {
      final response = await _dio.get('/chuyen-khoa/$id');
      return ChuyenKhoaEntity.fromJson(response.data);
    } on DioException {
      throw Exception('Không tìm thấy chuyên khoa với ID: $id');
    }
  }
}