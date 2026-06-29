import { getTodayApi as _getTodayDangKy, updateStatusApi } from '../../../api/dangKyKhamBenhApi';
import React, { useState, useEffect, useCallback, useRef } from 'react';

const DanhSachCho = ({ type = 'waiting', refreshTrigger = 0 }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const [cancelled, setCancelled] = useState([]);
  const fetchList = useCallback(() => {
    const shouldShowLoading = isInitialLoad.current;
    if (shouldShowLoading) setLoading(true);
    isInitialLoad.current = false;
    (async () => ({
      ok: true,
      json: async () => await _getTodayDangKy()
    }))().then(r => r.ok ? r.json() : []).then(data => {
      // Chỉ lấy bệnh nhân đang chờ khám (CHO_KHAM), loại trừ các trạng thái đã kết thúc
      const waiting = data.filter(r => r.trangThai === 'CHO_KHAM' && r.trangThai !== 'HOAN_THANH' && r.trangThai !== 'HOAN_TAT');
      const cancelled = data.filter(r => r.trangThai === 'HUY');
      setList(waiting);
      setCancelled(cancelled);
      if (shouldShowLoading) setLoading(false);
    }).catch(() => { if (shouldShowLoading) setLoading(false); });
  }, []);
  useEffect(() => {
    fetchList();
  }, [fetchList, refreshTrigger]);
  const cancelRegistration = id => {
    updateStatusApi(id, { trangThai: 'HUY' })
      .then(() => {
        fetchList();
      })
      .catch(err => console.error('Cancel failed:', err));
  };

  if (loading) return <div className="text-center py-4 text-gray-400 italic text-sm">Đang tải...</div>;

  if (type === 'cancelled') {
    return <>
      {cancelled.length > 0 ? cancelled.map(p => <div key={p.soThuTu} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold shadow-sm">
            {p.soThuTu}
          </div>
          <div>
            <p className="font-bold text-sm text-gray-800">{p.hoTen}</p>
            <p className="text-xs text-gray-5">Đã hủy • {new Date(p.thoiGian).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-lg uppercase">{p.tenChuyenKhoa}</span>
      </div>) : <div className="text-center text-gray-400 text-sm">Hiện không có bệnh nhân đã hủy</div>}
    </>;
  }

  return <>
    {list.length > 0 && list.map(p => <div key={p.soThuTu} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
          {p.soThuTu}
        </div>
        <div>
          <p className="font-bold text-sm text-gray-800">{p.hoTen}</p>
          <p className="text-xs text-gray-500">Chờ khám • {new Date(p.thoiGian).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg uppercase">{p.tenChuyenKhoa}</span>
        <button onClick={() => cancelRegistration(p.id)} className="ml-2 text-red-600 hover:underline text-sm">Hủy</button>
      </div>
    </div>)}
  </>;
};
export default DanhSachCho;
