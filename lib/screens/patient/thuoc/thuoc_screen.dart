import 'package:flutter/material.dart';
import '../../../models/chi_tiet_ca_kham.dart';
import '../../../models/toa_thuoc_chi_tiet.dart';
import '../../../models/chi_tiet_thuoc.dart';
import '../shared/detail_widgets.dart';

class ThuocScreen extends StatelessWidget {
  final ChiTietCaKham data;

  const ThuocScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.toaThuoc.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.medication, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Không có toa thuốc nào',
                style: TextStyle(fontSize: 16, color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: data.toaThuoc.length,
      itemBuilder: (context, index) {
        return _buildToaThuocCard(data.toaThuoc[index], context);
      },
    );
  }

  Widget _buildToaThuocCard(ToaThuocChiTiet toaThuoc, BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
        border: Border.all(color: const Color(0xFFEDF2F7)),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: true,
          leading: const Icon(Icons.medication, color: Colors.green),
          title: Text(
            'Toa thuốc #${toaThuoc.maToaThuoc}',
            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A202C)),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (toaThuoc.ngayKeToa?.isNotEmpty == true)
                Text(toaThuoc.ngayKeToa!,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              if (toaThuoc.bacSiKeToa?.isNotEmpty == true)
                Text('BS: ${toaThuoc.bacSiKeToa}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600])),
            ],
          ),
          trailing: const SizedBox(
            width: 44,
            height: 44,
            child: Icon(Icons.expand_more, size: 26, color: Colors.grey),
          ),
          children: [
            if (toaThuoc.chanDoan?.isNotEmpty == true)
              buildInfoRow('Chẩn đoán: ${toaThuoc.chanDoan}'),
            if (toaThuoc.ghiChu?.isNotEmpty == true)
              buildInfoRow('Ghi chú: ${toaThuoc.ghiChu}'),
            const Divider(),
            ...toaThuoc.chiTietThuoc.map((ct) => _buildChiTietThuocCard(ct)),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildChiTietThuocCard(ChiTietThuoc ct) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.green[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.medication_liquid, size: 18, color: Colors.green),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  ct.tenThuoc,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
              if (ct.soLuong != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'SL: ${ct.soLuong}',
                    style: const TextStyle(color: Colors.white, fontSize: 11),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          if (ct.hamLuong?.isNotEmpty == true)
            _buildThuocInfo('Hàm lượng', ct.hamLuong!),
          if (ct.dangBaoChe?.isNotEmpty == true)
            _buildThuocInfo('Dạng bào chế', ct.dangBaoChe!),
          if (ct.lieuDung?.isNotEmpty == true)
            _buildThuocInfo('Liều dùng', ct.lieuDung!),
          if (ct.tanSuat?.isNotEmpty == true)
            _buildThuocInfo('Tần suất', ct.tanSuat!),
          if (ct.cachDung?.isNotEmpty == true)
            _buildThuocInfo('Cách dùng', ct.cachDung!),
          if (ct.soLuong != null && ct.donViTinh?.isNotEmpty == true)
            _buildThuocInfo('Số lượng', '${ct.soLuong} ${ct.donViTinh}'),
          if (ct.ghiChu?.isNotEmpty == true)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                '📝 ${ct.ghiChu}',
                style: TextStyle(fontSize: 12, color: Colors.grey[700]),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildThuocInfo(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(label,
                style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13)),
          ),
        ],
      ),
    );
  }
}