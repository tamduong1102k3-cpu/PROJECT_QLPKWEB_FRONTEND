import 'package:flutter/material.dart';

const Map<int, String> tenChuyenKhoaMap = {
  1: 'Nội tổng quát',
  11: 'Tim mạch',
  3: 'Nhi khoa',
  4: 'Tai - Mũi - Họng',
  5: 'Răng - Hàm - Mặt',
};

class ChiSoField {
  final String key;
  final String label;
  final String unit;
  final bool laSo;
  final String? nhom; // Nhóm chỉ số (VD: 'Xét nghiệm máu', 'Chẩn đoán hình ảnh')
  final String? refText; // Khoảng tham chiếu hiển thị (VD: 'Ref: < 5.2')
  final double? refMin; // Giá trị tham chiếu tối thiểu (dùng đánh giá trạng thái)
  final double? refMax; // Giá trị tham chiếu tối đa (dùng đánh giá trạng thái)
  final IconData? icon; // Icon chuyên dụng cho chỉ số

  const ChiSoField(
    this.key,
    this.label, {
    this.unit = '',
    this.laSo = false,
    this.nhom,
    this.refText,
    this.refMin,
    this.refMax,
    this.icon,
  });
}

const Map<int, List<ChiSoField>> chuyenKhoaChiSoConfig = {
  1: [
    ChiSoField('nhietDo', 'Nhiệt độ', unit: '°C', laSo: true, refText: 'Ref: 36.5 - 37.5', refMin: 36.5, refMax: 37.5, icon: Icons.thermostat),
    ChiSoField('nhipTim', 'Nhịp tim', unit: 'lần/phút', laSo: true, refText: 'Ref: 60 - 100', refMin: 60, refMax: 100, icon: Icons.monitor_heart),
    ChiSoField('nhipTho', 'Nhịp thở', unit: 'lần/phút', laSo: true, refText: 'Ref: 12 - 20', refMin: 12, refMax: 20, icon: Icons.air),
    ChiSoField('huyetAp', 'Huyết áp', unit: 'mmHg', laSo: true, refText: 'Ref: 90 - 120 / 60 - 80', icon: Icons.speed),
    ChiSoField('canNang', 'Cân nặng', unit: 'kg', laSo: true, icon: Icons.monitor_weight_outlined),
    ChiSoField('chieuCao', 'Chiều cao', unit: 'cm', laSo: true, icon: Icons.height),
    ChiSoField('spo2', 'SpO2', unit: '%', laSo: true, refText: 'Ref: 95 - 100', refMin: 95, refMax: 100, icon: Icons.bloodtype_outlined),
  ],
  11: [
    // ===== Xét nghiệm máu =====
    ChiSoField('cholesterol', 'Cholesterol', unit: 'mmol/L', laSo: true, nhom: 'Xét nghiệm máu', refText: 'Ref: < 5.2', refMax: 5.2, icon: Icons.water_drop),
    ChiSoField('hdlCholesterol', 'HDL Cholesterol', unit: 'mmol/L', laSo: true, nhom: 'Xét nghiệm máu', refText: 'Ref: > 1.0', refMin: 1.0, icon: Icons.water_drop),
    ChiSoField('ldlCholesterol', 'LDL Cholesterol', unit: 'mmol/L', laSo: true, nhom: 'Xét nghiệm máu', refText: 'Ref: < 3.4', refMax: 3.4, icon: Icons.water_drop),
    ChiSoField('triglyceride', 'Triglyceride', unit: 'mmol/L', laSo: true, nhom: 'Xét nghiệm máu', refText: 'Ref: < 1.7', refMax: 1.7, icon: Icons.water_drop),
    ChiSoField('duongHuyet', 'Đường huyết', unit: 'mmol/L', laSo: true, nhom: 'Xét nghiệm máu', refText: 'Ref: < 5.6', refMax: 5.6, icon: Icons.water_drop),
    // ===== Chẩn đoán hình ảnh =====
    ChiSoField('ecgKetQua', 'Điện tâm đồ (ECG)', nhom: 'Chẩn đoán hình ảnh', icon: Icons.monitor_heart),
    ChiSoField('sieuAmTim', 'Siêu âm tim', nhom: 'Chẩn đoán hình ảnh', icon: Icons.favorite_outline),
  ],
  3: [
    ChiSoField('vongDau', 'Vòng đầu', unit: 'cm', laSo: true, icon: Icons.child_care),
    ChiSoField('tinhTrangDinhDuong', 'Tình trạng dinh dưỡng', icon: Icons.restaurant_outlined),
    ChiSoField('tamLyHanhVi', 'Tâm lý hành vi', icon: Icons.psychology_outlined),
    ChiSoField('khamTaiMuiHongNhi', 'Khám TMH nhi', icon: Icons.hearing_outlined),
    ChiSoField('khamHoHapNhi', 'Khám hô hấp nhi', icon: Icons.air),
    ChiSoField('khamDaNiemMacNhi', 'Khám da niêm mạc', icon: Icons.person_outline),
    ChiSoField('khamDuNiemMacNhi', 'Khám dữ niêm mạc nhi', icon: Icons.person_outline),
    ChiSoField('coQuanKhacNhi', 'Cơ quan khác nhi', icon: Icons.child_care_outlined),
  ],
  4: [
    ChiSoField('thinhLucTaiTrai', 'Thính lực tai trái', icon: Icons.hearing_outlined),
    ChiSoField('thinhLucTaiPhai', 'Thính lực tai phải', icon: Icons.hearing_outlined),
    ChiSoField('tinhTrangMui', 'Tình trạng mũi', icon: Icons.person_outline),
    ChiSoField('tinhTrangHong', 'Tình trạng họng', icon: Icons.person_outline),
    ChiSoField('soiTaiMuiHong', 'Soi TMH', icon: Icons.visibility_outlined),
    ChiSoField('ongTai', 'Ống tai', icon: Icons.hearing_outlined),
    ChiSoField('mangNhiPhai', 'Màng nhĩ phải', icon: Icons.disabled_visible),
    ChiSoField('mangNhiTrai', 'Màng nhĩ trái', icon: Icons.disabled_visible),
    ChiSoField('vachNgan', 'Vách ngăn', icon: Icons.linear_scale),
    ChiSoField('cuonMui', 'Cuốn mũi', icon: Icons.linear_scale),
    ChiSoField('kheMui', 'Khe mũi', icon: Icons.linear_scale),
    ChiSoField('amidan', 'Amidan', icon: Icons.medical_services_outlined),
    ChiSoField('thanhQuan', 'Thanh quản', icon: Icons.record_voice_over_outlined),
  ],
  5: [
    ChiSoField('tinhTrangRang', 'Tình trạng răng', icon: Icons.sentiment_satisfied_outlined),
    ChiSoField('sauRang', 'Sâu răng', icon: Icons.sentiment_dissatisfied_outlined),
    ChiSoField('caoRang', 'Cao răng', icon: Icons.brush_outlined),
    ChiSoField('viemNuou', 'Viêm nướu', icon: Icons.colorize),
    ChiSoField('khopCan', 'Khớp cắn', icon: Icons.crop_free),
    ChiSoField('niemMacMieng', 'Niêm mạc miệng', icon: Icons.chat_bubble_outline),
    ChiSoField('doLungLay', 'Độ lung lay', icon: Icons.graphic_eq),
    ChiSoField('phuHinhCu', 'Phụ hình cũ', icon: Icons.construction_outlined),
    ChiSoField('benhLyKhacRhm', 'Bệnh lý khác RHM', icon: Icons.medical_information_outlined),
  ],
};

const Map<int, Color> chuyenKhoaMau = {
  1: Color(0xFF0F766E),
  11: Color(0xFFEF4444),
  3: Color(0xFFF59E0B),
  4: Color(0xFF6366F1),
  5: Color(0xFF7C3AED),
};

List<ChiSoField> chiSoFieldsCuaKhoa(int? maChuyenKhoa) {
  if (maChuyenKhoa == null) return const [];
  return chuyenKhoaChiSoConfig[maChuyenKhoa] ?? const [];
}