package com.qlpk.backend.service.impl;

import com.qlpk.backend.dto.HoSoBenhNhanDTO;
import com.qlpk.backend.entity.*;
import com.qlpk.backend.repository.*;
import com.qlpk.backend.service.BenhNhanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BenhNhanServiceImpl implements BenhNhanService {

    @Autowired private BenhNhanRepository repository;
    @Autowired private PhieuKhamRepository phieuKhamRepository;
    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private NhanVienRepository nhanVienRepository;
    @Autowired private ChuyenKhoaRepository chuyenKhoaRepository;
    @Autowired private KhamLamSangRepository khamLamSangRepository;

    @Override
    public List<BenhNhan> getAll() {
        return repository.findAll();
    }

    @Override
    public BenhNhan getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public BenhNhan create(BenhNhan entity) throws Exception {
        if (entity.getSoDienThoai() != null && repository.existsBySoDienThoai(entity.getSoDienThoai())) {
            throw new Exception("Số điện thoại này đã được đăng ký cho bệnh nhân khác");
        }
        if (entity.getCccd() != null && !entity.getCccd().isBlank() && repository.existsByCccd(entity.getCccd())) {
            throw new Exception("Số CCCD này đã tồn tại trong hệ thống");
        }
        if (entity.getEmail() != null && !entity.getEmail().isBlank() && repository.existsByEmail(entity.getEmail())) {
            throw new Exception("Email này đã được sử dụng");
        }
        return repository.save(entity);
    }

    @Override
    public BenhNhan update(Integer id, BenhNhan body) {
        return repository.findById(id).map(existing -> {
            existing.setHoTen(body.getHoTen());
            existing.setNgaySinh(body.getNgaySinh());
            existing.setDiaChi(body.getDiaChi());
            existing.setSoDienThoai(body.getSoDienThoai());
            existing.setEmail(body.getEmail());
            existing.setNgheNghiep(body.getNgheNghiep());
            existing.setNhomMau(body.getNhomMau());
            existing.setDiUngThuoc(body.getDiUngThuoc());
            existing.setNguoiGiamHo(body.getNguoiGiamHo());
            existing.setSoDienThoaiNguoiGiamHo(body.getSoDienThoaiNguoiGiamHo());
            existing.setGhiChu(body.getGhiChu());
            existing.setCccd(body.getCccd());
            existing.setGioiTinh(body.getGioiTinh());
            return repository.save(existing);
        }).orElse(null);
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public List<BenhNhan> search(String keyword) {
        if (keyword == null || keyword.isBlank()) return repository.findAll();
        return repository.search(keyword);
    }

    @Override
    public List<HoSoBenhNhanDTO> getHoSo(Integer id) {
        List<PhieuKham> phieuKhams = phieuKhamRepository.findByMaBenhNhan(id);

        Map<Integer, String> nvMap = nhanVienRepository.findAll()
                .stream().collect(Collectors.toMap(NhanVien::getMaNhanVien, NhanVien::getHoTen, (a, b) -> a));

        Map<Integer, String> ckMap = chuyenKhoaRepository.findAll()
                .stream().collect(Collectors.toMap(ChuyenKhoa::getMaChuyenKhoa, ChuyenKhoa::getTenChuyenKhoa, (a, b) -> a));

        List<HoSoBenhNhanDTO> result = new ArrayList<>();

        for (PhieuKham pk : phieuKhams) {
            List<HoaDon> hoaDons = hoaDonRepository.findByMaPhieuKham(pk.getMaPhieuKham());
            HoaDon hoaDon = hoaDons.stream()
                    .filter(h -> "da thanh toan".equalsIgnoreCase(h.getTrangThai()))
                    .findFirst()
                    .orElse(hoaDons.isEmpty() ? null : hoaDons.get(0));

            HoSoBenhNhanDTO dto = new HoSoBenhNhanDTO();
            dto.setMaPhieuKham(pk.getMaPhieuKham());
            dto.setNgayKham(pk.getNgayKham());
            dto.setTrangThaiKham(pk.getTrangThai());
            dto.setGhiChuKham(pk.getGhiChu());
            dto.setTenChuyenKhoa(pk.getMaChuyenKhoa() != null ? ckMap.getOrDefault(pk.getMaChuyenKhoa(), "—") : "—");
            dto.setTenNhanVien(pk.getMaNhanVien() != null ? nvMap.getOrDefault(pk.getMaNhanVien(), "—") : "—");

            khamLamSangRepository.findByMaPhieuKham(pk.getMaPhieuKham()).ifPresent(kls -> {
                dto.setLyDoKham(kls.getLyDoKham());
                dto.setTienSuBanThan(kls.getTienSuBanThan());
                dto.setBenhSu(kls.getBenhSu());
                dto.setChanDoanSoBo(kls.getChanDoanSoBo());
                dto.setLoiDanBacSi(kls.getLoiDanBacSi());
                dto.setKetQuaCLS(kls.getKetQuaKhamCanLamSang());
                dto.setKhamLamSang(kls.getKhamLamSang());
            });

            if (hoaDon != null) {
                dto.setMaHoaDon(hoaDon.getMaHoaDon());
                dto.setTongTien(hoaDon.getTongTien());
                dto.setNgayThanhToan(hoaDon.getNgayThanhToan());
                dto.setTrangThaiHoaDon(hoaDon.getTrangThai());
                dto.setGhiChuHoaDon(hoaDon.getGhiChu());
            }
            result.add(dto);
        }
        return result;
    }
}