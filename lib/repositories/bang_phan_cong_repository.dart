import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/bang_phan_cong_ca_lam_entity.dart';
import '../data/entities/lich_thang_entity.dart';

class BangPhanCongRepository {
  Dio get _dio => DioClient().dio;

  /// GET /api/phan-cong/by-nhan-vien/{maNhanVien}
  Future<List<BangPhanCongCaLamEntity>> getByNhanVien(int maNhanVien) async {
    final response = await _dio.get('/phan-cong/by-nhan-vien/$maNhanVien');
    final List<dynamic> data = response.data;
    return data.map((json) => BangPhanCongCaLamEntity.fromJson(json)).toList();
  }

  /// GET /api/ca-lam-danh-muc/thang?maNhanVien=&nam=&thang=
  Future<LichThangEntity> getLichThang(
    int maNhanVien,
    int nam,
    int thang,
  ) async {
    final response = await _dio.get(
      '/ca-lam-danh-muc/thang',
      queryParameters: {
        'maNhanVien': maNhanVien,
        'nam': nam,
        'thang': thang,
      },
    );
    return LichThangEntity.fromJson(response.data as Map<String, dynamic>);
  }

  /// GET /api/phan-cong/working-today
  Future<List<BangPhanCongCaLamEntity>> getWorkingToday() async {
    final response = await _dio.get('/phan-cong/working-today');
    final List<dynamic> data = response.data;
    return data.map((json) => BangPhanCongCaLamEntity.fromJson(json)).toList();
  }

  /// GET /api/phan-cong
  Future<List<BangPhanCongCaLamEntity>> getAll() async {
    final response = await _dio.get('/phan-cong');
    final List<dynamic> data = response.data;
    return data.map((json) => BangPhanCongCaLamEntity.fromJson(json)).toList();
  }
}