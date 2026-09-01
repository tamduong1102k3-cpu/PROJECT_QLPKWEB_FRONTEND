# Kế hoạch: Củng cố luồng đăng nhập Frontend (QLPK-WEB)

## Bối cảnh (từ phân tích)
Luồng đăng nhập: `DangNhap.jsx` → `loginApi` (`accountApi.js:115`) → lưu access token vào **memory** (`tokenStore.js`), refresh token nằm **HttpOnly cookie**. Khôi phục phiên sau F5 qua `ensureAuthenticated()` (`accountApi.js:186`). Tự động refresh khi 401 trong `fetchClient.js`.

Frontend chỉ có **1 luồng login nhân viên** (`DangNhap.jsx`). Không có trang login bệnh nhân; nhánh `BENH_NHAN` trong `getRefreshEndpoint` (`fetchClient.js:35`) là code chết/đoán mò.

## Kiến trúc chốt (theo review)
```
LOGIN → loginApi()
        ├── access token → tokenStore (memory)
        └── backend set refresh token → HttpOnly cookie
      → handleLoginSuccess()
          ├── userType = NHAN_VIEN
          ├── lưu user (validate role)
          │     ├── role HỢP LỆ   → dashboard tương ứng
          │     └── role BẤT THƯỜNG → xóa session/localStorage → DangNhap
F5 → ensureAuthenticated() → /api/taikhoan/refresh-token
        ├── SUCCESS → access token mới vào memory
        └── INVALID → session expired → DangNhap
API 401 → fetchClient refresh
        ├── SUCCESS → retry API
        └── invalid → logout
```
Nguyên tắc: `under-development` CHỈ cho role hợp lệ nhưng UI chưa triển khai. Role bất thường luôn → `DangNhap` (client guard; backend vẫn là security boundary thật).

---

## Task 1 — Gộp `setAccessToken` trùng lặp ✅
**Sửa:**
- Xóa `setAccessToken(data.token);` tại `DangNhap.jsx:28`. `loginApi` (`accountApi.js:127-130`) là nơi duy nhất gán token sau login.
- `DangNhap.jsx:4` đổi import thành: `import { cleanupLegacyTokens } from '../api/tokenStore';` (bỏ `setAccessToken`).
- Giữ `cleanupLegacyTokens()` (`DangNhap.jsx:31`).
**Rủi ro:** Không.

---

## Task 2 — `userType` thay thế đoán mò ✅
**Bối cảnh bổ sung:** Backend CÓ controller bệnh nhân (`TaiKhoanBenhNhanController` với `/refresh-token`, `/logout`), nhưng **frontend không có trang login bệnh nhân** (xác nhận của user: không có plan mở rộng). Nhánh `BENH_NHAN` trong `getRefreshEndpoint` hiện là dead code ở frontend; giữ làm extension point.
**Sửa:**
- `App.handleLoginSuccess` (`App.jsx:85-92`): lưu thêm `userType: 'NHAN_VIEN'` vào object user ghi localStorage.
- `getRefreshEndpoint` (`fetchClient.js:35-50`) ưu tiên `user.userType`:
  ```js
  if (user.userType === 'BENH_NHAN') return '/api/tai-khoan-benh-nhan/refresh-token';
  if (user.userType === 'NHAN_VIEN') return '/api/taikhoan/refresh-token';
  ```
  Giữ fallback cũ (dựa `role`) nếu `userType` thiếu — chỉ để tương thích session cũ; TODO xóa sau khi migrate hết.
**Rủi ro:** Thấp. Đảm bảo mọi nơi ghi `localStorage.user` (chỉ `handleLoginSuccess`) đều set `userType`.

---

## Task 3 — Validate role tập trung (sửa mâu thuẫn) ⚠️
**Quy tắc thống nhất:**
- `getViewForRole(vaiTro)` trả:
  - view dashboard với role đã biết (giữ map hiện tại `App.jsx:26-36`),
  - `'under-development'` CHỈ với role hợp lệ nhưng UI chưa làm (định nghĩa rõ `UNIMPLEMENTED_ROLES = []` — rỗng hiện tại, là extension point),
  - `'DangNhap'` với mọi role không nhận diện được (bất thường).
- **Không** đưa user role bất thường vào `under-development`.

**Sửa cụ thể:**
1. `getViewForRole` (`App.jsx:26`): đổi dòng cuối `return 'under-development';` → thêm khối:
   ```js
   const UNIMPLEMENTED_ROLES = []; // role hợp lệ nhưng UI chưa làm
   const getViewForRole = (vaiTro) => {
     ... // map hiện tại
     if (UNIMPLEMENTED_ROLES.includes(vaiTro)) return 'under-development';
     return 'DangNhap'; // role bất thường
   };
   ```
2. `getStoredUser` (`App.jsx:39-50`) — trở thành validator tập trung: sau parse, nếu `!vt` hoặc `getViewForRole(vt) === 'DangNhap'` → `return null` (coi như không có session). Thỏa mãn yêu cầu "getStoredUser không coi role='ABC' là session hợp lệ".
3. `App` initializer (`App.jsx:57-62`): nếu `getStoredUser()` trả user nhưng `getViewForRole(vt) === 'DangNhap'` → xóa `localStorage.user`/`maNhanVien` và về `'DangNhap'` (dọn session cũ lạ).
4. `handleLoginSuccess` (`App.jsx:81-101`): tính `view = getViewForRole(vt)` trước khi lưu. Nếu `view === 'DangNhap'` → `clearAccessToken()` + xóa `localStorage.user`/`maNhanVien` + `setCurrentUser(null)` + `setCurrentView('DangNhap')` + return (KHÔNG lưu session, KHÔNG vào under-development). Ngược lại mới lưu user (`userType` từ Task 2) và tiếp tục; giữ ưu tiên `lanDauDangNhap` → `force-change-password` trước khi vào dashboard.
**Rủi ro:** Thấp. Chỉ đổi định tuyến client-side. Backend vẫn phải check quyền từng API.

---

## Task 4 — CSRF: ĐÃ verify, không cần sửa frontend ✅
**Đã kiểm tra backend (`D:\QLPK-WEB\backend`):**
- `SecurityConfig.java:57` tắt Spring CSRF, nhưng controller tự enforce thủ công.
- `TaiKhoanController.hasCsrfHeader()` (`TaiKhoanController.java:66`) yêu cầu header `X-Requested-With: XMLHttpRequest` trên `/refresh-token` (line 92) và `/logout` (line 188). Thiếu header → 403.
- `SecurityConfig.java:36-46`: CORS chỉ cho phép origin cố định (`http://localhost:5173`, `https://qlpkweb.vercel.app`) + `allowCredentials=true`, `allowedHeaders: *`. Không dùng `*` cho origin (Spring cấm `*`+credentials).
- Frontend (`fetchClient.js:76`, `accountApi.js:122,149,200`) đã gửi `X-Requested-With` + `credentials: 'include'`.

**Kết luận:** Phòng thủ "custom header" CSRF hoạt động đúng: trình duyệt không cho cross-origin set header không safelisted (`X-Requested-With`), cộng với CORS giới hạn origin → request CSRF từ `evil.com` bị chặn ở preflight. **Không cần sửa frontend.**

**Hardening tùy chọn (backend, out-of-scope frontend):**
- `/api/taikhoan/login` và `/api/taikhoan/first-time-change-password` là `permitAll` và KHÔNG check CSRF header → login-CSRF nhẹ (kẻ tấn công ép nạn nhân đăng nhập tài khoản attacker). Đề xuất backend thêm `hasCsrfHeader()` cho web trên `/login` nếu muốn triệt tiêu.
- `X-Client: mobile` bỏ qua CSRF (header `TaiKhoanController.java:92`) — đúng vì mobile dùng refresh token trong body, không cookie. An toàn vì attacker không gửi được header tùy ý cross-origin.
- Đảm bảo production không set `app.cors.allowed-origins=*` (đã bị Spring từ chối cùng credentials, nhưng nên review config deploy).

---

## Task 5 — Role định tuyến BẮT BUỘC lấy từ JWT (đóng bypass UI do sửa localStorage) 🔴
**Phát hiện (từ feedback user):** User dùng DevTools sửa `localStorage.user` (vd `role/vaiTro = "QUAN_TRI_VIEN"`) có thể hiện dashboard admin.
- Nếu KHÔNG có refresh cookie hợp lệ: `ensureAuthenticated()` (`accountApi.js:186`) fail → `clearStoredSession()` xóa `user` → reload rơi về `DangNhap`. Nên sửa thuần localStorage **không** vào được sau F5.
- Nếu ĐÃ đăng nhập (có cookie): `ensureAuthenticated` thành công, token trong memory vẫn là user thật, nhưng `App` đọc `localStorage.user.role` để định tuyến → hiện sai dashboard (UI-only; mọi API bị backend 403 vì token role thật khác). Đây là bypass UI cần đóng.

> ⚠️ **Lỗi bản gốc (đã sửa):** bản plan đầu có `const role = decodedRole || (stored?.role || stored?.vaiTro) || ''` — nếu có token nhưng decode fail/claimprofile rỗng sẽ **fallback về localStorage**, tức hở lại đúng lỗ hổng. Nguyên tắc mới: **có token thì role 100% từ token, không bao giờ fallback localStorage.**

**Nguyên tắc sửa (nghiêm ngặt):**
| Trạng thái | Hành vi bắt buộc |
|---|---|
| Không có token | → `DangNhap`. Không dùng `stored.role` dù bất kỳ hoàn cảnh nào — không token = không gì đáng tin để định tuyến. |
| Có token, decode được `role` hợp lệ | role = role từ token (100%), ghi đè `localStorage.user` để đồng bộ hiển thị. |
| Có token nhưng decode fail / claim rỗng | token hỏng → `clearStoredSession()` + `clearAccessToken()` → `DangNhap`. **Không** fallback `stored`. |

localStorage chỉ còn vai trò cache hiển thị (tên, avatar…), bị ghi đè mỗi lần có token hợp lệ. Backend vẫn là boundary thật (`JwtAuthenticationFilter.java:54` dùng `"ROLE_"+role`).

**Sửa:**
1. `tokenStore.js` — thêm (không dependency mới; tái dùng pattern base64Url của `ThanhToan.jsx`/`BangDieuKhienThuNgan.jsx`):
   ```js
   export const decodeTokenPayload = (token) => {
     if (!token) return null;
     try {
       const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
       const json = decodeURIComponent(escape(window.atob(b)));
       return JSON.parse(json);
     } catch { return null; }
   };
   export const getRoleFromAccessToken = () => decodeTokenPayload(getAccessToken())?.role || null;

   // Ghi đè localStorage.user.role = role từ token (hủy tamper). Chỉ chạy khi có stored user.
   export const syncRoleFromToken = () => {
     const token = getAccessToken();
     if (!token) return;
     const decodedRole = getRoleFromAccessToken();
     if (!decodedRole) return; // token hỏng để resolveSession xử lý
     try {
       const stored = JSON.parse(localStorage.getItem('user') || 'null');
       if (!stored) return;
       stored.role = decodedRole;
       stored.vaiTro = decodedRole;
       stored.userType = stored.userType || 'NHAN_VIEN';
       localStorage.setItem('user', JSON.stringify(stored));
     } catch {}
   };
   ```
2. `App.jsx` — `resolveSession()` viết lại (KHÔNG fallback localStorage):
   ```js
   const resolveSession = () => {
     const token = getAccessToken();

     // Không có token → không có gì đáng tin, kể cả localStorage
     if (!token) {
       clearAccessToken();
       localStorage.removeItem('user');
       localStorage.removeItem('maNhanVien');
       return { user: null, view: 'DangNhap' };
     }

     // Có token: role BẮT BUỘC từ token, KHÔNG đọc localStorage.role
     const decodedRole = getRoleFromAccessToken();
     if (!decodedRole) {
       clearAccessToken();
       localStorage.removeItem('user');
       localStorage.removeItem('maNhanVien');
       return { user: null, view: 'DangNhap' };
     }

     const view = getViewForRole(decodedRole);
     if (view === 'DangNhap') {
       // decode được nhưng không map sang view nào đã biết
       clearAccessToken();
       localStorage.removeItem('user');
       localStorage.removeItem('maNhanVien');
       return { user: null, view: 'DangNhap' };
     }

     syncRoleFromToken(); // ghi đè localStorage.role = decodedRole (hủy tamper)
     const stored = getStoredUser();
     const user = { ...(stored || {}), role: decodedRole, vaiTro: decodedRole };
     return { user, view };
   };
   ```
   Dùng cho cả `currentUser` và `currentView` initializer (thay `getStoredUser()` + `getViewForRole`). Import `getAccessToken`, `getRoleFromAccessToken`, `syncRoleFromToken` từ `tokenStore`.
3. `handleLoginSuccess` (`App.jsx`): `loginApi` đã `setAccessToken(data.token)` vào memory. Decode `data.token` lấy `role` làm nguồn role (claim đã ký, khó sửa hơn response body); fallback body chỉ khi cực đoan:
   ```js
   const loginRole = getRoleFromAccessToken() || user.vaiTro || user.role || '';
   ```
   Giữ logic validate/view của Task 3 (role bất thường → `DangNhap`, giữ `userType`, `lanDauDangNhap`). Sau khi xác định `view` hợp lệ → gọi `syncRoleFromToken()` trước khi `setCurrentUser`.
4. `ensureAuthenticated` (`accountApi.js:214`): ngay sau `setAccessToken(data.token)` thành công, gọi `syncRoleFromToken()` (phòng luồng refresh ngầm không kèm reload sau này). Import `syncRoleFromToken` từ `tokenStore`.

**Rủi ro:**
- `decodeTokenPayload` chỉ đọc claim, KHÔNG verify chữ ký (chấp nhận: token do backend cấp, nằm trong memory; attacker không forging được thiếu secret). Authorization thật vẫn do backend.
- **KHÔNG** fallback localStorage khi có token (đã sửa theo review).
- Không đổi backend. `window.atob` + `decodeURIComponent(escape(...))` giữ nguyên pattern hiện tại.

**Validation bổ sung:**
- Đã đăng nhập tk thường, sửa `localStorage.user.role="QUAN_TRI_VIEN"` rồi F5 → vẫn hiện dashboard tài khoản thật (role từ token), localStorage bị ghi đè lại role thật.
- Đã đăng nhập, sửa role thành giá trị lạ → F5 → `DangNhap`.
- Token thiếu claim `role` (mock/hỏng) dù có cookie → F5 → `DangNhap` (không vào dashboard).
- Không có cookie, chỉ sửa localStorage → F5 → `DangNhap` (như cũ).
- Mọi API từ dashboard vẫn do backend phân quyền theo token (không đổi).

---

## Validation
1. Đăng nhập nhân viên → đúng dashboard, không lỗi console.
2. F5 → `ensureAuthenticated` khôi phục phiên, vẫn ở dashboard.
3. Sửa `localStorage.user.role` = `"ABC"` → reload → về `DangNhap`, `localStorage.user` bị xóa.
4. Login trả `vaiTro` lạ → về `DangNhap`, không lưu session.
5. Access token hết hạn → API tự refresh qua cookie, retry thành công.
6. Đăng xuất → `localStorage` sạch, `/logout` revoke cookie.
7. `npm run lint` / `npm run build` qua.
8. (Task 5) Đã login tk thường, sửa `localStorage.user.role="QUAN_TRI_VIEN"` → F5 vẫn hiện dashboard đúng (role từ token), localStorage ghi đè role thật.
9. (Task 5) Đã login, sửa role lạ → F5 → `DangNhap`.
10. (Task 5) Token thiếu claim `role` (mock/hỏng) dù có cookie → F5 → `DangNhap` (không fallback localStorage).

## Open questions (đã giải quyết)
- ❌ Không có plan mở rộng login bệnh nhân ở frontend → Task 2: nhánh `BENH_NHAN` giữ làm dead-code/extension, chỉ nhân viên (`NHAN_VIEN`) được dùng thực tế.
- ✅ Backend đã enforce `X-Requested-With` trên `/refresh-token` & `/logout`, CORS giới hạn origin cố định → Task 4 thỏa mãn, không sửa frontend.
- ✅ Chọn hướng 1: thêm `hoTen` + `lanDauDangNhap` vào JWT claims (backend), sau đó bỏ hẳn `localStorage.user`/`maNhanVien` cho auth (frontend).

---

## Task 6 — Bỏ hẳn localStorage cho auth, thay bằng JWT claims 🔴
**Mục tiêu:** Xóa mọi `localStorage.user`/`maNhanVien` khỏi luồng auth. Tất cả thông tin user (role, hoTen, lanDauDangNhap, maNhanVien...) đều lấy từ JWT được backend ký, nằm trong memory.

### Backend
**Tiền đề:** `TaiKhoan` chỉ có `maNhanVien` (FK), `hoTen` nằm ở `NhanVien`. `NhanVienRepository` đã có sẵn. `TaiKhoanServiceImpl` đã autowired `NhanVienRepository`.

1. **`JwtUtils.java`** — cập nhật claims:
   - `generateToken(...)`: thêm claim `hoTen`, `lanDauDangNhap`, `maChuyenKhoa`, `tenChuyenKhoa`.
   - `generateEmployeeRefreshToken(...)`: chỉ giữ `sub` + `tokenType="refresh"` (xóa các claim UI không cần thiết).
   - Thêm getter: `getHoTenFromToken`, `getLanDauDangNhapFromToken`, `getMaChuyenKhoaFromToken`, `getTenChuyenKhoaFromToken`.

2. **`TaiKhoanServiceImpl.java`** — thêm helper:
   ```java
   public String getHoTenByMaNhanVien(Integer maNhanVien) {
       if (maNhanVien == null) return null;
       return nhanVienRepository.findById(maNhanVien)
               .map(NhanVien::getHoTen)
               .orElse(null);
   }
   ```

3. **`TaiKhoanController.java`** — cập nhật 2 endpoint:
   - `login` (line ~296): sau khi xác thực, `String hoTen = taiKhoanService.getHoTenByMaNhanVien(account.getMaNhanVien());`. Pass `hoTen`, `account.getLanDauDangNhap()`, `maChuyenKhoa`, `tenChuyenKhoa` vào `generateToken` (access token). Refresh token chỉ cần `generateEmployeeRefreshToken(username, maNhanVien)` (minimal).
   - `refreshToken` (line ~129): lookup `TaiKhoan` + `NhanVien` theo username/maNhanVien từ DB, lấy `hoTen`, `lanDauDangNhap`, `maChuyenKhoa`, `tenChuyenKhoa` mới nhất, rồi `generateToken` với full UI claims. Refresh token mới chỉ cần minimal claims.

**Lưu ý backend:**
- Token generation cũ (không có claim mới) vẫn validate được vì signature key không đổi; chỉ cần backend bắt đầu phát token mới là frontend sẽ nhận claim mới.
- `lanDauDangNhap` hiện không được trả trong login response (`TaiKhoanController:312-320` không có field này). Thêm vào JWT giúp frontend biết khi cần hiện màn hình đổi mật khẩu đầu tiên sau F5. Backward compat: nếu claim thiếu (token cũ), frontend mặc định `false`.
- `first-time-change-password` endpoint hiện chỉ trả message, không trả token. Frontend sẽ tự gọi refresh sau khi đổi mật khẩu thành công để lấy access token mới với `lanDauDangNhap=false`.

### Frontend
**Nguyên tắc:** Không còn `localStorage.user` / `maNhanVien` / `token` / `refreshToken` cho auth. `localStorage` chỉ còn `apiBaseUrl` (cấu hình user).

1. **`tokenStore.js`** — bổ sung decode helpers cho claims thường dùng:
   ```js
   export const decodeTokenPayload = (token) => { ... }; // đã có từ Task 5
   export const getRoleFromAccessToken = () => decodeTokenPayload(getAccessToken())?.role || null;
   export const getHoTenFromAccessToken = () => decodeTokenPayload(getAccessToken())?.hoTen || null;
   export const getLanDauDangNhapFromAccessToken = () => decodeTokenPayload(getAccessToken())?.lanDauDangNhap ?? false;
   export const getMaNhanVienFromAccessToken = () => {
     const v = decodeTokenPayload(getAccessToken())?.maNhanVien;
     return (typeof v === 'number' ? v : Number(v)) || null;
   };
   // Xóa cleanupLegacyTokens() và syncRoleFromToken() (không còn localStorage user để sync)
   ```
   Xóa `cleanupLegacyTokens` (migration đã xong) và `syncRoleFromToken`.

2. **`main.jsx`** — gọi `ensureAuthenticated()` **luôn** (không còn `hasSession`):
   ```js
   const boot = async () => {
     // One-time cleanup: xóa key cũ nếu còn sót từ migration trước
     try {
       localStorage.removeItem('token');
       localStorage.removeItem('refreshToken');
       localStorage.removeItem('user');
       localStorage.removeItem('maNhanVien');
     } catch {}
     try {
       await ensureAuthenticated();
     } catch (e) {
       console.warn('Không thể khôi phục phiên:', e);
     }
     createRoot(...).render(<App />);
   };
   ```

3. **`App.jsx`** — xây dựng user 100% từ JWT, không đọc `localStorage.user`:
   - Xóa `getStoredUser()`.
   - `resolveSession()` viết lại:
     ```js
     const resolveSession = () => {
       const token = getAccessToken();
       if (!token) return { user: null, view: 'DangNhap' };
       const payload = decodeTokenPayload(token);
       if (!payload || !payload.role) {
         clearAccessToken();
         return { user: null, view: 'DangNhap' };
       }
       const role = payload.role;
       const view = getViewForRole(role);
       if (view === 'DangNhap') {
         clearAccessToken();
         return { user: null, view: 'DangNhap' };
       }
       const user = {
         username: payload.sub,
         email: payload.email,
         role,
         vaiTro: role,
         maNhanVien: payload.maNhanVien ?? null,
         maTaiKhoan: payload.maTaiKhoan ?? null,
         hoTen: payload.hoTen ?? null,
         lanDauDangNhap: payload.lanDauDangNhap ?? false,
         maChuyenKhoa: payload.maChuyenKhoa ?? null,
         tenChuyenKhoa: payload.tenChuyenKhoa ?? null,
         userType: 'NHAN_VIEN',
       };
       return { user, view };
     };
     ```
   - `handleLoginSuccess`: build `user` từ token decode (ưu tiên `getRoleFromAccessToken()`), KHÔNG gọi `localStorage.setItem('user')`. Giữ logic `lanDauDangNhap` → `force-change-password`.
   - `handleLogout`: chỉ `clearAccessToken()` + `window.location.href = '/'`. Không còn `cleanupLegacyTokens`/`localStorage.removeItem('user')`.
   - Import `decodeTokenPayload` từ `tokenStore`.

4. **`accountApi.js`** — đơn giản hóa:
   - `clearStoredSession()` → chỉ còn `clearAccessToken()`. Xóa `localStorage.removeItem('user')`/`maNhanVien'`.
   - `ensureAuthenticated`: xóa `clearStoredSession()` (đã không còn stored session), chỉ giữ `clearAccessToken()` khi fail.
   - Import `clearAccessToken` thay vì `clearStoredSession`.

5. **`fetchClient.js`** — đơn giản hóa:
   - `getRefreshEndpoint()`: **luôn trả** `'/api/taikhoan/refresh-token'` (frontend chỉ có login nhân viên). Xóa toàn bộ đọc `localStorage.user`.
   - `clearSession()`: chỉ còn `clearAccessToken()` + cleanup legacy token keys (nếu muốn giữ).
   - Xóa `localStorage.removeItem('user')`/`maNhanVien'` trong `clearSession`.

6. **`pages/DangNhap.jsx`** — xóa `localStorage.setItem('maNhanVien', ...)`.

7. **`pages/BatBuocDoiMatKhau.jsx`** — sau `firstTimeChangePasswordApi` thành công, gọi `ensureAuthenticated()` để refresh access token (lấy `lanDauDangNhap=false` mới từ backend), rồi mới điều hướng vào dashboard.

8. **Các component đọc `localStorage.user`/`maNhanVien` trực tiếp** → chuyển sang đọc từ React `user` prop hoặc decode từ token:
   - `pages/receptionist/components/QuyTrinhTiepDon.jsx:255` → thay bằng `getMaNhanVienFromAccessToken()` hoặc nhận `user` prop.
   - `components/LichLamViecTab.jsx:93` → tương tự.
   - `pages/doctor/components/TabKhamTMH.jsx:34`
   - `pages/doctor/components/TabKhamTimMach.jsx:61`
   - `pages/doctor/components/TabKhamRHM.jsx:38`
   - `pages/doctor/components/TabKhamNhi.jsx:41`
   Tất cả đều là đọc `localStorage.getItem('user')` parse → thay bằng `user` prop từ dashboard cha (đã có từ `App.jsx`).

9. **`utils/jwtUtils.js`** — đánh dấu deprecated hoặc xóa. File này đọc `localStorage.token` (legacy key) và dùng `jwt-decode` dependency không có trong `package.json`. Toàn bộ logic đã được thay thế bằng `decodeTokenPayload` trong `tokenStore.js`.

### Migration / Edge cases
- **Token cũ (chưa có `hoTen`/`lanDauDangNhap` claim):** frontend `decodeTokenPayload` trả `null`/`undefined` → `resolveSession` dùng fallback (`hoTen: null`, `lanDauDangNhap: false`). UX: tên hiển thị có thể rỗng cho đến khi refresh lấy token mới.
- **Token có `lanDauDangNhap=true`:** `resolveSession` nhận `user.lanDauDangNhap=true` → `handleLoginSuccess` sẽ route sang `force-change-password`.
- **Xóa localStorage cũ:** `main.jsx` one-time cleanup đảm bảo xóa sạch `user`/`maNhanVien`/`token`/`refreshToken` cũ trên thiết bị đã từng login trước đây.
- **`apiBaseUrl`:** giữ nguyên trong localStorage (không phải auth data).

### Validation
1. F5 trang đã đăng nhập → `ensureAuthenticated()` luôn chạy, token vào memory → `resolveSession` decode JWT → đúng dashboard.
2. `localStorage` chỉ còn `apiBaseUrl` (nếu có). Không còn `user`, `maNhanVien`, `token`, `refreshToken`.
3. Sửa `localStorage.user.role` thành `"QUAN_TRI_VIEN"` rồi F5:
   - `main.jsx` cleanup xóa key cũ.
   - `ensureAuthenticated()` gọi refresh qua cookie.
   - **Nếu cookie hợp lệ** → backend cấp access token mới với role thật → dashboard đúng role thật (đây là bằng chứng bypass localStorage đã bị đóng).
   - **Nếu cookie không hợp lệ** → `DangNhap`.
4. Đăng nhập → `handleLoginSuccess` build user từ token → không ghi `localStorage.user` → F5 vẫn giữ phiên nhờ HttpOnly cookie + token decode.
5. Token cũ (không có `hoTen`) → F5 → hiện dashboard, `hoTen` null (fallback UI), không lỗi console.
6. Token có `lanDauDangNhap=true` → F5 → hiện màn hình đổi mật khẩu đầu tiên.
7. Đổi mật khẩu lần đầu thành công → frontend gọi `ensureAuthenticated()` (refresh) → nhận token mới `lanDauDangNhap=false` → vào dashboard.
8. Đăng xuất → xóa access token memory + redirect → `/logout` revoke cookie.
9. `npm run build` / `npm run lint` qua.

### Open questions (đã giải quyết)
- ✅ Hướng cấp `hoTen` cho frontend: **thêm claim vào Access JWT** (không gọi `/me`). Backend thêm `hoTen` + `lanDauDangNhap` + `maChuyenKhoa` + `tenChuyenKhoa` vào `generateToken`. Refresh token chỉ chứa minimal claims; backend query DB khi refresh để lấy dữ liệu mới nhất.
- ✅ `NhanVien` lookup: `TaiKhoanServiceImpl` thêm `getHoTenByMaNhanVien` (đã có `NhanVienRepository` autowired).
- ✅ `maChuyenKhoa`/`tenChuyenKhoa`: thêm vào JWT claims (đã có trong login response, thêm vào token cho nhất quán).
- ✅ Token cũ không có claim mới: frontend fallback gracefully (`hoTen: null`, `lanDauDangNhap: false`).
- ✅ Sau đổi mật khẩu lần đầu: frontend tự gọi `ensureAuthenticated()` để lấy access token mới với `lanDauDangNhap=false` (không cần đổi endpoint backend).
