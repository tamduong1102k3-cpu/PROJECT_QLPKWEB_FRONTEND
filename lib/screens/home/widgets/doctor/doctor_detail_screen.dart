import 'package:flutter/material.dart';
import '../../../../data/entities/bang_phan_cong_ca_lam_entity.dart';
import '../../../../data/entities/chuyen_khoa_entity.dart';
import '../../../../data/entities/nhan_vien_entity.dart';
import '../../../../repositories/bang_phan_cong_repository.dart';
import '../../../../repositories/chuyen_khoa_repository.dart';
import '../../../../repositories/nhan_vien_repository.dart';
import '../../../../utils/auth_guard.dart';
import '../../../appointment/appointment_booking_screen.dart';

class DoctorDetailScreen extends StatefulWidget {
  final int doctorId;

  const DoctorDetailScreen({super.key, required this.doctorId});

  @override
  State<DoctorDetailScreen> createState() => _DoctorDetailScreenState();
}

class _DoctorDetailScreenState extends State<DoctorDetailScreen> {
  final NhanVienRepository _nhanVienRepo = NhanVienRepository();
  final BangPhanCongRepository _phanCongRepo = BangPhanCongRepository();
  final ChuyenKhoaRepository _chuyenKhoaRepo = ChuyenKhoaRepository();

  NhanVienEntity? _doctor;
  ChuyenKhoaEntity? _specialty;
  List<BangPhanCongCaLamEntity> _schedules = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDoctorData();
  }

  Future<void> _loadDoctorData() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      // 1. Fetch doctor entity
      final doctor = await _nhanVienRepo.getById(widget.doctorId);

      // 2. Fetch schedule list and specialty concurrently
      final Future<List<BangPhanCongCaLamEntity>> scheduleFuture =
          _phanCongRepo.getByNhanVien(widget.doctorId);

      Future<ChuyenKhoaEntity?> specialtyFuture = Future.value(null);
      if (doctor.chuyenKhoa != null) {
        specialtyFuture = _chuyenKhoaRepo
            .getById(doctor.chuyenKhoa!)
            .then<ChuyenKhoaEntity?>((value) => value)
            .catchError((_) => null);
      }

      final results = await Future.wait([scheduleFuture, specialtyFuture]);
      final schedules = results[0] as List<BangPhanCongCaLamEntity>;
      final specialty = results[1] as ChuyenKhoaEntity?;

      // Sắp xếp lịch theo thứ tự thứ trong tuần
      const thuOrder = {
        'THU_2': 2,
        'THU_3': 3,
        'THU_4': 4,
        'THU_5': 5,
        'THU_6': 6,
        'THU_7': 7,
        'CHU_NHAT': 8,
      };
      schedules.sort((a, b) {
        final aOrder = thuOrder[a.thu] ?? 9;
        final bOrder = thuOrder[b.thu] ?? 9;
        if (aOrder != bOrder) return aOrder.compareTo(bOrder);
        if (a.gioLam != null && b.gioLam != null) {
          return a.gioLam!.compareTo(b.gioLam!);
        }
        return 0;
      });

      if (!mounted) return;
      setState(() {
        _doctor = doctor;
        _schedules = schedules;
        _specialty = specialty;
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

  /// Lấy asset avatar dựa trên giới tính (1 = Nam, null = mặc định female, khác = Nữ)
  String _getAvatarAsset(int? gioiTinh) {
    return gioiTinh == 1
        ? 'assets/images/employee/doctor male.png'
        : 'assets/images/employee/doctor female.png';
  }

  String _getGenderText(int? gioiTinh) {
    if (gioiTinh == null) return 'Chưa cập nhật';
    return gioiTinh == 1 ? 'Nam' : 'Nữ';
  }

  String _formatGioDisplay(String? time) {
    if (time == null || time.length < 5) return '';
    return time.substring(0, 5);
  }

  String _displayThu(String? thu) {
    switch (thu) {
      case 'THU_2':
        return 'Thứ 2';
      case 'THU_3':
        return 'Thứ 3';
      case 'THU_4':
        return 'Thứ 4';
      case 'THU_5':
        return 'Thứ 5';
      case 'THU_6':
        return 'Thứ 6';
      case 'THU_7':
        return 'Thứ 7';
      case 'CHU_NHAT':
        return 'Chủ nhật';
      default:
        return thu ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Thông tin bác sĩ',
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
      body: _buildBody(),
      bottomNavigationBar: _doctor == null || _isLoading
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
                          initialChuyenKhoa: _specialty,
                          initialBacSi: _doctor,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'ĐẶT LỊCH HẸN NGAY',
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

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.blue),
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
                onPressed: _loadDoctorData,
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      );
    }

    if (_doctor == null) {
      return const Center(child: Text('Không tìm thấy thông tin bác sĩ.'));
    }

    final doc = _doctor!;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card (Avatar + Name + Specialty)
          Container(
            width: double.infinity,
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            child: Column(
              children: [
                ClipOval(
                  child: Image.asset(
                    _getAvatarAsset(doc.gioiTinh),
                    width: 90,
                    height: 90,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      final initials = doc.hoTen.isNotEmpty ? doc.hoTen[0].toUpperCase() : '?';
                      return Container(
                        width: 90,
                        height: 90,
                        decoration: const BoxDecoration(
                          color: Color(0xFFE0F2FE),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            initials,
                            style: const TextStyle(
                              color: Colors.blue,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  doc.hoTen,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  doc.chucVu ?? 'Bác sĩ',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.grey[600],
                  ),
                ),
                if (_specialty != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _specialty!.tenChuyenKhoa,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.blue,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Details Information Section
          _buildSectionTitle('Thông tin chi tiết'),
          Container(
            color: Colors.white,
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                _buildInfoRow(
                    Icons.wc_rounded, 'Giới tính', _getGenderText(doc.gioiTinh)),
                const Divider(height: 1),
                _buildInfoRow(Icons.school_rounded, 'Bằng cấp',
                    doc.bangCap ?? 'Chưa cập nhật'),
                const Divider(height: 1),
                _buildInfoRow(Icons.phone_rounded, 'Số điện thoại',
                    doc.soDienThoai ?? 'Chưa cập nhật'),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Working Schedule Section
          _buildSectionTitle('Lịch làm việc'),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _schedules.isEmpty
                ? Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.event_busy, size: 40, color: Colors.grey[400]),
                        const SizedBox(height: 8),
                        Text(
                          'Chưa có lịch khám được phân công',
                          style: TextStyle(color: Colors.grey[500], fontSize: 13),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _schedules.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final sched = _schedules[index];
                      final start = _formatGioDisplay(sched.gioLam);
                      final end = _formatGioDisplay(sched.gioKetThuc);
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.blue,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _displayThu(sched.thu),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '$start - $end',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14,
                                      color: Color(0xFF1E293B),
                                    ),
                                  ),
                                  if (sched.phong != null &&
                                      sched.phong!.isNotEmpty) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      sched.phong!,
                                      style: TextStyle(
                                        color: Colors.grey[600],
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
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
          Icon(icon, size: 20, color: Colors.blue[400]),
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
}
