import { useState, useEffect, useMemo, useCallback } from "react";
import {
  createShiftApi,
  getMonthScheduleApi,
  createExceptionApi,
  updateExceptionApi,
  deleteExceptionApi,
  deleteShiftApi,
  updateShiftApi,
} from "../../../api/shiftApi";
import {
  getAllCaLamDanhMucApi,
  createCaLamDanhMucApi,
  updateCaLamDanhMucApi,
  deleteCaLamDanhMucApi,
} from "../../../api/caLamDanhMucApi";
import { getAllNhanVienApi as getAllEmployeesApi } from "../../../api/employeeApi";
import {
  getAllChucVuApi as getChucVuApi,
  getAllPhongApi as getPhongApi,
} from "../../../api/danhMucApi";
import { useNotification } from "../../../components/NotificationContext";

const THU_ORDER = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

const TIEU_DE_THEO_LOAI = {
  NGHI_PHEP: "Nghỉ phép",
  THEM_CA: "Thêm ca",
};

const TH = {
  border: "1px solid #e5e7eb",
  padding: "11px 8px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  textAlign: "center",
  background: "#f1f5f9",
  whiteSpace: "nowrap",
};
const TD = {
  border: "1px solid #e5e7eb",
  padding: "6px 8px",
  fontSize: "13px",
  color: "#374151",
  verticalAlign: "top",
};

export default function QuanLyCaLamViec() {
  const [staff, setStaff] = useState([]);
  const [chucVuList, setChucVuList] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterChucVu, setFilterChucVu] = useState("");

  const [viewMode, setViewMode] = useState("calendar");
  const [calSelectedMaNV, setCalSelectedMaNV] = useState("");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calData, setCalData] = useState(null);
  const [calLoading, setCalLoading] = useState(false);
  const [calError, setCalError] = useState(null);
  const [calSelectedDay, setCalSelectedDay] = useState(null);
  const [calForm, setCalForm] = useState({
    loai: null,
    id: null,
    phong: "",
    gioLam: "08:00",
    gioKetThuc: "17:00",
    lyDo: "",
    maCaMacDinh: null,
  });
  const [calDefaultForm, setCalDefaultForm] = useState({ phong: "", caIds: [""] });
  const [calDeleteConfirmId, setCalDeleteConfirmId] = useState(null);
  const [calSaving, setCalSaving] = useState(false);
  const [calShowAddDefault, setCalShowAddDefault] = useState(false);
  const [calEditingDefaultId, setCalEditingDefaultId] = useState(null);
  const [calEditDefaultForm, setCalEditDefaultForm] = useState({ phong: "", caIds: [""] });
  const [caLamList, setCaLamList] = useState([]);
  const [caLamLoading, setCaLamLoading] = useState(false);
  const [caLamError, setCaLamError] = useState(null);
  const [caLamForm, setCaLamForm] = useState({
    tenCa: "",
    gioBatDau: "",
    gioKetThuc: "",
  });
  const [editingCaLamId, setEditingCaLamId] = useState(null);
  const [openCaLamModal, setOpenCaLamModal] = useState(false);
  const [caLamSaving, setCaLamSaving] = useState(false);

  const { showSuccess, showError } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setCaLamLoading(true);
    setCaLamError(null);
    try {
      const [nvData, cvData, phData, caLamData] =
        await Promise.all([
          getAllEmployeesApi(),
          getChucVuApi(),
          getPhongApi(),
          getAllCaLamDanhMucApi(),
        ]);
      setStaff(nvData || []);
      setChucVuList(cvData || []);
      setPhongList(phData || []);
      setCaLamList(caLamData || []);
    } catch (e) {
      setError(e.message);
      setCaLamError(e.message);
    } finally {
      setLoading(false);
      setCaLamLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // ============== CALENDAR LOGIC ==============
  const fmtGio = (s) => (s || "").substring(0, 5) || "--:--";

  const fetchCalMonth = useCallback(async () => {
    if (!calSelectedMaNV) {
      setCalData(null);
      return null;
    }
    setCalLoading(true);
    setCalError(null);
    try {
      const data = await getMonthScheduleApi(
        calSelectedMaNV,
        calYear,
        calMonth,
      );
      setCalData(data);
      return data;
    } catch (e) {
      setCalError(e.message);
      return null;
    } finally {
      setCalLoading(false);
    }
  }, [calSelectedMaNV, calYear, calMonth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCalMonth();
  }, [fetchCalMonth]);

  const changeCalMonth = (delta) => {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCalMonth(m);
    setCalYear(y);
  };

  const calOpenDay = (day) => {
    if (!day) return;
    setCalSelectedDay(day);
    const firstDefault = (day.macDinh || [])[0] || null;
    setCalForm({
      loai: null,
      id: null,
      phong: "",
      gioLam: "08:00",
      gioKetThuc: "17:00",
      lyDo: "",
      maCaMacDinh: firstDefault?.ca?.id || null,
    });
    setCalShowAddDefault(false);
    setCalDefaultForm({ phong: "", caIds: [""] });
  };

  const calSaveException = async () => {
    if (!calForm.loai || !calSelectedDay || !calSelectedMaNV) return;
    if (calForm.loai === "THEM_CA" && !calForm.phong.trim()) {
      showError("Vui lòng chọn phòng!");
      return;
    }
    if (calForm.loai === "THEM_CA" && !calForm.maCaMacDinh) {
      showError("Vui lòng chọn ca!");
      return;
    }
    const payload = {
      maNhanVien: Number(calSelectedMaNV),
      ngay: calSelectedDay.ngay,
      loai: calForm.loai,
      phong: calForm.loai === "NGHI_PHEP" ? null : calForm.phong.trim(),
      gioLam: calForm.loai === "NGHI_PHEP" ? null : calForm.gioLam,
      gioKetThuc: calForm.loai === "NGHI_PHEP" ? null : calForm.gioKetThuc,
      lyDo: calForm.lyDo.trim() || null,
      // NGHI_PHEP có thể chọn 1 ca cụ thể (nghỉ ca đó) hoặc không chọn (nghỉ cả ngày)
      maCaMacDinh:
        calForm.loai === "NGHI_PHEP" ? calForm.maCaMacDinh : null,
    };
    setCalSaving(true);
    try {
      if (calForm.id) await updateExceptionApi(calForm.id, payload);
      else await createExceptionApi(payload);
      setCalForm({
        loai: null,
        id: null,
        phong: "",
        gioLam: "08:00",
        gioKetThuc: "17:00",
        lyDo: "",
        maCaMacDinh: null,
      });
      setCalSelectedDay(null);
      await fetchCalMonth();
      showSuccess("Đã lưu ngoại lệ thành công");
    } catch (e) {
      showError("Lỗi lưu ngoại lệ: " + e.message);
    } finally {
      setCalSaving(false);
    }
  };

  const confirmDeleteException = async () => {
    const id = calDeleteConfirmId;
    setCalDeleteConfirmId(null);
    if (!id) return;
    setCalSaving(true);
    try {
      await deleteExceptionApi(id);
      const data = await fetchCalMonth();
      if (calSelectedDay) {
        const key = calSelectedDay.ngay;
        setCalSelectedDay(data?.days?.find((x) => x.ngay === key) || null);
      }
      showSuccess("Đã xóa ngoại lệ thành công");
    } catch (e) {
      showError("Lỗi xóa ngoại lệ: " + e.message);
    } finally {
      setCalSaving(false);
    }
  };

  const cancelDeleteException = () => {
    setCalDeleteConfirmId(null);
  };

  const calStartEdit = (ex) => {
    setCalForm({
      loai: ex.loai,
      id: ex.id,
      phong: ex.phong || "",
      gioLam: (ex.gioLam || "08:00:00").substring(0, 5),
      gioKetThuc: (ex.gioKetThuc || "17:00:00").substring(0, 5),
      lyDo: ex.lyDo || "",
      // NGHI_PHEP theo ca lưu caThayThe = ca bị nghỉ
      maCaMacDinh: ex.caThayThe?.id || ex.maCaMacDinh || null,
    });
  };

  const calAddDefault = async () => {
    if (!calSelectedDay) return;
    if (!calDefaultForm.phong.trim()) {
      showError("Vui lòng chọn phòng!");
      return;
    }
    const selectedCaIds = (calDefaultForm.caIds || [])
      .map((id) => (id ? parseInt(id, 10) : null))
      .filter((id) => id !== null);
    if (selectedCaIds.length === 0) {
      showError("Vui lòng chọn ít nhất 1 ca!");
      return;
    }
    setCalSaving(true);
    try {
      // Tạo bản ghi riêng cho từng ngày cùng thứ trong tháng đang xem.
      // Mỗi bản ghi có ngay = ngày cụ thể -> sửa/xóa 1 ngày không ảnh hưởng ngày khác.
      const daysInMonth = new Date(calYear, calMonth, 0).getDate();
      const thu = calSelectedDay.thu;
      for (let dd = 1; dd <= daysInMonth; dd++) {
        const date = new Date(calYear, calMonth - 1, dd);
        const thuIndex = (date.getDay() + 6) % 7;
        if (THU_ORDER[thuIndex] !== thu) continue;
        const ngayKey = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
        for (const maCa of selectedCaIds) {
          await createShiftApi({
            maNhanVien: Number(calSelectedMaNV),
            thu,
            maCa,
            phong: calDefaultForm.phong.trim(),
            ngay: ngayKey,
          });
        }
      }
      setCalShowAddDefault(false);
      setCalDefaultForm({ phong: "", caIds: [""] });
      const data = await fetchCalMonth();
      if (calSelectedDay) {
        const key = calSelectedDay.ngay;
        setCalSelectedDay(data?.days?.find((x) => x.ngay === key) || null);
      }
      showSuccess("Đã thêm ca làm việc thường");
    } catch (e) {
      showError("Lỗi thêm ca: " + e.message);
    } finally {
      setCalSaving(false);
    }
  };

  // Xóa 1 ca mặc định của ngày đang xem: xóa thật bản ghi bang_phan_cong_ca_lam
  const calDeleteDefault = async (m) => {
    const ok = window.confirm(
      `Xóa ca làm việc thường này?${m?.phong ? ` (${m.phong})` : ""}`,
    );
    if (!ok) return;
    if (!m?.id) {
      showError("Không tìm thấy ID ca làm việc để xóa!");
      return;
    }
    setCalSaving(true);
    try {
      await deleteShiftApi(m.id);
      const data = await fetchCalMonth();
      if (calSelectedDay) {
        const key = calSelectedDay.ngay;
        setCalSelectedDay(data?.days?.find((x) => x.ngay === key) || null);
      }
      showSuccess("Đã xóa ca làm việc thường");
    } catch (e) {
      showError("Lỗi xóa ca: " + e.message);
    } finally {
      setCalSaving(false);
    }
  };

  const calStartEditDefault = (m) => {
    setCalEditingDefaultId(m.id);
    setCalEditDefaultForm({
      phong: m.phong || "",
      caIds: [m.ca?.id || m.maCa || ""],
    });
  };

  const calSaveEditDefault = async () => {
    if (!calEditingDefaultId) return;
    if (!calEditDefaultForm.phong.trim()) {
      showError("Vui lòng chọn phòng!");
      return;
    }
    const selectedCaIds = (calEditDefaultForm.caIds || [])
      .map((id) => (id ? parseInt(id, 10) : null))
      .filter((id) => id !== null);
    if (selectedCaIds.length === 0) {
      showError("Vui lòng chọn ít nhất 1 ca!");
      return;
    }
    setCalSaving(true);
    try {
      // Cập nhật đúng bản ghi đang sửa bằng ca đầu tiên + phòng mới.
      // Giữ nguyên ngay của bản ghi gốc -> chỉ ảnh hưởng đúng 1 ngày.
      const editingRecord = (calSelectedDay?.macDinh || []).find(
        (m) => m.id === calEditingDefaultId,
      );
      const ngay = editingRecord?.ngay || calSelectedDay.ngay;
      await updateShiftApi(calEditingDefaultId, {
        maNhanVien: Number(calSelectedMaNV),
        thu: calSelectedDay.thu,
        maCa: selectedCaIds[0],
        phong: calEditDefaultForm.phong.trim(),
        ngay,
      });

      // Tạo thêm các ca còn lại cho đúng ngày (nếu người dùng chọn nhiều ca)
      for (let i = 1; i < selectedCaIds.length; i++) {
        await createShiftApi({
          maNhanVien: Number(calSelectedMaNV),
          thu: calSelectedDay.thu,
          maCa: selectedCaIds[i],
          phong: calEditDefaultForm.phong.trim(),
          ngay,
        });
      }

      setCalEditingDefaultId(null);
      setCalEditDefaultForm({ phong: "", caIds: [""] });
      const data = await fetchCalMonth();
      if (calSelectedDay) {
        const key = calSelectedDay.ngay;
        setCalSelectedDay(data?.days?.find((x) => x.ngay === key) || null);
      }
      showSuccess("Đã cập nhật ca làm việc thường");
    } catch (e) {
      showError("Lỗi cập nhật ca: " + e.message);
    } finally {
      setCalSaving(false);
    }
  };

  const calCancelEditDefault = () => {
    setCalEditingDefaultId(null);
    setCalEditDefaultForm({ phong: "", caIds: [""] });
  };

  const calCells = useMemo(() => {
    const first = new Date(calYear, calMonth - 1, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [calYear, calMonth]);

  const calGetDayData = (d) => {
    if (!calData || !calData.days) return null;
    const key = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return calData.days.find((x) => x.ngay === key) || null;
  };

  const calMergeShows = (day) => {
    if (!day) return { nghi: null, items: [] };
    const macDinh = day.macDinh || [];
    const ngoaiLe = day.ngoaiLe || [];
    const themCa = ngoaiLe.filter((e) => e.loai === "THEM_CA");
    const nghiList = ngoaiLe.filter((e) => e.loai === "NGHI_PHEP");
    // NGHI_PHEP có caThayThe = nghỉ 1 ca cụ thể; không có = nghỉ cả ngày
    const nghiCa = nghiList.find((e) => e.caThayThe);
    const nghiAll = nghiList.find((e) => !e.caThayThe);
    if (nghiAll) return { nghi: nghiAll, items: [] };
    const items = [];
    macDinh.forEach((m) => {
      // Nếu ca mặc định bị nghỉ 1 ca cụ thể -> bỏ qua ca đó
      if (
        nghiCa &&
        nghiCa.caThayThe &&
        m.ca &&
        nghiCa.caThayThe.id === m.ca.id
      ) {
        return;
      }
      items.push({ kind: "macDinh", data: m });
    });
    themCa.forEach((t) => {
      // Thêm ca cũng bị nghỉ nếu trùng ca
      if (
        nghiCa &&
        nghiCa.caThayThe &&
        t.caThayThe &&
        nghiCa.caThayThe.id === t.caThayThe.id
      ) {
        return;
      }
      if (nghiCa && nghiCa.caThayThe && t.gioLam) {
        // NGHI_PHEP lưu gioLam của ca bị nghỉ, so với THEM_CA thật sự là ca Thêm
        // (THEM_CA không dùng caThayThe, nên giữ hiển thị)
      }
      items.push({ kind: "them", data: t });
    });
    return { nghi: nghiCa, items };
  };

  const ADMIN_ROLE_NAMES = ["quản trị viên", "quản trị"];
  const isAdminRole = (s) => {
    const cv = String(s.chucVu || s.chuc_vu || "")
      .trim()
      .toLowerCase();
    return ADMIN_ROLE_NAMES.some((name) => cv.includes(name));
  };
  const nonAdminStaff = staff.filter((s) => !isAdminRole(s));

  const filteredCalRooms = phongList;

  // ============== DANH MỤC CA LOGIC ==============
  const saveCaLam = async () => {
    if (!caLamForm.tenCa.trim()) {
      showError("Vui lòng nhập tên ca!");
      return;
    }
    if (!caLamForm.gioBatDau || !caLamForm.gioKetThuc) {
      showError("Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc!");
      return;
    }
    const payload = {
      tenCa: caLamForm.tenCa.trim(),
      gioBatDau: caLamForm.gioBatDau + ":00",
      gioKetThuc: caLamForm.gioKetThuc + ":00",
    };
    setCaLamSaving(true);
    try {
      if (editingCaLamId) {
        await updateCaLamDanhMucApi(editingCaLamId, payload);
      } else {
        await createCaLamDanhMucApi(payload);
      }
      setOpenCaLamModal(false);
      setEditingCaLamId(null);
      setCaLamForm({ tenCa: "", gioBatDau: "", gioKetThuc: "" });
      await fetchData();
      showSuccess(editingCaLamId ? "Đã cập nhật ca" : "Đã thêm ca mới");
    } catch (e) {
      showError("Lỗi lưu ca: " + e.message);
    } finally {
      setCaLamSaving(false);
    }
  };

  const deleteCaLam = async (id) => {
    if (
      !window.confirm(
        "Xác nhận xóa ca này? Nếu ca đang được dùng trong lịch phân công, thao tác sẽ bị từ chối.",
      )
    )
      return;
    try {
      await deleteCaLamDanhMucApi(id);
      await fetchData();
      showSuccess("Đã xóa ca");
    } catch (e) {
      showError("Lỗi xóa ca: " + e.message);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "3px solid #e5e7eb",
            borderTopColor: "#005bc0",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span style={{ color: "#6b7280" }}>Đang tải bảng phân công...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          margin: "20px",
          padding: "20px",
          background: "#fee2e2",
          borderRadius: "10px",
          color: "#991b1b",
        }}
      >
        <strong>Lỗi:</strong> {error}
        <button
          onClick={fetchData}
          style={{
            marginLeft: "12px",
            padding: "4px 12px",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Thử lại
        </button>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg,#005bc0,#0077e6)",
          padding: "14px 24px",
          borderRadius: "10px 10px 0 0",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
          📋 BẢNG PHÂN CÔNG CA LÀM VIỆC
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", opacity: 0.9 }}>Lọc chức vụ:</span>
            <select
              value={filterChucVu}
              onChange={(e) => setFilterChucVu(e.target.value)}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="" style={{ color: "#111", background: "#fff" }}>
                👥 Tất cả nhân viên
              </option>
              {chucVuList
                .filter((cv) => {
                  const name = String(cv.tenChucVu || cv.ten_chuc_vu || "")
                    .trim()
                    .toLowerCase();
                  return !ADMIN_ROLE_NAMES.some((r) => name === r);
                })
                .map((cv) => (
                  <option
                    key={cv.id || cv.ma_chuc_vu}
                    value={cv.tenChucVu || cv.ten_chuc_vu}
                    style={{ color: "#111", background: "#fff" }}
                  >
                    {cv.tenChucVu || cv.ten_chuc_vu}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <button
          onClick={() => setViewMode("calendar")}
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            background: viewMode === "calendar" ? "#fff" : "#e5e7eb",
            color: viewMode === "calendar" ? "#005bc0" : "#374151",
          }}
        >
          📅 Lịch tháng
        </button>
        <button
          onClick={() => setViewMode("danh-muc-ca")}
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "13px",
            background: viewMode === "danh-muc-ca" ? "#fff" : "#e5e7eb",
            color: viewMode === "danh-muc-ca" ? "#005bc0" : "#374151",
          }}
        >
          🗂️ Danh mục ca
        </button>
      </div>
      {/* ============== CALENDAR VIEW ============== */}
      {viewMode === "calendar" && (
        <>
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    fontWeight: 600,
                  }}
                >
                  Nhân viên:
                </span>
                <select
                  value={calSelectedMaNV}
                  onChange={(e) => setCalSelectedMaNV(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    minWidth: "200px",
                  }}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {nonAdminStaff.map((s) => (
                    <option
                      key={s.maNhanVien || s.ma_nhan_vien}
                      value={s.maNhanVien || s.ma_nhan_vien}
                    >
                      {s.hoTen || s.ho_ten} (NV
                      {String(s.maNhanVien || s.ma_nhan_vien).padStart(3, "0")})
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <button
                  onClick={() => changeCalMonth(-1)}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ◀
                </button>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    minWidth: "100px",
                    textAlign: "center",
                  }}
                >
                  {calMonth}/{calYear}
                </span>
                <button
                  onClick={() => changeCalMonth(1)}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  ▶
                </button>
                <button
                  onClick={() => {
                    const n = new Date();
                    setCalMonth(n.getMonth() + 1);
                    setCalYear(n.getFullYear());
                  }}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Hôm nay
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
              padding: "12px",
              overflowX: "auto",
            }}
          >
            {calLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "3px solid #e5e7eb",
                    borderTopColor: "#005bc0",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ color: "#6b7280" }}>Đang tải lịch tháng...</span>
              </div>
            )}
            {calError && !calLoading && (
              <div
                style={{
                  margin: "12px",
                  padding: "14px",
                  background: "#fee2e2",
                  borderRadius: "8px",
                  color: "#991b1b",
                }}
              >
                Lỗi: {calError}
              </div>
            )}
            {!calLoading && !calError && calSelectedMaNV && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "6px",
                  minWidth: "820px",
                }}
              >
                {THU_ORDER.map((t) => (
                  <div
                    key={t}
                    style={{
                      textAlign: "center",
                      padding: "8px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background:
                        t === "Thứ 7" || t === "Chủ Nhật"
                          ? "#fef2f2"
                          : "#f1f5f9",
                      color:
                        t === "Thứ 7" || t === "Chủ Nhật"
                          ? "#e11d48"
                          : "#475569",
                    }}
                  >
                    {t}
                  </div>
                ))}
                {calCells.map((d, idx) => {
                  if (d === null)
                    return (
                      <div
                        key={`e-${idx}`}
                        style={{
                          minHeight: "104px",
                          borderRadius: "10px",
                          background: "#fafafa",
                        }}
                      />
                    );
                  const day = calGetDayData(d);
                  const { nghi, items } = calMergeShows(day);
                  const dateKey = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const isToday =
                    dateKey ===
                    (() => {
                      const n = new Date();
                      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
                    })();
                  const isWeekend =
                    new Date(calYear, calMonth - 1, d).getDay() === 0 ||
                    new Date(calYear, calMonth - 1, d).getDay() === 6;
                  return (
                    <div
                      key={dateKey}
                      onClick={() => calOpenDay(day)}
                      style={{
                        minHeight: "104px",
                        borderRadius: "10px",
                        padding: "6px",
                        cursor: "pointer",
                        border: isToday
                          ? "2px solid #005bc0"
                          : "1px solid #e5e7eb",
                        background: "#fff",
                        transition: "background .15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f0f9ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: isToday
                              ? "#005bc0"
                              : isWeekend
                                ? "#e11d48"
                                : "#1e293b",
                          }}
                        >
                          {d}
                        </span>
                        {isToday && (
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              color: "#fff",
                              background: "#005bc0",
                              borderRadius: "6px",
                              padding: "1px 5px",
                            }}
                          >
                            Nay
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        {nghi && (
                          <div
                            style={{
                              background: "#fee2e2",
                              border: "1px solid #fca5a5",
                              borderRadius: "6px",
                              padding: "3px 6px",
                              fontSize: "11px",
                              color: "#b91c1c",
                              fontWeight: 700,
                            }}
                          >
                            🚫 Nghỉ{nghi.lyDo ? ` (${nghi.lyDo})` : ""}
                          </div>
                        )}
                        {items.map((it, i) => {
                          const isExtra = it.kind === "them";
                          const isDoi = it.kind === "doi";
                          const bg = isExtra
                            ? "linear-gradient(135deg,#fef9c3,#fef08a)"
                            : isDoi
                              ? "linear-gradient(135deg,#ede9fe,#ddd6fe)"
                              : "linear-gradient(135deg,#dbeafe,#eff6ff)";
                          const border = isExtra
                            ? "#facc15"
                            : isDoi
                              ? "#c4b5fd"
                              : "#93c5fd";
                          const color = isExtra
                            ? "#854d0e"
                            : isDoi
                              ? "#5b21b6"
                              : "#1e40af";
                              return (
                                 <div
                                   key={i}
                                   style={{
                                     background: bg,
                                     border: `1px solid ${border}`,
                                     borderRadius: "6px",
                                     padding: "3px 6px",
                                     fontSize: "11px",
                                     color,
                                   }}
                                 >
                                    <div style={{ fontWeight: 700 }}>
                                      📍 {it.data.phong || "—"}
                                    </div>
                                    <div>
                                      {isDoi
                                        ? it.data.caThayThe?.tenCa || "Đổi ca"
                                        : (() => {
                                            const ca = it.data.ca;
                                            const name =
                                              ca?.tenCa ||
                                              (() => {
                                                const h = Number(
                                                  (
                                                    ca?.gioBatDau ||
                                                    it.data.gioLam ||
                                                    ""
                                                  ).split(":")[0],
                                                );
                                                return h < 12
                                                  ? "ca sáng"
                                                  : "ca chiều";
                                              })();
                                            const start = fmtGio(
                                              isDoi
                                                ? it.data.gioLam
                                                : ca?.gioBatDau || it.data.gioLam,
                                            );
                                            const end = fmtGio(
                                              isDoi
                                                ? it.data.gioKetThuc
                                                : ca?.gioKetThuc || it.data.gioKetThuc,
                                            );
                                            return `${name} ${start}-${end}`;
                                          })()}
                                    </div>
                                   {isExtra && (
                                     <div
                                       style={{
                                         fontSize: "10px",
                                         fontStyle: "italic",
                                       }}
                                     >
                                       Thêm ca
                                     </div>
                                   )}
                                   {isDoi && (
                                     <div
                                       style={{
                                         fontSize: "10px",
                                         fontStyle: "italic",
                                       }}
                                     >
                                       Đổi ca
                                     </div>
                                   )}
                                 </div>
                              );
                        })}
                        {!nghi && items.length === 0 && (
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#cbd5e1",
                              textAlign: "center",
                              marginTop: "8px",
                            }}
                          >
                            —
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!calLoading && !calError && !calSelectedMaNV && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                Vui lòng chọn nhân viên để xem lịch tháng.
              </div>
            )}
          </div>

          {/* CALENDAR DAY MODAL */}
          {calSelectedDay &&
            calSelectedMaNV &&
            (() => {
              const emp = nonAdminStaff.find(
                (s) =>
                  String(s.maNhanVien || s.ma_nhan_vien) ===
                  String(calSelectedMaNV),
              );
              return (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      width: "480px",
                      maxWidth: "100%",
                      maxHeight: "90vh",
                      overflowY: "auto",
                      borderRadius: "16px",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div
                      style={{
                        background: "#005bc0",
                        padding: "16px 20px",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: "16px 16px 0 0",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          Quản lý ca ngày {calSelectedDay.ngay}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.85 }}>
                          {calSelectedDay.thu} ·{" "}
                          {emp?.hoTen || emp?.ho_ten || ""}
                        </div>
                      </div>
                      <button
                        onClick={() => setCalSelectedDay(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "20px",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ padding: "16px 20px" }}>
                      {/* Ca mặc định (theo thứ) */}
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Ca làm việc thường (theo {calSelectedDay.thu})
                        </div>
                        {(calSelectedDay.macDinh || []).length === 0 ? (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#94a3b8",
                              fontStyle: "italic",
                              marginBottom: "6px",
                            }}
                          >
                            Chưa có ca làm việc thường cho thứ này.
                          </div>
                        ) : (
                          (calSelectedDay.macDinh || []).map((m) => (
                            <div
                              key={m.id}
                              style={{
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                fontSize: "12px",
                                color: "#334155",
                                marginBottom: "4px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span>
                                📍 {m.phong || "—"}
                                <br />
                                {(() => {
                                  const ca = m.ca;
                                  const name =
                                    ca?.tenCa ||
                                    (() => {
                                      const h = Number(
                                        (ca?.gioBatDau || m.gioLam || "").split(
                                          ":",
                                        )[0],
                                      );
                                      return h < 12 ? "ca sáng" : "ca chiều";
                                    })();
                                  const start = fmtGio(
                                    ca?.gioBatDau || m.gioLam,
                                  );
                                  const end = fmtGio(
                                    ca?.gioKetThuc || m.gioKetThuc,
                                  );
                                  return `${name} ${start}-${end}`;
                                })()}
                              </span>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                  onClick={() =>
                                    calStartEditDefault(m)
                                  }
                                  disabled={calSaving}
                                  style={{
                                    background: "#e0f2fe",
                                    color: "#0369a1",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "2px 8px",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => calDeleteDefault(m)}
                                  disabled={calSaving}
                                  style={{
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "2px 8px",
                                    fontSize: "10px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                        {calEditingDefaultId ? (
                          <div
                            style={{
                              marginTop: "6px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "10px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                marginBottom: "6px",
                              }}
                            >
                              Sửa ca làm việc thường ({calSelectedDay.thu})
                            </div>
                            <label
                              style={{
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              Phòng:
                              <select
                                value={calEditDefaultForm.phong}
                                onChange={(e) =>
                                  setCalEditDefaultForm({
                                    ...calEditDefaultForm,
                                    phong: e.target.value,
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "7px",
                                  marginTop: "3px",
                                  borderRadius: "5px",
                                  border: "1px solid #ddd",
                                }}
                                >
                                  <option value="">-- Chọn phòng --</option>
                                  {filteredCalRooms.map((p) => {
                                    const ten = p.ten_phong || p.tenPhong;
                                    return (
                                      <option
                                        key={p.ma_phong || p.maPhong}
                                        value={ten}
                                      >
                                        {ten}
                                      </option>
                                    );
                                  })}
                                 </select>
                              </label>
                                <div style={{ marginBottom: "15px" }}>
                                  <label style={{ fontSize: "12px" }}>
                                    Chọn ca:
                                  </label>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "3px" }}>
                                    {(calEditDefaultForm.caIds || [""]).map((caId, idx) => (
                                      <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <select
                                          value={caId}
                                          onChange={(e) => {
                                            const newCaIds = [...(calEditDefaultForm.caIds || [])];
                                            newCaIds[idx] = e.target.value;
                                            setCalEditDefaultForm({
                                              ...calEditDefaultForm,
                                              caIds: newCaIds,
                                            });
                                          }}
                                          style={{
                                            flex: 1,
                                            padding: "7px",
                                            borderRadius: "5px",
                                            border: "1px solid #ddd",
                                          }}
                                        >
                                          <option value="">-- Chọn ca --</option>
                                          {caLamList.map((ca) => {
                                            const label =
                                              ca.tenCa ||
                                              (() => {
                                                const h = Number(
                                                  (ca.gioBatDau || "").split(":")[0],
                                                );
                                                return h < 12 ? "Ca sáng" : "Ca chiều";
                                              })();
                                            return (
                                              <option key={ca.id} value={ca.id}>
                                                {label} ({fmtGio(ca.gioBatDau)}–
                                                {fmtGio(ca.gioKetThuc)})
                                              </option>
                                            );
                                          })}
                                        </select>
                                        {(calEditDefaultForm.caIds || []).length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newCaIds = (calEditDefaultForm.caIds || []).filter((_, i) => i !== idx);
                                              setCalEditDefaultForm({
                                                ...calEditDefaultForm,
                                                caIds: newCaIds.length ? newCaIds : [""],
                                              });
                                            }}
                                            style={{
                                              width: "28px",
                                              height: "28px",
                                              borderRadius: "5px",
                                              border: "1px solid #ddd",
                                              background: "#fef2f2",
                                              cursor: "pointer",
                                              fontSize: "14px",
                                              fontWeight: 700,
                                              color: "#dc2626",
                                            }}
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCalEditDefaultForm({
                                          ...calEditDefaultForm,
                                          caIds: [...(calEditDefaultForm.caIds || []), ""],
                                        });
                                      }}
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "5px",
                                        border: "1px solid #ddd",
                                        background: "#f8fafc",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        fontWeight: 700,
                                        color: "#005bc0",
                                        alignSelf: "flex-start",
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <button
                                onClick={calCancelEditDefault}
                                disabled={calSaving}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #ddd",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                Hủy
                              </button>
                              <button
                                onClick={calSaveEditDefault}
                                disabled={calSaving}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: "6px",
                                  background: "#005bc0",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  fontSize: "12px",
                                }}
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : !calShowAddDefault ? (
                            <button
                              onClick={() => {
                                setCalShowAddDefault(true);
                                const firstRoom =
                                  filteredCalRooms[0]?.ten_phong ||
                                  filteredCalRooms[0]?.tenPhong ||
                                  "";
                                setCalDefaultForm({ phong: firstRoom, caIds: [""] });
                              }}
                              disabled={calSaving}
                              style={{
                                marginTop: "4px",
                                background: "#e0f2fe",
                                color: "#0369a1",
                                border: "none",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "11px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              + Thêm ca làm việc thường
                            </button>
                        ) : (
                          <div
                            style={{
                              marginTop: "6px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "10px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                marginBottom: "6px",
                              }}
                            >
                              Thêm ca làm việc thường ({calSelectedDay.thu})
                            </div>
                            <label
                              style={{
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "6px",
                              }}
                            >
                              Phòng:
                              <select
                                value={calDefaultForm.phong}
                                onChange={(e) =>
                                  setCalDefaultForm({
                                    ...calDefaultForm,
                                    phong: e.target.value,
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "7px",
                                  marginTop: "3px",
                                  borderRadius: "5px",
                                  border: "1px solid #ddd",
                                }}
                              >
                                <option value="">-- Chọn phòng --</option>
                                {filteredCalRooms.map((p) => {
                                  const ten = p.ten_phong || p.tenPhong;
                                  return (
                                    <option
                                      key={p.ma_phong || p.maPhong}
                                      value={ten}
                                    >
                                      {ten}
                                    </option>
                                  );
                                })}
                               </select>
                              </label>
                                <div style={{ marginBottom: "15px" }}>
                                  <label style={{ fontSize: "12px" }}>
                                    Chọn ca:
                                  </label>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "3px" }}>
                                    {(calDefaultForm.caIds || [""]).map((caId, idx) => (
                                      <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <select
                                          value={caId}
                                          onChange={(e) => {
                                            const newCaIds = [...(calDefaultForm.caIds || [])];
                                            newCaIds[idx] = e.target.value;
                                            setCalDefaultForm({
                                              ...calDefaultForm,
                                              caIds: newCaIds,
                                            });
                                          }}
                                          style={{
                                            flex: 1,
                                            padding: "7px",
                                            borderRadius: "5px",
                                            border: "1px solid #ddd",
                                          }}
                                        >
                                          <option value="">-- Chọn ca --</option>
                                          {caLamList.map((ca) => {
                                            const label =
                                              ca.tenCa ||
                                              (() => {
                                                const h = Number(
                                                  (ca.gioBatDau || "").split(":")[0],
                                                );
                                                return h < 12 ? "Ca sáng" : "Ca chiều";
                                              })();
                                            return (
                                              <option key={ca.id} value={ca.id}>
                                                {label} ({fmtGio(ca.gioBatDau)}–
                                                {fmtGio(ca.gioKetThuc)})
                                              </option>
                                            );
                                          })}
                                        </select>
                                        {(calDefaultForm.caIds || []).length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newCaIds = (calDefaultForm.caIds || []).filter((_, i) => i !== idx);
                                              setCalDefaultForm({
                                                ...calDefaultForm,
                                                caIds: newCaIds.length ? newCaIds : [""],
                                              });
                                            }}
                                            style={{
                                              width: "28px",
                                              height: "28px",
                                              borderRadius: "5px",
                                              border: "1px solid #ddd",
                                              background: "#fef2f2",
                                              cursor: "pointer",
                                              fontSize: "14px",
                                              fontWeight: 700,
                                              color: "#dc2626",
                                            }}
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCalDefaultForm({
                                          ...calDefaultForm,
                                          caIds: [...(calDefaultForm.caIds || []), ""],
                                        });
                                      }}
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "5px",
                                        border: "1px solid #ddd",
                                        background: "#f8fafc",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        fontWeight: 700,
                                        color: "#005bc0",
                                        alignSelf: "flex-start",
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "6px",
                              }}
                            >
                              <button
                                onClick={() => {
                                  setCalShowAddDefault(false);
                                  setCalDefaultForm({ phong: "", caIds: [""] });
                                }}
                                disabled={calSaving}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #ddd",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                Hủy
                              </button>
                              <button
                                onClick={calAddDefault}
                                disabled={calSaving}
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: "6px",
                                  background: "#005bc0",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  fontSize: "12px",
                                }}
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ngoại lệ đã có */}
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#334155",
                            marginBottom: "6px",
                          }}
                        >
                          Ngoại lệ đã có
                        </div>
                        {(calSelectedDay.ngoaiLe || []).length === 0 ? (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#94a3b8",
                              fontStyle: "italic",
                            }}
                          >
                            Chưa có.
                          </div>
                        ) : (
                          (calSelectedDay.ngoaiLe || []).map((ex) => (
                            <div
                              key={ex.id}
                              style={{
                                background: "#fff7ed",
                                border: "1px solid #fed7aa",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                fontSize: "12px",
                                color: "#9a3412",
                                marginBottom: "4px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 700 }}>
                                    {TIEU_DE_THEO_LOAI[ex.loai]}
                                  </span>
                                  {ex.caThayThe?.tenCa
                                    ? ` · ${ex.caThayThe.tenCa}`
                                    : ""}
                                  {ex.phong ? ` · 📍 ${ex.phong}` : ""}
                                  {ex.gioLam
                                    ? ` · 🕗 ${fmtGio(ex.gioLam)}–${fmtGio(ex.gioKetThuc)}`
                                    : ""}
                                  {ex.lyDo ? ` · 📝 ${ex.lyDo}` : ""}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "6px",
                                    alignItems: "center",
                                  }}
                                >
                                  <button
                                    onClick={() => calStartEdit(ex)}
                                    disabled={calSaving}
                                    style={{
                                      background: "#e0f2fe",
                                      color: "#0369a1",
                                      border: "none",
                                      borderRadius: "4px",
                                      padding: "2px 8px",
                                      fontSize: "10px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Sửa
                                  </button>
                                  {calDeleteConfirmId !== ex.id && (
                                    <button
                                      onClick={() =>
                                        setCalDeleteConfirmId(ex.id)
                                      }
                                      disabled={calSaving}
                                      style={{
                                        background: "#fee2e2",
                                        color: "#dc2626",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "2px 8px",
                                        fontSize: "10px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                              </div>
                              {calDeleteConfirmId === ex.id && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "8px",
                                    alignItems: "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#991b1b",
                                    }}
                                  >
                                    Xác nhận xóa ngoại lệ này?
                                  </span>
                                  <button
                                    onClick={cancelDeleteException}
                                    disabled={calSaving}
                                    style={{
                                      padding: "3px 10px",
                                      borderRadius: "4px",
                                      border: "1px solid #ddd",
                                      background: "#fff",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                    }}
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    onClick={confirmDeleteException}
                                    disabled={calSaving}
                                    style={{
                                      padding: "3px 10px",
                                      borderRadius: "4px",
                                      border: "none",
                                      background: "#dc2626",
                                      color: "#fff",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Thêm / sửa ngoại lệ */}
                      <div
                        style={{
                          borderTop: "1px solid #e5e7eb",
                          paddingTop: "14px",
                        }}
                      >
                        {!calForm.loai && (
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() =>
                                setCalForm({ ...calForm, loai: "NGHI_PHEP" })
                              }
                              disabled={calSaving}
                              style={btnStyle("#dc2626")}
                            >
                              🚫 Nghỉ phép
                            </button>
                            <button
                              onClick={() =>
                                setCalForm({ ...calForm, loai: "THEM_CA" })
                              }
                              disabled={calSaving}
                              style={btnStyle("#ca8a04")}
                            >
                              ➕ Thêm ca
                            </button>
                          </div>
                        )}
                        {calForm.loai && (
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#334155",
                                marginBottom: "10px",
                              }}
                            >
                              {calForm.id ? "Sửa" : "Thêm"}{" "}
                              {TIEU_DE_THEO_LOAI[calForm.loai]}
                            </div>

                            {calForm.loai !== "NGHI_PHEP" && (
                              <>
                                <label
                                  style={{
                                    fontSize: "12px",
                                    display: "block",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Chọn ca:
                                  <select
                                    value={
                                      calForm.maCaMacDinh
                                        ? String(calForm.maCaMacDinh)
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const id = e.target.value
                                        ? Number(e.target.value)
                                        : null;
                                      const ca = caLamList.find(
                                        (c) => c.id === id,
                                      );
                                      setCalForm({
                                        ...calForm,
                                        maCaMacDinh: id,
                                        gioLam: ca
                                          ? ca.gioBatDau
                                          : calForm.gioLam,
                                        gioKetThuc: ca
                                          ? ca.gioKetThuc
                                          : calForm.gioKetThuc,
                                      });
                                    }}
                                    disabled={calSaving}
                                    style={{
                                      width: "100%",
                                      padding: "8px",
                                      marginTop: "4px",
                                      borderRadius: "5px",
                                      border: "1px solid #ddd",
                                    }}
                                  >
                                    <option value="">-- Chọn ca --</option>
                                    {caLamList.map((ca) => (
                                      <option key={ca.id} value={ca.id}>
                                        {ca.tenCa} ({fmtGio(ca.gioBatDau)}–
                                        {fmtGio(ca.gioKetThuc)})
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <label
                                  style={{
                                    fontSize: "12px",
                                    display: "block",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Phòng:
                                  <select
                                    value={calForm.phong}
                                    onChange={(e) =>
                                      setCalForm({
                                        ...calForm,
                                        phong: e.target.value,
                                      })
                                    }
                                    disabled={calSaving}
                                    style={{
                                      width: "100%",
                                      padding: "8px",
                                      marginTop: "4px",
                                      borderRadius: "5px",
                                      border: "1px solid #ddd",
                                    }}
                                  >
                                    <option value="">-- Chọn phòng --</option>
                                    {filteredCalRooms.map((p) => {
                                      const ten = p.ten_phong || p.tenPhong;
                                      return (
                                        <option
                                          key={p.ma_phong || p.maPhong}
                                          value={ten}
                                        >
                                          {ten}
                                        </option>
                                      );
                                    })}
                                   </select>
                                 </label>

                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "10px",
                                    marginBottom: "8px",
                                  }}
                                >
                                  <label style={{ fontSize: "12px" }}>
                                    Bắt đầu:
                                  </label>
                                  <span
                                    style={{
                                      width: "100%",
                                      padding: "8px",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {calForm.gioLam
                                      ? calForm.gioLam.substring(0, 5)
                                      : "--:--"}
                                  </span>
                                  <label style={{ fontSize: "12px" }}>
                                    Kết thúc:
                                  </label>
                                  <span
                                    style={{
                                      width: "100%",
                                      padding: "8px",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {calForm.gioKetThuc
                                      ? calForm.gioKetThuc.substring(0, 5)
                                      : "--:--"}
                                  </span>
                                </div>
                              </>
                            )}

                            <label
                              style={{
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "12px",
                              }}
                            >
                              Lý do (tùy chọn):
                              <input
                                value={calForm.lyDo}
                                onChange={(e) =>
                                  setCalForm({
                                    ...calForm,
                                    lyDo: e.target.value,
                                  })
                                }
                                placeholder="vd: nghỉ bệnh, hỗ trợ phòng khám..."
                                disabled={calSaving}
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  marginTop: "4px",
                                  borderRadius: "5px",
                                  border: "1px solid #ddd",
                                }}
                              />
                            </label>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  setCalForm({
                                    loai: null,
                                    id: null,
                                    phong: "",
                                    gioLam: "08:00",
                                    gioKetThuc: "17:00",
                                    lyDo: "",
                                    maCaMacDinh: null,
                                  })
                                }
                                disabled={calSaving}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "6px",
                                  border: "1px solid #ddd",
                                  cursor: "pointer",
                                }}
                              >
                                Hủy
                              </button>
                              <button
                                onClick={calSaveException}
                                disabled={calSaving}
                                style={{
                                  padding: "8px 20px",
                                  borderRadius: "6px",
                                  background: "#005bc0",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
        </>
      )}

      {/* ============== DANH MỤC CA VIEW ============== */}
      {viewMode === "danh-muc-ca" && (
        <div
          style={{
            marginTop: "12px",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0, color: "#005bc0", fontSize: "16px" }}>
              Danh mục ca làm việc
            </h2>
            <button
              onClick={() => {
                setEditingCaLamId(null);
                setCaLamForm({ tenCa: "", gioBatDau: "", gioKetThuc: "" });
                setOpenCaLamModal(true);
              }}
              style={{
                padding: "8px 16px",
                background: "#005bc0",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              + Thêm ca mới
            </button>
          </div>

          {caLamLoading && (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}
            >
              Đang tải danh mục ca...
            </div>
          )}
          {caLamError && !caLamLoading && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "20px",
              }}
            >
              Lỗi: {caLamError}
            </div>
          )}

          {!caLamLoading && !caLamError && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH}>Tên ca</th>
                    <th style={TH}>Giờ bắt đầu</th>
                    <th style={TH}>Giờ kết thúc</th>
                    <th style={TH}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {caLamList.map((ca) => (
                    <tr key={ca.id}>
                      <td style={TD}>{ca.tenCa}</td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        {fmtGio(ca.gioBatDau)}
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        {fmtGio(ca.gioKetThuc)}
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <button
                          onClick={() => {
                            setEditingCaLamId(ca.id);
                            setCaLamForm({
                              tenCa: ca.tenCa,
                              gioBatDau: fmtGio(ca.gioBatDau),
                              gioKetThuc: fmtGio(ca.gioKetThuc),
                            });
                            setOpenCaLamModal(true);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#e0f2fe",
                            color: "#0369a1",
                            border: "none",
                            borderRadius: "4px",
                            marginRight: "8px",
                            cursor: "pointer",
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => deleteCaLam(ca.id)}
                          style={{
                            padding: "6px 12px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MODAL THÊM/SỬA CA DANH MỤC */}
          {openCaLamModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  width: "400px",
                  borderRadius: "16px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    background: "#005bc0",
                    padding: "18px",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: "16px 16px 0 0",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {editingCaLamId ? "Sửa ca" : "Thêm ca mới"}
                  </div>
                  <button
                    onClick={() => setOpenCaLamModal(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: "20px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "12px",
                    }}
                  >
                    Tên ca:
                    <input
                      value={caLamForm.tenCa}
                      onChange={(e) =>
                        setCaLamForm({ ...caLamForm, tenCa: e.target.value })
                      }
                      placeholder="vd: Ca sáng"
                      disabled={caLamSaving}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginTop: "4px",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    <label style={{ fontSize: "13px" }}>
                      Giờ bắt đầu:
                      <input
                        type="time"
                        value={caLamForm.gioBatDau}
                        onChange={(e) =>
                          setCaLamForm({
                            ...caLamForm,
                            gioBatDau: e.target.value,
                          })
                        }
                        disabled={caLamSaving}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "4px",
                          borderRadius: "5px",
                          border: "1px solid #ddd",
                        }}
                      />
                    </label>
                    <label style={{ fontSize: "13px" }}>
                      Giờ kết thúc:
                      <input
                        type="time"
                        value={caLamForm.gioKetThuc}
                        onChange={(e) =>
                          setCaLamForm({
                            ...caLamForm,
                            gioKetThuc: e.target.value,
                          })
                        }
                        disabled={caLamSaving}
                        style={{
                          width: "100%",
                          padding: "8px",
                          marginTop: "4px",
                          borderRadius: "5px",
                          border: "1px solid #ddd",
                        }}
                      />
                    </label>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => setOpenCaLamModal(false)}
                      disabled={caLamSaving}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        cursor: "pointer",
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={saveCaLam}
                      disabled={caLamSaving}
                      style={{
                        padding: "8px 25px",
                        borderRadius: "6px",
                        background: "#005bc0",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function btnStyle(color) {
  return {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    color: "#fff",
    background: color,
    fontSize: "12px",
  };
}
