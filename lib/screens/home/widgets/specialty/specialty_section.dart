import 'package:flutter/material.dart';
import '../../../../data/entities/chuyen_khoa_entity.dart';
import '../../../../models/service_item_model.dart';
import '../../../../repositories/chuyen_khoa_repository.dart';
import '../../../../widgets/shimmer_loading.dart';
import '../service/service_item_widget.dart';
import 'specialty_detail_screen.dart';

class SpecialtySection extends StatefulWidget {
  final void Function(Map<int, String> chuyenKhoaMap)? onChuyenKhoaLoaded;

  const SpecialtySection({super.key, this.onChuyenKhoaLoaded});

  @override
  State<SpecialtySection> createState() => _SpecialtySectionState();
}

class _SpecialtySectionState extends State<SpecialtySection> {
  final ChuyenKhoaRepository _chuyenKhoaRepo = ChuyenKhoaRepository();
  List<ServiceItemModel> _services = [];
  List<ChuyenKhoaEntity> _chuyenKhoaEntities = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final entities = await _chuyenKhoaRepo.getAll();
      final chuyenKhoaMap = {for (var e in entities) e.maChuyenKhoa: e.tenChuyenKhoa};
      if (!mounted) return;
      setState(() {
        _chuyenKhoaEntities = entities;
        _services = entities.asMap().entries.map((entry) {
          return ServiceItemModel.fromEntity(entry.value, entry.key);
        }).toList();
        _isLoading = false;
        _error = null;
      });
      widget.onChuyenKhoaLoaded?.call(chuyenKhoaMap);
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
    if (_isLoading) {
      return const Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          LoadingNotification(),
          SpecialtyCarouselShimmer(),
        ],
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 40),
              const SizedBox(height: 8),
              Text(
                'Không thể tải dữ liệu',
                style: TextStyle(color: Colors.grey[600]),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _error = null;
                  });
                  _loadData();
                },
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      );
    }

    if (_services.isEmpty) {
      return const SizedBox.shrink();
    }

    return _buildCarousel();
  }

  Widget _buildCarousel() {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: SpecialtyCarouselWidget(
        services: _services,
        chuyenKhoaEntities: _chuyenKhoaEntities,
      ),
    );
  }
}

class SpecialtyCarouselWidget extends StatefulWidget {
  final List<ServiceItemModel> services;
  final List<ChuyenKhoaEntity> chuyenKhoaEntities;

  const SpecialtyCarouselWidget({
    super.key,
    required this.services,
    required this.chuyenKhoaEntities,
  });

  @override
  State<SpecialtyCarouselWidget> createState() => _SpecialtyCarouselWidgetState();
}

class _SpecialtyCarouselWidgetState extends State<SpecialtyCarouselWidget> {
  late PageController _pageController;
  int _currentPage = 0;
  late int _totalPages;

  static const int itemsPerPage = 8;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _totalPages = _calculateTotalPages();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  int _calculateTotalPages() {
    if (widget.services.isEmpty) return 1;
    return (widget.services.length / itemsPerPage).ceil();
  }

  /// Tìm ChuyenKhoaEntity theo index trong danh sách service
  ChuyenKhoaEntity? _getChuyenKhoaEntity(int serviceIndex) {
    if (serviceIndex < widget.chuyenKhoaEntities.length) {
      return widget.chuyenKhoaEntities[serviceIndex];
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: 280,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (page) {
              setState(() => _currentPage = page);
            },
            itemCount: _totalPages,
            itemBuilder: (context, pageIndex) {
              final startIndex = pageIndex * itemsPerPage;
              final endIndex = (startIndex + itemsPerPage > widget.services.length)
                  ? widget.services.length
                  : startIndex + itemsPerPage;
              final pageItems = widget.services.sublist(startIndex, endIndex);

              return Padding(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                child: GridView.builder(
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.9,
                  ),
                  itemCount: pageItems.length,
                  itemBuilder: (context, index) {
                    final serviceIndex = startIndex + index;
                    return ServiceItemWidget(
                      service: pageItems[index],
                      onTap: () {
                        final chuyenKhoaEntity = _getChuyenKhoaEntity(serviceIndex);
                        if (chuyenKhoaEntity != null) {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => SpecialtyDetailScreen(
                                specialty: chuyenKhoaEntity,
                              ),
                            ),
                          );
                        }
                      },
                    );
                  },
                ),
              );
            },
          ),
        ),
        if (_totalPages > 1)
          Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_totalPages, (index) {
                final isActive = index == _currentPage;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isActive ? 20 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isActive ? const Color(0xFF2196F3) : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
          ),
      ],
    );
  }
}