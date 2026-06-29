import React, { useState, useEffect, useCallback } from 'react';
import {
  getPendingApprovalListApi,
  getApprovedListApi
} from '../../../api/phieuChiDinhApi';
import DuyetKetQuaXetNghiem from './DuyetKetQuaXetNghiem';
import DuyetKetQuaCDHA from './DuyetKetQuaCDHA';
import { toast } from 'react-toastify';

const TABS = [
  { key: 'pending',     label: 'Chờ duyệt',   icon: 'pending_actions' },
  { key: 'approved',    label: 'Đã duyệt',    icon: 'verified' },
];

const BangDieuKhienChanDoan = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingList, setPendingList] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedLoai, setSelectedLoai] = useState(null);

  const maCK = user?.maChuyenKhoa;
  const isXn = maCK === 7;

  const toPatient = (item) => ({
    maPhieuKham: item.maPhieuKham, maBenhNhan: item.maBenhNhan,
    hoTen: item.hoTen, gioiTinh: item.gioiTinh, ngaySinh: item.ngaySinh,
    soDienThoai: item.soDienThoai, cccd: item.cccd,
    loaiDichVu: item.loaiDichVu,
  });

  const normalize = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filterData = (list) => {
    if (!query.trim()) return list;
    const q = normalize(query);
    return list.filter((i) =>
      normalize(i.hoTen).includes(q) ||
      (i.maPhieuKham || '').toString().includes(q) ||
      (i.maBenhNhan || '').toString().includes(q));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = maCK ? { maChuyenKhoa: maCK } : {};
      const [p, a] = await Promise.allSettled([
        getPendingApprovalListApi(params),
        getApprovedListApi(params),
      ]);
      if (p.status === 'fulfilled') setPendingList(p.value || []);
      if (a.status === 'fulfilled') setApprovedList(a.value || []);
    } catch (e) { console.error(e); toast.error('Không tải được dữ liệu.'); }
    finally { setLoading(false); }
  }, [maCK]);

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, [fetchData]);

  const handleSelect = (item) => {
    const loai = item.loaiKetQua === 'XN' ? 'xet_nghiem' : item.loaiKetQua === 'CDHA' ? 'cdha' : item.loaiKetQua;
    setSelectedPatient(toPatient(item));
    setSelectedLoai(loai);
  };
  const handleBack = () => { setSelectedPatient(null); setSelectedLoai(null); fetchData(); };

  if (selectedPatient && selectedLoai) {
    if (selectedLoai === 'xet_nghiem')
      return <DuyetKetQuaXetNghiem patient={selectedPatient} user={user} onBack={handleBack} />;
    if (selectedLoai === 'cdha')
      return <DuyetKetQuaCDHA patient={selectedPatient} user={user} onBack={handleBack} />;
  }

  const currentList = activeTab === 'pending' ? pendingList : approvedList;
  const counts = {
    pending: pendingList.length,
    approved: approvedList.length,
  };
  const filteredList = filterData(currentList);

  const initials = (name) =>
    (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const formatYear = (d) => {
    if (!d) return '';
    try { return new Date(d).getFullYear().toString(); } catch { return d; }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-200/50">
              <span className="material-symbols-outlined text-white text-2xl">monitoring</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-gray-900 tracking-tight">
                  {isXn ? 'Xét nghiệm' : 'Chẩn đoán hình ảnh'}
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Quản lý duyệt kết quả cận lâm sàng</p>
            </div>
          </div>
          {loading && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg ring-1 ring-indigo-200/50">
              <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
              Đang tải
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 bg-gray-50/80 p-1 rounded-xl border border-gray-100 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
              }`}>
              <span className={`material-symbols-outlined text-base ${activeTab === tab.key ? 'text-indigo-600' : 'text-gray-400'}`}>{tab.icon}</span>
              {tab.label}
              <span className={`text-[10px] min-w-[18px] text-center px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.key
                  ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                  : counts[tab.key] > 0 ? 'bg-gray-200 text-gray-600' : 'bg-gray-100/60 text-gray-300'
              }`}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[400px]">
        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-gray-400 pointer-events-none">search</span>
          <input type="text" placeholder="Tìm tên, mã phiếu khám, mã BN..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 transition-colors">
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          )}
        </div>

        {loading && pendingList.length === 0 && approvedList.length === 0 ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="text-left py-3 pr-3">Tên bệnh nhân</th>
                  <th className="text-left py-3 pr-3">Mã PK</th>
                  <th className="text-left py-3 pr-3">CCCD</th>
                  <th className="text-left py-3 pr-3">Dịch vụ</th>
                  <th className="text-left py-3 pr-3">SĐT</th>
                  <th className="text-left py-3 pr-3">Năm sinh</th>
                  <th className="text-right py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gray-50 ring-1 ring-gray-100 flex items-center justify-center mb-3 mx-auto">
                          <span className="material-symbols-outlined text-3xl text-gray-300">
                            {activeTab === 'pending' ? 'task_alt' : 'verified'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-500">
                          {activeTab === 'pending' ? 'Không có kết quả chờ duyệt' : 'Chưa có kết quả đã duyệt'}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {query ? 'Không tìm thấy kết quả phù hợp.' : (
                            activeTab === 'pending' ? 'Tất cả đã được xử lý xong.' : 'Kết quả đã duyệt sẽ hiển thị tại đây.'
                          )}
                        </p>
                        {query && (
                          <button onClick={() => setQuery('')} className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2">
                            Xóa tìm kiếm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : filteredList.map((item) => {
                  const loai = item.loaiKetQua === 'XN' ? 'XN' : item.loaiKetQua === 'CDHA' ? 'CDHA' : item.loaiKetQua;
                  const loaiColor = item.loaiKetQua === 'XN' ? 'text-cyan-600 bg-cyan-50 ring-cyan-200' : 'text-violet-600 bg-violet-50 ring-violet-200';
                  const isApproved = activeTab === 'approved';
                  return (
                    <tr key={item.maPhieuKham}
                      onClick={() => handleSelect(item)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${isApproved ? 'from-emerald-400 to-emerald-600' : 'from-sky-400 to-sky-600'} text-white text-[10px] font-bold flex items-center justify-center shadow-sm flex-shrink-0`}>
                            {initials(item.hoTen)}
                          </div>
                          <span className="font-bold text-gray-800 truncate max-w-[160px]">{item.hoTen}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="font-mono text-sm font-bold text-gray-500">#{item.maPhieuKham}</span>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="text-gray-500">{item.cccd || ''}</span>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ${loaiColor}`}>
                          <span className="material-symbols-outlined text-[13px]">{item.loaiKetQua === 'XN' ? 'science' : 'radiology'}</span>
                          {loai}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="text-gray-500">{item.soDienThoai || ''}</span>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="text-gray-500">{formatYear(item.ngaySinh)}</span>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${
                          isApproved ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                        </span>
                        <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-500 transition-all ml-2 text-base align-middle">chevron_right</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BangDieuKhienChanDoan;