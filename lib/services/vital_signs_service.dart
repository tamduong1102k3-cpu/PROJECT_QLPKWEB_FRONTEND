import 'package:flutter/foundation.dart';

import '../core/dio_client.dart';
import '../models/vital_signs_model.dart';

class VitalSignsService {
  static final VitalSignsService _instance = VitalSignsService._internal();
  factory VitalSignsService() => _instance;
  VitalSignsService._internal();

  final _dio = DioClient().dio;

  /// Lấy chỉ số sinh hiệu gần nhất của bệnh nhân
  /// Trả về VitalSignsModel nếu thành công, null nếu không có dữ liệu
  Future<VitalSignsModel?> getLatestVitalSigns(int maBenhNhan) async {
    try {
      final response = await _dio.get(
        '/benh-nhan/$maBenhNhan/vital-signs-latest',
      );

      if (response.statusCode == 200) {
        final body = response.data as Map<String, dynamic>;
        if (body['success'] == true && body['data'] != null) {
          return VitalSignsModel.fromJson(body['data'] as Map<String, dynamic>);
        }
      }
      return null;
    } catch (e) {
      debugPrint('getLatestVitalSigns error: $e');
      return null;
    }
  }
}