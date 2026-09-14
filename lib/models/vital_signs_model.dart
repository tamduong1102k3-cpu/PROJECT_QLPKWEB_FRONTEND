class VitalSignsModel {
  final double? nhietDo;
  final int? nhipTim;
  final int? nhipTho;
  final double? canNang;
  final double? chieuCao;

  VitalSignsModel({
    this.nhietDo,
    this.nhipTim,
    this.nhipTho,
    this.canNang,
    this.chieuCao,
  });

  factory VitalSignsModel.fromJson(Map<String, dynamic> json) {
    return VitalSignsModel(
      nhietDo: (json['nhietDo'] as num?)?.toDouble(),
      nhipTim: (json['nhipTim'] as num?)?.toInt(),
      nhipTho: (json['nhipTho'] as num?)?.toInt(),
      canNang: (json['canNang'] as num?)?.toDouble(),
      chieuCao: (json['chieuCao'] as num?)?.toDouble(),
    );
  }
}