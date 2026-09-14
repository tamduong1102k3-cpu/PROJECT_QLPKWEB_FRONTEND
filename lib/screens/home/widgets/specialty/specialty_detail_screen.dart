import 'package:flutter/material.dart';
import '../../../../data/entities/chuyen_khoa_entity.dart';
import '../../../../data/entities/nhan_vien_entity.dart';
import '../../../../data/entities/danh_muc_benh_ly_entity.dart';
import '../../../../data/entities/bang_phan_cong_ca_lam_entity.dart';
import '../../../../models/service_item_model.dart';
import '../../../../repositories/nhan_vien_repository.dart';
import '../../../../repositories/danh_muc_benh_ly_repository.dart';
import '../../../../repositories/bang_phan_cong_repository.dart';
import '../../../../utils/auth_guard.dart';
import '../../../appointment/appointment_booking_screen.dart';

class SpecialtyDetailScreen extends StatefulWidget {
  final ChuyenKhoaEntity specialty;

  const SpecialtyDetailScreen({super.key, required this.specialty});

  @override
  State<SpecialtyDetailScreen> createState() => _SpecialtyDetailScreenState();
}

class _SpecialtyDetailScreenState extends State<SpecialtyDetailScreen> {
  final NhanVienRepository _nhanVienRepo = NhanVienRepository();
  final DanhMucBenhLyRepository _danhMucBenhLyRepo = DanhMucBenhLyRepository();
  final BangPhanCongRepository _phanCongRepo = BangPhanCongRepository();

  List<NhanVienEntity> _doctors = [];
  List<NhanVienEntity> _assistants = [];
  List<DanhMucBenhLyEntity> _diseases = [];
  Map<int, List<BangPhanCongCaLamEntity>> _schedules = {};
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final maChuyenKhoa = widget.specialty.maChuyenKhoa;

      // Load staff and diseases concurrently
      final results = await Future.wait([
        _nhanVienRepo.getByChuyenKhoa(maChuyenKhoa),
        _danhMucBenhLyRepo.getByChuyenKhoa(maChuyenKhoa),
      ]);

      final staff = results[0] as List<NhanVienEntity>;
      final diseases = results[1] as List<DanhMucBenhLyEntity>;

      // Classify staff into doctors and assistants
      // Priority: check 'trợ lý' FIRST to avoid 'Trợ lý bác sĩ chuyên khoa' matching as doctor
      final List<NhanVienEntity> docs = [];
      final List<NhanVienEntity> assists = [];

      for (final person in staff) {
        if (person.chucVu != null &&
            person.chucVu!.toLowerCase().contains('trợ lý')) {
          assists.add(person);
        } else if (person.chucVu != null &&
            (person.chucVu!.toLowerCase().contains('bác sĩ') ||
                person.chucVu!.toLowerCase().contains('doctor') ||
                person.chucVu!.toLowerCase().contains('bac si'))) {
          docs.add(person);
        } else {
          // Fallback: treat unrecognized roles as assistants
          assists.add(person);
        }
      }

      // Fetch schedules for each doctor
      final Map<int, List<BangPhanCongCaLamEntity>> schedules = {};
      for (final doctor in docs) {
        try {
          final sched = await _phanCongRepo.getByNhanVien(doctor.maNhanVien);
          schedules[doctor.maNhanVien] = sched;
        } catch (_) {
          // If schedule fetch fails, just continue with empty schedule
          schedules[doctor.maNhanVien] = [];
        }
      }

      if (!mounted) return;
      setState(() {
        _doctors = docs;
        _assistants = assists;
        _diseases = diseases;
        _schedules = schedules;
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
    final themeColor = Colors.teal;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Chi tiết chuyên khoa',
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
      body: _buildBody(themeColor),
      bottomNavigationBar: _isLoading
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
                          initialChuyenKhoa: widget.specialty,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'ĐẶT LỊCH KHÁM NGAY',
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

  Widget _buildBody(Color themeColor) {
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
                onPressed: _loadData,
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      );
    }

    final specialty = widget.specialty;
    final assetPath = ServiceItemModel.fromEntity(specialty, 0).assetPath;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
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
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(40),
                    child: Image.asset(
                      assetPath,
                      width: 80,
                      height: 80,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) {
                        return Icon(
                          Icons.medical_services,
                          color: themeColor,
                          size: 40,
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  specialty.tenChuyenKhoa,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                if (specialty.moTa != null && specialty.moTa!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    specialty.moTa!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Khối 1: Các bệnh lý thường gặp (moved to top)
          _buildSectionTitle('Các bệnh lý thường gặp'),
          _buildDiseaseChips(_diseases),
          const SizedBox(height: 12),

          // Khối 2: Bác sĩ phụ trách (moved after diseases)
          _buildSectionTitle('Bác sĩ phụ trách'),
          _buildDoctorsSection(),
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

  Widget _buildDiseaseChips(List<DanhMucBenhLyEntity> diseases) {
    if (diseases.isEmpty) {
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
          child: const Center(
            child: Text(
              'Chưa cập nhật danh sách bệnh lý',
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ),
        ),
      );
    }

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
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: diseases.map((disease) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.medical_services_outlined,
                    size: 16,
                    color: Colors.teal[600],
                  ),
                  const SizedBox(width: 6),
                  Text(
                    disease.tenBenh,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF334155),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildDoctorsSection() {
    if (_doctors.isEmpty) {
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
          child: const Center(
            child: Text(
              'Không có bác sĩ phụ trách',
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: List.generate(_doctors.length, (index) {
          final doctor = _doctors[index];

          // Find first assistant (if any) to pair with this doctor
          final NhanVienEntity? assistant =
              index < _assistants.length ? _assistants[index] : null;

          return Padding(
            padding: EdgeInsets.only(top: index > 0 ? 8 : 0),
            child: _buildDoctorCard(doctor, assistant),
          );
        }),
      ),
    );
  }

  Widget _buildDoctorCard(NhanVienEntity doctor, NhanVienEntity? assistant) {
    // Get schedule for this doctor
    final schedule = _schedules[doctor.maNhanVien] ?? [];
    final sortedDays = schedule
        .map((s) => s.thuDisplay)
        .where((d) => d.isNotEmpty)
        .toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hàng 1: Lịch làm việc
          if (sortedDays.isNotEmpty)
            Row(
              children: [
                const Icon(
                  Icons.calendar_today,
                  size: 16,
                  color: Color(0xFF64748B),
                ),
                const SizedBox(width: 8),
                Text(
                  'Lịch làm việc: ${sortedDays.join(', ')}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            )
          else
            Row(
              children: [
                const Icon(
                  Icons.calendar_today,
                  size: 16,
                  color: Color(0xFF64748B),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Lịch làm việc: Chưa cập nhật',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          const SizedBox(height: 12),

          // Hàng 2: Bác sĩ (cột trái) | Trợ lý (cột phải)
          IntrinsicHeight(
            child: Row(
              children: [
                // Cột trái: Bác sĩ
                Expanded(
                  child: Row(
                    children: [
                      ClipOval(
                        child: Image.asset(
                          doctor.gioiTinh == 1
                              ? 'assets/images/employee/doctor male.png'
                              : 'assets/images/employee/doctor female.png',
                          width: 36,
                          height: 36,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              width: 36,
                              height: 36,
                              decoration: const BoxDecoration(
                                color: Color(0xFFF1F5F9),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  doctor.hoTen.isNotEmpty
                                      ? doctor.hoTen[0].toUpperCase()
                                      : '?',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blueGrey,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Bác sĩ ${doctor.hoTen}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                            const Text(
                              'Bác sĩ chính',
                              style: TextStyle(
                                fontSize: 11,
                                color: Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Divider dọc
                if (assistant != null) ...[
                  Container(
                    width: 1,
                    height: 36,
                    color: const Color(0xFFE2E8F0),
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                  ),
                  // Cột phải: Trợ lý
                  Expanded(
                    child: Row(
                      children: [
                        ClipOval(
                          child: Image.asset(
                            assistant.gioiTinh == 1
                                ? 'assets/images/employee/tro ly nam.png'
                                : 'assets/images/employee/tro ly nu.png',
                            width: 36,
                            height: 36,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                width: 36,
                                height: 36,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFF1F5F9),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    assistant.hoTen.isNotEmpty
                                        ? assistant.hoTen[0].toUpperCase()
                                        : '?',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blueGrey,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Trợ lý ${assistant.hoTen}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                  color: Color(0xFF1E293B),
                                ),
                              ),
                              const Text(
                                'Trợ lý chuyên khoa',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}