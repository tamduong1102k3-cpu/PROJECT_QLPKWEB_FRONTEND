import 'package:flutter/material.dart';
import '../../../models/chi_tiet_dich_vu.dart';

/// Màn hình "Kết quả chẩn đoán hình ảnh" cho phiếu CLS_CHAN_DOAN_HINH_ANH
class KetQuaCDHAScreen extends StatelessWidget {
  final List<ChiTietDichVu> chiTietDichVu;
  const KetQuaCDHAScreen({super.key, required this.chiTietDichVu});

  @override
  Widget build(BuildContext context) {
    if (chiTietDichVu.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Chưa có kết quả chẩn đoán hình ảnh',
                style: TextStyle(fontSize: 16, color: Colors.grey)),
          ],
        ),
      );
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        for (final ct in chiTietDichVu) _card(ct),
      ],
    );
  }

  Widget _card(ChiTietDichVu ct) {
    if (ct.moTaCdha == null &&
        ct.ketQuaCdha == null &&
        ct.ketLuanCdha == null &&
        ct.hinhAnhCdha == null) {
      return const SizedBox.shrink();
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEDF2F7)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tên dịch vụ
          Row(
            children: [
              const Icon(Icons.radio_button_checked,
                  size: 18, color: Color(0xFF1070EE)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(ct.tenDichVu,
                    style: const TextStyle(
                        fontSize: 15, fontWeight: FontWeight.bold,
                        color: Color(0xFF1A202C))),
              ),
            ],
          ),
          const Divider(height: 20),
          // Mô tả hình ảnh
          if (ct.moTaCdha?.isNotEmpty == true)
            _section('MÔ TẢ HÌNH ẢNH', ct.moTaCdha!),
          const SizedBox(height: 12),
          // Kết luận (ketLuan)
          if (ct.ketQuaCdha?.isNotEmpty == true)
            _highlightSection('KẾT LUẬN', ct.ketQuaCdha!),
          const SizedBox(height: 12),
          // Đề nghị (deNghi)
          if (ct.ketLuanCdha?.isNotEmpty == true)
            _section('ĐỀ NGHỊ', ct.ketLuanCdha!),
          // Hình ảnh
          if (ct.hinhAnhCdha?.isNotEmpty == true) ...[
            const SizedBox(height: 12),
            _imageSection(ct.hinhAnhCdha!),
          ],
        ],
      ),
    );
  }

  Widget _section(String title, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: const TextStyle(
                fontSize: 11, fontWeight: FontWeight.bold,
                color: Color(0xFF64748B), letterSpacing: 0.5)),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(
                fontSize: 14, color: Color(0xFF1F2937), height: 1.5)),
      ],
    );
  }

  Widget _highlightSection(String title, String value) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontSize: 11, fontWeight: FontWeight.bold,
                  color: Color(0xFF15803D), letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 14, color: Color(0xFF166534), height: 1.5)),
        ],
      ),
    );
  }

  Widget _imageSection(String value) {
    final urls =
        value.split('\n').where((s) => s.trim().isNotEmpty).toList();
    if (urls.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('HÌNH ẢNH',
            style: TextStyle(
                fontSize: 11, fontWeight: FontWeight.bold,
                color: Color(0xFF64748B), letterSpacing: 0.5)),
        const SizedBox(height: 8),
        for (final url in urls)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(
                url,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 100,
                  alignment: Alignment.center,
                  color: const Color(0xFFF1F5F9),
                  child: const Text('Không hiển thị được hình ảnh',
                      style: TextStyle(color: Colors.grey)),
                ),
                loadingBuilder: (context, child, progress) {
                  if (progress == null) return child;
                  return const SizedBox(
                    height: 100,
                    child: Center(child: CircularProgressIndicator()),
                  );
                },
              ),
            ),
          ),
      ],
    );
  }
}