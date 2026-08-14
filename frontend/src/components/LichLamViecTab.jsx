import React, { useState, useEffect, useMemo } from 'react';
import { getShiftsByNhanVienApi } from '../api/shiftApi';

// ==================== CONFIG & HELPERS ====================

const DAY_ORDER = [
  { key: 'thu-2', label: 'Thứ 2' },
  { key: 'thu-3', label: 'Thứ 3' },
  { key: 'thu-4', label: 'Thứ 4' },
  { key: 'thu-5', label: 'Thứ 5' },
  { key: 'thu-6', label: 'Thứ 6' },
  { key: 'thu-7', label: 'Thứ 7' },
  { key: 'chu-nhat', label: 'Chủ Nhật' }
];

const DAY_INDEX_MAP = {
  'thu-2': 0,
  'thu-3': 1,
  'thu-4': 2,
  'thu-5': 3,
  'thu-6': 4,
  'thu-7': 5,
  'chu-nhat': 6
};

function classifyShift(gioLam = '', gioKetThuc = '') {
  const startHour = parseInt((gioLam || '08').split(':')[0], 10) || 8;
  if (startHour >= 5 && startHour < 12) return { type: 'sang', label: 'Ca sáng' };
  if (startHour >= 12 && startHour < 17) return { type: 'chieu', label: 'Ca chiều' };
  return { type: 'toi', label: 'Ca tối' };
}

const SHIFT_STYLE = {
  sang: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    softBg: 'bg-emerald-50',
    softBorder: 'border-emerald-200',
    softText: 'text-emerald-600',
    chipBg: 'bg-emerald-100 border-emerald-200',
    icon: 'wb_sunny',
    dot: 'bg-emerald-500',
    iconColor: 'text-amber-400'
  },
  chieu: {
    gradient: 'from-indigo-500 via-blue-500 to-sky-500',
    softBg: 'bg-indigo-50',
    softBorder: 'border-indigo-200',
    softText: 'text-indigo-600',
    chipBg: 'bg-indigo-100 border-indigo-200',
    icon: 'light_mode',
    dot: 'bg-indigo-500',
    iconColor: 'text-blue-400'
  },
  toi: {
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    softBg: 'bg-violet-50',
    softBorder: 'border-violet-200',
    softText: 'text-violet-600',
    chipBg: 'bg-violet-100 border-violet-200',
    icon: 'dark_mode',
    dot: 'bg-violet-500',
    iconColor: 'text-violet-400'
  }
};

function getMondayOfCurrentWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Chuẩn hóa giá trị "thu" từ backend (vd: 'Thứ 2', 'thu-2', 'THU_2') về dạng so khớp được
// Ví dụ: 'Thứ 2' -> 'thu2', 'thu-2' -> 'thu2', 'Chủ Nhật' -> 'chunhat', 'chu-nhat' -> 'chunhat'
function normalizeDayKey(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '');
}

// ==================== MAIN COMPONENT ====================

export default function LichLamViecTab({ user }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  const maNhanVien = user?.maNhanVien || user?.id || localStorage.getItem('maNhanVien');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!maNhanVien) {
          setError('Không xác định được mã nhân viên.');
          return;
        }
        const data = await getShiftsByNhanVienApi(maNhanVien);
        setShifts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [maNhanVien]);

  const monday = useMemo(() => getMondayOfCurrentWeek(), []);
  const today = new Date();

  const groupedByDay = useMemo(() => {
    return DAY_ORDER.map(day => {
      const dayShifts = shifts
        .filter(s => normalizeDayKey(s.thu) === normalizeDayKey(day.key))
        .map(s => {
          const classified = classifyShift(s.gioLam, s.gioKetThuc);
          const dateObj = new Date(monday);
          dateObj.setDate(monday.getDate() + DAY_INDEX_MAP[day.key]);
          return {
            ...s,
            type: classified.type,
            dateObj,
            isToday: formatDate(dateObj) === formatDate(today),
            gioLam: (s.gioLam || '').substring(0, 5) || '08:00',
            gioKetThuc: (s.gioKetThuc || '').substring(0, 5) || '17:00'
          };
        });
      const dateObj = new Date(monday.getTime() + DAY_INDEX_MAP[day.key] * 86400000);
      return { 
        ...day, 
        dateObj, 
        shifts: dayShifts, 
        isToday: formatDate(dateObj) === formatDate(today), 
        isWeekend: day.key === 'thu-7' || day.key === 'chu-nhat' 
      };
    });
  }, [shifts, monday]);

  return (
    <div className="min-h-screen relative">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[130px]"></div>
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-violet-100/50 rounded-full blur-[130px]"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(100,116,139,0.06) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .animate-slide-up { animation: slideUp 0.5s ease-out both; }
        .animate-fade-in-scale { animation: fadeInScale 0.3s ease-out both; }
        .glass-card { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06); }
        .skeleton { background: linear-gradient(90deg, rgba(241,245,249,0.5) 25%, rgba(248,250,252,0.8) 50%, rgba(241,245,249,0.5) 75%); background-size: 800px 100%; animation: shimmer 1.5s infinite; }
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
      `}</style>

      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ==================== CALENDAR CARD ==================== */}
        <div className="overflow-hidden rounded-3xl border-2 border-red-300 bg-white/80 shadow-xl shadow-red-100/50 backdrop-blur-sm">

          {/* Red header with binding rings (calendar icon look) */}
          <div className="relative bg-gradient-to-r from-red-600 to-rose-500 px-6 pt-4 pb-5">
            {/* Binding rings */}
            <div className="absolute -top-1.5 left-10 rounded-md bg-white/90 px-3 py-1.5 shadow-sm ring-2 ring-red-300" />
            <div className="absolute -top-1.5 right-10 rounded-md bg-white/90 px-3 py-1.5 shadow-sm ring-2 ring-red-300" />
            {/* Centered title */}
            <div className="relative flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-white text-[22px]">calendar_month</span>
              <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white">Lịch làm việc</h2>
            </div>
          </div>

          <div className="p-4">

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="glass-card rounded-3xl h-64 skeleton"></div>
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="glass-card rounded-3xl p-10 text-center max-w-md mx-auto">
                <span className="material-symbols-outlined text-red-500 text-4xl mb-2">error</span>
                <p className="text-slate-600">{error}</p>
              </div>
            )}

            {/* WEEK VIEW */}
            {!loading && !error && (
              <div className="animate-fade-in-scale overflow-x-auto custom-scroll">
                <div className="grid grid-cols-7 gap-2 min-w-[900px]">
                  {groupedByDay.map((day, dayIdx) => (
                    <div
                      key={day.key}
                      className={`glass-card rounded-3xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group ${day.isToday ? 'ring-2 ring-blue-500/30' : ''}`}
                      style={{ animationDelay: `${dayIdx * 0.05}s` }}
                    >
                      <div className={`px-2 py-2 border-b flex items-center justify-between ${day.isToday ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white' : 'bg-slate-50/80'}`}>
                        <div>
                          <p className={`text-[9px] font-bold uppercase ${day.isToday ? 'text-blue-100' : 'text-slate-400'}`}>{day.label}</p>
                          <p className={`text-base font-extrabold ${day.isToday ? 'text-white' : (day.isWeekend ? 'text-rose-500' : 'text-slate-800')}`}>{day.dateObj.getDate()}</p>
                        </div>
                        {day.isToday && <span className="px-1.5 py-0.5 rounded-lg bg-white/20 text-[8px] font-bold uppercase">Hôm nay</span>}
                      </div>

                      <div className="flex-1 p-1.5 space-y-1.5 min-h-[120px]">
                        {day.shifts.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center gap-1 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                            <span className="material-symbols-outlined text-[16px]">event_busy</span>
                            <p className="text-[9px] font-medium">Nghỉ</p>
                          </div>
                        ) : (
                          day.shifts.map((shift, idx) => {
                            const style = SHIFT_STYLE[shift.type] || SHIFT_STYLE.chieu;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedShift(shift)}
                                className={`w-full text-left rounded-xl p-2 text-white transition-transform hover:-translate-y-1 bg-gradient-to-br ${style.gradient} shadow-sm`}
                              >
                                <p className="text-[11px] font-extrabold mb-1 truncate">{shift.phong || 'Phòng trực'}</p>
                                <div className="inline-flex items-center gap-1 bg-black/10 px-1.5 py-0.5 rounded-lg text-[9px] font-bold">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                  {shift.gioLam} - {shift.gioKetThuc}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* DETAIL MODAL */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedShift(null)}>
          <div className="animate-fade-in-scale relative w-full max-w-sm glass-card rounded-[28px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-br ${SHIFT_STYLE[selectedShift.type]?.gradient} p-6 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80">Chi tiết ca làm việc</p>
                  <h3 className="text-xl font-black">{selectedShift.phong || 'Phòng làm việc'}</h3>
                </div>
                <button onClick={() => setSelectedShift(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Giờ làm</p>
                  <p className="font-bold text-slate-800">{selectedShift.gioLam} – {selectedShift.gioKetThuc}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Thứ</p>
                  <p className="font-bold text-slate-800 capitalize">{selectedShift.dateObj?.toLocaleDateString('vi-VN', { weekday: 'long' })}</p>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Ghi chú</p>
                <p className="text-sm text-slate-600 italic">{selectedShift.ghiChu || 'Không có ghi chú.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}