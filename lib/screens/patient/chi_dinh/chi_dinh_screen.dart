import 'package:flutter/material.dart';
import '../../../models/chi_tiet_ca_kham.dart';
import '../../../models/phieu_chi_dinh_chi_tiet.dart';
import '../../../models/chi_tiet_dich_vu.dart';
import '../shared/detail_widgets.dart';

/// Tab "Chỉ định" cho phiếu khám thông thường.
/// Hiển thị từng phiếu chỉ định (card) + danh sách dịch vụ CLS bên trong,
/// kèm trạng thái và tóm tắt kết quả (kết luận XN / mô tả + kết luận CĐHA).
class ChiDinhScreen extends StatelessWidget {
  final ChiTietCaKham data;

  const ChiDinhScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.phieuChiDinh.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.biotech_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Không có chỉ định nào',
                style: TextStyle(fontSize: 16, color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: data.phieuChiDinh.length,
      itemBuilder: (context, index) {
        return _buildPhieuChiDinhCard(data.phieuChiDinh[index]);
      },
    );
  }

  // ── Card phiếu chỉ định ──
  Widget _buildPhieuChiDinhCard(PhieuChiDinhChiTiet pcd) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header phiếu chỉ định
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                const Icon(Icons.biotech, color: Color(0xFF1070EE), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Phiếu chỉ định #${pcd.maPhieuChiDinh}',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                            color: Color(0xFF1A202C)),
                      ),
                      if (pcd.ngayChiDinh?.isNotEmpty == true)
                        Text(
                          _formatDate(pcd.ngayChiDinh!),
                          style: const TextStyle(
                              fontSize: 12, color: Color(0xFF6B7280)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Thông tin bác sĩ + ghi chú
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (pcd.bacSiChiDinh?.isNotEmpty == true)
                  buildInfoRow(
                      'Bác sĩ chỉ định: ${pcd.bacSiChiDinh}'),
                if (pcd.ghiChu?.isNotEmpty == true)
                  buildInfoRow('Ghi chú: ${pcd.ghiChu}'),
              ],
            ),
          ),

          // Danh sách dịch vụ CLS
          ...pcd.chiTietDichVu.map((ct) => _buildChiTietDichVu(ct)).toList(),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  // ── Từng dịch vụ CLS ──
  Widget _buildChiTietDichVu(ChiTietDichVu ct) {
    final isXN = _isXN(ct);
    final isCDHA = _isCDHA(ct);

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tên dịch vụ + trạng thái
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: (isXN ? const Color(0xFF0F766E) : const Color(0xFF1070EE))
                      .withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  isXN ? Icons.science_outlined : Icons.radio_button_checked,
                  size: 18,
                  color: isXN ? const Color(0xFF0F766E) : const Color(0xFF1070EE),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  ct.tenDichVu,
                  style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: Color(0xFF1A202C)),
                ),
              ),
              buildTrangThaiChip(ct.trangThai ?? ''),
            ],
          ),
          const SizedBox(height: 8),

          // Bác sĩ / kỹ thuật viên (nếu có kết quả)
          if (isXN && (ct.tenBsKetLuan?.isNotEmpty == true ||
              ct.tenKyThuatVien?.isNotEmpty == true)) ...[
            if (ct.tenBsKetLuan?.isNotEmpty == true)
              _labelText('Bác sĩ kết luận', ct.tenBsKetLuan!),
            if (ct.tenKyThuatVien?.isNotEmpty == true)
              _labelText('Kỹ thuật viên', ct.tenKyThuatVien!),
          ],
          if (isCDHA && (ct.tenBsCdha?.isNotEmpty == true ||
              ct.tenKyThuatVien?.isNotEmpty == true)) ...[
            if (ct.tenBsCdha?.isNotEmpty == true)
              _labelText('Bác sĩ thực hiện', ct.tenBsCdha!),
            if (ct.tenKyThuatVien?.isNotEmpty == true)
              _labelText('Kỹ thuật viên', ct.tenKyThuatVien!),
          ],

          // Kết quả theo loại
          if (isXN) _buildXNSection(ct),
          if (isCDHA) _buildCDHASection(ct),
        ],
      ),
    );
  }

  Widget _buildXNSection(ChiTietDichVu ct) {
    // Danh sách chỉ số xét nghiệm đã duyệt
    final chiSo = ct.chiTietChiSoXetNghiem;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (chiSo.isNotEmpty) ...[
          const Divider(height: 16),
          ...chiSo.map((c) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: Text(c.tenChiSo ?? '—',
                          style: const TextStyle(
                              fontSize: 13, color: Color(0xFF1F2937))),
                    ),
                    Expanded(
                      flex: 2,
                      child: Text(
                        c.giaTri ?? '—',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: c.batThuong == true
                              ? const Color(0xFFDC2626)
                              : const Color(0xFF1F2937),
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 1,
                      child: Text(c.donVi ?? '—',
                          style: const TextStyle(
                              fontSize: 12, color: Color(0xFF6B7280))),
                    ),
                  ],
                ),
              )),
        ],
        if (ct.ketQuaXetNghiem?.isNotEmpty == true) ...[
          const Divider(height: 16),
          _highlightText('Kết luận', ct.ketQuaXetNghiem!),
        ],
      ],
    );
  }

  Widget _buildCDHASection(ChiTietDichVu ct) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (ct.moTaCdha?.isNotEmpty == true) ...[
          const Divider(height: 16),
          _labelText('Mô tả', ct.moTaCdha!),
        ],
        if (ct.ketQuaCdha?.isNotEmpty == true) ...[
          const SizedBox(height: 8),
          _highlightText('Kết luận', ct.ketQuaCdha!),
        ],
        if (ct.ketLuanCdha?.isNotEmpty == true) ...[
          const SizedBox(height: 8),
          _labelText('Đề nghị', ct.ketLuanCdha!, color: const Color(0xFF15803D)),
        ],
      ],
    );
  }

  bool _isXN(ChiTietDichVu ct) {
    return ct.loai?.toLowerCase().contains('xét nghiệm') == true ||
        ct.chiTietChiSoXetNghiem.isNotEmpty ||
        ct.ketQuaXetNghiem?.isNotEmpty == true;
  }

  bool _isCDHA(ChiTietDichVu ct) {
    return ct.loai?.toLowerCase().contains('cđha') == true ||
        ct.loai?.toLowerCase().contains('chẩn đoán') == true ||
        ct.ketQuaCdha?.isNotEmpty == true ||
        ct.moTaCdha?.isNotEmpty == true;
  }

  Widget _labelText(String label, String value,
      {Color color = const Color(0xFF1F2937)}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Color(0xFF6B7280),
                letterSpacing: 0.4)),
        const SizedBox(height: 2),
        Text(value,
            style: TextStyle(fontSize: 13, color: color, height: 1.4)),
      ],
    );
  }

  Widget _highlightText(String label, String value) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF15803D),
                  letterSpacing: 0.4)),
          const SizedBox(height: 2),
          Text(value,
              style: const TextStyle(
                  fontSize: 13, color: Color(0xFF166534), height: 1.4)),
        ],
      ),
    );
  }

  String _formatDate(String s) {
    if (s.length < 10) return s;
    final parts = s.substring(0, 10).split('-');
    if (parts.length == 3) {
      return 'Ngày: ${parts[2]}/${parts[1]}/${parts[0]}';
    }
    return s;
  }
}