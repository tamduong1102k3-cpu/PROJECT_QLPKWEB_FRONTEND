import '../data/entities/chuyen_khoa_entity.dart';
import '../data/entities/dich_vu_entity.dart';
import '../data/entities/nhan_vien_entity.dart';
import 'chuyen_khoa_repository.dart';
import 'dich_vu_repository.dart';
import 'nhan_vien_repository.dart';

class SearchResult {
  final List<DoctorSearchItem> doctors;
  final List<SpecialtySearchItem> specialties;
  final List<ServiceSearchItem> services;

  SearchResult({
    required this.doctors,
    required this.specialties,
    required this.services,
  });

  bool get isEmpty => doctors.isEmpty && specialties.isEmpty && services.isEmpty;
  bool get isNotEmpty => !isEmpty;
  int get totalCount => doctors.length + specialties.length + services.length;
}

class DoctorSearchItem {
  final int id;
  final String name;
  final String title;
  final String specialty;
  final int? chuyenKhoaId;
  final int? gioiTinh;

  DoctorSearchItem({
    required this.id,
    required this.name,
    required this.title,
    required this.specialty,
    this.chuyenKhoaId,
    this.gioiTinh,
  });
}

class SpecialtySearchItem {
  final int id;
  final String name;
  final String? description;

  SpecialtySearchItem({
    required this.id,
    required this.name,
    this.description,
  });
}

class ServiceSearchItem {
  final int id;
  final String name;
  final String donGiaStr;
  final double donGia;
  final String? loaiDichVu;
  final String tenChuyenKhoa;

  ServiceSearchItem({
    required this.id,
    required this.name,
    required this.donGiaStr,
    required this.donGia,
    this.loaiDichVu,
    this.tenChuyenKhoa = '',
  });
}

class SearchRepository {
  final ChuyenKhoaRepository _chuyenKhoaRepo = ChuyenKhoaRepository();
  final DichVuRepository _dichVuRepo = DichVuRepository();
  final NhanVienRepository _nhanVienRepo = NhanVienRepository();

  List<DoctorSearchItem> _allDoctors = [];
  List<SpecialtySearchItem> _allSpecialties = [];
  List<ServiceSearchItem> _allServices = [];
  bool _isLoaded = false;

  /// Load tất cả dữ liệu cần thiết cho tìm kiếm
  Future<void> loadAllData() async {
    try {
      final results = await Future.wait([
        _nhanVienRepo.getByChucVu('Bác sĩ'),
        _chuyenKhoaRepo.getAll(),
        _dichVuRepo.getAll(),
      ]);

      final nhanVienEntities = results[0] as List<NhanVienEntity>;
      final chuyenKhoaEntities = results[1] as List<ChuyenKhoaEntity>;
      final dichVuEntities = results[2] as List<DichVuEntity>;

      final chuyenKhoaMap = {
        for (var e in chuyenKhoaEntities) e.maChuyenKhoa: e.tenChuyenKhoa
      };

      _allDoctors = nhanVienEntities.map((e) {
        return DoctorSearchItem(
          id: e.maNhanVien,
          name: e.hoTen,
          title: e.chucVu ?? 'Bác sĩ',
          specialty: chuyenKhoaMap[e.chuyenKhoa] ?? '',
          chuyenKhoaId: e.chuyenKhoa,
          gioiTinh: e.gioiTinh,
        );
      }).toList();

      _allSpecialties = chuyenKhoaEntities.map((e) {
        return SpecialtySearchItem(
          id: e.maChuyenKhoa,
          name: e.tenChuyenKhoa,
          description: e.moTa,
        );
      }).toList();

      _allServices = dichVuEntities.map((e) {
        return ServiceSearchItem(
          id: e.maDichVu,
          name: e.tenDichVu,
          donGiaStr: _formatDonGia(e.donGia),
          donGia: e.donGia,
          loaiDichVu: e.loaiDichVu,
          tenChuyenKhoa: chuyenKhoaMap[e.maChuyenKhoa] ?? '',
        );
      }).toList();

      _isLoaded = true;
    } catch (e) {
      _isLoaded = false;
      rethrow;
    }
  }

  bool get isLoaded => _isLoaded;

  /// Tìm kiếm theo từ khóa trên tất cả các danh mục
  SearchResult search(String keyword) {
    if (keyword.trim().isEmpty) {
      return SearchResult(
        doctors: _allDoctors,
        specialties: _allSpecialties,
        services: _allServices,
      );
    }

    final query = keyword.trim().toLowerCase();
    final queryWords = query.split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();

    // Tìm bác sĩ
    final matchedDoctors = _allDoctors.where((doctor) {
      return _matchesAnyWord(doctor.name, queryWords) ||
          _matchesAnyWord(doctor.specialty, queryWords) ||
          _matchesAnyWord(doctor.title, queryWords);
    }).toList();

    // Tìm chuyên khoa
    final matchedSpecialties = _allSpecialties.where((specialty) {
      return _matchesAnyWord(specialty.name, queryWords) ||
          (specialty.description != null &&
              _matchesAnyWord(specialty.description!, queryWords));
    }).toList();

    // Tìm dịch vụ
    final matchedServices = _allServices.where((service) {
      return _matchesAnyWord(service.name, queryWords) ||
          _matchesAnyWord(service.tenChuyenKhoa, queryWords);
    }).toList();

    return SearchResult(
      doctors: matchedDoctors,
      specialties: matchedSpecialties,
      services: matchedServices,
    );
  }

  /// Kiểm tra nếu text khớp với bất kỳ từ nào trong danh sách
  bool _matchesAnyWord(String text, List<String> words) {
    final lowerText = text.toLowerCase();
    return words.any((word) => lowerText.contains(word));
  }

  String _formatDonGia(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (match) => '${match[1]}.',
    )}đ';
  }
}