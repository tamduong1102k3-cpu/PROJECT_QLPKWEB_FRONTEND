class LichKhamEntity {
  final int? id;
  final int maBenhNhan;
  final int maChuyenKhoa;
  final int? maBacSi;
  final int maDichVu;
  final int? maLichKhamGoc;
  final int? maCa;
  final String ngayKham; // LocalDate as String "yyyy-MM-dd"
  final String nguonTao; // 'DAT_LICH_APP' hoặc 'TAI_KHAM'
  final String trangThai;
  final String? nguoiHuy;
  final String? ghiChu;
  final DateTime? ngayTao;
  final DateTime? ngayCapNhat;

  // Transient fields (dữ liệu join từ backend)
  final String? tenBenhNhan;
  final String? tenBacSi;
  final String? tenChuyenKhoa;
  final String? tenDichVu;
  final String? tenCa;
  final String? gioBatDau;
  final String? gioKetThuc;

  LichKhamEntity({
    this.id,
    required this.maBenhNhan,
    required this.maChuyenKhoa,
    this.maBacSi,
    required this.maDichVu,
    this.maLichKhamGoc,
    this.maCa,
    required this.ngayKham,
    this.nguonTao = 'DAT_LICH_APP',
    this.trangThai = 'CHUA_DEN',
    this.nguoiHuy,
    this.ghiChu,
    this.ngayTao,
    this.ngayCapNhat,
    this.tenBenhNhan,
    this.tenBacSi,
    this.tenChuyenKhoa,
    this.tenDichVu,
    this.tenCa,
    this.gioBatDau,
    this.gioKetThuc,
  });

  factory LichKhamEntity.fromJson(Map<String, dynamic> json) {
    return LichKhamEntity(
      id: json['id'] as int?,
      maBenhNhan: json['maBenhNhan'] as int? ?? 0,
      maChuyenKhoa: json['maChuyenKhoa'] as int? ?? 0,
      maBacSi: json['maBacSi'] as int?,
      maDichVu: json['maDichVu'] as int? ?? 0,
      maLichKhamGoc: json['maLichKhamGoc'] as int?,
      maCa: json['maCa'] as int?,
      ngayKham: json['ngayKham'] as String? ?? '',
      nguonTao: json['nguonTao'] as String? ?? 'DAT_LICH_APP',
      trangThai: json['trangThai'] as String? ?? 'CHUA_DEN',
      nguoiHuy: json['nguoiHuy'] as String?,
      ghiChu: json['ghiChu'] as String?,
      ngayTao: json['ngayTao'] != null
          ? DateTime.tryParse(json['ngayTao'] as String)
          : null,
      ngayCapNhat: json['ngayCapNhat'] != null
          ? DateTime.tryParse(json['ngayCapNhat'] as String)
          : null,
      tenBenhNhan: json['tenBenhNhan'] as String?,
      tenBacSi: json['tenBacSi'] as String?,
      tenChuyenKhoa: json['tenChuyenKhoa'] as String?,
      tenDichVu: json['tenDichVu'] as String?,
      tenCa: json['tenCa'] as String?,
      gioBatDau: json['gioBatDau'] as String?,
      gioKetThuc: json['gioKetThuc'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'maBenhNhan': maBenhNhan,
      'maChuyenKhoa': maChuyenKhoa,
      if (maBacSi != null) 'maBacSi': maBacSi,
      'maDichVu': maDichVu,
      if (maLichKhamGoc != null) 'maLichKhamGoc': maLichKhamGoc,
      if (maCa != null) 'maCa': maCa,
      'ngayKham': ngayKham,
      'nguonTao': nguonTao,
      'trangThai': trangThai,
      if (nguoiHuy != null) 'nguoiHuy': nguoiHuy,
      if (ghiChu != null) 'ghiChu': ghiChu,
    };
  }

  /// Hiển thị trạng thái bằng tiếng Việt
  String get trangThaiDisplay {
    switch (trangThai) {
      case 'CHUA_DEN':
        return 'Chưa đến';
      case 'DA_CHECK_IN':
        return 'Đã check-in';
      case 'HOAN_THANH':
        return 'Hoàn thành';
      case 'HUY':
        return 'Đã hủy';
      case 'QUA_HEN':
        return 'Quá hẹn';
      case 'HOAN':
        return 'Hoãn';
      default:
        return trangThai;
    }
  }

  String get nguonTaoDisplay {
    return nguonTao == 'TAI_KHAM' ? 'TÁI KHÁM' : 'APP';
  }
}