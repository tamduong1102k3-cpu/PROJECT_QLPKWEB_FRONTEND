import 'package:flutter/material.dart';
import '../../../models/chi_tiet_dich_vu.dart';
import '../../../models/chi_so_xet_nghiem.dart';

/// Màn hình "Kết quả xét nghiệm" cho phiếu CLS_XET_NGHIEM
/// Hiển thị các chỉ số dạng danh sách gọn (Chỉ số | Kết quả | Đơn vị)
/// để người dùng thấy tất cả trong một màn hình cuộn dọc.
class KetQuaXNScreen extends StatelessWidget {
  final List<ChiTietDichVu> chiTietDichVu;
  const KetQuaXNScreen({super.key, required this.chiTietDichVu});

  List<ChiSoXetNghiem> _allChiSo() {
    final list = <ChiSoXetNghiem>[];
    for (final ct in chiTietDichVu) {
      list.addAll(ct.chiTietChiSoXetNghiem);
    }
    list.sort((a, b) {
      final ta = int.tryParse(a.thuTu?.toString() ?? '') ?? 0;
      final tb = int.tryParse(b.thuTu?.toString() ?? '') ?? 0;
      return ta.compareTo(tb);
    });
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final chiSo = _allChiSo();
    if (chiSo.isEmpty && chiTietDichVu.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.science_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Chưa có kết quả xét nghiệm',
                style: TextStyle(fontSize: 16, color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Danh sách chỉ số
        if (chiSo.isNotEmpty) _buildChiSoList(chiSo),
        const SizedBox(height: 16),
        // Kết luận
        for (final ct in chiTietDichVu)
          if (ct.ketQuaXetNghiem?.isNotEmpty == true)
            _buildKetLuan(ct.tenDichVu, ct.ketQuaXetNghiem!),
      ],
    );
  }

  /// Danh sách chỉ số dạng từng dòng gọn — thấy tất cả khi cuộn dọc.
  Widget _buildChiSoList(List<ChiSoXetNghiem> chiSo) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEDF2F7)),
      ),
      child: Column(
        children: [
          // Header 3 cột
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
            ),
            child: const Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Text('Chỉ số',
                      style: TextStyle(
                          fontSize: 12, fontWeight: FontWeight.bold,
                          color: Color(0xFF64748B))),
                ),
                Expanded(
                  flex: 2,
                  child: Text('Kết quả',
                      style: TextStyle(
                          fontSize: 12, fontWeight: FontWeight.bold,
                          color: Color(0xFF64748B))),
                ),
                Expanded(
                  flex: 1,
                  child: Text('Đơn vị',
                      style: TextStyle(
                          fontSize: 12, fontWeight: FontWeight.bold,
                          color: Color(0xFF64748B))),
                ),
              ],
            ),
          ),
          // Các dòng chỉ số
          ...chiSo.map((c) => _chiSoRow(c)).toList(),
        ],
      ),
    );
  }

  Widget _chiSoRow(ChiSoXetNghiem c) {
    final isAbnormal = c.batThuong == true;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: isAbnormal ? const Color(0xFFFFF5F5) : Colors.white,
        border: Border(
          bottom: BorderSide(color: const Color(0xFFEDF2F7)),
        ),
      ),
      child: Row(
        children: [
          // Chỉ số
          Expanded(
            flex: 3,
            child: Text(
              c.tenChiSo ?? '—',
              style: const TextStyle(
                  fontSize: 13, color: Color(0xFF1F2937)),
            ),
          ),
          // Kết quả (+ cảnh báo nếu bất thường)
          Expanded(
            flex: 2,
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    c.giaTri ?? '—',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isAbnormal
                          ? const Color(0xFFDC2626)
                          : const Color(0xFF1F2937),
                    ),
                  ),
                ),
                if (isAbnormal) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.error_outline,
                      size: 15, color: Color(0xFFDC2626)),
                ],
              ],
            ),
          ),
          // Đơn vị
          Expanded(
            flex: 1,
            child: Text(
              c.donVi ?? '—',
              style: const TextStyle(
                  fontSize: 12, color: Color(0xFF6B7280)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKetLuan(String tenDv, String ketLuan) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(tenDv,
              style: const TextStyle(
                  fontSize: 14, fontWeight: FontWeight.bold,
                  color: Color(0xFF15803D))),
          const SizedBox(height: 8),
          const Text('KẾT LUẬN',
              style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.bold,
                  color: Color(0xFF15803D), letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(ketLuan,
              style: const TextStyle(
                  fontSize: 14, color: Color(0xFF1F2937), height: 1.5)),
        ],
      ),
    );
  }
}