import 'package:flutter/material.dart';
import '../../../../data/entities/bang_phan_cong_ca_lam_entity.dart';
import '../../../../data/entities/chuyen_khoa_entity.dart';
import '../../../../data/entities/nhan_vien_entity.dart';
import '../../../../models/doctor_model.dart';
import '../../../../repositories/bang_phan_cong_repository.dart';
import '../../../../repositories/chuyen_khoa_repository.dart';
import '../../../../repositories/nhan_vien_repository.dart';
import 'doctor_detail_screen.dart';

class AllDoctorsScreen extends StatefulWidget {
  const AllDoctorsScreen({super.key});

  @override
  State<AllDoctorsScreen> createState() => _AllDoctorsScreenState();
}

class _AllDoctorsScreenState extends State<AllDoctorsScreen> {
  final NhanVienRepository _nhanVienRepo = NhanVienRepository();
  final ChuyenKhoaRepository _chuyenKhoaRepo = ChuyenKhoaRepository();
  final BangPhanCongRepository _phanCongRepo = BangPhanCongRepository();
  List<DoctorModel> _doctors = [];
  List<ChuyenKhoaEntity> _chuyenKhoaEntities = [];
  final TextEditingController _searchController = TextEditingController();
  int _selectedChuyenKhoa = 0; // 0 = Tất cả chuyên khoa
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  @override
  void dispose() {
    _searchController.dispose();
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
      final chuyenKhoaMap = {
        for (var e in chuyenKhoaList) e.maChuyenKhoa: e.tenChuyenKhoa
      };

      if (!mounted) return;

      // Fetch lịch phân công cho các bác sĩ
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
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
      debugPrint('Lỗi tải bác sĩ: $e');
    }
  }

  List<DoctorModel> get _filteredDoctors {
    final keyword = _searchController.text.trim().toLowerCase();
    return _doctors.where((d) {
      final matchKeyword = keyword.isEmpty ||
          d.name.toLowerCase().contains(keyword) ||
          d.specialty.toLowerCase().contains(keyword);
      final matchChuyenKhoa =
          _selectedChuyenKhoa == 0 || d.chuyenKhoaId == _selectedChuyenKhoa;
      return matchKeyword && matchChuyenKhoa;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Tất cả bác sĩ',
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
              const Text(
                'Không thể tải dữ liệu',
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
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

    if (_doctors.isEmpty) {
      return const Center(
        child: Text(
          'Chưa có bác sĩ nào',
          style: TextStyle(color: Colors.grey, fontSize: 15),
        ),
      );
    }

    final doctors = _filteredDoctors;

    return Column(
      children: [
        // Thanh tìm kiếm
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 4),
          child: TextField(
            controller: _searchController,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Tìm bác sĩ hoặc chuyên khoa...',
              hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
              prefixIcon: const Icon(Icons.search, color: Colors.grey),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, color: Colors.grey),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {});
                      },
                    )
                  : null,
              filled: true,
              fillColor: Colors.white,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),
        // Bộ lọc chuyên khoa dạng dropdown
        if (_chuyenKhoaEntities.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 4, 14, 0),
            child: DropdownButtonFormField<int>(
              key: ValueKey(_selectedChuyenKhoa),
              initialValue: _selectedChuyenKhoa,
              isExpanded: true,
              decoration: InputDecoration(
                labelText: 'Chuyên khoa',
                prefixIcon: const Icon(
                  Icons.filter_list,
                  size: 20,
                  color: Colors.blue,
                ),
                filled: true,
                fillColor: Colors.white,
                isDense: true,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              items: [
                const DropdownMenuItem<int>(
                  value: 0,
                  child: Text('Tất cả chuyên khoa'),
                ),
                ..._chuyenKhoaEntities.map(
                  (ck) => DropdownMenuItem<int>(
                    value: ck.maChuyenKhoa,
                    child: Text(
                      ck.tenChuyenKhoa,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
              ],
              onChanged: (value) {
                setState(() {
                  _selectedChuyenKhoa = value ?? 0;
                });
              },
            ),
          ),
        // Danh sách bác sĩ
        Expanded(
          child: doctors.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.search_off, size: 48, color: Colors.grey[400]),
                      const SizedBox(height: 8),
                      const Text(
                        'Không tìm thấy bác sĩ phù hợp',
                        style: TextStyle(color: Colors.grey, fontSize: 14),
                      ),
                    ],
                  ),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(14),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.82,
                  ),
                  itemCount: doctors.length,
                  itemBuilder: (context, index) =>
                      _buildDoctorCard(doctors[index]),
                ),
        ),
      ],
    );
  }

  Widget _buildDoctorCard(DoctorModel doctor) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => DoctorDetailScreen(doctorId: doctor.id),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Avatar
                ClipOval(
                  child: Image.asset(
                    _getAvatarAsset(doctor.gioiTinh),
                    width: 64,
                    height: 64,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return CircleAvatar(
                        radius: 32,
                        backgroundColor: Colors.blue.withValues(alpha: 0.1),
                        child: Text(
                          doctor.name.isNotEmpty
                              ? doctor.name[0].toUpperCase()
                              : '?',
                          style: const TextStyle(
                            color: Colors.blue,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 10),
                // Tên bác sĩ
                Text(
                  doctor.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A2B4E),
                  ),
                ),
                const SizedBox(height: 4),
                // Chuyên khoa
                Text(
                  doctor.specialty.isNotEmpty
                      ? doctor.specialty
                      : (doctor.title.isNotEmpty ? doctor.title : 'Bác sĩ'),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.blue,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Lấy asset avatar dựa trên giới tính (1 = Nam, null = mặc định female, khác = Nữ)
  String _getAvatarAsset(int? gioiTinh) {
    return gioiTinh == 1
        ? 'assets/images/employee/doctor male.png'
        : 'assets/images/employee/doctor female.png';
  }
}