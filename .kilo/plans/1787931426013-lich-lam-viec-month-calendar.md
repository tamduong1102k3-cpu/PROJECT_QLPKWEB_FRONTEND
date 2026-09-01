# Kế hoạch: Calendar tháng quản lý ca làm việc nhân viên (Admin)

## Mục tiêu
Admin cần một **calendar tháng bao quát của 1 nhân viên**, cho phép chỉnh sửa ngày làm việc cụ thể
(nghỉ phép / đổi ca / thêm ca) thay vì chỉ sửa theo thứ (weekday) như hiện tại.

Dữ liệu ca mặc định vẫn lưu theo `thu` trong `bang_phan_cong_ca_lam` (không đổi). Bảng mới
`ngoai_le_ca_lam` (đã tạo trong DB) lưu các **ngoại lệ theo ngày** (`ngay` + `loai`).

## Quy tắc hiển thị / merge (theo ngày)
Với mỗi ngày `d` trong tháng:
1. Tính `thu` tương ứng ("Thứ 2"…"Chủ Nhật").
2. Ca mặc định = các bản ghi `bang_phan_cong_ca_lam` khớp `(ma_nhan_vien, thu)`.
3. Ngoại lệ = các bản ghi `ngoai_le_ca_lam` khớp `(ma_nhan_vien, ngay)`:
   - `NGHI_PHEP` → ẩn ca mặc định ngày đó, hiển thị chip "Nghỉ".
   - `DOI_CA` → thay ca mặc định bằng ca (phòng/giờ) trong ngoại lệ.
   - `THEM_CA` → hiển thị thêm ca đó cạnh ca mặc định.
   - Không có ngoại lệ → dùng nguyên ca mặc định.

> Unique DB: `(ma_nhan_vien, ngay, loai)` → mỗi ngày tối đa 1 NGHI_PHEP, 1 DOI_CA, 1 THEM_CA (không hỗ trợ nhiều THEM_CA cùng ngày trừ khi nới unique key).

---

## A. BACKEND (package `com.qlpk.backend`)

### A1. Enum mới
- `entity/NgoaiLeLoai.java`: `NGHI_PHEP, DOI_CA, THEM_CA`
- `entity/NgoaiLeTrangThai.java`: `CHO_DUYET, DA_DUYET, TU_CHOI` (mặc định `DA_DUYET`, để dành duyệt sau)

### A2. Entity `NgoaiLeCaLam.java` (mới)
Map đúng tên cột đã tạo:
- `id` `@Id @GeneratedValue` Integer
- `maNhanVien` `@Column(name="ma_nhan_vien", nullable=false)` Integer
- `ngay` `@Column(name="ngay", nullable=false)` `java.time.LocalDate`
- `loai` `@Enumerated(EnumType.STRING) @Column(name="loai", nullable=false)` `NgoaiLeLoai`
- `phong` `@Column(name="phong")` String (nullable)
- `gioLam` `@Column(name="gio_lam") @JsonFormat("HH:mm:ss")` `LocalTime` (nullable)
- `gioKetThuc` `@Column(name="gio_ket_thuc")` `LocalTime` (nullable)
- `lyDo` `@Column(name="ly_do")` String (nullable)
- `trangThai` `@Enumerated(EnumType.STRING) @Column(name="trang_thai")` `NgoaiLeTrangThai` (default `DA_DUYET`)
- `taoLuc` `@Column(name="tao_luc", updatable=false)` `LocalDateTime` (DB default CURRENT_TIMESTAMP, không set khi create)

Không khai báo `@ManyToOne`/`@JoinColumn` (tránh lazy/init phức tạp); chỉ lưu `maNhanVien` như bảng chính.

### A3. Repository `NgoaiLeCaLamRepository.java`
`extends JpaRepository<NgoaiLeCaLam, Integer>` + thêm:
- `List<NgoaiLeCaLam> findByMaNhanVienAndNgayBetween(Integer ma, LocalDate from, LocalDate to)`
- (tùy chọn) `findByMaNhanVienAndNgayAndLoai(...)` để kiểm tra trùng trước khi tạo.

### A4. Service `NgoaiLeCaLamService` + impl
- `create`, `update(id, entity)`, `delete(id)` (dùng repo chuẩn).
- `getLichThang(maNhanVien, nam, thang)` trả về DTO:
  - Tính `first = LocalDate.of(nam, thang, 1)`, `last = first.withDayOfMonth(lengthOfMonth)`.
  - `macDinhList = bangPhanCongRepo.findByMaNhanVien(ma)` (list theo `thu`).
  - `ngoaiLeList = repo.findByMaNhanVienAndNgayBetween(ma, first, last)`.
  - Duyệt từng ngày → build `NgayDTO { ngay, thu, macDinh: [...], ngoaiLe: [...] }`.
  - Thuật toán map `LocalDate → "Thứ 2"…"Chủ Nhật"` viết hàm riêng (tương tự `getVietnameseDayOfWeek` đang có trong `BangPhanCongCaLamServiceImpl`, nhưng nhận tham số `DayOfWeek`).
  - **Backend chỉ trả về `macDinh` + `ngoaiLe` thô; frontend tự merge để dễ edit.** (Không nhồi merge vào SQL.)
- DTO: `LichThangDTO { maNhanVien, nam, thang, List<NgayDTO> days }` (dùng class record/POJO đơn giản, không entity).

### A5. Controller `NgoaiLeCaLamController.java`
`@RequestMapping("/api/ca-lam")`
- `GET /thang?maNhanVien=&nam=&thang=` → `getLichThang(...)` (cần `maNhanVien`; bổ sung vào spec của user).
- `POST /ngoai-le` → create (body = NgoaiLeCaLam JSON).
- `PUT /ngoai-le/{id}` → update.
- `DELETE /ngoai-le/{id}` → delete.
Bọc try/catch trả 500 như controller cũ.

### A6. SecurityConfig.java
Thêm (ngay sau các rule `/api/phan-cong/**`, khoảng dòng 92):
```
.requestMatchers(HttpMethod.GET, "/api/ca-lam/**").permitAll()
.requestMatchers(HttpMethod.POST, "/api/ca-lam/**").hasRole("QUAN_TRI_VIEN")
.requestMatchers(HttpMethod.PUT, "/api/ca-lam/**").hasRole("QUAN_TRI_VIEN")
.requestMatchers(HttpMethod.DELETE, "/api/ca-lam/**").hasRole("QUAN_TRI_VIEN")
```
> Quyết định: dùng prefix `/api/ca-lam` (khớp convention `/api/*` của dự án; user viết `/ca-lam` thiếu `/api`).

---

## B. FRONTEND (`frontend/src`)

### B1. `api/shiftApi.js` – thêm hàm gọi API mới
Thêm base `const CA_LAM_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/ca-lam';`
- `getMonthScheduleApi(maNhanVien, nam, thang)` → `GET ${CA_LAM_URL}/thang?maNhanVien=...&nam=...&thang=...`
- `createExceptionApi(payload)` → `POST ${CA_LAM_URL}/ngoai-le`
- `updateExceptionApi(id, payload)` → `PUT ${CA_LAM_URL}/ngoai-le/${id}`
- `deleteExceptionApi(id)` → `DELETE ${CA_LAM_URL}/ngoai-le/${id}`
(Dùng `fetchClient` như các hàm cũ.)

### B2. Component mới `components/LichCaLamNhanVien.jsx` (calendar tháng 1 nhân viên + edit)
Trạng thái:
- `staffList` (từ `getAllEmployeesApi`), `selectedMaNV` (chọn nhân viên).
- `viewYear`, `viewMonth` (có nút ◀ ▶ tháng và "Tháng này").
- `monthData` (kết quả GET `/thang`).
- `selectedDate` + modal quản lý ngày.

Giao diện:
- Select nhân viên + thanh chuyển tháng (tiêu đề "Tháng X - Năm Y").
- Lưới 7 cột (Thứ 2…Chủ Nhật), ô ngày như `LichLamViecTab` (số ngày, highlight hôm nay, thứ 7/CN tô hồng).
- Mỗi ô: gọi hàm `mergeDay(macDinh, ngoaiLe)` trả về danh sách chip hiển thị:
  - Nếu có `NGHI_PHEP` → chip đỏ "Nghỉ" (ẩn ca mặc định).
  - Ngược lại: chip ca mặc định; nếu có `DOI_CA` → thay bằng chip ca đổi (màu khác, ghi chú "Đổi ca"); nếu có `THEM_CA` → thêm chip "Thêm ca".
- Click ô → modal ngày:
  - Hiển thị ca mặc định (nếu có).
  - Nút: "Nghỉ phép" (tạo `NGHI_PHEP`, không cần phòng/giờ), "Đổi ca" (tạo `DOI_CA`, dùng dropdown phòng + time như `QuanLyCaLamViec`), "Thêm ca" (tạo `THEM_CA`).
  - Danh sách ngoại lệ đã có của ngày đó: nút Sửa / Xóa (gọi update/delete rồi reload tháng).
  - Sau mọi thao tác → gọi lại `getMonthScheduleApi` để refresh.

### B3. Gộp "Mẫu tuần" vào calendar tháng (theo lựa chọn của user)
Không còn toggle "Mẫu tuần / Lịch tháng". **Calendar tháng là view duy nhất**.

- `admin/components/QuanLyCaLamViec.jsx` → rút gọn thành wrapper mỏng chỉ render `<LichCaLamNhanVien />` (xóa header toggle, ma trận tuần cũ, modal thêm ca cũ, các hàm `fetchData/getShiftsFor/openModal/handleAdd/handleRemove/getRoomsForEmployee/...`). Component vẫn được `BangDieuKhienAdmin` gọi ở tab `shifts`.
- `LichCaLamNhanVien.jsx` trở thành nơi duy nhất chỉnh cả 2 lớp dữ liệu:
  - **Ca mặc định theo thứ** (`bang_phan_cong_ca_lam`) – tạo/xóa ngay trong modal ngày (xem B5).
  - **Ngoại lệ theo ngày** (`ngoai_le_ca_lam`) – đã làm (nghỉ/đổi/thêm ca).

### B5. Sửa/xóa/thêm ca mặc định theo thứ trong modal ngày
Trong modal quản lý ngày, khu "Ca mặc định (theo {thu})":
- Mỗi ca mặc định `selectedDay.macDinh` hiển thị kèm nút **Xóa** → gọi `deleteShiftApi(m.id)` rồi reload ngày.
- Nút **"+ Thêm ca mặc định"** mở form (phòng từ `phongList`, giờ bắt đầu/kết thúc) → `createShiftApi({ maNhanVien, thu: selectedDay.thu, gioLam: 'HH:mm:ss', gioKetThuc: 'HH:mm:ss', phong })`.
- Thêm state `showAddDefault`, `defaultForm`, và hàm `reloadDay()` (refetch tháng + cập nhật `selectedDay` theo `ngay`). Dùng `reloadDay()` chung cho cả thêm/sửa/xóa ngoại lệ và ca mặc định.
- Import bổ sung vào `LichCaLamNhanViec.jsx`: `createShiftApi`, `deleteShiftApi` từ `../api/shiftApi`.

> Lưu ý: backend `shiftApi.js` đã có `createShiftApi`/`deleteShiftApi` (dùng bởi ma trận tuần cũ). Không cần sửa backend. Ca mặc định vẫn lưu vào `bang_phan_cong_ca_lam` như cũ; calendar tháng tự động hiển thị lại cho mọi ngày khớp thứ.

### B4. (Tùy chọn, out of scope) Receptionist `LichLamViecTab.jsx`
Có thể gọi `/thang` để cũng hiển thị ngày nghỉ/đổi ca của chính mình. Chỉ làm nếu user yêu cầu.

---

## C. Validation
- Backend: `mvn -q compile` (trong `backend/`). Test nhanh bằng curl/Postman:
  - POST `/api/ca-lam/ngoai-le` (NGHI_PHEP) → GET `/api/ca-lam/thang?maNhanVien=..&nam=..&thang=..` thấy ngày đó bị ẩn ca + có NGHI_PHEP.
  - POST DOI_CA → ngày đó hiển thị ca thay thế. POST THEM_CA → ngày đó có thêm ca.
  - PUT/DELETE hoạt động, reload vẫn đúng.
- Frontend: chạy `npm run dev` (frontend), login QUAN_TRI_VIEN → tab Ca Làm Việc → chọn NV → chuyển tháng → click ngày → thêm/sửa/xóa ngoại lệ → reload trang vẫn giữ.
- Kiểm tra column mapping entity khớp exactly với bảng đã tạo (đặc biệt `tao_luc` có default DB → không truyền khi create).

## D. Rủi ro / lưu ý
- Nếu Hibernate `ddl-auto=update` và bảng đã tạo thủ công → chỉ validate/thêm cột thiếu, không drop. Vẫn nên đối chiếu tên cột.
- Unique `(ma_nhan_vien, ngay, loai)`: chỉ 1 THEM_CA/ngày. Muốn nhiều ca phụ → nới unique key (cần chỉnh DB + entity).
- `trangThai` mặc định `DA_DUYET`; luồng duyệt (NHAN_VIEN gửi → QUAN_TRI_VIEN duyệt) chưa làm, để sau.
