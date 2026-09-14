import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/nhan_vien_entity.dart';

class NhanVienRepository {
  Dio get _dio => DioClient().dio;

  /// GET /api/nhan_vien/by-chuc-vu?chucVu=
  Future<List<NhanVienEntity>> getByChucVu(String chucVu) async {
    final response = await _dio.get('/nhan_vien/by-chuc-vu', queryParameters: {'chucVu': chucVu});
    final List<dynamic> data = response.data;
    return data.map((json) => NhanVienEntity.fromJson(json)).toList();
  }

  /// GET /api/nhan_vien/by-chuyen-khoa?chuyenKhoa=
  Future<List<NhanVienEntity>> getByChuyenKhoa(int chuyenKhoa) async {
    final response = await _dio.get('/nhan_vien/by-chuyen-khoa', queryParameters: {'chuyenKhoa': chuyenKhoa});
    final List<dynamic> data = response.data;
    return data.map((json) => NhanVienEntity.fromJson(json)).toList();
  }

  /// GET /api/nhan_vien/bac-si-by-chuyen-khoa?chuyenKhoa=
  Future<List<NhanVienEntity>> getBacSiByChuyenKhoa(int chuyenKhoa) async {
    final response = await _dio.get('/nhan_vien/bac-si-by-chuyen-khoa', queryParameters: {'chuyenKhoa': chuyenKhoa});
    final List<dynamic> data = response.data;
    return data.map((json) => NhanVienEntity.fromJson(json)).toList();
  }

  /// GET /api/nhan_vien/{id}
  Future<NhanVienEntity> getById(int id) async {
    final response = await _dio.get('/nhan_vien/$id');
    return NhanVienEntity.fromJson(response.data);
  }
}