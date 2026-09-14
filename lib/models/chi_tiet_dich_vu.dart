import 'chi_so_xet_nghiem.dart';

class ChiTietDichVu {
  final int maChiTietChiDinh;
  final String tenDichVu;
  final String? loai;
  final String? trangThai;
  final String? chiSoXetNghiem;
  final String? ketQuaXetNghiem;
  final String? donViXetNghiem;
  final String? chiSoBinhThuong;
  final String? ketQuaCdha;
  final String? moTaCdha;
  final String? ketLuanCdha;
  final String? hinhAnhCdha;
  final String? bacSiDocKetQua;
  final String? ngayDocKetQua;
  // Tên bác sĩ kết luận xét nghiệm (ma_bs_ket_luan)
  final String? tenBsKetLuan;
  // Tên bác sĩ thực hiện CĐHA (ma_bac_si_thuc_hien)
  final String? tenBsCdha;
  // Tên kỹ thuật viên thực hiện (nguoi_thuc_hien / ma_nhan_vien_thuc_hien)
  final String? tenKyThuatVien;
  final List<ChiSoXetNghiem> chiTietChiSoXetNghiem;

  ChiTietDichVu({
    required this.maChiTietChiDinh,
    required this.tenDichVu,
    this.loai,
    this.trangThai,
    this.chiSoXetNghiem,
    this.ketQuaXetNghiem,
    this.donViXetNghiem,
    this.chiSoBinhThuong,
    this.ketQuaCdha,
    this.moTaCdha,
    this.ketLuanCdha,
    this.hinhAnhCdha,
    this.bacSiDocKetQua,
    this.ngayDocKetQua,
    this.tenBsKetLuan,
    this.tenBsCdha,
    this.tenKyThuatVien,
    this.chiTietChiSoXetNghiem = const [],
  });

  factory ChiTietDichVu.fromJson(Map<String, dynamic> json) {
    // Parse nested chiTietChiDinh entity (ChiTietChiDinh)
    final chiTietChiDinh = json['chiTietChiDinh'] as Map<String, dynamic>? ?? {};
    // Parse nested dichVu entity
    final dichVu = json['dichVu'] as Map<String, dynamic>?;
    // Parse nested ketQuaXetNghiem entity (KetQuaXetNghiem)
    final ketQuaXetNghiem = json['ketQuaXetNghiem'] as Map<String, dynamic>?;
    // Parse nested ketQuaCdha entity (KetQuaCdha)
    final ketQuaCdha = json['ketQuaCdha'] as Map<String, dynamic>?;
    // Parse nested chiSoXetNghiem list (KetQuaXnChiSo)
    final chiSoXetNghiemList = json['chiSoXetNghiem'] as List<dynamic>?;

    // Build combined XN info from both ketQuaXetNghiem.ketLuan + chiSoXetNghiem list
    String? combinedXnResult;
    if (ketQuaXetNghiem != null) {
      combinedXnResult = ketQuaXetNghiem['ketLuan'] as String?;
    }

    // Build combined CDHA info
    String? hinhAnhStr;
    final duongDan1 = ketQuaCdha?['duongDanAnh1'] as String?;
    final duongDan2 = ketQuaCdha?['duongDanAnh2'] as String?;
    if (duongDan1 != null && duongDan2 != null) {
      hinhAnhStr = '$duongDan1\n$duongDan2';
    } else if (duongDan1 != null) {
      hinhAnhStr = duongDan1;
    } else if (duongDan2 != null) {
      hinhAnhStr = duongDan2;
    }

    return ChiTietDichVu(
      maChiTietChiDinh: chiTietChiDinh['id'] as int? ??
          chiTietChiDinh['maChiTietChiDinh'] as int? ??
          0,
      tenDichVu: dichVu?['tenDichVu'] as String? ?? '',
      loai: dichVu?['loaiDichVu'] as String?,
      trangThai: chiTietChiDinh['trangThaiDv'] as String?,
      chiSoXetNghiem: null, // Now using chiTietChiSoXetNghiem list instead
      ketQuaXetNghiem: combinedXnResult,
      donViXetNghiem: null, // Now using chiTietChiSoXetNghiem list instead
      chiSoBinhThuong: null, // Now using chiTietChiSoXetNghiem list instead
      ketQuaCdha: ketQuaCdha?['ketLuan'] as String?,
      moTaCdha: ketQuaCdha?['moTaHinhAnh'] as String?,
      ketLuanCdha: ketQuaCdha?['deNghi'] as String?,
      hinhAnhCdha: hinhAnhStr,
      bacSiDocKetQua: chiTietChiDinh['maNhanVienThucHien']?.toString(),
      ngayDocKetQua: ketQuaXetNghiem?['ngayThucHien']?.toString(),
      tenBsKetLuan: json['tenBsKetLuan'] as String?,
      tenBsCdha: json['tenBsCdha'] as String?,
      tenKyThuatVien: json['tenKyThuatVien'] as String?,
      chiTietChiSoXetNghiem: chiSoXetNghiemList
              ?.map(
                  (e) => ChiSoXetNghiem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'maChiTietChiDinh': maChiTietChiDinh,
      'tenDichVu': tenDichVu,
      'loai': loai,
      'trangThai': trangThai,
      'chiSoXetNghiem': chiSoXetNghiem,
      'ketQuaXetNghiem': ketQuaXetNghiem,
      'donViXetNghiem': donViXetNghiem,
      'chiSoBinhThuong': chiSoBinhThuong,
      'ketQuaCdha': ketQuaCdha,
      'moTaCdha': moTaCdha,
      'ketLuanCdha': ketLuanCdha,
      'hinhAnhCdha': hinhAnhCdha,
      'bacSiDocKetQua': bacSiDocKetQua,
      'ngayDocKetQua': ngayDocKetQua,
      'tenBsKetLuan': tenBsKetLuan,
      'tenBsCdha': tenBsCdha,
      'tenKyThuatVien': tenKyThuatVien,
      'chiTietChiSoXetNghiem':
          chiTietChiSoXetNghiem.map((e) => e.toJson()).toList(),
    };
  }
}