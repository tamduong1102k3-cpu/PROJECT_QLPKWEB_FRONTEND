class DanhMucBenhLyEntity {
  final int id;
  final String maIcd;
  final String tenBenh;
  final String? trieuChungGoiY;
  final int? chuyenKhoaLienQuan;

  DanhMucBenhLyEntity({
    required this.id,
    required this.maIcd,
    required this.tenBenh,
    this.trieuChungGoiY,
    this.chuyenKhoaLienQuan,
  });

  factory DanhMucBenhLyEntity.fromJson(Map<String, dynamic> json) {
    return DanhMucBenhLyEntity(
      id: json['id'] as int,
      maIcd: json['maIcd'] as String,
      tenBenh: json['tenBenh'] as String,
      trieuChungGoiY: json['trieuChungGoiY'] as String?,
      chuyenKhoaLienQuan: json['chuyenKhoaLienQuan'] != null
          ? (json['chuyenKhoaLienQuan'] is Map
              ? (json['chuyenKhoaLienQuan']['maChuyenKhoa'] as int?)
              : json['chuyenKhoaLienQuan'] as int?)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'maIcd': maIcd,
      'tenBenh': tenBenh,
      'trieuChungGoiY': trieuChungGoiY,
      'chuyenKhoaLienQuan': chuyenKhoaLienQuan,
    };
  }
}