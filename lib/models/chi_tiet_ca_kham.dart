import 'phieu_chi_dinh_chi_tiet.dart';
import 'toa_thuoc_chi_tiet.dart';

class ChiTietCaKham {
  // Thông tin phiếu khám + bệnh nhân
  final int maPhieuKham;
  final String? ngayKham;
  final String? trieuChung;
  final String? chanDoan;
  final String? ghiChu;
  final String? trangThai;
  final int? maChuyenKhoa;
  final String? tenChuyenKhoa;
  final String? tenNhanVien;
  final String? tenDichVu;
  final String? loaiDichVu;

  // Thông tin bệnh nhân
  final int? maBenhNhan;
  final String? tenBenhNhan;
  final String? ngaySinh;
  final String? gioiTinh;
  final String? soDienThoai;
  final String? email;
  final String? diaChi;
  final bool? daXacMinhDanhTinh;

  // Khám lâm sàng (các chỉ số cơ bản)
  final String? mach;
  final String? nhietDo;
  final String? huyetAp;
  final String? nhipTho;
  final String? canNang;
  final String? chieuCao;

  // === CHỈ SỐ KHÁM TỔNG HỢP BỔ SUNG ===
  // Chỉ số sinh tồn bổ sung
  final String? spo2;
  final String? vongDau;
  final String? tinhTrangDinhDuong;
  final String? tamLyHanhVi;

  // Khám nhi khoa
  final String? khamTaiMuiHongNhi;
  final String? khamHoHapNhi;
  final String? khamDuNiemMacNhi;
  final String? coQuanKhacNhi;
  final String? khamDaNiemMacNhi;

  // Răng hàm mặt (RHM)
  final String? tinhTrangRang;
  final String? sauRang;
  final String? caoRang;
  final String? viemNuou;
  final String? khopCan;
  final String? niemMacMieng;
  final String? doLungLay;
  final String? phuHinhCu;
  final String? benhLyKhacRhm;

  // Tai mũi họng (TMH)
  final String? thinhLucTaiTrai;
  final String? thinhLucTaiPhai;
  final String? tinhTrangMui;
  final String? tinhTrangHong;
  final String? soiTaiMuiHong;
  final String? ongTai;
  final String? mangNhiPhai;
  final String? mangNhiTrai;
  final String? vachNgan;
  final String? cuonMui;
  final String? kheMui;
  final String? amidan;
  final String? thanhQuan;

  // Xét nghiệm máu
  final String? cholesterol;
  final String? hdlCholesterol;
  final String? ldlCholesterol;
  final String? triglyceride;
  final String? duongHuyet;

  // Chẩn đoán hình ảnh
  final String? ecgKetQua;
  final String? sieuAmTim;

  // Ghi chú chỉ số
  final String? ghiChuChiSo;

  // Hóa đơn
  final HoaDonInfo? hoaDon;
  final List<ChiTietHoaDonInfo> chiTietHoaDon;

  // Lịch tái khám
  final List<LichTaiKhamInfo> lichTaiKham;

  // Tiếp nhận CLS
  final TiepNhanClsInfo? tiepNhanCls;

  // Danh sách phiếu chỉ định
  final List<PhieuChiDinhChiTiet> phieuChiDinh;

  // Danh sách toa thuốc
  final List<ToaThuocChiTiet> toaThuoc;

  ChiTietCaKham({
    required this.maPhieuKham,
    this.ngayKham,
    this.trieuChung,
    this.chanDoan,
    this.ghiChu,
    this.trangThai,
    this.maChuyenKhoa,
    this.tenChuyenKhoa,
    this.tenNhanVien,
    this.tenDichVu,
    this.loaiDichVu,
    this.maBenhNhan,
    this.tenBenhNhan,
    this.ngaySinh,
    this.gioiTinh,
    this.soDienThoai,
    this.email,
    this.diaChi,
    this.daXacMinhDanhTinh,
    this.mach,
    this.nhietDo,
    this.huyetAp,
    this.nhipTho,
    this.canNang,
    this.chieuCao,
    // Chỉ số bổ sung
    this.spo2,
    this.vongDau,
    this.tinhTrangDinhDuong,
    this.tamLyHanhVi,
    this.khamTaiMuiHongNhi,
    this.khamHoHapNhi,
    this.khamDuNiemMacNhi,
    this.coQuanKhacNhi,
    this.khamDaNiemMacNhi,
    this.tinhTrangRang,
    this.sauRang,
    this.caoRang,
    this.viemNuou,
    this.khopCan,
    this.niemMacMieng,
    this.doLungLay,
    this.phuHinhCu,
    this.benhLyKhacRhm,
    this.thinhLucTaiTrai,
    this.thinhLucTaiPhai,
    this.tinhTrangMui,
    this.tinhTrangHong,
    this.soiTaiMuiHong,
    this.ongTai,
    this.mangNhiPhai,
    this.mangNhiTrai,
    this.vachNgan,
    this.cuonMui,
    this.kheMui,
    this.amidan,
    this.thanhQuan,
    this.cholesterol,
    this.hdlCholesterol,
    this.ldlCholesterol,
    this.triglyceride,
    this.duongHuyet,
    this.ecgKetQua,
    this.sieuAmTim,
    this.ghiChuChiSo,
    this.hoaDon,
    this.chiTietHoaDon = const [],
    this.lichTaiKham = const [],
    this.tiepNhanCls,
    required this.phieuChiDinh,
    required this.toaThuoc,
  });

  factory ChiTietCaKham.fromJson(Map<String, dynamic> json) {
    // Parse nested phieuKham object
    final phieuKham = json['phieuKham'] as Map<String, dynamic>? ?? {};
    // Parse nested benhNhan object (entity)
    final benhNhan = json['benhNhan'] as Map<String, dynamic>?;
    // Parse nested khamLamSang object (entity)
    final khamLamSang = json['khamLamSang'] as Map<String, dynamic>?;
    // Parse nested chiSoKhamTongHop object (entity) - contains vital signs
    final chiSoKhamTongHop = json['chiSoKhamTongHop'] as Map<String, dynamic>?;
    // Parse nested hoaDon object
    final hoaDon = json['hoaDon'] as Map<String, dynamic>?;
    // Parse nested tiepNhanCls object
    final tiepNhanCls = json['tiepNhanCls'] as Map<String, dynamic>?;

    // Build huyetAp string from systolic/diastolic
    String? huyetApStr;
    if (chiSoKhamTongHop != null) {
      final huyetApTamThu = _toInt(chiSoKhamTongHop['huyetApTamThu']);
      final huyetApTamTruong = _toInt(chiSoKhamTongHop['huyetApTamTruong']);
      if (huyetApTamThu != null && huyetApTamTruong != null) {
        huyetApStr = '$huyetApTamThu/$huyetApTamTruong';
      } else if (huyetApTamThu != null) {
        huyetApStr = '$huyetApTamThu';
      } else if (huyetApTamTruong != null) {
        huyetApStr = '$huyetApTamTruong';
      }
    }

    // Convert gioiTinh (Boolean from backend) to String
    String? gioiTinhStr;
    if (benhNhan != null) {
      final gioiTinhVal = benhNhan['gioiTinh'];
      if (gioiTinhVal is bool) {
        gioiTinhStr = gioiTinhVal ? 'Nam' : 'Nữ';
      } else if (gioiTinhVal is int) {
        gioiTinhStr = gioiTinhVal == 1 ? 'Nam' : 'Nữ';
      }
    }

    return ChiTietCaKham(
      maPhieuKham: phieuKham['maPhieuKham'] as int? ?? 0,
      ngayKham: phieuKham['ngayKham']?.toString(),
      trieuChung: khamLamSang?['lyDoKham'] as String?,
      chanDoan: khamLamSang?['chanDoanSoBo'] as String?,
      ghiChu: phieuKham['ghiChu'] as String?,
      trangThai: phieuKham['trangThai'] as String?,
      maChuyenKhoa: phieuKham['maChuyenKhoa'] as int?,
      tenChuyenKhoa: json['tenChuyenKhoa'] as String?,
      tenNhanVien: json['tenNhanVien'] as String?,
      tenDichVu: json['tenDichVu'] as String?,
      loaiDichVu: json['loaiDichVu'] as String?,
      maBenhNhan: benhNhan?['maBenhNhan'] as int?,
      tenBenhNhan: benhNhan?['hoTen'] as String?,
      ngaySinh: benhNhan?['ngaySinh']?.toString(),
      gioiTinh: gioiTinhStr,
      soDienThoai: benhNhan?['soDienThoai'] as String?,
      email: benhNhan?['email'] as String?,
      diaChi: benhNhan?['diaChi'] as String?,
      daXacMinhDanhTinh: benhNhan?['daXacMinhDanhTinh'] as bool?,
      mach: _toInt(chiSoKhamTongHop?['nhipTim'])?.toString(),
      nhietDo: _toDouble(chiSoKhamTongHop?['nhietDo'])?.toString(),
      huyetAp: huyetApStr,
      nhipTho: _toInt(chiSoKhamTongHop?['nhipTho'])?.toString(),
      canNang: _toDouble(chiSoKhamTongHop?['canNang'])?.toString(),
      chieuCao: _toDouble(chiSoKhamTongHop?['chieuCao'])?.toString(),
      // === CHỈ SỐ BỔ SUNG ===
      spo2: _toDouble(chiSoKhamTongHop?['spo2'])?.toString(),
      vongDau: _toDouble(chiSoKhamTongHop?['vongDau'])?.toString(),
      tinhTrangDinhDuong: chiSoKhamTongHop?['tinhTrangDinhDuong'] as String?,
      tamLyHanhVi: chiSoKhamTongHop?['tamLyHanhVi'] as String?,
      // Khám nhi
      khamTaiMuiHongNhi: chiSoKhamTongHop?['khamTaiMuiHongNhi'] as String?,
      khamHoHapNhi: chiSoKhamTongHop?['khamHoHapNhi'] as String?,
      khamDuNiemMacNhi: chiSoKhamTongHop?['khamDuNiemMacNhi'] as String?,
      coQuanKhacNhi: chiSoKhamTongHop?['coQuanKhacNhi'] as String?,
      khamDaNiemMacNhi: chiSoKhamTongHop?['khamDaNiemMacNhi'] as String?,
      // RHM
      tinhTrangRang: chiSoKhamTongHop?['tinhTrangRang'] as String?,
      sauRang: chiSoKhamTongHop?['sauRang'] as String?,
      caoRang: chiSoKhamTongHop?['caoRang'] as String?,
      viemNuou: chiSoKhamTongHop?['viemNuou'] as String?,
      khopCan: chiSoKhamTongHop?['khopCan'] as String?,
      niemMacMieng: chiSoKhamTongHop?['niemMacMieng'] as String?,
      doLungLay: chiSoKhamTongHop?['doLungLay'] as String?,
      phuHinhCu: chiSoKhamTongHop?['phuHinhCu'] as String?,
      benhLyKhacRhm: chiSoKhamTongHop?['benhLyKhacRhm'] as String?,
      // TMH
      thinhLucTaiTrai: chiSoKhamTongHop?['thinhLucTaiTrai'] as String?,
      thinhLucTaiPhai: chiSoKhamTongHop?['thinhLucTaiPhai'] as String?,
      tinhTrangMui: chiSoKhamTongHop?['tinhTrangMui'] as String?,
      tinhTrangHong: chiSoKhamTongHop?['tinhTrangHong'] as String?,
      soiTaiMuiHong: chiSoKhamTongHop?['soiTaiMuiHong'] as String?,
      ongTai: chiSoKhamTongHop?['ongTai'] as String?,
      mangNhiPhai: chiSoKhamTongHop?['mangNhiPhai'] as String?,
      mangNhiTrai: chiSoKhamTongHop?['mangNhiTrai'] as String?,
      vachNgan: chiSoKhamTongHop?['vachNgan'] as String?,
      cuonMui: chiSoKhamTongHop?['cuonMui'] as String?,
      kheMui: chiSoKhamTongHop?['kheMui'] as String?,
      amidan: chiSoKhamTongHop?['amidan'] as String?,
      thanhQuan: chiSoKhamTongHop?['thanhQuan'] as String?,
      // Xét nghiệm
      cholesterol: _toDouble(chiSoKhamTongHop?['cholesterol'])?.toString(),
      hdlCholesterol: _toDouble(chiSoKhamTongHop?['hdlCholesterol'])?.toString(),
      ldlCholesterol: _toDouble(chiSoKhamTongHop?['ldlCholesterol'])?.toString(),
      triglyceride: _toDouble(chiSoKhamTongHop?['triglyceride'])?.toString(),
      duongHuyet: _toDouble(chiSoKhamTongHop?['duongHuyet'])?.toString(),
      // CĐHA
      ecgKetQua: chiSoKhamTongHop?['ecgKetQua'] as String?,
      sieuAmTim: chiSoKhamTongHop?['sieuAmTim'] as String?,
      // Ghi chú
      ghiChuChiSo: chiSoKhamTongHop?['ghiChu'] as String?,
      // Các phần còn lại
      hoaDon: hoaDon != null ? HoaDonInfo.fromJson(hoaDon) : null,
      chiTietHoaDon: (json['chiTietHoaDon'] as List<dynamic>?)
              ?.map((e) =>
                  ChiTietHoaDonInfo.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      lichTaiKham: (json['lichTaiKham'] as List<dynamic>?)
              ?.map(
                  (e) => LichTaiKhamInfo.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      tiepNhanCls:
          tiepNhanCls != null ? TiepNhanClsInfo.fromJson(tiepNhanCls) : null,
      phieuChiDinh: (json['danhSachPhieuChiDinh'] as List<dynamic>?)
              ?.map((e) =>
                  PhieuChiDinhChiTiet.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      toaThuoc: (json['danhSachToaThuoc'] as List<dynamic>?)
              ?.map(
                  (e) => ToaThuocChiTiet.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  /// Helper to safely convert dynamic to int
  static int? _toInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  /// Helper to safely convert dynamic to double
  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  Map<String, dynamic> toJson() {
    return {
      'maPhieuKham': maPhieuKham,
      'ngayKham': ngayKham,
      'trieuChung': trieuChung,
      'chanDoan': chanDoan,
      'ghiChu': ghiChu,
      'trangThai': trangThai,
      'maChuyenKhoa': maChuyenKhoa,
      'tenChuyenKhoa': tenChuyenKhoa,
      'tenNhanVien': tenNhanVien,
      'maBenhNhan': maBenhNhan,
      'tenBenhNhan': tenBenhNhan,
      'ngaySinh': ngaySinh,
      'gioiTinh': gioiTinh,
      'soDienThoai': soDienThoai,
      'email': email,
      'diaChi': diaChi,
      'mach': mach,
      'nhietDo': nhietDo,
      'huyetAp': huyetAp,
      'nhipTho': nhipTho,
      'canNang': canNang,
      'chieuCao': chieuCao,
      // Chỉ số bổ sung
      'spo2': spo2,
      'vongDau': vongDau,
      'tinhTrangDinhDuong': tinhTrangDinhDuong,
      'tamLyHanhVi': tamLyHanhVi,
      'khamTaiMuiHongNhi': khamTaiMuiHongNhi,
      'khamHoHapNhi': khamHoHapNhi,
      'khamDuNiemMacNhi': khamDuNiemMacNhi,
      'coQuanKhacNhi': coQuanKhacNhi,
      'khamDaNiemMacNhi': khamDaNiemMacNhi,
      'tinhTrangRang': tinhTrangRang,
      'sauRang': sauRang,
      'caoRang': caoRang,
      'viemNuou': viemNuou,
      'khopCan': khopCan,
      'niemMacMieng': niemMacMieng,
      'doLungLay': doLungLay,
      'phuHinhCu': phuHinhCu,
      'benhLyKhacRhm': benhLyKhacRhm,
      'thinhLucTaiTrai': thinhLucTaiTrai,
      'thinhLucTaiPhai': thinhLucTaiPhai,
      'tinhTrangMui': tinhTrangMui,
      'tinhTrangHong': tinhTrangHong,
      'soiTaiMuiHong': soiTaiMuiHong,
      'ongTai': ongTai,
      'mangNhiPhai': mangNhiPhai,
      'mangNhiTrai': mangNhiTrai,
      'vachNgan': vachNgan,
      'cuonMui': cuonMui,
      'kheMui': kheMui,
      'amidan': amidan,
      'thanhQuan': thanhQuan,
      'cholesterol': cholesterol,
      'hdlCholesterol': hdlCholesterol,
      'ldlCholesterol': ldlCholesterol,
      'triglyceride': triglyceride,
      'duongHuyet': duongHuyet,
      'ecgKetQua': ecgKetQua,
      'sieuAmTim': sieuAmTim,
      'ghiChuChiSo': ghiChuChiSo,
      'phieuChiDinh': phieuChiDinh.map((e) => e.toJson()).toList(),
      'toaThuoc': toaThuoc.map((e) => e.toJson()).toList(),
    };
  }
}

/// Thông tin hóa đơn
class HoaDonInfo {
  final int? maHoaDon;
  final double? tongTien;
  final String? ngayThanhToan;
  final String? trangThai;
  final String? ghiChu;
  final String? phuongThucThanhToan;
  final String? maGiaoDich;

  HoaDonInfo({
    this.maHoaDon,
    this.tongTien,
    this.ngayThanhToan,
    this.trangThai,
    this.ghiChu,
    this.phuongThucThanhToan,
    this.maGiaoDich,
  });

  factory HoaDonInfo.fromJson(Map<String, dynamic> json) {
    return HoaDonInfo(
      maHoaDon: json['maHoaDon'] as int?,
      tongTien: _parseDouble(json['tongTien']),
      ngayThanhToan: json['ngayThanhToan']?.toString(),
      trangThai: json['trangThai'] as String?,
      ghiChu: json['ghiChu'] as String?,
      phuongThucThanhToan: json['phuongThucThanhToan'] as String?,
      maGiaoDich: json['maGiaoDich'] as String?,
    );
  }

  static double? _parseDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

/// Thông tin chi tiết hóa đơn
class ChiTietHoaDonInfo {
  final int? id;
  final String? noiDung;
  final String? loaiMuc;
  final int? soLuong;
  final double? donGia;
  final double? thanhTien;

  ChiTietHoaDonInfo({
    this.id,
    this.noiDung,
    this.loaiMuc,
    this.soLuong,
    this.donGia,
    this.thanhTien,
  });

  factory ChiTietHoaDonInfo.fromJson(Map<String, dynamic> json) {
    return ChiTietHoaDonInfo(
      id: json['id'] as int?,
      noiDung: json['noiDung'] as String?,
      loaiMuc: json['loaiMuc'] as String?,
      soLuong: json['soLuong'] as int?,
      donGia: HoaDonInfo._parseDouble(json['donGia']),
      thanhTien: HoaDonInfo._parseDouble(json['thanhTien']),
    );
  }
}

/// Thông tin lịch tái khám
class LichTaiKhamInfo {
  final int? id;
  final String? ngayTaiKham;
  final String? ghiChu;
  final String? trangThai;

  LichTaiKhamInfo({
    this.id,
    this.ngayTaiKham,
    this.ghiChu,
    this.trangThai,
  });

  factory LichTaiKhamInfo.fromJson(Map<String, dynamic> json) {
    return LichTaiKhamInfo(
      id: json['id'] as int?,
      ngayTaiKham: (json['ngayTaiKham'] ?? json['ngayKham'])?.toString(),
      ghiChu: json['ghiChu'] as String?,
      trangThai: json['trangThai'] as String?,
    );
  }
}

/// Thông tin tiếp nhận CLS
class TiepNhanClsInfo {
  final int? maTiepNhan;
  final String? lyDoDen;
  final String? thongTinSangLoc;
  final String? ghiChu;

  TiepNhanClsInfo({
    this.maTiepNhan,
    this.lyDoDen,
    this.thongTinSangLoc,
    this.ghiChu,
  });

  factory TiepNhanClsInfo.fromJson(Map<String, dynamic> json) {
    return TiepNhanClsInfo(
      maTiepNhan: json['maTiepNhan'] as int?,
      lyDoDen: json['lyDoDen'] as String?,
      thongTinSangLoc: json['thongTinSangLoc'] as String?,
      ghiChu: json['ghiChu'] as String?,
    );
  }
}