import React, { useState, useEffect, useCallback } from 'react';
import { getSpecialtyHistoryApi } from '../api/phieuKhamApi';
import { sqlLikeMatch } from '../utils/searchUtils';

const LichSuChuyenKhoa = ({ user, onReview }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const maChuyenKhoa = user?.maChuyenKhoa;

  const fetchHistory = useCallback(async () => {
    if (!maChuyenKhoa) return;
    try {
      setLoading(true);
      const data = await getSpecialtyHistoryApi(maChuyenKhoa);
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching specialty history:", error);
    } finally {
      setLoading(false);
    }
  }, [maChuyenKhoa]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter(item => {
    if (!searchTerm) return true;
    return (
      sqlLikeMatch(item.hoTen, searchTerm) ||
      sqlLikeMatch(item.maPhieuKham, searchTerm) ||
      sqlLikeMatch(item.chanDoan, searchTerm)
    );
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">history_edu</span>
            Lịch sử khám chuyên khoa (Tất cả các ngày)
          </h3>
          <p className="text-xs text-slate-400 font-medium">Chuyên khoa: {user?.tenChuyenKhoa || 'Mọi chuyên khoa'}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, mã phiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-56 transition-all placeholder:font-normal placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            )}
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Mã Phiếu</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Bệnh Nhân</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Ngày Khám</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Chẩn Đoán</th>
              <th className="px-6 py-4 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                  Không tìm thấy lịch sử khám nào.
                </td>
              </tr>
            ) : (
              filteredHistory.map(item => (
                <tr key={item.maPhieuKham} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-xs text-indigo-600">
                    #{item.maPhieuKham}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {item.hoTen ? item.hoTen.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.hoTen}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Mã BN: #{item.maBenhNhan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {item.ngayKham ? new Date(item.ngayKham).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium italic max-w-xs truncate">
                    {item.chanDoan || 'Không có ghi nhận chẩn đoán'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onReview(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      Xem lại
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LichSuChuyenKhoa;
