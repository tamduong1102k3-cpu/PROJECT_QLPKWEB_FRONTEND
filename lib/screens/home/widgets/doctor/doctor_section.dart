import 'package:flutter/material.dart';
import '../../../../data/entities/bang_phan_cong_ca_lam_entity.dart';
import '../../../../data/entities/chuyen_khoa_entity.dart';
import '../../../../data/entities/nhan_vien_entity.dart';
import '../../../../models/doctor_model.dart';
import '../../../../repositories/bang_phan_cong_repository.dart';
import '../../../../repositories/chuyen_khoa_repository.dart';
import '../../../../repositories/nhan_vien_repository.dart';
import '../../../../utils/auth_guard.dart';
import '../../../../widgets/shimmer_loading.dart';
import '../../../appointment/appointment_booking_screen.dart';
import 'all_doctors_screen.dart';
import 'doctor_card_widget.dart';

class DoctorSection extends StatefulWidget {
  const DoctorSection({super.key});

  @override
  State<DoctorSection> createState() => _DoctorSectionState();
}

class _DoctorSectionState extends State<DoctorSection> {
  final NhanVienRepository _nhanVienRepo = NhanVienRepository();
  final ChuyenKhoaRepository _chuyenKhoaRepo = ChuyenKhoaRepository();
  final BangPhanCongRepository _phanCongRepo = BangPhanCongRepository();
  List<DoctorModel> _doctors = [];
  List<NhanVienEntity> _doctorEntities = [];
  List<ChuyenKhoaEntity> _chuyenKhoaEntities = [];
  bool _isLoading = true;
  String? _error;
  final PageController _controller = PageController(viewportFraction: 0.5);

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _loadDoctors() async {
    try {
      // Fetch đồng thời bác sĩ và chuyên khoa
      final results = await Future.wait([
        _nhanVienRepo.getByChucVu('Bác sĩ'),
        _chuyenKhoaRepo.getAll(),
      ]);
      final entities = results[0] as List<NhanVienEntity>;
      final chuyenKhoaList = results[1] as List<ChuyenKhoaEntity>;
      final chuyenKhoaMap = {for (var e in chuyenKhoaList) e.maChuyenKhoa: e.tenChuyenKhoa};

      if (!mounted) return;

      // Fetch lịch phân công cho từng bác sĩ
      final schedulesByDoctor = <int, List<BangPhanCongCaLamEntity>>{};
      try {
        final allSchedules = await _phanCongRepo.getAll();
        for (final schedule in allSchedules) {
          if (schedule.maNhanVien != null) {
            schedulesByDoctor.putIfAbsent(schedule.maNhanVien!, () => []);
            schedulesByDoctor[schedule.maNhanVien!]!.add(schedule);
          }
        }
      } catch (e) {
        debugPrint('Lỗi tải lịch phân công: $e');
        // Không block nếu lỗi lịch, vẫn hiển thị bác sĩ
      }

      setState(() {
        _doctorEntities = entities;
        _chuyenKhoaEntities = chuyenKhoaList;
        _doctors = entities.map((e) {
          final tenChuyenKhoa = chuyenKhoaMap[e.chuyenKhoa] ?? '';
          return DoctorModel(
            id: e.maNhanVien,
            name: e.hoTen,
            title: e.chucVu ?? 'Bác sĩ',
            specialty: tenChuyenKhoa,
            chuyenKhoaId: e.chuyenKhoa,
            gioiTinh: e.gioiTinh,
            schedules: schedulesByDoctor[e.maNhanVien] ?? [],
          );
        }).toList();
        _isLoading = false;
      });
      if (_doctors.length > 2) _startAutoScroll();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
      debugPrint('Lỗi tải bác sĩ: $e');
    }
  }

  void _startAutoScroll() {
    Future.delayed(const Duration(seconds: 4), () {
      if (!mounted || !_controller.hasClients || _doctors.length <= 2) return;
      int nextPage = (_controller.page?.round() ?? 0) + 2;
      if (nextPage >= _doctors.length) nextPage = 0;
      _controller.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 800),
        curve: Curves.easeInOut,
      );
      _startAutoScroll();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const LoadingNotification(),
          SizedBox(
            height: 310,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              scrollDirection: Axis.horizontal,
              itemCount: 5,
              itemBuilder: (context, index) {
                return const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 6),
                  child: DoctorCardShimmer(),
                );
              },
            ),
          ),
        ],
      );
    }

    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 40),
              const SizedBox(height: 8),
              Text(
                'Không thể tải dữ liệu',
                style: TextStyle(color: Colors.grey[600], fontSize: 14),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _error = null;
                  });
                  _loadDoctors();
                },
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      );
    }

    if (_doctors.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'BÁC SĨ KHÁM BỆNH',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const AllDoctorsScreen(),
                    ),
                  );
                },
                child: const Text('Xem tất cả'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 330,
          child: PageView.builder(
            controller: _controller,
            itemCount: _doctors.length,
            padEnds: false,
            itemBuilder: (context, index) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: DoctorCardWidget(
                  doctor: _doctors[index],
                  onBookPressed: () async {
                    if (index < _doctorEntities.length) {
                      final loggedIn = await requireLogin(context);
                      if (!loggedIn || !context.mounted) return;

                      final bacSi = _doctorEntities[index];
                      // Tìm chuyên khoa tương ứng từ list
                      ChuyenKhoaEntity? chuyenKhoa;
                      if (bacSi.chuyenKhoa != null) {
                        try {
                          chuyenKhoa = _chuyenKhoaEntities.firstWhere(
                            (ck) => ck.maChuyenKhoa == bacSi.chuyenKhoa,
                          );
                        } catch (_) {}
                      }
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => AppointmentBookingScreen(
                            initialChuyenKhoa: chuyenKhoa,
                            initialBacSi: bacSi,
                          ),
                        ),
                      );
                    }
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}