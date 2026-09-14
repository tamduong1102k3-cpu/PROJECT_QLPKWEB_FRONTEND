class ProfileHelpers {
  ProfileHelpers._();

  /// Format gender from dynamic to "Nam"/"Nữ"
  static String mapGender(dynamic gender) {
    if (gender == null) return '';
    if (gender is bool) return gender ? 'Nam' : 'Nữ';

    final gStr = gender.toString().trim().toLowerCase();
    if (gStr == 'true' || gStr == '1' || gStr == 'nam' || gStr == 'm' || gStr == 'male') {
      return 'Nam';
    }
    if (gStr == 'false' || gStr == '0' || gStr == 'nữ' || gStr == 'nu' || gStr == 'f' || gStr == 'female') {
      return 'Nữ';
    }
    return gender.toString();
  }

  /// Format date from yyyy-MM-dd to dd/MM/yyyy
  static String formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final parts = dateStr.split(RegExp(r'[-/]'));
      if (parts.length >= 3) {
        if (parts[0].length == 4) {
          return '${parts[2].padLeft(2, '0')}/${parts[1].padLeft(2, '0')}/${parts[0]}';
        }
        return '${parts[0].padLeft(2, '0')}/${parts[1].padLeft(2, '0')}/${parts[2]}';
      }
    } catch (_) {}
    return dateStr;
  }

  /// Get patient name from profile data
  static String getPatientName(Map<String, dynamic>? profile) {
    if (profile == null) return '';
    final name = profile['tenBenhNhan']?.toString() ?? profile['hoTen']?.toString() ?? '';
    return name.trim();
  }

  /// Get profile string value by key
  static String? getProfileValue(Map<String, dynamic>? profile, String key) {
    final value = profile?[key];
    if (value == null) return null;
    if (value is String) return value;
    return value.toString();
  }

  /// Get profile int value by key
  static int? getProfileInt(Map<String, dynamic>? profile, String key) {
    final value = profile?[key];
    if (value == null) return null;
    if (value is int) return value;
    return int.tryParse(value.toString());
  }
}