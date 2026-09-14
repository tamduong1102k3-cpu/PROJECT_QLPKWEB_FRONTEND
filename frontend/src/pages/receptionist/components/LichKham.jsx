import { getAllApi } from '../../../api/lichKhamApi';
import { getAllApi as getAllDichVuApi } from '../../../api/dichVuApi';
import { getAllPhongApi } from '../../../api/danhMucApi';
import { getAllNhanVienApi } from '../../../api/employeeApi';
import { getAllCaLamDanhMucApi } from '../../../api/caLamDanhMucApi';
import { updateApi as updateAppointmentApi } from '../../../api/appointmentApi';
import { useState, useEffect, useCallback } from 'react';
import usePagination from '../../../hooks/usePagination';
import Pagination from '../../../components/Pagination';

const LichKham = ({ onCheckIn, compact, simple }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dichVuMap, setDichVuMap] = useState({});

  // Dữ liệu dropdown cho modal sửa
  const [phongList, setPhongList] = useState([]);
  const [nhanVienList, setNhanVienList] = useState([]);
  const [caList, setCaList] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, appointment: null });
  const [editForm, setEditForm] = useState({ maPhong: '', maBacSi: '', ngayKham: '', maCa: '', ghiChu: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Tải danh sách dịch vụ để tra cứu tên
        try {
          const dvData = await getAllDichVuApi();
          if (Array.isArray(dvData)) {
            const map = {};
            dvData.forEach(dv => { if (dv.maDichVu) map[dv.maDichVu] = dv.tenDichVu; });
            setDichVuMap(map);
          }
        } catch (e) { console.warn('Không thể tải danh sách dịch vụ:', e); }

        const data = await getAllApi();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Lỗi tải lịch khám:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Tải danh sách phòng, bác sĩ, ca khám cho modal sửa
  useEffect(() => {
    (async () => {
      try { const ph = await getAllPhongApi(); setPhongList(Array.isArray(ph) ? ph : []); } catch (e) { console.warn('Không thể tải phòng:', e); }
      try { const nv = await getAllNhanVienApi(); setNhanVienList(Array.isArray(nv) ? nv : []); } catch (e) { console.warn('Không thể tải nhân viên:', e); }
      try { const ca = await getAllCaLamDanhMucApi(); setCaList(Array.isArray(ca) ? ca : []); } catch (e) { console.warn('Không thể tải ca làm việc:', e); }
    })();
  }, []);

  const refreshList = useCallback(async () => {
    try {
      const data = await getAllApi();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải lại lịch khám:', err);
    }
  }, []);

  // Mở modal sửa thông tin lịch khám
  const openEditModal = (a) => {
    setEditForm({
      maPhong: a.maPhong ?? '',
      maBacSi: a.maBacSi ?? '',
      maCa: a.maCa ?? '',
      ngayKham: a.ngayKham ?? '',
      ghiChu: a.ghiChu ?? ''
    });
    setEditModal({ open: true, appointment: a });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, appointment: null });
    setSavingEdit(false);
  };

  // Lưu thông tin đã sửa
  const handleSaveEdit = async () => {
    const appointment = editModal.appointment;
    if (!appointment) return;
    setSavingEdit(true);
    try {
      const payload = {
        maBenhNhan: appointment.maBenhNhan,
        maPhong: editForm.maPhong ? Number(editForm.maPhong) : null,
        maBacSi: editForm.maBacSi ? Number(editForm.maBacSi) : null,
        ngayKham: editForm.ngayKham || null,
        maCa: editForm.maCa ? Number(editForm.maCa) : null,
        ghiChu: editForm.ghiChu || null,
        maChuyenKhoa: appointment.maChuyenKhoa,
        maDichVu: appointment.maDichVu
      };
      await updateAppointmentApi(appointment.id, payload);
      closeEditModal();
      await refreshList();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Hàm lấy tên dịch vụ: ưu tiên từ response backend, fallback về cache
  const getTenDichVu = (a) => {
    return a.tenDichVu || dichVuMap[a.maDichVu] || '--';
  };

  const statusLabels = {
    CHUA_DEN: { label: 'Chưa đến', color: 'bg-gray-100 text-gray-700' },
    DA_CHECK_IN: { label: 'Đã check-in', color: 'bg-green-100 text-green-700' },
    HOAN_THANH: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    HUY: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    QUA_HEN: { label: 'Quá hẹn', color: 'bg-orange-100 text-orange-700' },
  };

  const getStatus = (status) => statusLabels[status] || { label: status || 'Chưa xác định', color: 'bg-gray-100 text-gray-700' };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.ngayKham === todayStr || (a.ngayKham && a.ngayKham.trim().startsWith(todayStr)));

  // Compact mode: card view (không phân trang)
  if (compact) {
    if (loading) return <div className="text-center py-4 text-gray-400 italic text-sm">Đang tải...</div>;
    if (todayAppointments.length === 0) return <div className="text-center py-8 text-gray-400 text-sm">Không có lịch khám hôm nay</div>;

    return todayAppointments.slice(0, 5).map((a) => {
      const isPending = a.trangThai === 'CHUA_DEN';
      return (
        <div key={a.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-lg">calendar_month</span>
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800">{a.tenBenhNhan || `BN#${a.maBenhNhan}`}</p>
              <p className="text-[11px] text-gray-500">{a.tenChuyenKhoa || ''}{a.tenBacSi ? ` - BS: ${a.tenBacSi}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => openEditModal(a)} className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-all" title="Cập nhật">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            {isPending ? (
              <button onClick={() => {
                onCheckIn && onCheckIn({ id: a.id, maBenhNhan: a.maBenhNhan, tenBenhNhan: a.tenBenhNhan, maChuyenKhoa: a.maChuyenKhoa, maBacSi: a.maBacSi, nguonTao: a.nguonTao || a.nguon_tao, daXacMinhDanhTinh: a.daXacMinhDanhTinh });
              }} className="text-[11px] font-bold bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 shadow-sm shadow-green-500/20 transition-all">Check-in</button>
            ) : (
              <span className="text-[11px] text-gray-400">{getStatus(a.trangThai).label}</span>
            )}
          </div>
        </div>
      );
    });
  }

  // Bọc filter trong useCallback để reference ổn định giữa các render,
  // tránh bị reset trang về 1 mỗi lần re-render (lỗi không chuyển trang được)
  const appointmentFilters = useCallback((a) => (
    filterStatus === 'ALL' || a.trangThai === filterStatus
  ), [filterStatus]);

  // Full mode: table - dùng usePagination để filter + search + phân trang
  const {
    paginatedData: paginated,
    filteredData: filtered,
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
    searchKeys: ['tenBenhNhan', 'maBenhNhan', 'tenBacSi', 'tenChuyenKhoa', 'tenDichVu'],
    searchTerm: search,
    filters: appointmentFilters,
  });

  const getSourceBadge = (source) => {
    const s = source?.toUpperCase();
    if (s === 'TAI_KHAM') return <span className="text-purple-600 text-[12px] font-bold uppercase tracking-wide">Tái khám</span>;
    if (s === 'DAT_LICH_APP') return <span className="text-indigo-600 text-[12px] font-bold uppercase tracking-wide">App</span>;
    return <span className="text-gray-500 text-[12px] font-bold uppercase tracking-wide">{source || 'Khác'}</span>;
  };

  return (
    <div className={simple ? '' : 'space-y-3 animate-fade-in'}>
      {!simple && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Lịch khám của bệnh nhân</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input type="text" placeholder="Tìm bệnh nhân, bác sĩ..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-64" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); }}>
                <option value="ALL">Tất cả trạng thái</option>
                <option value="CHUA_DEN">Chưa đến</option>
                <option value="DA_CHECK_IN">Đã check-in</option>
                <option value="HOAN_THANH">Hoàn thành</option>
                <option value="HUY">Đã hủy</option>
                <option value="QUA_HEN">Quá hẹn</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* IN-LIST WARNING */}
      {pageError && (
        <div className="mb-3 px-4 py-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {pageError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-sm text-gray-500 font-medium">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Bệnh Nhân</th>
              <th className="px-4 py-3">Chuyên Khoa</th>
              <th className="px-4 py-3">Dịch Vụ</th>
              <th className="px-4 py-3">Bác Sĩ</th>
              <th className="px-4 py-3">Ngày Khám</th>
              <th className="px-4 py-3">Nguồn</th>
              <th className="px-4 py-3">Trạng Thái</th>
              <th className="px-4 py-3">Ghi Chú</th>
              <th className="px-4 py-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" className="text-center py-10 text-gray-400 italic">Đang tải dữ liệu...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-10 text-gray-400 italic">Không tìm thấy lịch khám nào</td></tr>
            ) : (
              paginated.map(a => {
                const status = getStatus(a.trangThai);
                const isPending = a.trangThai === 'CHUA_DEN';
                return (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-gray-400">#{a.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800">{a.tenBenhNhan || `BN#${a.maBenhNhan}`}</div>
                      {a.maBenhNhan && <div className="text-xs text-gray-400">Mã BN: {a.maBenhNhan}</div>}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{a.tenChuyenKhoa || '--'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{getTenDichVu(a)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{a.tenBacSi || '--'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">{a.ngayKham ? new Date(a.ngayKham).toLocaleDateString('vi-VN') : '--'}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {getSourceBadge(a.nguonTao || a.nguon_tao)}
                        {(a.nguonTao || a.nguon_tao) === 'DAT_LICH_APP' && !a.daXacMinhDanhTinh && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold w-fit">
                            <span className="material-symbols-outlined text-[11px]">gpp_maybe</span>Chưa XM
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span></td>
                    <td className="px-4 py-4 text-sm text-gray-400 max-w-[200px] truncate">{a.ghiChu || '--'}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEditModal(a)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all" title="Cập nhật lịch khám">
                          <span className="material-symbols-outlined text-sm">edit</span>Cập nhật
                        </button>
                        {isPending && (
                          <button onClick={() => {
                            onCheckIn && onCheckIn({ id: a.id, maBenhNhan: a.maBenhNhan, tenBenhNhan: a.tenBenhNhan, maChuyenKhoa: a.maChuyenKhoa, maBacSi: a.maBacSi, nguonTao: a.nguonTao || a.nguon_tao, daXacMinhDanhTinh: a.daXacMinhDanhTinh });
                          }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm shadow-emerald-200 hover:shadow-md font-semibold text-xs">
                            <span className="material-symbols-outlined text-sm">assignment_turned_in</span>Tiếp đón
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="mt-2 text-xs text-gray-400 text-right">Hiển thị {filtered.length} / {appointments.length} lịch khám</div>
      )}

      {/* PAGINATION UI (chỉ chế độ bảng đầy đủ) */}
      {!loading && filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCount}
          label="lịch khám"
          visiblePages={visiblePages}
          onPageChange={setCurrentPage}
          jumpPage={jumpPage}
          onJumpPage={handleJumpPage}
          onJumpBlur={handleJumpPageBlur}
          activeClass="bg-emerald-600 text-white shadow-md shadow-emerald-100"
          hoverClass="hover:bg-green-50 hover:text-green-600"
          ringClass="focus:ring-2 focus:ring-green-200"
        />
      )}

      {/* MODAL SỬA THÔNG TIN LỊCH KHÁM */}
      {editModal.open && editModal.appointment && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={closeEditModal}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">edit_calendar</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-[15px]">Cập nhật lịch khám</h3>
                  <p className="text-emerald-100 text-xs">#{editModal.appointment.id} • {editModal.appointment.tenBenhNhan || `BN#${editModal.appointment.maBenhNhan}`}</p>
                </div>
              </div>
              <button onClick={closeEditModal} className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Phòng khám */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Phòng khám</label>
                <select
                  value={editForm.maPhong ?? ''}
                  onChange={e => setEditForm({ ...editForm, maPhong: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                >
                  <option value="">-- Chọn phòng --</option>
                  {phongList.map(p => (
                    <option key={p.maPhong} value={p.maPhong}>{p.tenPhong}</option>
                  ))}
                </select>
              </div>

              {/* Bác sĩ */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Bác sĩ</label>
                <select
                  value={editForm.maBacSi ?? ''}
                  onChange={e => setEditForm({ ...editForm, maBacSi: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                >
                  <option value="">-- Chọn bác sĩ --</option>
                  {nhanVienList
                    .filter(nv => nv.chucVu === 'BAC_SI' || nv.tenChucVu?.toUpperCase().includes('BÁC S'))
                    .map(nv => (
                      <option key={nv.maNhanVien} value={nv.maNhanVien}>{nv.hoTen}</option>
                    ))}
                </select>
              </div>

              {/* Ngày khám */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Ngày khám</label>
                <input
                  type="date"
                  value={editForm.ngayKham}
                  onChange={e => setEditForm({ ...editForm, ngayKham: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                />
              </div>

              {/* Ca khám */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Ca khám</label>
                <select
                  value={editForm.maCa ?? ''}
                  onChange={e => setEditForm({ ...editForm, maCa: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                >
                  <option value="">-- Chọn ca --</option>
                  {caList.map(ca => (
                    <option key={ca.id} value={ca.id}>{ca.tenCa} ({ca.gioBatDau} - {ca.gioKetThuc})</option>
                  ))}
                </select>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Ghi chú</label>
                <textarea
                  rows={3}
                  value={editForm.ghiChu}
                  onChange={e => setEditForm({ ...editForm, ghiChu: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50 resize-none"
                  placeholder="Ghi chú cho lịch khám..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-1 flex gap-3">
              <button
                onClick={closeEditModal}
                disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingEdit ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">save</span>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LichKham;