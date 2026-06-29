# Task Plan: Chuyển form tiếp nhận CLS từ Bác sĩ sang Kỹ thuật viên

## Mục tiêu
Form tiếp nhận CLS (lý do đến, sàng lọc, ghi chú) hiện do bác sĩ nhập → chuyển sang KTV nhập. 
Bác sĩ không cần xác nhận DV nữa, mà duyệt kết quả cuối cùng + update maNhanVienChiDinh.

## Luồng mới
1. **KTV**: Tiếp nhận BN → Đo sinh hiệu xong → **Tự động mở form tiếp nhận CLS** → KTV nhập (lý do đến, sàng lọc, ghi chú) → Submit → tạo PhieuChiDinh (maNhanVienChiDinh = KTV) → CHO_CLS
2. **KTV**: "Chờ thực hiện" → nhập kết quả chuyên môn
3. **Bác sĩ**: Tab "Chờ duyệt" → xem form tiếp nhận + kết quả → Duyệt → **update maNhanVienChiDinh = bác sĩ**

## Các thay đổi

### Backend
1. **PhieuKhamController** - Thêm endpoint mới `POST /{maPhieuKham}/tech-confirm-cls`
2. **PhieuKhamService** - Thêm method `techConfirmClsService()`
3. **PhieuKhamServiceImpl** - Implement method tạo TiepNhanCls + PhieuChiDinh + update status
4. **PhieuChiDinhServiceImpl** - Sửa `approveTestResult()` và `approveCdhaResult()` để update maNhanVienChiDinh

### Frontend
1. **BangDieuKhienKyThuatVien.jsx** - Sau khi lưu sinh hiệu, tự động mở ModalNhapTiepNhanCls
2. **ModalNhapTiepNhanCls.jsx** (mới) - Form nhập lý do đến, sàng lọc, ghi chú cho KTV
3. **BangDieuKhienChanDoan.jsx** - Xóa tab "Xác nhận DV", giữ lại "Chờ duyệt" và "Đã duyệt"
4. **TiepNhanCLS.jsx** - Không còn dùng trong dashboard bác sĩ nữa, có thể xóa hoặc giữ
5. **API** - Thêm hàm `techConfirmClsApi()` trong phieuKhamApi