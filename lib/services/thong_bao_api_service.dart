import 'package:flutter/cupertino.dart';

import '../core/dio_client.dart';
import '../services/auth_service.dart';
import '../models/thong_bao_model.dart';

class ThongBaoApiService {
  static final ThongBaoApiService _instance = ThongBaoApiService._internal();
  factory ThongBaoApiService() => _instance;
  ThongBaoApiService._internal();

  final _dio = DioClient().dio;
  final _authService = AuthService();

  /// Tạo thông báo mới (lưu vào database)
  Future<bool> createThongBao({
    required int nguoiNhanId,
    required String loaiNguoiNhan,
    required String tieuDe,
    required String noiDung,
    String? referenceType,
    String? referenceId,
  }) async {
    try {
      final response = await _dio.post(
        '/thong-bao',
        data: {
          'nguoiNhanId': nguoiNhanId,
          'loaiNguoiNhan': loaiNguoiNhan,
          'tieuDe': tieuDe,
          'noiDung': noiDung,
          'referenceType': referenceType,
          'referenceId': referenceId,
        },
      );
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      debugPrint('createThongBao error: $e');
      return false;
    }
  }

  /// Lấy danh sách thông báo
  /// Dùng maTaiKhoanBn (mã tài khoản) vì bảng thong_bao lưu theo ma_tai_khoan (maTaiKhoanBn)
  /// - chiChuaDoc=true: chỉ lấy thông báo chưa đọc
  Future<List<ThongBaoModel>> getThongBao({
    bool? chiChuaDoc,
  }) async {
    final nguoiNhanId = _authService.maTaiKhoanBn;
    debugPrint('ThongBaoApiService.getThongBao - maTaiKhoanBn: $nguoiNhanId, chiChuaDoc: $chiChuaDoc');
    if (nguoiNhanId == null) {
      debugPrint('ThongBaoApiService.getThongBao - maTaiKhoanBn is null, cannot fetch');
      return [];
    }
    return _fetchThongBao(nguoiNhanId, chiChuaDoc);
  }

  /// Internal fetch thông báo theo nguoiNhanId
  Future<List<ThongBaoModel>> _fetchThongBao(int nguoiNhanId, bool? chiChuaDoc) async {
    try {
      final queryParams = <String, dynamic>{};
      if (chiChuaDoc != null) queryParams['chiChuaDoc'] = chiChuaDoc;

      final response = await _dio.get(
        '/thong-bao/$nguoiNhanId/BENH_NHAN',
        queryParameters: queryParams,
      );

      debugPrint('ThongBaoApiService._fetchThongBao - nguoiNhanId: $nguoiNhanId, status: ${response.statusCode}, response: ${response.data}');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'] ?? [];
        debugPrint('ThongBaoApiService._fetchThongBao - found ${data.length} notifications');
        return data.map((e) => ThongBaoModel.fromJson(e as Map<String, dynamic>)).toList();
      }
      debugPrint('ThongBaoApiService._fetchThongBao - unexpected response: ${response.data}');
      return [];
    } catch (e) {
      debugPrint('ThongBaoApiService._fetchThongBao - ERROR: $e');
      return [];
    }
  }

  /// Lấy số lượng chưa đọc
  Future<int> getUnreadCount() async {
    final nguoiNhanId = _authService.maTaiKhoanBn;
    debugPrint('ThongBaoApiService.getUnreadCount - maTaiKhoanBn: $nguoiNhanId');
    if (nguoiNhanId == null) return 0;

    try {
      final response = await _dio.get('/thong-bao/$nguoiNhanId/BENH_NHAN/unread-count');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final count = (response.data['unreadCount'] as num).toInt();
        debugPrint('ThongBaoApiService.getUnreadCount - count: $count');
        return count;
      }
      debugPrint('ThongBaoApiService.getUnreadCount - unexpected response: ${response.data}');
      return 0;
    } catch (e) {
      debugPrint('ThongBaoApiService.getUnreadCount - ERROR: $e');
      return 0;
    }
  }

  /// Đánh dấu đã đọc 1 thông báo
  Future<bool> markAsRead(int id) async {
    try {
      final response = await _dio.put('/thong-bao/$id/mark-read');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }

  /// Đánh dấu tất cả đã đọc
  Future<bool> markAllAsRead() async {
    final nguoiNhanId = _authService.maTaiKhoanBn;
    debugPrint('ThongBaoApiService.markAllAsRead - maTaiKhoanBn: $nguoiNhanId');
    if (nguoiNhanId == null) return false;

    try {
      final response = await _dio.put('/thong-bao/$nguoiNhanId/BENH_NHAN/mark-all-read');
      debugPrint('ThongBaoApiService.markAllAsRead - status: ${response.statusCode}, response: ${response.data}');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      debugPrint('ThongBaoApiService.markAllAsRead - ERROR: $e');
      return false;
    }
  }

  /// Xóa 1 thông báo (xóa khỏi DB)
  Future<bool> deleteNotif(int id) async {
    try {
      final response = await _dio.delete('/thong-bao/$id');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      debugPrint('ThongBaoApiService.deleteNotif - ERROR: $e');
      return false;
    }
  }
}