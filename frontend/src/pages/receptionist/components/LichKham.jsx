import { getAllApi } from '../../../api/lichKhamApi';
import { getAllApi as getAllDichVuApi } from '../../../api/dichVuApi';
import { useState, useEffect, useCallback } from 'react';
import usePagination from '../../../hooks/usePagination';
import Pagination from '../../../components/Pagination';

const LichKham = ({ onCheckIn, compact, simple }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dichVuMap, setDichVuMap] = useState({});

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

  // Hàm lấy tên dịch vụ: ưu tiên từ response backend, fallback về cache
  const getTenDichVu = (a) => {
    return a.tenDichVu || dichVuMap[a.maDichVu] || '--';
  };

  const statusLabels = {
    CHO_XAC_NHAN: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
    DA_XAC_NHAN: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    CHUA_DEN: { label: 'Chưa đến', color: 'bg-gray-100 text-gray-700' },
    DA_CHECK_IN: { label: 'Đã check-in', color: 'bg-green-100 text-green-700' },
    HOAN_THANH: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    HUY: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
    KHONG_DEN: { label: 'Không đến', color: 'bg-gray-100 text-gray-700' },
    QUA_HEN: { label: 'Quá hẹn', color: 'bg-orange-100 text-orange-700' },
  };

  const getStatus = (status) => statusLabels[status] || { label: status || 'Chưa xác định', color: 'bg-gray-100 text-gray-700' };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.ngayKham === todayStr || (a.ngayKham && a.ngayKham.startsWith(todayStr)));

  // Compact mode: card view (không phân trang)
  if (compact) {
    if (loading) return <div className="text-center py-4 text-gray-400 italic text-sm">Đang tải...</div>;
    if (todayAppointments.length === 0) return <div className="text-center py-8 text-gray-400 text-sm">Không có lịch khám hôm nay</div>;

    return todayAppointments.slice(0, 5).map((a) => {
      const isPending = a.trangThai === 'CHO_XAC_NHAN' || a.trangThai === 'DA_XAC_NHAN' || a.trangThai === 'CHUA_DEN';
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
          {isPending ? (
            <button onClick={() => {
              onCheckIn && onCheckIn({ id: a.id, maBenhNhan: a.maBenhNhan, tenBenhNhan: a.tenBenhNhan, maChuyenKhoa: a.maChuyenKhoa, maBacSi: a.maBacSi, nguonTao: a.nguonTao || a.nguon_tao, daXacMinhDanhTinh: a.daXacMinhDanhTinh });
            }} className="text-[11px] font-bold bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 shadow-sm shadow-green-500/20 transition-all">Check-in</button>
          ) : (
            <span className="text-[11px] text-gray-400">{getStatus(a.trangThai).label}</span>
          )}
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
                <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
                <option value="DA_XAC_NHAN">Đã xác nhận</option>
                <option value="CHUA_DEN">Chưa đến</option>
                <option value="DA_CHECK_IN">Đã check-in</option>
                <option value="HOAN_THANH">Hoàn thành</option>
                <option value="HUY">Đã hủy</option>
                <option value="KHONG_DEN">Không đến</option>
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
                const isPending = a.trangThai === 'CHO_XAC_NHAN' || a.trangThai === 'DA_XAC_NHAN' || a.trangThai === 'CHUA_DEN';
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
                      {isPending ? (
                        <button onClick={() => {
                          onCheckIn && onCheckIn({ id: a.id, maBenhNhan: a.maBenhNhan, tenBenhNhan: a.tenBenhNhan, maChuyenKhoa: a.maChuyenKhoa, maBacSi: a.maBacSi, nguonTao: a.nguonTao || a.nguon_tao, daXacMinhDanhTinh: a.daXacMinhDanhTinh });
                        }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm shadow-emerald-200 hover:shadow-md font-semibold text-xs">
                          <span className="material-symbols-outlined text-sm">assignment_turned_in</span>Tiếp đón
                        </button>
                      ) : (<span className="text-xs text-gray-300 italic">--</span>)}
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
    </div>
  );
};

export default LichKham;