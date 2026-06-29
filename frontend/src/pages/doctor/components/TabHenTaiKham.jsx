import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { getAllApi, createApi, deleteApi, updateApi } from '../../../api/appointmentApi';
import { useNotification } from '../../../components/NotificationContext';

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

const getStatusBadge = (trangThai) => {
  const cfg = STATUS_CONFIG[trangThai] || { label: trangThai, cls: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
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

/* ─── Create Modal (Portal) ─── */
const AppointmentModal = ({ formData, setFormData, onClose, onCreate, getMinDate, patient }) =>
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
            width: '100%', maxWidth: '480px',
            background: '#fff', borderRadius: '1.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            animation: 'modalIn 0.28s cubic-bezier(.34,1.56,.64,1) both'
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
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Patient info - auto-filled when from examination view */}
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
                <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#818cf8' }}>person</span>
                  Mã bệnh nhân <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.maBenhNhan}
                  onChange={e => setFormData({ ...formData, maBenhNhan: e.target.value })}
                  placeholder="Nhập mã bệnh nhân..."
                  style={{ width: '100%', padding: '0.75rem 1rem', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', fontSize: 14, fontWeight: 600, color: '#1f2937', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#818cf8'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#818cf8' }}>event</span>
                Ngày tái khám <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.ngayTaiKham}
                min={getMinDate()}
                onChange={e => setFormData({ ...formData, ngayTaiKham: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', fontSize: 14, fontWeight: 600, color: '#1f2937', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#818cf8'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <p style={{ fontSize: 10, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3, marginTop: 5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                Không được chọn ngày hôm nay hoặc trong quá khứ
              </p>
            </div>

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

          {/* Footer */}
          <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: 14, color: '#4b5563', cursor: 'pointer' }}
            >
              Hủy bỏ
            </button>
            <button
              onClick={onCreate}
              style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: '0.75rem', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 15px rgba(79,70,229,0.35)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
              Xác nhận tạo
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
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    maBenhNhan: patient?.maBenhNhan || '', maChuyenKhoa: user?.maChuyenKhoa || '', ngayTaiKham: '', ghiChu: ''
  });

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const openModal = () => {
    setFormData({ maBenhNhan: patient?.maBenhNhan || '', maChuyenKhoa: user?.maChuyenKhoa || '', ngayTaiKham: '', ghiChu: '' });
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!formData.maBenhNhan || !formData.maChuyenKhoa || !formData.ngayTaiKham) {
      showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      await createApi({
        maBenhNhan: Number(formData.maBenhNhan),
        maChuyenKhoa: Number(formData.maChuyenKhoa),
        maNhanVien: Number(user?.maNhanVien),
        ngayTaiKham: formData.ngayTaiKham,
        trangThai: 'CHUA_DEN',
        ghiChu: formData.ghiChu
      });
      showSuccess('Đã tạo lịch hẹn tái khám thành công!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showError('Lỗi: ' + err.message);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) return;
    setDeletingId(id);
    try {
      await deleteApi(id);
      showSuccess('Đã hủy lịch hẹn');
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

  const filtered = appointments.filter(a => {
    const matchStatus = !filterStatus || a.trangThai === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (a.tenBenhNhan || '').toLowerCase().includes(q)
      || String(a.maBenhNhan).includes(q)
      || (a.tenChuyenKhoa || '').toLowerCase().includes(q)
      || (a.tenNhanVien || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
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
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm bệnh nhân, chuyên khoa, bác sĩ..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2">
          {FILTER_OPTS.map(o => (
            <button
              key={o.value}
              onClick={() => setFilterStatus(o.value)}
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
                    {['ID', 'Bệnh nhân', 'Chuyên khoa', 'Bác sĩ', 'Ngày tái khám', 'Trạng thái', 'Ghi chú', ''].map(h => (
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
                  {filtered.map(a => (
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
                          onClick={() => handleDelete(a.id)}
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
        />
      )}
    </div>
  );
};

export default TabHenTaiKham;