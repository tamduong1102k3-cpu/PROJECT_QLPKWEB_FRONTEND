import { getTodayApi as _getTodayDangKy } from '../../../api/dangKyKhamBenhApi';
import { apiClient } from "../../../api/apiClient";
import React, { useState, useEffect, useCallback } from 'react';

const DanhSachCho = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelled, setCancelled] = useState([]);
  const fetchList = useCallback(() => {
    (async () => ({
      ok: true,
      json: async () => await _getTodayDangKy()
    }))().then(r => r.ok ? r.json() : []).then(data => {
      const waiting = data.filter(r => r.trangThai === 'CHO_KHAM');
      const cancelled = data.filter(r => r.trangThai === 'HUY');
      setList(waiting);
      setCancelled(cancelled);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  useEffect(() => {
    fetchList();
  }, [fetchList]);
  const cancelRegistration = id => {
    apiClient(`${API_BASE}/dang-ky/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trangThai: 'HUY'
      })
    }).then(r => {
      if (r.ok) {
        fetchList();
      } else {
        console.error('Cancel failed');
      }
    }).catch(err => console.error(err));
  };
  if (loading) return <div className="text-center py-4 text-gray-400 italic text-sm">Đang tải...</div>;
  return <>
      {/* Waiting List */}
      {list.length > 0 && list.map(p => <div key={p.soThuTu} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
              {p.soThuTu}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800">{p.hoTen}</p>
              <p className="text-xs text-gray-500">ChĐ khám • {new Date(p.thoiGian).toLocaleTimeString('vi-VN', {
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
        {/* Cancelled List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Danh sách hủy</h3>
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
        </div>
    </>;
};
export default DanhSachCho;
