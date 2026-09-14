import 'package:flutter/material.dart';
import '../../providers/benh_nhan_provider.dart';
import '../../services/patient_service.dart';
import '../../widgets/shimmer_loading.dart';
import '../patient/search_patient_screen.dart';
import '../patient/create_patient_screen.dart';

// Component imports
import 'profile_constants.dart';
import 'widgets/mandatory_selection.dart';
import 'widgets/profile_header.dart';
import 'widgets/patient_info_section.dart';
import 'widgets/vital_signs_section.dart';
import 'widgets/profile_error_view.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _patientService = PatientService();
  bool _isLoading = true;
  bool _hasProfile = false;

  late final BenhNhanProvider _provider;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    _provider = BenhNhanProvider();
    await _checkProfileStatus();
  }

  Future<void> _checkProfileStatus() async {
    setState(() => _isLoading = true);
    final hasProfile = await _patientService.checkHasProfile();
    if (mounted) {
      setState(() {
        _hasProfile = hasProfile;
        _isLoading = false;
      });
      if (hasProfile) {
        _loadPatientData();
      }
    }
  }

  Future<void> _loadPatientData() async {
    await Future.wait([
      _provider.loadProfile(),
      _provider.loadVitalSigns(),
    ]);
    if (mounted) {
      setState(() {});
    }
  }

  Future<void> _refresh() async {
    await _checkProfileStatus();
  }

  Future<void> _navigateToSearch() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => SearchPatientScreen(
          onLinked: () => Navigator.of(context).pop(true),
        ),
      ),
    );
    if (result == true) _checkProfileStatus();
  }

  Future<void> _navigateToCreate() async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => CreatePatientScreen(
          onCreated: () => Navigator.of(context).pop(true),
        ),
      ),
    );
    if (result == true) _checkProfileStatus();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: ProfileColors.scaffoldBackground,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (!_hasProfile) {
      return Scaffold(
        backgroundColor: ProfileColors.scaffoldBackground,
        body: RefreshIndicator(
          onRefresh: _refresh,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: SizedBox(
              height: MediaQuery.of(context).size.height,
              child: MandatorySelection(
                onSearch: _navigateToSearch,
                onCreate: _navigateToCreate,
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: ProfileColors.scaffoldBackground,
      appBar: AppBar(
        title: const Text(
          'Hồ sơ bệnh nhân',
          style: TextStyle(fontWeight: FontWeight.w600, color: ProfileColors.foreground, fontSize: 18),
        ),
        centerTitle: true,
        backgroundColor: ProfileColors.card,
        foregroundColor: ProfileColors.foreground,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: ProfileColors.border, height: 1.0),
        ),
        iconTheme: const IconThemeData(color: ProfileColors.foreground),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: ProfileColors.foreground),
            onPressed: _refresh,
          ),
        ],
      ),
      body: _provider.isLoadingProfile
          ? const ShimmerLoading()
          : _provider.profileError != null
              ? ProfileErrorView(
                  errorMessage: _provider.profileError,
                  onRetry: _refresh,
                )
              : RefreshIndicator(
                  onRefresh: _refresh,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      children: [
                        ProfileHeader(profile: _provider.profile),
                        const SizedBox(height: 16),
                        PatientInfoSection(profile: _provider.profile),
                        const SizedBox(height: 16),
                        VitalSignsSection(
                          profile: _provider.profile,
                          vitalSigns: _provider.vitalSigns,
                          isLoading: _provider.isLoadingVitalSigns,
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
    );
  }
}