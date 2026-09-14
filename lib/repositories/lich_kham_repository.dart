import 'package:dio/dio.dart';
import '../core/dio_client.dart';
import '../data/entities/lich_kham_entity.dart';

class LichKhamRepository {
  Dio get _dio => DioClient().dio;

  // ==================== LẤY DANH SÁCH ====================

  /// Lấy tất cả lịch khám
  Future<List<LichKhamEntity>> getAll() async {
    final response = await _dio.get('/lich-kham');
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy lịch khám theo ID
  Future<LichKhamEntity> getById(int id) async {
    final response = await _dio.get('/lich-kham/$id');
    return LichKhamEntity.fromJson(response.data);
  }

  // ==================== THÊM / SỬA / XÓA ====================

  /// Tạo lịch khám mới (cần JWT - tự động lấy mã bệnh nhân từ token)
  Future<LichKhamEntity> create(LichKhamEntity entity) async {
    final response = await _dio.post('/lich-kham', data: entity.toJson());
    // Backend trả về { success: true, data: {...} }
    return LichKhamEntity.fromJson(response.data['data']);
  }

  /// Cập nhật lịch khám (cần JWT - chỉ chủ sở hữu mới được sửa)
  Future<LichKhamEntity> update(int id, LichKhamEntity entity) async {
    final response = await _dio.put('/lich-kham/$id', data: entity.toJson());
    return LichKhamEntity.fromJson(response.data['data']);
  }

  /// Xóa lịch khám
  Future<void> delete(int id) async {
    await _dio.delete('/lich-kham/$id');
  }

  // ==================== LẤY THEO ĐIỀU KIỆN ====================

  /// Lấy lịch khám theo bệnh nhân
  Future<List<LichKhamEntity>> getByBenhNhan(int maBenhNhan) async {
    final response = await _dio.get('/lich-kham/benh-nhan/$maBenhNhan');
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy lịch khám theo bác sĩ
  Future<List<LichKhamEntity>> getByBacSi(int maBacSi) async {
    final response = await _dio.get('/lich-kham/bac-si/$maBacSi');
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy lịch khám theo ngày
  Future<List<LichKhamEntity>> getByNgayKham(String ngayKham) async {
    final response = await _dio.get('/lich-kham/ngay', queryParameters: {'ngayKham': ngayKham});
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy lịch khám theo chuyên khoa
  Future<List<LichKhamEntity>> getByChuyenKhoa(int maChuyenKhoa) async {
    final response = await _dio.get('/lich-kham/chuyen-khoa/$maChuyenKhoa');
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy lịch khám theo trạng thái
  Future<List<LichKhamEntity>> getByTrangThai(String trangThai) async {
    final response = await _dio.get('/lich-kham/trang-thai/$trangThai');
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy danh sách lịch khám trong ngày (loại bỏ trạng thái HUY, QUA_HEN)
  Future<List<LichKhamEntity>> getAppointmentsByDate(String ngayKham) async {
    final response = await _dio.get('/lich-kham/today', queryParameters: {'ngayKham': ngayKham});
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy lịch khám theo bác sĩ và ngày
  Future<List<LichKhamEntity>> getByDoctorAndDate(int maBacSi, String ngayKham) async {
    final response = await _dio.get('/lich-kham/bac-si/$maBacSi/ngay', queryParameters: {'ngayKham': ngayKham});
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  /// Lấy lịch khám trong khoảng thời gian
  Future<List<LichKhamEntity>> getBetweenDates(String startDate, String endDate) async {
    final response = await _dio.get('/lich-kham/khoang-thoi-gian', queryParameters: {
      'startDate': startDate,
      'endDate': endDate,
    });
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }

  // ==================== THAY ĐỔI TRẠNG THÁI ====================

  /// Cập nhật trạng thái lịch khám
  Future<LichKhamEntity> updateTrangThai(int id, String trangThai) async {
    final response = await _dio.put('/lich-kham/$id/trang-thai', data: {'trangThai': trangThai});
    return LichKhamEntity.fromJson(response.data);
  }

  /// Xác nhận lịch khám — KHÔNG CÒN ĐƯỢC HỖ TRỢ (backend trả 410 GONE).
  /// Lịch hẹn được giữ chỗ ngay khi tạo (CHUA_DEN), không cần bước xác nhận.
  Future<LichKhamEntity> xacNhan(int id) async {
    final response = await _dio.put('/lich-kham/$id/xac-nhan');
    return LichKhamEntity.fromJson(response.data['data']);
  }

  /// Hủy lịch khám (cần JWT - chỉ bệnh nhân sở hữu mới được hủy)
  Future<LichKhamEntity> huyLichKham(int id, {String? ghiChu}) async {
    final Map<String, dynamic>? body = ghiChu != null ? {'ghiChu': ghiChu} : null;
    final response = await _dio.put('/lich-kham/$id/huy', data: body);
    return LichKhamEntity.fromJson(response.data['data']);
  }

  // ==================== KIỂM TRA GIỚI HẠN HỦY ====================

  /// Đếm số lần hủy lịch khám trong 30 ngày qua
  Future<int> countCancellationsLast30Days() async {
    final response = await _dio.get('/lich-kham/cancellation-count');
    final data = response.data as Map<String, dynamic>;
    return data['count'] as int? ?? 0;
  }

  /// Kiểm tra xem bệnh nhân còn được đặt lịch không
  Future<bool> canBookAppointment() async {
    final response = await _dio.get('/lich-kham/can-book');
    final data = response.data as Map<String, dynamic>;
    return data['canBook'] as bool? ?? true;
  }

  /// Kiểm tra xem bệnh nhân có lịch khám đang hoạt động không
  Future<bool> hasActiveAppointment() async {
    final response = await _dio.get('/lich-kham/has-active');
    final data = response.data as Map<String, dynamic>;
    return data['hasActive'] as bool? ?? false;
  }

  /// Kiểm tra xem bệnh nhân đã có lịch trùng ngày chưa
  Future<bool> isDuplicateDate(String ngayKham) async {
    final response = await _dio.get('/lich-kham/check-duplicate', queryParameters: {
      'ngayKham': ngayKham,
    });
    final data = response.data as Map<String, dynamic>;
    return data['isDuplicate'] as bool? ?? false;
  }

  // ==================== TÌM KIẾM / LỌC ====================

  /// Tìm kiếm lịch khám theo nhiều điều kiện (tất cả đều optional)
  /// - [trangThai]: "CHUA_DEN", "DA_CHECK_IN", "HOAN_THANH", "HUY", "QUA_HEN"
  /// - [maChuyenKhoa]: mã chuyên khoa
  /// - [maDichVu]: mã dịch vụ
  /// - [ngayKham]: ngày khám (yyyy-MM-dd), nếu null thì tìm tất cả các ngày
  /// - [todayOnly]: nếu true, tự động lọc theo ngày hiện tại
  Future<List<LichKhamEntity>> searchAppointments({
    String? trangThai,
    int? maChuyenKhoa,
    int? maDichVu,
    String? ngayKham,
    bool todayOnly = false,
  }) async {
    final queryParams = <String, dynamic>{};

    if (todayOnly) {
      final now = DateTime.now();
      ngayKham =
          '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    }

    if (trangThai != null && trangThai.isNotEmpty) {
      queryParams['trangThai'] = trangThai;
    }
    if (maChuyenKhoa != null && maChuyenKhoa > 0) {
      queryParams['maChuyenKhoa'] = maChuyenKhoa.toString();
    }
    if (maDichVu != null && maDichVu > 0) {
      queryParams['maDichVu'] = maDichVu.toString();
    }
    if (ngayKham != null && ngayKham.isNotEmpty) {
      queryParams['ngayKham'] = ngayKham;
    }

    final response = await _dio.get('/lich-kham/search', queryParameters: queryParams.isNotEmpty ? queryParams : null);
    final data = response.data as List<dynamic>;
    return data.map((json) => LichKhamEntity.fromJson(json)).toList();
  }
}