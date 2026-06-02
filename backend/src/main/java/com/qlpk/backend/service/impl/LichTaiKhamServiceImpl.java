package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.LichTaiKham;
import com.qlpk.backend.repository.BenhNhanRepository;
import com.qlpk.backend.repository.ChuyenKhoaRepository;
import com.qlpk.backend.repository.LichTaiKhamRepository;
import com.qlpk.backend.repository.NhanVienRepository;
import com.qlpk.backend.service.LichTaiKhamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LichTaiKhamServiceImpl implements LichTaiKhamService {

    @Autowired
    private LichTaiKhamRepository repository;

    @Autowired private BenhNhanRepository benhNhanRepository;
    @Autowired private NhanVienRepository nhanVienRepository;
    @Autowired private ChuyenKhoaRepository chuyenKhoaRepository;

    @Override
    public List<LichTaiKham> getAll() {
        return repository.findAll();
    }

    @Override
    public LichTaiKham getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public LichTaiKham create(LichTaiKham entity) {
        return repository.save(entity);
    }

    @Override
    public LichTaiKham update(Integer id, LichTaiKham entity) {
        if (repository.existsById(id)) {
            return repository.save(entity);
        }
        return null;
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public List<Map<String, Object>> getAllDetailed() {
        try {
            List<LichTaiKham> list = repository.findAll();
            
            Map<Integer, String> benhNhanMap = new HashMap<>();
            benhNhanRepository.findAll().forEach(b -> {
                if (b.getMaBenhNhan() != null) benhNhanMap.put(b.getMaBenhNhan(), b.getHoTen());
            });

            Map<Integer, String> nhanVienMap = new HashMap<>();
            nhanVienRepository.findAll().forEach(n -> {
                if (n.getMaNhanVien() != null) nhanVienMap.put(n.getMaNhanVien(), n.getHoTen());
            });

            Map<Integer, String> khoaMap = new HashMap<>();
            chuyenKhoaRepository.findAll().forEach(k -> {
                if (k.getMaChuyenKhoa() != null) khoaMap.put(k.getMaChuyenKhoa(), k.getTenChuyenKhoa());
            });

            return list.stream().map(l -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", l.getId());
                map.put("maBenhNhan", l.getMaBenhNhan());
                map.put("tenBenhNhan", benhNhanMap.getOrDefault(l.getMaBenhNhan(), "Bệnh nhân #" + l.getMaBenhNhan()));
                map.put("maChuyenKhoa", l.getMaChuyenKhoa());
                map.put("tenChuyenKhoa", khoaMap.getOrDefault(l.getMaChuyenKhoa(), "Khoa #" + l.getMaChuyenKhoa()));
                map.put("maNhanVien", l.getMaNhanVien());
                map.put("tenNhanVien", nhanVienMap.getOrDefault(l.getMaNhanVien(), "Bác sĩ #" + l.getMaNhanVien()));
                map.put("ngayTaiKham", l.getNgayTaiKham());
                map.put("trangThai", l.getTrangThai());
                map.put("ghiChu", l.getGhiChu());
                map.put("daGuiThongBao", l.getDaGuiThongBao());
                return map;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public LichTaiKham updateAppointment(Integer id, LichTaiKham updated) {
        return repository.findById(id).map(l -> {
            l.setNgayTaiKham(updated.getNgayTaiKham());
            l.setTrangThai(updated.getTrangThai());
            l.setGhiChu(updated.getGhiChu());
            return repository.save(l);
        }).orElse(null);
    }
}