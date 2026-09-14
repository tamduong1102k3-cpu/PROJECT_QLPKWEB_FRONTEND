# Kế hoạch: Sửa lỗi thiếu ca làm việc trong lịch tháng ngày 2026-09-01

## Bối cảnh

Người dùng báo cáo rằng với nhân viên 214, ngày 2026-09-01 có 2 ca làm việc được phân công (ma_ca=1 và ma_ca=2, đều là `MAC_DINH`), nhưng lịch tháng ở frontend `QuanLyCaLamViec.jsx` chỉ hiển thị 1 ca.

Dữ liệu mẫu:
- id=191: ma_nhan_vien=214, ma_ca=1, thu=Thứ 3, ngay=2026-09-01, kieu_phan_cong=MAC_DINH
- id=192: ma_nhan_vien=214, ma_ca=2, thu=Thứ 3, ngay=2026-09-01, kieu_phan_cong=MAC_DINH

## Kết quả kiểm tra Backend

Endpoint: `GET /api/ca-lam-danh-muc/thang?maNhanVien=...&nam=...&thang=...`

Controller: `CaLamController.java:83-95`
- Chuyển tiếp đến `bangPhanCongService.getLichThang(...)`

Service: `BangPhanCongCaLamServiceImpl.java:296-341`
- `getLichThang` nạp tất cả ca làm việc qua `repository.findByMaNhanVien(maNhanVien)`
- Với mỗi ngày trong tháng, duyệt tất cả ca và thêm ca `MAC_DINH` khớp thứ vào danh sách `macDinh`
- Không có bước loại bỏ trùng lặp hay giới hạn ở backend

**Kết luận backend: endpoint trả về dữ liệu đúng.** Cả 2 ca của ngày 2026-09-01 đều có trong `macDinh` của phản hồi.

## Nguyên nhân (Frontend)

File: `frontend/src/api/shiftApi.js`, hàm `normalizeMonthData` (dòng 55-97)

```javascript
const seenMaCa = new Set();
const uniqueMacDinh = (day.macDinh || []).filter((item) => {
  if (seenMaCa.has(item.maCa)) {
    return false;
  }
  seenMaCa.add(item.maCa);
  return true;
});
```

Trong `BangPhanCongCaLam.java`:
```java
@Transient
private Integer maCa;
```

`maCa` là trường `@Transient` của JPA. JPA **không** điền giá trị này khi đọc từ database. Jackson serialize nó thành `null` cho các bản ghi lấy từ DB.

Hậu quả:
- Với ngày 2026-09-01, cả 2 bản ghi đều có `maCa === null` trong JSON trả về
- Bước loại bỏ trùng lặp bằng `Set` thấy `null` cho cả 2 mục
- Chỉ mục đầu tiên qua bộ lọc; mục thứ hai bị loại bỏ sai

## Cách sửa

Trong `frontend/src/api/shiftApi.js`, đổi khóa loại bỏ trùng lặp từ `item.maCa` sang `item.ca?.id`.

Đối tượng `ca` được nạp qua quan hệ `@ManyToOne` và được serialize đúng kèm `id`, nên `item.ca?.id` đáng tin cậy.

### Thay đổi trong `normalizeMonthData`:

```javascript
const seenMaCa = new Set();
const uniqueMacDinh = (day.macDinh || []).filter((item) => {
  const key = item.ca?.id ?? item.maCa; // fallback cho an toàn
  if (seenMaCa.has(key)) {
    return false;
  }
  seenMaCa.add(key);
  return true;
});
```

## Các bước kiểm tra

1. Mở công cụ devtools của trình duyệt → tab Network
2. Vào QuanLyCaLamViec, chọn nhân viên 214, tháng 9/2026
3. Kiểm tra phản hồi `GET /api/ca-lam-danh-muc/thang`
   - Xác nhận `days[0].macDinh` có 2 mục cho `ngay: "2026-09-01"`
4. Sau khi sửa, xác nhận ô lịch của ngày 2026-09-01 hiển thị đủ 2 ca
5. Kiểm tra các ngày khác không bị ảnh hưởng (ngày chỉ có 1 ca vẫn hiển thị bình thường)

## Đánh giá rủi ro

- **Rủi ro thấp**: Chỉ đổi khóa loại bỏ trùng lặp. Fallback `item.maCa` giữ tương thích ngược nếu có nguồn dữ liệu không phải DB vẫn cung cấp `maCa`.
- Không cần thay đổi backend.
- Không cần migration database.
- Không thay đổi contract API.

## Ngoài phạm vi

- Thay đổi endpoint backend
- Thay đổi schema entity
- Các chế độ xem lịch khác hoặc component khác
