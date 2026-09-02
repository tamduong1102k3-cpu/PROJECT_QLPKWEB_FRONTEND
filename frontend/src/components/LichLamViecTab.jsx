import { useState, useEffect, useMemo, useCallback } from "react";
import { getMonthScheduleApi } from "../api/shiftApi";

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
  THEM_CA: "Thêm ca thường ngoại lệ",
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

const fmtGio = (s) => (s || "").substring(0, 5) || "--:--";

const getShiftTimeValue = (entry) =>
  entry?.ca?.gioBatDau || entry?.gioLam || "";

const getShiftDisplayName = (entry) => {
  const ca = entry?.ca;
  const timeValue = getShiftTimeValue(entry);
  const hour = Number(String(timeValue).split(":")[0] || 0);
  return ca?.tenCa || (hour < 12 ? "ca sáng" : "ca chiều");
};

export default function LichCaLamNhanVien({ user }) {
  const maNhanVien = user?.maNhanVien || user?.id;
  const employeeName = user?.hoTen || user?.ho_ten || "";

  const [viewMode, setViewMode] = useState("calendar");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calData, setCalData] = useState(null);
  const [calLoading, setCalLoading] = useState(false);
  const [calError, setCalError] = useState(null);
  const [calSelectedDay, setCalSelectedDay] = useState(null);

  const fetchCalMonth = useCallback(async () => {
    if (!maNhanVien) {
      setCalData(null);
      return null;
    }
    setCalLoading(true);
    setCalError(null);
    try {
      const data = await getMonthScheduleApi(maNhanVien, calYear, calMonth);
      setCalData(data);
      return data;
    } catch (e) {
      setCalError(e.message);
      return null;
    } finally {
      setCalLoading(false);
    }
  }, [maNhanVien, calYear, calMonth]);

  useEffect(() => {
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
    const nghiCa = nghiList.find((e) => e.caThayThe);
    const nghiAll = nghiList.find((e) => !e.caThayThe);
    if (nghiAll) return { nghi: nghiAll, items: [] };
    const items = [];
    macDinh.forEach((m) => {
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
      if (
        nghiCa &&
        nghiCa.caThayThe &&
        t.caThayThe &&
        nghiCa.caThayThe.id === t.caThayThe.id
      ) {
        return;
      }
      items.push({ kind: "them", data: t });
    });
    return { nghi: nghiCa, items };
  };

  if (!maNhanVien) {
    return (
      <div style={{ padding: "20px" }}>
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#94a3b8",
            background: "#fff",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
          }}
        >
          Không xác định được mã nhân viên.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER - y hệt QuanLyCaLamViec */}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              maxWidth: "280px",
            }}
          >
            <span style={{ opacity: 0.9 }}>👤</span>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {employeeName
                ? `${employeeName} (NV${String(maNhanVien).padStart(3, "0")})`
                : `NV${String(maNhanVien).padStart(3, "0")}`}
            </span>
          </div>
        </div>
      </div>

      {/* VIEW TOGGLE - y hệt */}
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
      </div>

      {/* CALENDAR VIEW - y hệt */}
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
                <div
                  style={{
                    minWidth: "260px",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: "#f8fafc",
                    color: "#374151",
                  }}
                >
                  {employeeName
                    ? `${employeeName} (NV${String(maNhanVien).padStart(3, "0")})`
                    : `NV${String(maNhanVien).padStart(3, "0")}`}
                </div>
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
            {!calLoading && !calError && maNhanVien && (
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
                      onClick={() => day && setCalSelectedDay(day)}
                      style={{
                        minHeight: "104px",
                        borderRadius: "10px",
                        padding: "6px",
                        cursor: day ? "pointer" : "default",
                        border: isToday
                          ? "2px solid #005bc0"
                          : "1px solid #e5e7eb",
                        background: "#fff",
                        transition: "background .15s",
                      }}
                      onMouseEnter={(e) =>
                        day &&
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
                                      const timeValue =
                                        ca?.gioBatDau || it.data.gioLam || "";
                                      const name = getShiftDisplayName(it.data);
                                      const start = fmtGio(
                                        isDoi
                                          ? it.data.gioLam
                                          : ca?.gioBatDau || it.data.gioLam,
                                      );
                                      const end = fmtGio(
                                        isDoi
                                          ? it.data.gioKetThuc
                                          : ca?.gioKetThuc ||
                                              it.data.gioKetThuc,
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
            )}
          </div>

          {/* MODAL CHI TIẾT NGÀY (READ-ONLY) - y hệt cấu trúc QuanLyCaLamViec */}
          {calSelectedDay && (
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
                      Chi tiết ca ngày {calSelectedDay.ngay}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.85 }}>
                      {calSelectedDay.thu} · {employeeName}
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
                  {/* Ca mặc định - read only */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Ca làm việc mặc định trong tháng (theo{" "}
                      {calSelectedDay.thu})
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
                        Chưa có ca làm việc mặc định cho thứ này.
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
                          }}
                        >
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
                            const start = fmtGio(ca?.gioBatDau || m.gioLam);
                            const end = fmtGio(
                              ca?.gioKetThuc || m.gioKetThuc,
                            );
                            return `${name} ${start}-${end}`;
                          })()}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Ngoại lệ - read only */}
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
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            {TIEU_DE_THEO_LOAI[ex.loai] || ex.loai}
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
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      </div>
  );
}
