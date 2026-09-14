import 'ca_lam_entity.dart';

class BangPhanCongCaLamEntity {
  final int? id;
  final int? maNhanVien;
  final String?
  ngay; // LocalDate as String "yyyy-MM-dd" (có thể null với ca mặc định theo thứ)
  final String? thu; // Ví dụ: "THU_2", "THU_3", ...
  final CaLamEntity? ca; // Ca làm việc (Sáng/Chiều)
  final String? phong;
  final String? kieuPhanCong; // "MAC_DINH" hoặc "THEO_NGAY"
  final String?
  hanhDong; // "THEM", "THAY_THE", "NGHI_PHEP" (null = bình thường)
  final String? lyDo;
  final int? maCa;

  BangPhanCongCaLamEntity({
    this.id,
    this.maNhanVien,
    this.ngay,
    this.thu,
    this.ca,
    this.phong,
    this.kieuPhanCong,
    this.hanhDong,
    this.lyDo,
    this.maCa,
  });

  factory BangPhanCongCaLamEntity.fromJson(Map<String, dynamic> json) {
    return BangPhanCongCaLamEntity(
      id: json['id'] as int?,
      maNhanVien: json['maNhanVien'] as int?,
      ngay: json['ngay'] as String?,
      thu: json['thu'] as String?,
      ca: json['ca'] is Map<String, dynamic>
          ? CaLamEntity.fromJson(json['ca'] as Map<String, dynamic>)
          : null,
      phong: json['phong'] as String?,
      kieuPhanCong: json['kieuPhanCong'] as String?,
      hanhDong: json['hanhDong'] as String?,
      lyDo: json['lyDo'] as String?,
      maCa: json['maCa'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      if (maNhanVien != null) 'maNhanVien': maNhanVien,
      if (ngay != null) 'ngay': ngay,
      if (thu != null) 'thu': thu,
      if (ca != null) 'ca': ca!.toJson(),
      if (phong != null) 'phong': phong,
      if (kieuPhanCong != null) 'kieuPhanCong': kieuPhanCong,
      if (hanhDong != null) 'hanhDong': hanhDong,
      if (lyDo != null) 'lyDo': lyDo,
      if (maCa != null) 'maCa': maCa,
    };
  }

  /// Bản ghi này có phải là nghỉ phép hay không
  bool get isNghiPhep => hanhDong == 'NGHI_PHEP';

  /// Tương thích ngược: giờ bắt đầu ca (lấy từ ca.gioBatDau)
  String? get gioLam => ca?.gioBatDau;

  /// Tương thích ngược: giờ kết thúc ca (lấy từ ca.gioKetThuc)
  String? get gioKetThuc => ca?.gioKetThuc;

  /// Hiển thị thứ bằng tiếng Việt (chuẩn hóa cả biến thể "Chủ Nhật", "Chu Nhat")
  String get thuDisplay {
    final value = (thu ?? '').trim();
    switch (value) {
      case 'THU_2':
      case 'Thứ 2':
      case 'Thu 2':
        return 'Thứ 2';
      case 'THU_3':
      case 'Thứ 3':
      case 'Thu 3':
        return 'Thứ 3';
      case 'THU_4':
      case 'Thứ 4':
      case 'Thu 4':
        return 'Thứ 4';
      case 'THU_5':
      case 'Thứ 5':
      case 'Thu 5':
        return 'Thứ 5';
      case 'THU_6':
      case 'Thứ 6':
      case 'Thu 6':
        return 'Thứ 6';
      case 'THU_7':
      case 'Thứ 7':
      case 'Thu 7':
        return 'Thứ 7';
      case 'CHU_NHAT':
      case 'Chu Nhat':
      case 'Chủ Nhật':
      case 'Chủ nhật':
      case 'Chu nhật':
        return 'Chủ nhật';
      default:
        return value;
    }
  }

  /// Tên ca hiển thị (Ca sáng / Ca chiều) — ưu tiên từ ca, fallback theo giờ
  String get caDisplay => ca?.tenCaDisplay ?? 'Ca';

  /// Khoảng giờ hiển thị "07:00 – 11:30"
  String get gioDisplay => ca?.gioRange ?? '';

  /// Nhãn ngắn cho chip ca (Sáng / Chiều)
  String get caIconLabel => ca?.iconLabel ?? 'Ca';
}
