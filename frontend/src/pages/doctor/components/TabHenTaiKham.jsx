import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getAllApi, createApi, updateApi } from '../../../api/appointmentApi';
import { getAllChuyenKhoaApi } from '../../../api/danhMucApi';
import { getAllApi as getAllDichVuApi } from '../../../api/dichVuApi';
import { getAllApi as getAllBenhNhanApi } from '../../../api/benhNhanApi';
import { getShiftsByNhanVienApi } from '../../../api/shiftApi';
import { useNotification } from '../../../components/NotificationContext';
import usePagination from '../../../hooks/usePagination';
import Pagination from '../../../components/Pagination';

/* ─── keyframe style ─── */
const MODAL_STYLE = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);    }
  }
`;

/* ─── Status config ─── */
const STATUS_CONFIG = {
  CHUA_DEN: { label: 'Chưa đến', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', ring: '#f59e0b' },
  DA_DEN: { label: 'Đã đến', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', ring: '#10b981' },
  HOAN: { label: 'Hoãn', cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400', ring: '#ef4444' },
};

const getDaysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return <span className="text-[10px] text-red-400 font-medium">Đã qua</span>;
  if (diff === 0) return <span className="text-[10px] text-emerald-500 font-bold">Hôm nay</span>;
  if (diff === 1) return <span className="text-[10px] text-indigo-500 font-medium">Ngày mai</span>;
  return <span className="text-[10px] text-gray-400">Còn {diff} ngày</span>;
};

/* ─── Status dropdown pill (inline update) ─── */
const StatusDropdown = ({ appointment, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cfg = STATUS_CONFIG[appointment.trangThai] || {};

  const handleChange = async (newStatus) => {
    if (newStatus === appointment.trangThai) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      await onUpdate(appointment.id, { ...appointment, trangThai: newStatus });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${cfg.cls || 'bg-gray-50 text-gray-600 border-gray-200'}`}
      >
        {loading
          ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot || 'bg-gray-400'}`} />
        }
        {cfg.label || appointment.trangThai}
        <span className="material-symbols-outlined text-[12px]">expand_more</span>
      </button>

      {open && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 z-[99998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[99999] mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[140px]"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            {Object.entries(STATUS_CONFIG).map(([key, s]) => (
              <button
                key={key}
                onClick={() => handleChange(key)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${key === appointment.trangThai ? 'font-bold' : 'font-medium text-gray-600'}`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                {s.label}
                {key === appointment.trangThai && <span className="material-symbols-outlined text-[16px] text-indigo-500 ml-auto">check</span>}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

/* ─── Select style helper ─── */
const selectStyle = {
  width: '100%', padding: '0.75rem 1rem', background: '#f9fafb', border: '1.5px solid #e5e7eb',
  borderRadius: '0.75rem', fontSize: 14, fontWeight: 600, color: '#1f2937', outline: 'none',
  boxSizing: 'border-box', appearance: 'auto'
};

/* ─── Helper: format ngày YYYY-MM-DD từ Date ─── */
const formatDateInput = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/* ─── Helper: format ngày dd/MM/yyyy ─── */
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

/* ─── Chuyển danh sách thứ làm việc sang mảng số ngày trong tuần (0=CN, 1=T2, ..., 6=T7) ─── */
const getAvailableDayNumbers = (shifts) => {
  if (!Array.isArray(shifts) || shifts.length === 0) return [];
  const dayMap = { 'Chủ Nhật': 0, 'Thứ 2': 1, 'Thứ 3': 2, 'Thứ 4': 3, 'Thứ 5': 4, 'Thứ 6': 5, 'Thứ 7': 6 };
  return [...new Set(shifts.map(s => dayMap[s.thu]).filter(d => d !== undefined))];
};

/* ─── Helper: chuyển đổi ngày sang thứ tiếng Việt ─── */
const getVietnameseDayFromDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[d.getDay()];
};

/* ─── Tổng hợp danh sách thứ làm việc duy nhất ─── */
const getUniqueWorkingDays = (shifts) => {
  if (!Array.isArray(shifts) || shifts.length === 0) return [];
  const dayOrder = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const uniqueDays = [...new Set(shifts.map(s => s.thu).filter(Boolean))];
  return uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
};

/* ─── Custom Calendar component (thuần, không dependency) ─── */
const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const VIETNAMESE_DAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const CustomCalendar = ({ selectedDate, minDateStr, shifts, onSelect }) => {
  const [viewDate, setViewDate] = useState(() => {
    const d = minDateStr ? new Date(minDateStr + 'T12:00:00') : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const availableDayNumbers = getAvailableDayNumbers(shifts);
  const minDate = minDateStr ? new Date(minDateStr + 'T12:00:00') : null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const firstDayCol = startOfMonth.getDay(); // 0=CN
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Tạo mảng cells: đầu tháng thêm ô trống theo firstDayCol
  const cells = [];
  for (let i = 0; i < firstDayCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  const isDisabled = (date) => {
    // Không cho chọn hôm nay/quá khứ
    if (minDate && date.getTime() < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime()) {
      return true;
    }
    if (!minDate && date.getTime() < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) {
      return true;
    }
    // Kiểm tra thứ làm việc
    if (availableDayNumbers.length > 0 && !availableDayNumbers.includes(date.getDay())) {
      return true;
    }
    return false;
  };

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const monthLabel = `Tháng ${month + 1}/${year}`;
  const todayStr = formatDateInput(new Date());

  return (
    <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', background: '#fff', overflow: 'hidden', marginTop: 6 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
        <button
          type="button"
          onClick={prevMonth}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 18, display: 'flex', alignItems: 'center', padding: '2px 6px', borderRadius: 8 }}
          title="Tháng trước"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
        </button>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 18, display: 'flex', alignItems: 'center', padding: '2px 6px', borderRadius: 8 }}
          title="Tháng sau"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
        </button>
      </div>

      {/* Weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f1f5f9' }}>
        {WEEKDAY_LABELS.map(w => (
          <div key={w} style={{ padding: '6px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af' }}>{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: 6 }}>
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} />;
          const dateStr = formatDateInput(cell);
          const disabled = isDisabled(cell);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              title={disabled ? 'Bác sĩ không làm việc' : getVietnameseDayFromDate(dateStr)}
              style={{
                aspectRatio: '1',
                border: 'none',
                borderRadius: 8,
                background: isSelected ? '#4f46e5' : isToday && !disabled ? '#eef2ff' : (disabled ? '#f3f4f6' : 'transparent'),
                color: isSelected ? '#fff' : (disabled ? '#d1d5db' : '#374151'),
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontWeight: isSelected ? 700 : (isToday ? 700 : 500),
                textDecoration: disabled ? 'line-through' : 'none',
                opacity: disabled ? 0.65 : 1,
                transition: 'all 0.15s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1
              }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = isSelected ? '#4338ca' : '#eef2ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#4f46e5' : (isToday && !disabled ? '#eef2ff' : 'transparent'); }}
            >
              <span style={{ fontSize: 13 }}>{cell.getDate()}</span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  marginTop: 2,
                  color: isSelected ? 'rgba(255,255,255,0.85)' : (disabled ? '#d1d5db' : '#9ca3af'),
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {VIETNAMESE_DAYS[cell.getDay()]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 10px 8px', borderTop: '1px solid #f1f5f9', fontSize: 10, color: '#6b7280' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 4, background: '#4f46e5', display: 'inline-block' }} /> Ngày chọn
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 4, background: '#f3f4f6', border: '1px solid #d1d5db', display: 'inline-block' }} /> Nghỉ
        </span>
      </div>
    </div>
  );
};

/* ─── Create Modal (Portal) ─── */
const AppointmentModal = ({ formData, setFormData, onClose, onCreate, getMinDate, patient, chuyenKhoaList, dichVuList, benhNhanList, creating, doctorShifts }) => {
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const errorStyle = { borderColor: '#ef4444', background: '#fef2f2' };

  const clearError = (key) => {
    setFormErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateAndSubmit = () => {
    const errors = {};
    if (!formData.maBenhNhan) errors.maBenhNhan = 'Chưa chọn bệnh nhân';
    if (!formData.maChuyenKhoa) errors.maChuyenKhoa = 'Chưa chọn chuyên khoa';
    if (!formData.maDichVu) errors.maDichVu = 'Chưa chọn dịch vụ';
    if (!formData.ngayTaiKham) errors.ngayTaiKham = 'Chưa chọn ngày tái khám';
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      onCreate();
    }
  };

  // Lọc dịch vụ theo chuyên khoa đã chọn
  const filteredDichVus = formData.maChuyenKhoa
    ? dichVuList.filter(dv => String(dv.maChuyenKhoa) === String(formData.maChuyenKhoa))
    : dichVuList;

  // Lọc bệnh nhân theo từ khóa
  const filteredBenhNhans = benhNhanList.filter(bn =>
    !patientSearch
    || (bn.hoTen || '').toLowerCase().includes(patientSearch.toLowerCase())
    || String(bn.maBenhNhan).includes(patientSearch)
    || (bn.soDienThoai || '').toLowerCase().includes(patientSearch.toLowerCase())
  ).slice(0, 8);

  const selectedChuyenKhoa = chuyenKhoaList.find(c => String(c.maChuyenKhoa) === String(formData.maChuyenKhoa));
  const selectedDichVu = dichVuList.find(d => String(d.maDichVu) === String(formData.maDichVu));

  return ReactDOM.createPortal(
    <>
      <style>{MODAL_STYLE}</style>
      <div
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: '100%', maxWidth: '900px',
            background: '#fff', borderRadius: '1.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            animation: 'modalIn 0.28s cubic-bezier(.34,1.56,.64,1) both',
            margin: 'auto'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '0.875rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22 }}>calendar_add_on</span>
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', margin: 0 }}>Tạo lịch hẹn tái khám</h3>
                <p style={{ color: 'rgba(199,210,254,0.9)', fontSize: 12, margin: '2px 0 0' }}>
                  {patient ? `Bệnh nhân: ${patient.hoTen || 'N/A'}` : 'Điền đầy đủ thông tin bên dưới'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '0.625rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#fff' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'row', gap: '1.5rem' }}>
            {/* Cột trái: bệnh nhân, chuyên khoa, dịch vụ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Chọn bệnh nhân - only when no patient from exam view */}
            {patient ? (
              <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#16a34a' }}>person</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#166534' }}>{patient.hoTen || 'N/A'}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#15803d' }}>Mã BN: {patient.maBenhNhan} • Tự động từ phiếu khám</p>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ fontSize: 13, fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#4f46e5' }}>person_search</span>
                  Chọn bệnh nhân <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={e => { setPatientSearch(e.target.value); setShowPatientList(true); }}
                    onFocus={() => setShowPatientList(true)}
                    onBlur={() => setTimeout(() => setShowPatientList(false), 200)}
                    placeholder="Tìm theo tên, mã BN hoặc SĐT..."
                    style={{ ...selectStyle, paddingLeft: '2.5rem' }}
                  />
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#9ca3af' }}>search</span>
                  {showPatientList && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 12px 32px rgba(0,0,0,0.12)', zIndex: 20, maxHeight: 240, overflowY: 'auto' }}>
                      {filteredBenhNhans.length === 0 ? (
                        <div style={{ padding: '0.75rem 1rem', fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>Không tìm thấy bệnh nhân</div>
                      ) : filteredBenhNhans.map(bn => (
                        <button
                          key={bn.maBenhNhan}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, maBenhNhan: bn.maBenhNhan, tenBenhNhan: bn.hoTen });
                            setPatientSearch(bn.hoTen);
                            setShowPatientList(false);
                            clearError('maBenhNhan');
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', padding: '0.6rem 0.9rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #818cf8, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {(bn.hoTen || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{bn.hoTen}</p>
                            <p style={{ margin: '1px 0 0', fontSize: 11, color: '#9ca3af' }}>Mã #{bn.maBenhNhan} {bn.soDienThoai ? `• ${bn.soDienThoai}` : ''}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.maBenhNhan && (
                  <p style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5, fontWeight: 600 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
                    {formErrors.maBenhNhan}
                  </p>
                )}
              </div>
            )}

            {/* Chọn chuyên khoa */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#4f46e5' }}>local_hospital</span>
                Chuyên khoa <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.maChuyenKhoa || ''}
                onChange={e => { setFormData({ ...formData, maChuyenKhoa: e.target.value ? Number(e.target.value) : '', maDichVu: '' }); clearError('maChuyenKhoa'); }}
                style={formErrors.maChuyenKhoa ? { ...selectStyle, ...errorStyle } : selectStyle}
              >
                <option value="">-- Chọn chuyên khoa --</option>
                {chuyenKhoaList.map(ck => (
                  <option key={ck.maChuyenKhoa} value={ck.maChuyenKhoa}>{ck.tenChuyenKhoa}</option>
                ))}
              </select>
              {formErrors.maChuyenKhoa && (
                <p style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
                  {formErrors.maChuyenKhoa}
                </p>
              )}
              {selectedChuyenKhoa && (
                <p style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                  {selectedChuyenKhoa.tenChuyenKhoa}
                </p>
              )}
            </div>

            {/* Chọn dịch vụ */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#4f46e5' }}>medical_services</span>
                Dịch vụ <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.maDichVu || ''}
                onChange={e => { setFormData({ ...formData, maDichVu: e.target.value ? Number(e.target.value) : '' }); clearError('maDichVu'); }}
                style={formErrors.maDichVu ? { ...selectStyle, ...errorStyle } : selectStyle}
                disabled={!formData.maChuyenKhoa}
              >
                <option value="">{formData.maChuyenKhoa ? '-- Chọn dịch vụ --' : '-- Chọn chuyên khoa trước --'}</option>
                {filteredDichVus.map(dv => (
                  <option key={dv.maDichVu} value={dv.maDichVu}>
                    {dv.tenDichVu}{dv.donGia ? ` - ${new Intl.NumberFormat('vi-VN').format(dv.donGia)}đ` : ''}
                  </option>
                ))}
              </select>
              {formErrors.maDichVu && (
                <p style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
                  {formErrors.maDichVu}
                </p>
              )}
              {selectedDichVu && (
                <p style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check_circle</span>
                  {selectedDichVu.tenDichVu}{selectedDichVu.donGia ? ` • ${new Intl.NumberFormat('vi-VN').format(selectedDichVu.donGia)}đ` : ''}
                </p>
              )}
            </div>
            </div>
            {/* /Cột trái */}

            {/* Cột phải: ngày tái khám + ghi chú */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Ngày tái khám */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#4f46e5' }}>event</span>
                Ngày tái khám <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <CustomCalendar
                selectedDate={formData.ngayTaiKham}
                minDateStr={getMinDate()}
                shifts={doctorShifts}
                onSelect={(dateStr) => { setFormData({ ...formData, ngayTaiKham: dateStr }); clearError('ngayTaiKham'); }}
              />
              {formErrors.ngayTaiKham && (
                <p style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
                  {formErrors.ngayTaiKham}
                </p>
              )}
              {formData.ngayTaiKham && (
                <p style={{ fontSize: 11, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 3, marginTop: 6, fontWeight: 700 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event_available</span>
                  Đã chọn: {formatDateDisplay(formData.ngayTaiKham)} ({getVietnameseDayFromDate(formData.ngayTaiKham)})
                </p>
              )}
              {doctorShifts && doctorShifts.length > 0 && (
                <p style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_month</span>
                  Bác sĩ làm việc: <strong>{getUniqueWorkingDays(doctorShifts).join(', ')}</strong>
                </p>
              )}
            </div>

            {/* Ghi chú */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#818cf8' }}>notes</span>
                Ghi chú
              </label>
              <textarea
                value={formData.ghiChu}
                onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                rows={3}
                placeholder="Ghi chú thêm về lịch hẹn..."
                style={{ width: '100%', padding: '0.75rem 1rem', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                onFocus={e => e.target.style.borderColor = '#818cf8'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            </div>
            {/* /Cột phải */}
          </div>

          {/* Footer */}
          <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              disabled={creating}
              style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: 14, color: '#4b5563', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.5 : 1 }}
            >
              Hủy bỏ
            </button>
            <button
              onClick={validateAndSubmit}
              disabled={creating}
              style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: 14, color: '#fff', cursor: creating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 15px rgba(79,70,229,0.35)', opacity: creating ? 0.6 : 1 }}
            >
              {creating ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" style={{ display: 'inline-block' }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
              )}
              {creating ? 'Đang tạo...' : 'Xác nhận tạo'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

/* ─── Cancel Modal (Portal) ─── */
const CancelModal = ({ onClose, onConfirm, lyDo, setLyDo, deletingId }) =>
  ReactDOM.createPortal(
    <>
      <style>{MODAL_STYLE}</style>
      <div
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box'
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: '100%', maxWidth: '460px',
            background: '#fff', borderRadius: '1.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            animation: 'modalIn 0.28s cubic-bezier(.34,1.56,.64,1) both'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)', padding: '1.25rem 1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '0.875rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22 }}>event_busy</span>
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', margin: 0 }}>Hủy lịch hẹn</h3>
                <p style={{ color: 'rgba(254,226,226,0.9)', fontSize: 12, margin: '2px 0 0' }}>
                  Bác sĩ hủy lịch - sẽ thông báo cho bệnh nhân
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: '0.9rem', right: '0.9rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.625rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#fff' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#f87171' }}>notes</span>
              Lý do hủy <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              value={lyDo}
              onChange={e => setLyDo(e.target.value)}
              rows={4}
              placeholder="VD: Bác sĩ nghỉ phép / thiết bị bảo trì / bệnh nhân đổi lịch..."
              style={{ width: '100%', padding: '0.85rem 1rem', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
              onFocus={e => e.target.style.borderColor = '#f87171'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Footer */}
          <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              disabled={deletingId !== null}
              style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: 14, color: '#4b5563', cursor: 'pointer', opacity: deletingId !== null ? 0.5 : 1 }}
            >
              Quay lại
            </button>
            <button
              onClick={onConfirm}
              disabled={deletingId !== null}
              style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #dc2626, #f87171)', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 15px rgba(220,38,38,0.35)', opacity: deletingId !== null ? 0.6 : 1 }}
            >
              {deletingId !== null ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" style={{ display: 'inline-block' }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>event_busy</span>
              )}
              {deletingId !== null ? 'Đang hủy...' : 'Xác nhận hủy'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

/* ═══════════════════════════════════════════════════════════════════════ */

const FILTER_OPTS = [
  { value: '', label: 'Tất cả' },
  { value: 'CHUA_DEN', label: 'Chưa đến' },
  { value: 'DA_DEN', label: 'Đã đến' },
  { value: 'HOAN', label: 'Hoãn' },
];

const TabHenTaiKham = ({ user, patient }) => {
  const { showSuccess, showError } = useNotification();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLyDo, setCancelLyDo] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dữ liệu dropdown
  const [chuyenKhoaList, setChuyenKhoaList] = useState([]);
  const [dichVuList, setDichVuList] = useState([]);
  const [benhNhanList, setBenhNhanList] = useState([]);

  const [formData, setFormData] = useState({
    maBenhNhan: patient?.maBenhNhan || '',
    maChuyenKhoa: user?.maChuyenKhoa || '',
    maDichVu: '',
    ngayTaiKham: '',
    ghiChu: ''
  });

  // Lịch làm việc (các thứ trong tuần) của bác sĩ hiện tại
  const [doctorShifts, setDoctorShifts] = useState([]);

  // Load lịch làm việc của bác sĩ đang đăng nhập
  useEffect(() => {
    const loadDoctorShifts = async () => {
      if (!user?.maNhanVien) return;
      try {
        const shifts = await getShiftsByNhanVienApi(user.maNhanVien);
        setDoctorShifts(Array.isArray(shifts) ? shifts : []);
      } catch (err) {
        console.error('Error loading doctor shifts:', err);
        setDoctorShifts([]);
      }
    };
    loadDoctorShifts();
  }, [user?.maNhanVien]);

  // Load dropdown data
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [ck, dv, bn] = await Promise.all([
          getAllChuyenKhoaApi(),
          getAllDichVuApi(),
          getAllBenhNhanApi()
        ]);
        setChuyenKhoaList(ck || []);
        setDichVuList(dv || []);
        setBenhNhanList(bn || []);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
      }
    };
    loadDropdowns();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllApi();
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchData, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const openModal = () => {
    setFormData({
      maBenhNhan: patient?.maBenhNhan || '',
      tenBenhNhan: patient?.hoTen || '',
      maChuyenKhoa: user?.maChuyenKhoa || '',
      maDichVu: '',
      ngayTaiKham: '',
      ghiChu: ''
    });
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (creating) return;
    if (!formData.maBenhNhan || !formData.maChuyenKhoa || !formData.maDichVu || !formData.ngayTaiKham) {
      showError('Vui lòng nhập đầy đủ thông tin (bệnh nhân, chuyên khoa, dịch vụ, ngày)');
      return;
    }
    // Kiểm tra lại ngày tái khám có khớp với lịch làm việc của bác sĩ
    const selectedDay = getVietnameseDayFromDate(formData.ngayTaiKham);
    const workingDays = getUniqueWorkingDays(doctorShifts);
    if (workingDays.length > 0 && !workingDays.includes(selectedDay)) {
      showError(`Ngày ${selectedDay} không nằm trong lịch làm việc của bác sĩ. Bác sĩ làm việc vào các ngày: ${workingDays.join(', ')}`);
      return;
    }
    setCreating(true);
    try {
      await createApi({
        maBenhNhan: Number(formData.maBenhNhan),
        maChuyenKhoa: Number(formData.maChuyenKhoa),
        maDichVu: Number(formData.maDichVu),
        maNhanVien: Number(user?.maNhanVien),
        maPhieuKham: patient?.maPhieuKham,
        ngayTaiKham: formData.ngayTaiKham,
        trangThai: 'CHUA_DEN',
        nguonTao: 'TAI_KHAM',
        ghiChu: formData.ghiChu
      });
      showSuccess('Đã tạo lịch hẹn tái khám thành công!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showError('Lỗi: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateApi(id, data);
      showSuccess('Đã cập nhật trạng thái!');
      fetchData();
    } catch (err) {
      showError('Lỗi: ' + err.message);
    }
  };

  const openCancelModal = (id) => {
    setCancelTarget(id);
    setCancelLyDo('');
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setCancelLyDo('');
  };

  const confirmCancel = async () => {
    const lyDoFinal = cancelLyDo.trim();
    if (!lyDoFinal) {
      showError('Vui lòng nhập lý do hủy lịch hẹn');
      return;
    }
    setDeletingId(cancelTarget);
    try {
      await updateApi(cancelTarget, {
        trangThai: 'HUY',
        nguoiHuy: 'BAC_SI',
        ghiChu: lyDoFinal
      });
      showSuccess('Đã hủy lịch hẹn và thông báo cho bệnh nhân');
      closeCancelModal();
      fetchData();
    } catch (err) {
      showError('Lỗi: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Derived ── */
  const stats = {
    total: appointments.length,
    chuaDen: appointments.filter(a => a.trangThai === 'CHUA_DEN').length,
    daDen: appointments.filter(a => a.trangThai === 'DA_DEN').length,
    hoan: appointments.filter(a => a.trangThai === 'HOAN').length,
  };

  // Bọc filter trong useCallback để reference ổn định giữa các render,
  // tránh bị reset trang về 1 mỗi lần re-render (lỗi không chuyển trang được)
  const appointmentFilters = useCallback((a) => {
    const matchStatus = !filterStatus || a.trangThai === filterStatus;
    const matchChuyenKhoa = !user?.maChuyenKhoa || a.maChuyenKhoa === user.maChuyenKhoa;
    return matchStatus && matchChuyenKhoa;
  }, [filterStatus, user?.maChuyenKhoa]);

  // Filter + search + phân trang dùng chung
  const {
    filteredData: filtered,
    paginatedData: paginated,
    totalItems: filteredCount,
    totalPages,
    currentPage,
    setCurrentPage,
    safeCurrentPage,
    visiblePages,
    jumpPage,
    handleJumpPage,
    handleJumpPageBlur,
    pageError,
  } = usePagination({
    data: appointments,
    pageSize: 8,
    searchKeys: ['tenBenhNhan', 'maBenhNhan', 'tenChuyenKhoa', 'tenDichVu', 'tenNhanVien'],
    searchTerm: search,
    filters: appointmentFilters,
  });

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header + Stats ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <span className="material-symbols-outlined text-white text-[22px]">calendar_month</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Lịch Hẹn Tái Khám</h2>
              <p className="text-sm text-gray-400 mt-0.5">Quản lý lịch hẹn tái khám cho bệnh nhân</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Làm mới"
            >
              <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
            <button
              onClick={openModal}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo lịch hẹn
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: 'Tổng lịch hẹn', value: stats.total, icon: 'calendar_month', color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Chưa đến', value: stats.chuaDen, icon: 'schedule', color: 'text-amber-600 bg-amber-50' },
            { label: 'Đã đến', value: stats.daDen, icon: 'check_circle', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Đã hoãn', value: stats.hoan, icon: 'cancel', color: 'text-red-500 bg-red-50' },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setFilterStatus(prev => prev === s.label.toUpperCase().replace(/ /g, '_') ? '' : '')}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-all text-left"
            >
              <span className={`material-symbols-outlined text-[20px] p-2 rounded-lg ${s.color}`}>{s.icon}</span>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                <p className="text-xl font-black text-gray-800 leading-tight">{s.value}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={e => { setCurrentPage(1); setSearch(e.target.value); }}
              placeholder="Tìm bệnh nhân, chuyên khoa, dịch vụ, bác sĩ..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm"
            />
            {search && (
              <button onClick={() => { setCurrentPage(1); setSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2">
          {FILTER_OPTS.map(o => (
            <button
              key={o.value}
              onClick={() => { setCurrentPage(1); setFilterStatus(o.value); }}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border ${filterStatus === o.value
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                }`}
            >
              {o.label}
              {o.value && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${filterStatus === o.value ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {appointments.filter(a => a.trangThai === o.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-gray-400">Đang tải dữ liệu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-300">
              <span className="material-symbols-outlined text-4xl">{search || filterStatus ? 'search_off' : 'calendar_month'}</span>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-500 text-base">
                {search || filterStatus ? 'Không tìm thấy kết quả' : 'Chưa có lịch hẹn nào'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {search || filterStatus ? 'Thử thay đổi từ khóa hoặc bộ lọc' : 'Nhấn "Tạo lịch hẹn" để thêm mới'}
              </p>
            </div>
            {!search && !filterStatus && (
              <button onClick={openModal} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tạo lịch hẹn
              </button>
            )}
          </div>
        ) : (
          <>
            {/* IN-LIST WARNING */}
            {pageError && (
              <div className="px-5 py-3 bg-rose-50 border-b border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {pageError}
              </div>
            )}
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">
                Hiển thị <span className="font-bold text-gray-700">{filtered.length}</span>
                {filtered.length < appointments.length && <> / {appointments.length}</>} lịch hẹn
              </p>
            </div>
            <div className="overflow-x-auto" style={{ maxHeight: 460 }}>
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['ID', 'Bệnh nhân', 'Chuyên khoa', 'Dịch vụ', 'Bác sĩ', 'Ngày tái khám', 'Trạng thái', 'Ghi chú', ''].map(h => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 ${!h || h === 'Trạng thái' ? 'text-center' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(a => (
                    <tr key={a.id} className="hover:bg-indigo-50/30 transition-colors group">
                      {/* ID */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg">#{a.id}</span>
                      </td>

                      {/* Patient */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                            {(a.tenBenhNhan || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 leading-tight whitespace-nowrap">{a.tenBenhNhan || '—'}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">MBN #{a.maBenhNhan}</p>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{a.tenChuyenKhoa || '—'}</td>

                      {/* Service */}
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{a.tenDichVu || '—'}</td>

                      {/* Doctor */}
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">{a.tenNhanVien || '—'}</td>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-bold text-gray-700 whitespace-nowrap">
                          {a.ngayTaiKham ? new Date(a.ngayTaiKham).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                        </p>
                        {a.ngayTaiKham && <div className="mt-0.5">{getDaysUntil(a.ngayTaiKham)}</div>}
                      </td>

                      {/* Status — clickable dropdown */}
                      <td className="px-5 py-3.5 text-center">
                        <StatusDropdown appointment={a} onUpdate={handleUpdate} />
                      </td>

                      {/* Note */}
                      <td className="px-5 py-3.5 max-w-[140px]">
                        {a.ghiChu
                          ? <p className="text-sm text-gray-500 truncate" title={a.ghiChu}>{a.ghiChu}</p>
                          : <span className="text-gray-300">—</span>}
                      </td>

                      {/* Delete */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => openCancelModal(a.id)}
                          disabled={deletingId === a.id}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Hủy lịch hẹn"
                        >
                          <span className={`material-symbols-outlined text-[18px] ${deletingId === a.id ? 'animate-spin' : ''}`}>
                            {deletingId === a.id ? 'refresh' : 'delete'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION UI */}
            {filtered.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCount}
                  label="lịch hẹn"
                  visiblePages={visiblePages}
                  onPageChange={setCurrentPage}
                  jumpPage={jumpPage}
                  onJumpPage={handleJumpPage}
                  onJumpBlur={handleJumpPageBlur}
                  activeClass="bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  hoverClass="hover:bg-indigo-50 hover:text-indigo-600"
                  ringClass="focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <AppointmentModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          getMinDate={getMinDate}
          patient={patient}
          chuyenKhoaList={chuyenKhoaList}
          dichVuList={dichVuList}
          benhNhanList={benhNhanList}
          creating={creating}
          doctorShifts={doctorShifts}
        />
      )}

      {/* ── Cancel Modal ── */}
      {cancelTarget !== null && (
        <CancelModal
          onClose={closeCancelModal}
          onConfirm={confirmCancel}
          lyDo={cancelLyDo}
          setLyDo={setCancelLyDo}
          deletingId={deletingId}
        />
      )}
    </div>
  );
};

export default TabHenTaiKham;