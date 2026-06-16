package com.qlpk.backend.service.impl;

import com.qlpk.backend.entity.*;
import com.qlpk.backend.payment.entity.GiaoDichThanhToan;
import com.qlpk.backend.payment.repository.GiaoDichThanhToanRepository;
import com.qlpk.backend.repository.*;
import com.qlpk.backend.service.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class HoaDonServiceImpl implements HoaDonService {

    @Autowired
    private HoaDonRepository repository;

    @Autowired
    private ChiTietHoaDonRepository chiTietRepository;

    @Autowired
    private PhieuKhamRepository phieuKhamRepository;

    @Autowired
    private PhieuChiDinhRepository phieuChiDinhRepository;

    @Autowired
    private ChiTietChiDinhRepository chiTietChiDinhRepository;

    @Autowired
    private ToaThuocRepository toaThuocRepository;

    @Autowired
    private ChiTietToaThuocRepository chiTietToaThuocRepository;

    @Autowired
    private DichVuRepository dichVuRepository;

    @Autowired
    private ThuocRepository thuocRepository;

    @Autowired
    private GiaoDichThanhToanRepository giaoDichRepository;

    @Autowired
    private DangKyKhamBenhRepository dangKyRepository;

    @Override
    public List<HoaDon> getAll() {
        return repository.findAll();
    }

    @Override
    public HoaDon getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public HoaDon create(HoaDon entity) {
        return repository.save(entity);
    }

    @Override
    public HoaDon update(Integer id, HoaDon entity) {
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
    @Transactional
    public HoaDon thanhToan(Integer maHoaDon, Integer maNhanVien, String phuongThuc, BigDecimal soTienNhan, String maGiaoDich) {
        HoaDon hoaDon = repository.findById(maHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với mã: " + maHoaDon));

        if ("da thanh toan".equalsIgnoreCase(hoaDon.getTrangThai())) {
            throw new RuntimeException("Hóa đơn #" + maHoaDon + " đã được thanh toán trước đó!");
        }

        if ("huy".equalsIgnoreCase(hoaDon.getTrangThai())) {
            throw new RuntimeException("Hóa đơn #" + maHoaDon + " đã bị hủy!");
        }

        if (soTienNhan != null && soTienNhan.compareTo(hoaDon.getTongTien()) < 0) {
            throw new RuntimeException("Số tiền nhận (" + soTienNhan + ") không đủ để thanh toán (" + hoaDon.getTongTien() + ")");
        }

        hoaDon.setTrangThai("da thanh toan");
        hoaDon.setNgayThanhToan(LocalDateTime.now());
        hoaDon.setPhuongThucThanhToan(phuongThuc);
        hoaDon.setMaGiaoDich(maGiaoDich);
        if (maNhanVien != null) {
            hoaDon.setMaNhanVien(maNhanVien);
        }

        HoaDon saved = repository.save(hoaDon);

        // Ghi vào bảng giao_dich_thanh_toan
        GiaoDichThanhToan giaoDich = new GiaoDichThanhToan();
        giaoDich.setMaHoaDon(maHoaDon);
        giaoDich.setProvider(phuongThuc != null ? phuongThuc.toUpperCase() : "OTHER");
        giaoDich.setOrderId("INVOICE_" + maHoaDon);
        giaoDich.setTransId(maGiaoDich != null ? maGiaoDich : "MANUAL_" + System.currentTimeMillis());
        giaoDich.setSoTien(hoaDon.getTongTien());
        giaoDich.setTrangThai("da thanh toan");
        giaoDich.setCreatedAt(LocalDateTime.now());
        giaoDichRepository.save(giaoDich);

        // Sau khi thanh toán xong, nếu hóa đơn có chi tiết là THUOC
        // thì cập nhật trang_thai toa thuốc thành CHO_CAP_THUOC
        if (hoaDon.getMaPhieuKham() != null) {
            List<ChiTietHoaDon> ctList = chiTietRepository.findByMaHoaDon(maHoaDon);
            boolean hasThuoc = ctList.stream().anyMatch(ct -> "THUOC".equalsIgnoreCase(ct.getLoaiMuc()));
            if (hasThuoc) {
                toaThuocRepository.updateTrangThaiChoCapThuocByPhieuKham(hoaDon.getMaPhieuKham());
            }
        }

        return saved;
    }

    @Override
    public Map<String, Object> getBillingItems(Integer maPhieuKham) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> services = new ArrayList<>();
        List<Map<String, Object>> medicines = new ArrayList<>();
        BigDecimal tongDichVu = BigDecimal.ZERO;
        BigDecimal tongThuoc = BigDecimal.ZERO;

        // 1. Lấy dịch vụ khám chính
        PhieuKham pk = phieuKhamRepository.findById(maPhieuKham).orElse(null);
        Integer maDichVuKham = null;
        if (pk != null && pk.getMaDichVu() != null) {
            maDichVuKham = pk.getMaDichVu();
        } else {
            // Tìm trong DangKyKhamBenh.ghiChu (format: "[Dịch vụ ID: X]")
            var dkOpt = dangKyRepository.findByMaPhieuKham(maPhieuKham);
            if (dkOpt.isPresent() && dkOpt.get().getGhiChu() != null) {
                String ghiChu = dkOpt.get().getGhiChu();
                if (ghiChu.contains("[Dịch vụ ID:")) {
                    try {
                        String idStr = ghiChu.substring(ghiChu.indexOf("[Dịch vụ ID:") + 12, ghiChu.indexOf("]", ghiChu.indexOf("[Dịch vụ ID:")));
                        maDichVuKham = Integer.parseInt(idStr.trim());
                    } catch (Exception ignore) {}
                }
            }
        }
        if (maDichVuKham != null) {
            DichVu dv = dichVuRepository.findById(maDichVuKham).orElse(null);
            if (dv != null) {
                BigDecimal donGia = dv.getDonGia() != null ? dv.getDonGia() : BigDecimal.ZERO;
                int soLuong = 1;
                BigDecimal thanhTien = donGia.multiply(BigDecimal.valueOf(soLuong));
                tongDichVu = tongDichVu.add(thanhTien);

                Map<String, Object> item = new HashMap<>();
                item.put("idGoc", maDichVuKham);
                item.put("noiDung", dv.getTenDichVu() + " (Khám)");
                item.put("loaiMuc", "DICH_VU");
                item.put("soLuong", soLuong);
                item.put("donGia", donGia);
                item.put("thanhTien", thanhTien);
                services.add(item);
            }
        }

        // 2. Lấy dịch vụ từ ChiTietChiDinh (cận lâm sàng, xét nghiệm, ...)
        List<PhieuChiDinh> pcdList = phieuChiDinhRepository.findByMaPhieuKham(maPhieuKham);
        for (PhieuChiDinh pcd : pcdList) {
            List<ChiTietChiDinh> details = chiTietChiDinhRepository.findByMaPhieuChiDinh(pcd.getMaPhieuChiDinh());
            if (details == null) continue;
            for (ChiTietChiDinh ct : details) {
                String tenDv = "Dịch vụ #" + ct.getMaDichVu();
                DichVu dv = dichVuRepository.findById(ct.getMaDichVu()).orElse(null);
                if (dv != null) tenDv = dv.getTenDichVu();
                
                BigDecimal donGia = ct.getDonGia() != null ? BigDecimal.valueOf(ct.getDonGia()) : BigDecimal.ZERO;
                int soLuong = ct.getSoLuong() != null ? ct.getSoLuong() : 1;
                BigDecimal thanhTien = donGia.multiply(BigDecimal.valueOf(soLuong));
                tongDichVu = tongDichVu.add(thanhTien);

                Map<String, Object> item = new HashMap<>();
                item.put("idGoc", ct.getId());
                item.put("noiDung", tenDv);
                item.put("loaiMuc", "DICH_VU");
                item.put("soLuong", soLuong);
                item.put("donGia", donGia);
                item.put("thanhTien", thanhTien);
                services.add(item);
            }
        }

        // 2. Lấy thuốc từ ToaThuoc + ChiTietToaThuoc
        List<ToaThuoc> toaThuocList = toaThuocRepository.findByMaPhieuKham(maPhieuKham);
        for (ToaThuoc toa : toaThuocList) {
            List<ChiTietToaThuoc> details = chiTietToaThuocRepository.findByMaToaThuoc(toa.getMaToaThuoc());
            if (details == null) continue;
            for (ChiTietToaThuoc ct : details) {
                String tenThuoc = "Thuốc #" + ct.getMaThuoc();
                BigDecimal donGiaBan = BigDecimal.ZERO;
                Thuoc thuoc = thuocRepository.findById(ct.getMaThuoc()).orElse(null);
                if (thuoc != null) {
                    tenThuoc = thuoc.getTenThuoc();
                    donGiaBan = thuoc.getDonGiaBan() != null ? thuoc.getDonGiaBan() : BigDecimal.ZERO;
                }

                int soLuong = 1; // Mặc định 1 đơn vị
                BigDecimal thanhTien = donGiaBan.multiply(BigDecimal.valueOf(soLuong));
                tongThuoc = tongThuoc.add(thanhTien);

                Map<String, Object> item = new HashMap<>();
                item.put("idGoc", ct.getId());
                item.put("noiDung", tenThuoc);
                item.put("loaiMuc", "THUOC");
                item.put("soLuong", soLuong);
                item.put("donGia", donGiaBan);
                item.put("thanhTien", thanhTien);
                medicines.add(item);
            }
        }

        result.put("dichVu", services);
        result.put("thuoc", medicines);
        result.put("tongDichVu", tongDichVu);
        result.put("tongThuoc", tongThuoc);
        result.put("tongCong", tongDichVu.add(tongThuoc));
        return result;
    }

    @Override
    @Transactional
    public HoaDon taoHoaDonTuPhieuKham(Integer maPhieuKham, Integer maNhanVien) throws Exception {
        PhieuKham pk = phieuKhamRepository.findById(maPhieuKham)
                .orElseThrow(() -> new Exception("Không tìm thấy phiếu khám #" + maPhieuKham));

        // Kiểm tra hóa đơn đã tồn tại chưa
        List<HoaDon> existing = repository.findByMaPhieuKham(maPhieuKham);
        if (existing != null && !existing.isEmpty()) {
            // Trả về hóa đơn đầu tiên tìm thấy (dù chưa thanh toán hay đã thanh toán)
            // Không tạo thêm hóa đơn mới trong DB, nhưng cũng không chặn — 
            // nếu là "chua thanh toan" thì frontend hiện nút thanh toán, 
            // nếu là "da thanh toan" thì frontend chỉ hiển thị thông tin
            return existing.get(0);
        }

        // Lấy các mục cần thanh toán
        Map<String, Object> billingItems = getBillingItems(maPhieuKham);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> services = (List<Map<String, Object>>) billingItems.get("dichVu");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> medicines = (List<Map<String, Object>>) billingItems.get("thuoc");
        BigDecimal tongCong = (BigDecimal) billingItems.get("tongCong");

        // Tạo hóa đơn
        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaPhieuKham(maPhieuKham);
        hoaDon.setMaNhanVien(maNhanVien);
        hoaDon.setTongTien(tongCong);
        hoaDon.setNgayThanhToan(LocalDateTime.now());
        hoaDon.setTrangThai("chua thanh toan");
        // Mặc định phương thức thanh toán là "chua_xac_dinh" khi mới tạo hóa đơn.
        // Giá trị này sẽ được cập nhật khi khách hàng thực hiện thanh toán.
        // Fix: Column 'phuong_thuc_thanh_toan' cannot be null trong DB
        hoaDon.setPhuongThucThanhToan("chua_xac_dinh");
        hoaDon = repository.save(hoaDon);

        // Tạo chi tiết hóa đơn
        int stt = 0;
        for (Map<String, Object> item : services) {
            ChiTietHoaDon ct = new ChiTietHoaDon();
            ct.setMaHoaDon(hoaDon.getMaHoaDon());
            ct.setNoiDung((String) item.get("noiDung"));
            ct.setLoaiMuc("DICH_VU");
            ct.setIdGoc((Integer) item.get("idGoc"));
            ct.setSoLuong((Integer) item.get("soLuong"));
            ct.setDonGia((BigDecimal) item.get("donGia"));
            ct.setThanhTien((BigDecimal) item.get("thanhTien"));
            chiTietRepository.save(ct);
            stt++;
        }
        for (Map<String, Object> item : medicines) {
            ChiTietHoaDon ct = new ChiTietHoaDon();
            ct.setMaHoaDon(hoaDon.getMaHoaDon());
            ct.setNoiDung((String) item.get("noiDung"));
            ct.setLoaiMuc("THUOC");
            ct.setIdGoc((Integer) item.get("idGoc"));
            ct.setSoLuong((Integer) item.get("soLuong"));
            ct.setDonGia((BigDecimal) item.get("donGia"));
            ct.setThanhTien((BigDecimal) item.get("thanhTien"));
            chiTietRepository.save(ct);
            stt++;
        }

        return hoaDon;
    }

    @Override
    public List<Map<String, Object>> getPaidInvoicesDetailed() {
        return repository.findPaidInvoicesDetailed();
    }

    @Override
    public List<Map<String, Object>> getPaidInvoicesWithThuoc() {
        return repository.findPaidInvoicesWithThuoc();
    }

    @Override
    public List<Map<String, Object>> getPaidInvoicesWithThuocAndStatus() {
        return repository.findPaidInvoicesWithThuocAndStatus();
    }

    @Override
    public List<Map<String, Object>> getPaidInvoicesDaCapThuoc() {
        return repository.findPaidInvoicesDaCapThuoc();
    }
}
