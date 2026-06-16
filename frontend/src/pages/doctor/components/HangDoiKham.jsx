import React, { useState, useEffect, useCallback, useRef } from 'react';
import NhomOSoLieu from './NhomOSoLieu';
import { getTodayApi } from '../../../api/dangKyKhamBenhApi';
import { getTodayResultsApi as getTodayResultsXetNghiemApi } from '../../../api/ketQuaXetNghiemApi';
import { getTodayResultsApi as getTodayResultsCdhaApi } from '../../../api/ketQuaCdhaApi';
import { getPendingTestsApi, getCompletedTestsTodayApi } from '../../../api/phieuChiDinhApi';

const HangDoiKham = ({ user, handleSelectPatient, refreshTrigger }) => {
  const [patients, setPatients] = useState({
    waiting: [],
    completed: []
  });
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('waiting'); // 'waiting' hoặc 'completed'
  const debounceTimerRef = useRef(null);

  // Mã chuyên khoa: 1: Nội, 3: Nhi, 4: TMH, 5: RHM, 7: XN, 11: Tim mạch, 12: CĐHA
  const isXetNghiemDoc = Number(user?.maChuyenKhoa) === 7;
  const isCdhaDoc = Number(user?.maChuyenKhoa) === 12;
  const isRhmDoc = Number(user?.maChuyenKhoa) === 5;
  const isLabDoctor = isXetNghiemDoc || isCdhaDoc;

  const fetchQueue = useCallback(async (keyword = '') => {
    try {
      setLoadingQueue(true);
      let data = null;
      if (isLabDoctor) {
        // Lấy danh sách chờ duyệt theo mã chuyên khoa (kèm thông tin bệnh nhân)
        const params = { maChuyenKhoa: user?.maChuyenKhoa };
        const [pendingRes, completedRes] = await Promise.allSettled([
          getPendingTestsApi(params),
          getCompletedTestsTodayApi(params)
        ]);
        const pending = pendingRes.status === 'fulfilled' ? (pendingRes.value || []) : [];
        const completed = completedRes.status === 'fulfilled' ? (completedRes.value || []) : [];
        setPatients({
          waiting: completed, // completed = DA_THUC_HIEN -> cần bác sĩ duyệt
          completed: pending  // pending = CHUA_THUC_HIEN -> chưa có kết quả
        });
        return;
      } else if (isXetNghiemDoc) {
        data = await getTodayResultsXetNghiemApi();
      } else if (isCdhaDoc) {
        data = await getTodayResultsCdhaApi();
      } else {
        // Sử dụng keyword cho tìm kiếm bệnh nhân backend-side (SQL LIKE)
        data = await getTodayApi(keyword);
      }

      if (data) {
        let waiting = [];
        let completed = [];
        if (isXetNghiemDoc || isCdhaDoc) {
          waiting = data.filter(r => r.trangThai === 'CHO_DUYET');
          completed = data.filter(r => r.trangThai === 'DA_DUYET' || r.trangThai === 'HOAN_THANH' || r.trangThai === 'CHO_BAC_SI');
        } else {
          if (user?.maChuyenKhoa) {
            data = data.filter(r => Number(r.maChuyenKhoa) === Number(user.maChuyenKhoa));
          }
          waiting = data.filter(r => r.trangThai === 'CHO_BAC_SI' || r.trangThai === 'DA_KHAM_LAM_SANG' || (isRhmDoc && r.trangThai === 'DANG_KHAM'));
          completed = data.filter(r => r.trangThai === 'HOAN_THANH');
        }
        setPatients({
          waiting,
          completed
        });
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setLoadingQueue(false);
    }
  }, [user, isXetNghiemDoc, isCdhaDoc, isRhmDoc, isLabDoctor]);

  useEffect(() => {
    fetchQueue(appliedSearch);
    const interval = setInterval(() => fetchQueue(appliedSearch), 30000);
    return () => clearInterval(interval);
  }, [fetchQueue, appliedSearch, refreshTrigger]);

  // Debounce search: chờ 400ms sau khi user ngừng gõ mới gọi API
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setAppliedSearch(value);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setAppliedSearch('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  // Danh sách hiển thị theo tab
  const displayedPatients = activeTab === 'waiting' ? patients.waiting : patients.completed;

  const getTabLabel = () => {
    if (isLabDoctor) {
      return { waiting: 'Chờ duyệt KQ', completed: 'Chờ thực hiện' };
    }
    return { waiting: 'Chờ khám', completed: 'Đã khám' };
  };
  const tabLabels = getTabLabel();

  return (
    <div className="animate-fade-in space-y-6">
      <NhomOSoLieu user={user} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">person_search</span>
              {isLabDoctor ? 'Quản lý bệnh nhân' : 'Danh Sách Bệnh Nhân'}
            </h3>
            <button onClick={() => fetchQueue(appliedSearch)} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-gray-200">
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('waiting')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'waiting'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
              {tabLabels.waiting}
              {patients.waiting.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'waiting' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {patients.waiting.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-green-600 text-white shadow-md shadow-green-200'
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {tabLabels.completed}
              {patients.completed.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-600'
                }`}>
                  {patients.completed.length}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Tìm theo tên, CCCD, mã phiếu khám, chuyên khoa..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Bệnh nhân</th>
                <th className="px-6 py-4">Mã</th>
                <th className="px-6 py-4">CCCD</th>
                <th className="px-6 py-4">Dịch vụ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingQueue ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">Đang tải...</td>
                </tr>
              ) : displayedPatients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    {appliedSearch
                      ? `Không tìm thấy bệnh nhân với từ khóa "${appliedSearch}"`
                      : activeTab === 'waiting'
                        ? 'Không có bệnh nhân đang chờ'
                        : 'Không có bệnh nhân đã khám hôm nay'}
                  </td>
                </tr>
              ) : (
                displayedPatients.map((p, idx) => (
                  <tr key={p.id || p.maPhieuKham || idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{p.hoTen || p.tenBenhNhan || 'Bệnh nhân'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">#{p.maPhieuKham || p.maBenhNhan || p.maChiTiet || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.cccd || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.tenChuyenKhoa || p.tenDichVu || p.dichVu || p.phong || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {activeTab === 'waiting' ? (
                        <span className="px-2 py-1 rounded-md text-xs font-bold uppercase bg-amber-100 text-amber-700">
                          CHỜ KHÁM
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md text-xs font-bold uppercase bg-green-100 text-green-700">
                          HOÀN THÀNH
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSelectPatient(p)}
                        className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all ${
                          activeTab === 'waiting'
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {activeTab === 'waiting' ? 'Khám' : 'Xem'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HangDoiKham;