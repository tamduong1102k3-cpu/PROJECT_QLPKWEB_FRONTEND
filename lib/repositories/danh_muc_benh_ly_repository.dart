import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/danh_muc_benh_ly_entity.dart';

class DanhMucBenhLyRepository {
  Dio get _dio => DioClient().dio;

  /// GET /api/danh-muc-benh-ly/chuyen-khoa/{maChuyenKhoa}
  Future<List<DanhMucBenhLyEntity>> getByChuyenKhoa(int maChuyenKhoa) async {
    final response = await _dio.get('/danh-muc-benh-ly/chuyen-khoa/$maChuyenKhoa');
    final Map<String, dynamic> body = response.data;
    final List<dynamic> data = body['data'] as List<dynamic>;
    return data.map((json) => DanhMucBenhLyEntity.fromJson(json)).toList();
  }
}