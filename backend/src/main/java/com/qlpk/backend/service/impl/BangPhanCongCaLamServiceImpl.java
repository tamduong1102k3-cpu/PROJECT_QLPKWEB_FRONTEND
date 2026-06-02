package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.BangPhanCongCaLam;
import com.qlpk.backend.repository.BangPhanCongCaLamRepository;
import com.qlpk.backend.service.BangPhanCongCaLamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;

@Service
public class BangPhanCongCaLamServiceImpl implements BangPhanCongCaLamService {

    @Autowired
    private BangPhanCongCaLamRepository repository;

    @Override
    public List<BangPhanCongCaLam> getAll() {
        return repository.findAll();
    }

    @Override
    public BangPhanCongCaLam getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public BangPhanCongCaLam create(BangPhanCongCaLam entity) {
        return repository.save(entity);
    }

    @Override
    public BangPhanCongCaLam update(Integer id, BangPhanCongCaLam entity) {
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
    public List<BangPhanCongCaLam> getWorkingToday() {
        String today = getVietnameseDayOfWeek();
        return repository.findByThu(today);
    }

    private String getVietnameseDayOfWeek() {
        java.time.DayOfWeek day = java.time.LocalDate.now().getDayOfWeek();
        switch (day) {
            case MONDAY:    return "Thứ 2";
            case TUESDAY:   return "Thứ 3";
            case WEDNESDAY: return "Thứ 4";
            case THURSDAY:  return "Thứ 5";
            case FRIDAY:    return "Thứ 6";
            case SATURDAY:  return "Thứ 7";
            case SUNDAY:    return "Chủ Nhật";
            default:        return "";
        }
    }

    @Override
    public Map<String, String> getCurrentRoom(Integer maNhanVien) {
        // Thay vì dùng FULL display name (Thứ Hai), hãy dùng hàm helper bên dưới để khớp "Thứ 2"
        String dayOfWeek = getVietnameseDayOfWeek(); 
        
        List<BangPhanCongCaLam> shifts = repository.findByMaNhanVien(maNhanVien);
        LocalTime now = LocalTime.now();

        BangPhanCongCaLam activeShift = shifts.stream()
                .filter(s -> s.getThu().equalsIgnoreCase(dayOfWeek))
                .filter(s -> {
                    LocalTime start = s.getGioLam();
                    LocalTime end = s.getGioKetThuc();
                    if (start == null || end == null) return false;
                    return (now.isAfter(start) || now.equals(start)) && (now.isBefore(end) || now.equals(end));
                })
                .findFirst()
                .orElse(null);

        Map<String, String> response = new HashMap<>();
        response.put("phong", activeShift != null ? activeShift.getPhong() : "Chưa có lịch trực");
        return response;
    }
}