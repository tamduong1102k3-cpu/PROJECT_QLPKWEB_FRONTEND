import React, { useState, useEffect, useCallback } from 'react';
import { 
  getPendingApprovalListApi, 
  getApprovedListApi 
} from '../../../api/phieuChiDinhApi';
import DuyetKetQuaXetNghiem from './DuyetKetQuaXetNghiem';
import DuyetKetQuaCDHA from './DuyetKetQuaCDHA';

const BangDieuKhienChanDoan = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingList, setPendingList] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedLoai, setSelectedLoai] = useState(null);

  const maChuyenKhoa = user?.maChuyenKhoa;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = maChuyenKhoa ? { maChuyenKhoa } : {};
      const [pendingRes, approvedRes] = await Promise.allSettled([
        getPendingApprovalListApi(params),
        getApprovedListApi(params)
      ]);
      if (pendingRes.status === 'fulfilled') setPendingList(pendingRes.value || []);
      if (approvedRes.status === 'fulfilled') setApprovedList(approvedRes.value || []);
    } catch (e) {
      console.error("Lỗi khi tải danh sách duyệt:", e);
    } finally {
      setLoading(false);
    }
  }, [maChuyenKhoa]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSelectPatient = (item) => {
    const patient = {
      maPhieuKham: item.maPhieuKham,
      maBenhNhan: item.maBenhNhan,
      hoTen: item.hoTen,
      gioiTinh: item.gioiTinh,
      ngaySinh: item.ngaySinh,
      soDienThoai: item.soDienThoai,
      cccd: item.cccd
    };
    setSelectedPatient(patient);
    setSelectedLoai(item.loaiKetQua);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setSelectedLoai(null);
    fetchData();
  };

  // If a patient is selected, show the appropriate approval component
  if (selectedPatient && selectedLoai) {
    if (selectedLoai === 'XN') {
      return (
        <DuyetKetQuaXetNghiem 
          patient={selectedPatient} 
          user={user} 
          onBack={handleBackToList} 
        />
      );
    } else if (selectedLoai === 'CDHA') {
      return (
        <DuyetKetQuaCDHA 
          patient={selectedPatient} 
          user={user} 
          onBack={handleBackToList} 
        />
      );
    }
  }

  const currentList = activeTab === 'pending' ? pendingList : approvedList;

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800">
            {user?.tenChuyenKhoa || 'Chẩn đoán'} - Duyệt kết quả
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý phê duyệt kết quả {user?.maChuyenKhoa === 7 ? 'xét nghiệm' : 'chẩn đoán hình ảnh'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {user?.hoTen || user?.username}
          </span>
          {onBack && (
            <button onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all border border-gray-200">
              ← QUAY LẠI
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 px-6 text-sm font-bold transition-all relative ${
              activeTab === 'pending'
                ? 'text-rose-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">pending_actions</span>
              CHỜ DUYỆT
              {pendingList.length > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full font-bold">
                  {pendingList.length}
                </span>
              )}
            </span>
            {activeTab === 'pending' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-4 px-6 text-sm font-bold transition-all relative ${
              activeTab === 'approved'
                ? 'text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              ĐÃ DUYỆT
              {approvedList.length > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">
                  {approvedList.length}
                </span>
              )}
            </span>
            {activeTab === 'approved' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-indigo-600 font-bold italic">
              <span className="material-symbols-outlined animate-spin mr-2">sync</span>
              Đang tải danh sách...
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">
                {activeTab === 'pending' ? 'hourglass_empty' : 'checklist'}
              </span>
              <h3 className="text-lg font-bold text-gray-500 mb-1">
                {activeTab === 'pending' ? 'Không có kết quả chờ duyệt' : 'Chưa có kết quả đã duyệt'}
              </h3>
              <p className="text-sm text-gray-400">
                {activeTab === 'pending'
                  ? 'Tất cả kết quả đã được duyệt hoặc chưa có kết quả mới.'
                  : 'Hôm nay chưa có kết quả nào được duyệt.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <th className="py-4 px-4">STT</th>
                    <th className="py-4 px-4">Họ tên</th>
                    <th className="py-4 px-4">Mã BN</th>
                    <th className="py-4 px-4">SĐT</th>
                    <th className="py-4 px-4">CCCD</th>
                    <th className="py-4 px-4">Dịch vụ</th>
                    <th className="py-4 px-4">Loại</th>
                    <th className="py-4 px-4">Trạng thái</th>
                    <th className="py-4 px-4">Thời gian</th>
                    <th className="py-4 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentList.map((item, index) => (
                    <tr key={`${item.maPhieuKham}-${item.chiTietId}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-400 font-medium">{index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                            {item.hoTen?.[0] || '?'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-sm">{item.hoTen}</span>
                            <div className="text-[11px] text-gray-400">
                              {item.gioiTinh ? 'Nam' : 'Nữ'} 
                              {item.ngaySinh ? ` • ${new Date(item.ngaySinh).getFullYear()}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                          #{item.maBenhNhan}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {item.soDienThoai || '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {item.cccd || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-700">{item.tenDichVu}</span>
                      </td>
                      <td className="py-4 px-4">
                        {item.loaiKetQua === 'XN' ? (
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            XÉT NGHIỆM
                          </span>
                        ) : item.loaiKetQua === 'CDHA' ? (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            CĐHA
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
                            KHÁC
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {item.trangThai === 'CHO_DUYET' ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                            CHỜ DUYỆT
                          </span>
                        ) : item.trangThai === 'DA_DUYET' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            ĐÃ DUYỆT
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold">
                            {item.trangThai || '-'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">{item.thoiGian ? new Date(item.thoiGian).toLocaleString('vi-VN') : '-'}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleSelectPatient(item)}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
                        >
                          XEM & DUYỆT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BangDieuKhienChanDoan;