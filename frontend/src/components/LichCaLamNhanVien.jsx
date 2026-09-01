import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getMonthScheduleApi,
  createExceptionApi,
  updateExceptionApi,
  deleteExceptionApi,
  createShiftApi,
  deleteShiftApi,
} from "../api/shiftApi";
import { getAllNhanVienApi as getAllEmployeesApi } from "../api/employeeApi";
import { getAllPhongApi } from "../api/danhMucApi";

const THU_ORDER = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

const LOAI_LABEL = {
  NGHI_PHEP: "Nghỉ phép",
  DOI_CA: "Đổi ca",
  THEM_CA: "Thêm ca thường ngoại lệ",
};

const fmtGio = (s) => (s || "").substring(0, 5) || "--:--";

export default function LichCaLamNhanVien() {
  const [staff, setStaff] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [selectedMaNV, setSelectedMaNV] = useState("");
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedDay, setSelectedDay] = useState(null); // { ngay, thu, macDinh, ngoaiLe }
  const [form, setForm] = useState({
    loai: null,
    id: null,
    phong: "",
    gioLam: "",
    gioKetThuc: "",
    lyDo: "",
    caIds: [""],
  });

  // Thêm/sửa ca mặc định theo thứ (bang_phan_cong_ca_lam)
  const [showAddDefault, setShowAddDefault] = useState(false);
  const [defaultForm, setDefaultForm] = useState({
    phong: "",
    gioLam: "",
    gioKetThuc: "",
  });

  // Bộ chọn nhân viên dạng tìm kiếm (hỗ trợ hàng trăm NV)
  const [empOpen, setEmpOpen] = useState(false);
  const [empQuery, setEmpQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [nv, ph] = await Promise.all([
          getAllEmployeesApi(),
          getAllPhongApi(),
        ]);
        const list = Array.isArray(nv) ? nv : [];
        setStaff(list);
        setPhongList(Array.isArray(ph) ? ph : []);
        if (list.length > 0) {
          // Mặc định chọn nhân viên đầu tiên (không phải quản trị)
          const adminRoles = ["quản trị viên", "quản trị"];
          const first =
            list.find(
              (s) =>
                !adminRoles.includes(
                  String(s.chucVu || s.chuc_vu || "")
                    .trim()
                    .toLowerCase(),
                ),
            ) || list[0];
          setSelectedMaNV(first.maNhanVien || first.ma_nhan_vien);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const fetchMonth = useCallback(async () => {
    if (!selectedMaNV) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMonthScheduleApi(selectedMaNV, viewYear, viewMonth);
      setMonthData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMaNV, viewYear, viewMonth]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const goToday = () => {
    const now = new Date();
    setViewMonth(now.getMonth() + 1);
    setViewYear(now.getFullYear());
  };

  // Sinh ô ngày trong tháng (null = ô trống để căn lưới)
  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth - 1, 1);
    const startOffset = (first.getDay() + 6) % 7; // Thứ 2 = 0
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewYear, viewMonth]);

  const monthLabel = `${viewMonth}/${viewYear}`;

  const todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  })();

  const getDayData = (d) => {
    if (!monthData || !monthData.days) return null;
    const key = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return monthData.days.find((x) => x.ngay === key) || null;
  };

  // Tính danh sách hiển thị của 1 ngày (đã merge)
  const mergeShows = (day) => {
    if (!day) return { nghi: null, items: [] };
    const macDinh = day.macDinh || [];
    const ngoaiLe = day.ngoaiLe || [];
    const nghi = ngoaiLe.find((e) => e.loai === "NGHI_PHEP");
    if (nghi) return { nghi, items: [] };
    const doiCa = ngoaiLe.find((e) => e.loai === "DOI_CA");
    const themCa = ngoaiLe.filter((e) => e.loai === "THEM_CA");
    const items = [];
    if (doiCa) items.push({ kind: "doi", data: doiCa });
    else macDinh.forEach((m) => items.push({ kind: "macDinh", data: m }));
    themCa.forEach((t) => items.push({ kind: "them", data: t }));
    return { nghi, items };
  };

  const openDay = (d) => {
    const day = getDayData(d);
    if (!day) return;
    setSelectedDay(day);
    setForm({
      loai: null,
      id: null,
      phong: "",
      gioLam: "",
      gioKetThuc: "",
      lyDo: "",
      caIds: [""],
    });
  };

  const startAdd = (loai) => {
    setForm({
      loai,
      id: null,
      phong: phongList[0]?.ten_phong || phongList[0]?.tenPhong || "",
      gioLam: "",
      gioKetThuc: "",
      lyDo: "",
      caIds: [""],
    });
  };

  const startEdit = (ex) => {
    const selectedCaId = ex.caThayThe?.id || ex.maCaMacDinh;
    setForm({
      loai: ex.loai,
      id: ex.id,
      phong: ex.phong || "",
      gioLam: ex.gioLam ? ex.gioLam.substring(0, 5) : "",
      gioKetThuc: ex.gioKetThuc ? ex.gioKetThuc.substring(0, 5) : "",
      lyDo: ex.lyDo || "",
      caIds: selectedCaId ? [String(selectedCaId)] : [""],
    });
  };

  const handleSave = async () => {
    if (!form.loai || !selectedDay) return;
    if (
      (form.loai === "DOI_CA" || form.loai === "THEM_CA") &&
      !form.phong.trim()
    ) {
      alert("Vui lòng chọn phòng!");
      return;
    }
    const selectedCaIds = (form.caIds || []).filter(Boolean);
    if (
      (form.loai === "DOI_CA" || form.loai === "THEM_CA") &&
      selectedCaIds.length === 0
    ) {
      alert("Vui lòng chọn ca!");
      return;
    }
    const payload = {
      maNhanVien: Number(selectedMaNV),
      ngay: selectedDay.ngay,
      loai: form.loai,
      phong: form.loai === "NGHI_PHEP" ? null : form.phong.trim(),
      gioLam: form.loai === "NGHI_PHEP" ? null : null,
      gioKetThuc: form.loai === "NGHI_PHEP" ? null : null,
      lyDo: form.lyDo.trim() || null,
      maCaMacDinh: selectedCaIds.length > 0 ? Number(selectedCaIds[0]) : null,
    };
    try {
      if (form.id) await updateExceptionApi(form.id, payload);
      else await createExceptionApi(payload);
      setForm({
        loai: null,
        id: null,
        phong: "",
        gioLam: "",
        gioKetThuc: "",
        lyDo: "",
        caIds: [""],
      });
      await reloadDay();
    } catch (e) {
      alert(e.message);
    }
  };

  const reloadDay = async () => {
    if (!selectedDay) return;
    const key = selectedDay.ngay;
    await fetchMonth();
    const refreshed = await getMonthScheduleApi(
      selectedMaNV,
      viewYear,
      viewMonth,
    );
    setSelectedDay(refreshed.days.find((x) => x.ngay === key) || null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa ngoại lệ này?")) return;
    try {
      await deleteExceptionApi(id);
      await reloadDay();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAddDefault = async () => {
    if (!defaultForm.phong.trim()) {
      alert("Vui lòng chọn phòng!");
      return;
    }
    const payload = {
      maNhanVien: Number(selectedMaNV),
      thu: selectedDay.thu,
      gioLam: null,
      gioKetThuc: null,
      phong: defaultForm.phong.trim(),
    };
    try {
      await createShiftApi(payload);
      setShowAddDefault(false);
      setDefaultForm({ phong: "", gioLam: "", gioKetThuc: "" });
      await reloadDay();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteDefault = async (id) => {
    if (!window.confirm("Xác nhận xóa ca mặc định này?")) return;
    try {
      await deleteShiftApi(id);
      await reloadDay();
    } catch (e) {
      alert(e.message);
    }
  };

  const employeeName = useMemo(() => {
    const nv = staff.find(
      (s) => String(s.maNhanVien || s.ma_nhan_vien) === String(selectedMaNV),
    );
    return nv ? nv.hoTen || nv.ho_ten : "";
  }, [staff, selectedMaNV]);

  const filteredStaff = useMemo(() => {
    const q = empQuery.trim().toLowerCase();
    const list = q
      ? staff.filter((s) => {
          const name = (s.hoTen || s.ho_ten || "").toLowerCase();
          const id = String(s.maNhanVien || s.ma_nhan_vien);
          return name.includes(q) || id.includes(q);
        })
      : staff;
    return list.slice(0, 50);
  }, [staff, empQuery]);

  return (
    <div style={{ padding: "20px" }}>
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
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
          📅 LỊCH LÀM VIỆC THEO THÁNG
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setEmpOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
                outline: "none",
                maxWidth: "280px",
              }}
            >
              <span style={{ opacity: 0.9 }}>Nhân viên:</span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {employeeName
                  ? `${employeeName} (#${selectedMaNV})`
                  : "Chọn nhân viên"}
              </span>
              <span style={{ fontSize: "10px" }}>▼</span>
            </button>
            {empOpen && (
              <>
                <div
                  onClick={() => setEmpOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 50 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "6px",
                    width: "300px",
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                    zIndex: 60,
                    overflow: "hidden",
                  }}
                >
                  <input
                    autoFocus
                    value={empQuery}
                    onChange={(e) => setEmpQuery(e.target.value)}
                    placeholder="Tìm tên hoặc mã NV..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "none",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                    {filteredStaff.length === 0 && (
                      <div
                        style={{
                          padding: "12px",
                          color: "#94a3b8",
                          fontSize: "13px",
                          textAlign: "center",
                        }}
                      >
                        Không tìm thấy
                      </div>
                    )}
                    {filteredStaff.map((s) => {
                      const id = s.maNhanVien || s.ma_nhan_vien;
                      const active = String(id) === String(selectedMaNV);
                      return (
                        <div
                          key={id}
                          onClick={() => {
                            setSelectedMaNV(id);
                            setEmpOpen(false);
                            setEmpQuery("");
                          }}
                          style={{
                            padding: "9px 12px",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: "#334155",
                            borderBottom: "1px solid #f1f5f9",
                            background: active ? "#eff6ff" : "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <span>{s.hoTen || s.ho_ten}</span>
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                            #{id}
                          </span>
                        </div>
                      );
                    })}
                    {filteredStaff.length >= 50 && (
                      <div
                        style={{
                          padding: "8px 12px",
                          color: "#94a3b8",
                          fontSize: "12px",
                          textAlign: "center",
                        }}
                      >
                        Hiển thị 50 kết quả đầu, hãy tìm kiếm cụ thể hơn
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => changeMonth(-1)}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
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
                minWidth: "90px",
                textAlign: "center",
              }}
            >
              {monthLabel}
            </span>
            <button
              onClick={() => changeMonth(1)}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ▶
            </button>
            <button
              onClick={goToday}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Hôm nay
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          padding: "12px",
        }}
      >
        {loading && (
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
        {error && !loading && (
          <div
            style={{
              margin: "12px",
              padding: "14px",
              background: "#fee2e2",
              borderRadius: "8px",
              color: "#991b1b",
            }}
          >
            Lỗi: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Weekday header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "8px",
                marginBottom: "8px",
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
                      t === "Thứ 7" || t === "Chủ Nhật" ? "#fef2f2" : "#f1f5f9",
                    color:
                      t === "Thứ 7" || t === "Chủ Nhật" ? "#e11d48" : "#475569",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "8px",
              }}
            >
              {cells.map((d, idx) => {
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
                const day = getDayData(d);
                const { nghi, items } = mergeShows(day);
                const dateKey = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const isToday = dateKey === todayStr;
                const isWeekend =
                  new Date(viewYear, viewMonth - 1, d).getDay() === 0 ||
                  new Date(viewYear, viewMonth - 1, d).getDay() === 6;
                return (
                  <div
                    key={dateKey}
                    onClick={() => openDay(d)}
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
                          🚫 Nghỉ{ngoaiLe_lyDo(nghi)}
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
                              🕗 {fmtGio(it.data.gioLam)} –{" "}
                              {fmtGio(it.data.gioKetThuc)}
                            </div>
                            {isExtra && (
                              <div
                                style={{
                                  fontSize: "10px",
                                  fontStyle: "italic",
                                }}
                              >
                                Thêm ca thường ngoại lệ
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
          </>
        )}
      </div>

      {/* MODAL QUẢN LÝ NGÀY */}
      {selectedDay && (
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
                  Quản lý ca ngày {selectedDay.ngay}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.85 }}>
                  {selectedDay.thu} · {employeeName}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
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

            <div style={{ padding: "0" }}>
              {/* Ca mặc định (theo thứ) - có thể sửa/xóa/thêm */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Ca mặc định (theo {selectedDay.thu})
                </div>
                {(selectedDay.macDinh || []).length === 0 ? (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      fontStyle: "italic",
                      marginBottom: "6px",
                    }}
                  >
                    Chưa có ca mặc định cho thứ này.
                  </div>
                ) : (
                  (selectedDay.macDinh || []).map((m) => (
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
                        📍 {m.phong || "—"} · 🕗 {fmtGio(m.gioLam)} –{" "}
                        {fmtGio(m.gioKetThuc)}
                      </span>
                      <button
                        onClick={() => handleDeleteDefault(m.id)}
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
                  ))
                )}
                {!showAddDefault ? (
                  <button
                    onClick={() => setShowAddDefault(true)}
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
                    + Thêm ca mặc định
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
                      Thêm ca mặc định ({selectedDay.thu})
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
                        value={defaultForm.phong}
                        onChange={(e) =>
                          setDefaultForm({
                            ...defaultForm,
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
                        {phongList.map((p) => {
                          const ten = p.ten_phong || p.tenPhong;
                          return (
                            <option key={p.ma_phong || p.maPhong} value={ten}>
                              {ten}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "6px",
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowAddDefault(false);
                          setDefaultForm({
                            phong: "",
                            gioLam: "",
                            gioKetThuc: "",
                          });
                        }}
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
                        onClick={handleAddDefault}
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
                {(selectedDay.ngoiLe || []).length === 0 ? (
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
                  (selectedDay.ngoiLe || []).map((ex) => (
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
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700 }}>
                          {LOAI_LABEL[ex.loai]}
                        </span>
                        {ex.phong ? ` · 📍 ${ex.phong}` : ""}
                        {ex.gioLam
                          ? ` · 🕗 ${fmtGio(ex.gioLam)}–${fmtGio(ex.gioKetThuc)}`
                          : ""}
                        {ex.lyDo ? ` · 📝 ${ex.lyDo}` : ""}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => startEdit(ex)}
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
                          onClick={() => handleDelete(ex.id)}
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
              </div>

              {/* Thêm / sửa ngoại lệ */}
              <div
                style={{ borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}
              >
                {!form.loai && (
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => startAdd("NGHI_PHEP")}
                      style={btnStyle("#dc2626")}
                    >
                      🚫 Nghỉ phép
                    </button>
                    <button
                      onClick={() => startAdd("DOI_CA")}
                      style={btnStyle("#7c3aed")}
                    >
                      🔄 Đổi ca
                    </button>
                    <button
                      onClick={() => startAdd("THEM_CA")}
                      style={btnStyle("#ca8a04")}
                    >
                      ➕ Thêm ca thường ngoại lệ
                    </button>
                  </div>
                )}

                {form.loai && (
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "10px",
                      }}
                    >
                      {form.id
                        ? `Sửa ${LOAI_LABEL[form.loai]}`
                        : `➕ ${LOAI_LABEL[form.loai]}`}
                    </div>

                    {form.loai !== "NGHI_PHEP" && (
                      <>
                        <div style={{ marginBottom: "8px" }}>
                          <label
                            style={{
                              fontSize: "12px",
                              display: "block",
                              marginBottom: "6px",
                            }}
                          >
                            Chọn ca:
                          </label>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            {(form.caIds || [""]).map((caId, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  gap: "6px",
                                  alignItems: "center",
                                }}
                              >
                                <select
                                  value={caId}
                                  onChange={(e) => {
                                    const nextCaIds = [...(form.caIds || [""])];
                                    nextCaIds[idx] = e.target.value;
                                    setForm({ ...form, caIds: nextCaIds });
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: "5px",
                                    border: "1px solid #ddd",
                                  }}
                                >
                                  <option value=""></option>
                                  {caLamList.map((ca) => (
                                    <option key={ca.id} value={ca.id}>
                                      {ca.tenCa} ({fmtGio(ca.gioBatDau)}–
                                      {fmtGio(ca.gioKetThuc)})
                                    </option>
                                  ))}
                                </select>
                                {(form.caIds || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextCaIds = (
                                        form.caIds || []
                                      ).filter((_, i) => i !== idx);
                                      setForm({
                                        ...form,
                                        caIds: nextCaIds.length
                                          ? nextCaIds
                                          : [""],
                                      });
                                    }}
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      borderRadius: "5px",
                                      border: "1px solid #ddd",
                                      background: "#fef2f2",
                                      cursor: "pointer",
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
                              onClick={() =>
                                setForm({
                                  ...form,
                                  caIds: [...(form.caIds || [""]), ""],
                                })
                              }
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "5px",
                                border: "1px solid #ddd",
                                background: "#f8fafc",
                                cursor: "pointer",
                                fontWeight: 700,
                                color: "#005bc0",
                                alignSelf: "flex-start",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <label
                          style={{
                            fontSize: "12px",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          Phòng:
                          <select
                            value={form.phong}
                            onChange={(e) =>
                              setForm({ ...form, phong: e.target.value })
                            }
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginTop: "4px",
                              borderRadius: "5px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <option value=""></option>
                            {phongList.map((p) => {
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
                        value={form.lyDo}
                        onChange={(e) =>
                          setForm({ ...form, lyDo: e.target.value })
                        }
                        placeholder="vd: nghỉ bệnh, hỗ trợ phòng khám..."
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
                          setForm({
                            loai: null,
                            id: null,
                            phong: "",
                            gioLam: "",
                            gioKetThuc: "",
                            lyDo: "",
                          })
                        }
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
                        onClick={handleSave}
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

// Hiển thị lý do ngắn gọn trên chip nghỉ
function ngoaiLe_lyDo(ex) {
  return ex.lyDo ? ` (${ex.lyDo})` : "";
}
