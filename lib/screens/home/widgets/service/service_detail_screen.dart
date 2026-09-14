import 'package:flutter/material.dart';
import '../../../../data/entities/chuyen_khoa_entity.dart';
import '../../../../data/entities/dich_vu_entity.dart';
import '../../../../data/entities/nhan_vien_entity.dart';
import '../../../../models/dich_vu_model.dart';
import '../../../../repositories/chuyen_khoa_repository.dart';
import '../../../../repositories/dich_vu_repository.dart';
import '../../../../repositories/nhan_vien_repository.dart';
import '../../../../utils/auth_guard.dart';
import '../../../appointment/appointment_booking_screen.dart';

class ServiceDetailScreen extends StatefulWidget {
  final int serviceId;

  const ServiceDetailScreen({super.key, required this.serviceId});

  @override
  State<ServiceDetailScreen> createState() => _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends State<ServiceDetailScreen> {
  final DichVuRepository _dichVuRepo = DichVuRepository();
  final NhanVienRepository _nhanVienRepo = NhanVienRepository();
  final ChuyenKhoaRepository _chuyenKhoaRepo = ChuyenKhoaRepository();

  DichVuEntity? _service;
  ChuyenKhoaEntity? _specialty;
  List<NhanVienEntity> _doctors = [];
  List<NhanVienEntity> _assistants = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadServiceData();
  }

  Future<void> _loadServiceData() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      // 1. Fetch service details
      final service = await _dichVuRepo.getById(widget.serviceId);

      // 2. Fetch specialty details if maChuyenKhoa exists
      ChuyenKhoaEntity? specialty;
      List<NhanVienEntity> staff = [];

      if (service.maChuyenKhoa != null) {
        try {
          specialty = await _chuyenKhoaRepo.getById(service.maChuyenKhoa!);
        } catch (_) {}

        try {
          staff = await _nhanVienRepo.getByChuyenKhoa(service.maChuyenKhoa!);
        } catch (_) {}
      }

      // Classify staff into doctors and assistants
      final List<NhanVienEntity> docs = [];
      final List<NhanVienEntity> assists = [];

      for (final person in staff) {
        if (person.chucVu != null &&
            (person.chucVu!.toLowerCase().contains('bác sĩ') ||
                person.chucVu!.toLowerCase().contains('doctor') ||
                person.chucVu!.toLowerCase().contains('bac si'))) {
          docs.add(person);
        } else {
          assists.add(person);
        }
      }

      if (!mounted) return;
      setState(() {
        _service = service;
        _specialty = specialty;
        _doctors = docs;
        _assistants = assists;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Determine color theme based on type or use teal as default
    final DichVuModel? serviceModel = _service != null
        ? DichVuModel.fromEntity(_service!,
            index: 0, tenChuyenKhoa: _specialty?.tenChuyenKhoa ?? '')
        : null;
    final themeColor = serviceModel?.color ?? Colors.teal;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Chi tiết dịch vụ y tế',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: _buildBody(themeColor, serviceModel),
      bottomNavigationBar: _service == null || _isLoading
          ? null
          : Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () async {
                    final loggedIn = await requireLogin(context);
                    if (!loggedIn || !context.mounted) return;

                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => AppointmentBookingScreen(
                          initialDichVu: _service,
                          initialChuyenKhoa: _specialty,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'ĐẶT LỊCH DỊCH VỤ NGAY',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildBody(Color themeColor, DichVuModel? model) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.teal),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                'Lỗi khi tải thông tin: $_error',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadServiceData,
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      );
    }

    if (_service == null || model == null) {
      return const Center(child: Text('Không tìm thấy thông tin dịch vụ.'));
    }

    final srv = _service!;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card (Service Icon + Name + Category)
          Container(
            width: double.infinity,
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: themeColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Icon(
                      model.icon,
                      color: themeColor,
                      size: 40,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  srv.tenDichVu,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                if (srv.loaiDichVu != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      DichVuModel.loaiDichVuToVietnamese(srv.loaiDichVu),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF475569),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Technical Details Section (Room, Specialty, Price)
          _buildSectionTitle('Thông tin chi tiết dịch vụ'),
          Container(
            color: Colors.white,
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                _buildInfoRow(Icons.monetization_on_rounded, 'Chi phí dịch vụ',
                    model.donGiaStr),
                const Divider(height: 1),
                _buildInfoRow(
                    Icons.meeting_room_rounded,
                    'Phòng thực hiện',
                    srv.phong != null
                        ? 'Phòng ${srv.phong}'
                        : 'Chưa sắp xếp phòng'),
                if (_specialty != null) ...[
                  const Divider(height: 1),
                  _buildInfoRow(Icons.medical_services_rounded, 'Chuyên khoa',
                      _specialty!.tenChuyenKhoa),
                ],
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Department Doctors Section
          _buildSectionTitle('Bác sĩ phụ trách'),
          _buildStaffList(_doctors, 'Không có bác sĩ phụ trách'),
          const SizedBox(height: 12),

          // Department Assistants/Nurses Section
          _buildSectionTitle('Trợ lý & Điều dưỡng'),
          _buildStaffList(_assistants, 'Không có trợ lý y khoa'),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.bold,
          color: Color(0xFF475569),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.teal[400]),
          const SizedBox(width: 12),
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
          const Spacer(),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF1E293B),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStaffList(List<NhanVienEntity> list, String emptyMessage) {
    if (list.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Center(
            child: Text(
              emptyMessage,
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (context, index) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final person = list[index];
          final initials =
              person.hoTen.isNotEmpty ? person.hoTen[0].toUpperCase() : '?';
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                ClipOval(
                  child: Image.asset(
                    person.gioiTinh == 1
                        ? 'assets/images/employee/doctor male.png'
                        : 'assets/images/employee/doctor female.png',
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 40,
                        height: 40,
                        decoration: const BoxDecoration(
                          color: Color(0xFFF1F5F9),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            initials,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blueGrey,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        person.hoTen,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        person.chucVu ?? 'Nhân viên',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                if (person.bangCap != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      person.bangCap!,
                      style: const TextStyle(
                        fontSize: 10,
                        color: Color(0xFF475569),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
