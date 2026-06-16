import React, { useState, useEffect, useCallback } from 'react';
import { getPendingTestsApi, getCompletedTestsTodayApi } from '../../api/phieuChiDinhApi';
import { getByPhieuKhamApi } from '../../api/chiSoKhamTongHopApi';
import { removeVietnameseTones } from './component/TienIchKyThuatVien';
import BangDanhSachCongViec from './component/BangDanhSachCongViec';
import ModalNhapKetQua from './component/ModalNhapKetQua';
import ModalXemKetQua from './component/ModalXemKetQua';
import ModalKhamSinhHieu from './component/ModalKhamSinhHieu';

import QuanLyBenhNhan from '../../pages/admin/components/QuanLyBenhNhan';
import UserMenu from '../../components/UserMenu';
import WebSocketAutoRefresh from '../../hooks/WebSocketAutoRefresh';
import LichSuChuyenKhoa from '../../components/LichSuChuyenKhoa';

const BangDieuKhienKyThuatVien = ({ onLogout, user }) => {
  const isImaging = user?.vaiTro?.includes('CHAN_DOAN_HINH_ANH') || user?.vaiTro?.includes('CDHA');
  const deptName = isImaging ? 'Chẩn Đoán Hình Ảnh' : 'Xét Nghiệm';
  const [activeTab, setActiveTab] = useState('worklist');
  const [worklistTab, setWorklistTab] = useState('pending');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingTests, setPendingTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [absentTests, setAbsentTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);
  // Vitals states
  const [vitalsPatient, setVitalsPatient] = useState(null);
  // Map lưu trạng thái sinh hiệu {maPhieuKham: true/false}
  const [vitalsMap, setVitalsMap] = useState({});
  // Map lưu dữ liệu sinh hiệu {maPhieuKham: data}
  const [vitalsDataMap, setVitalsDataMap] = useState({});

  // Fetch danh sách và kiểm tra sinh hiệu cho từng bệnh nhân
  const fetchWorklist = useCallback(async (showIndicator = true) => {
    if (showIndicator) setLoading(true);
    try {
      const maChuyenKhoa = user?.maChuyenKhoa || '';
      const [pending, completed] = await Promise.all([
        getPendingTestsApi({ maChuyenKhoa }),
        getCompletedTestsTodayApi({ maChuyenKhoa })
      ]);
      setPendingTests(pending || []);
      setCompletedTests(completed || []);

      // Kiểm tra sinh hiệu cho tất cả bệnh nhân đang chờ
      const allItems = [...(pending || []), ...(completed || [])];
      const maPhieuKhams = [...new Set(allItems.map(i => i.maPhieuKham).filter(Boolean))];
      
      const newVitalsMap = {};
      const newVitalsDataMap = {};
      
      await Promise.all(maPhieuKhams.map(async (maPK) => {
        try {
          const data = await getByPhieuKhamApi(maPK);
          if (data && data.id) {
            newVitalsMap[maPK] = true;
            newVitalsDataMap[maPK] = data;
          } else {
            newVitalsMap[maPK] = false;
          }
        } catch (error) {
          newVitalsMap[maPK] = false;
        }
      }));
      
      setVitalsMap(prev => ({...prev, ...newVitalsMap}));
      setVitalsDataMap(prev => ({...prev, ...newVitalsDataMap}));
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchWorklist();
    const interval = setInterval(() => fetchWorklist(false), 30000);
    return () => clearInterval(interval);
  }, [fetchWorklist]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchWorklist(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filterList = list => {
    const q = removeVietnameseTones(searchQuery.toLowerCase());
    return list.filter(item => 
      removeVietnameseTones(item.hoTen || '').toLowerCase().includes(q) || 
      (item.maPhieuKham || '').toString().includes(q)
    );
  };

  // Mở modal nhập kết quả chuyên môn
  const handleOpenResult = (item) => {
    setSelectedTest(item);
  };

  // Mở modal khám sinh hiệu (cả thêm mới và sửa)
  const handleOpenVitals = (item) => {
    setVitalsPatient(item);
  };

  // Sau khi lưu sinh hiệu xong, cập nhật lại vitalsMap + tự động mở kết quả chuyên môn
  const handleVitalsComplete = (item) => {
    setVitalsPatient(null);
    // Cập nhật trạng thái sinh hiệu
    setVitalsMap(prev => ({...prev, [item.maPhieuKham]: true}));
    // Mở modal nhập kết quả
    setSelectedTest(item);
  };

  // Đóng modal sinh hiệu (không lưu)
  const handleVitalsClose = () => {
    setVitalsPatient(null);
  };

  const handleMarkAbsent = (item) => {
    setPendingTests(prev => prev.filter(t => t.id !== item.id));
    setAbsentTests(prev => [...prev, item]);
  };

  const handleMarkPresent = (item) => {
    setAbsentTests(prev => prev.filter(t => t.id !== item.id));
    setPendingTests(prev => [...prev, item]);
  };

  // Enrich items with vitals status
  const enrichItems = (items) => {
    return items.map(item => ({
      ...item,
      hasVitals: vitalsMap[item.maPhieuKham] || false,
      vitalsData: vitalsDataMap[item.maPhieuKham] || null
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-body-md overflow-hidden text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <WebSocketAutoRefresh
        topics={['/topic/phieu-kham', '/topic/cls']}
        onMessage={(topic, data) => {
          fetchWorklist(false);
        }}
      />
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20`}>
        <div className="h-20 flex items-center justify-center border-b border-slate-100 px-6">
          <div className={`flex items-center gap-3 w-full ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">{isImaging ? 'image' : 'science'}</span>
            </div>
            {isSidebarOpen && <span className="font-black text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">MedCore</span>}
          </div>
        </div>
        <nav className="flex-1 py-6 px-4">
          <ul className="space-y-2">
            {[
              {id:'worklist', label: deptName, icon: isImaging ? 'image' : 'science'},
              {id:'history', label: 'Lịch Sử Khoa', icon: 'history'},
              {id:'patients', label: 'Hồ Sơ', icon:'person_search'}
            ].map(i => (
              <li key={i.id}>
                <button onClick={() => setActiveTab(i.id)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200" style={{ backgroundColor: activeTab === i.id ? '#eef2ff' : 'transparent', color: activeTab === i.id ? '#4338ca' : '#64748b' }}>
                  <span className={`material-symbols-outlined ${activeTab === i.id ? 'text-indigo-600' : ''}`}>{i.icon}</span>
                  {isSidebarOpen && <span className="text-[15px]">{i.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 p-2.5 hover:bg-slate-100 rounded-xl transition-colors ring-1 ring-transparent hover:ring-slate-200">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {activeTab === 'worklist' ? `Phòng ${deptName}` : 'Hồ Sơ Bệnh Nhân'}
            </h1>
          </div>
          <div className="flex items-center gap-6 border-l border-slate-200 pl-6">
            <UserMenu
              user={user}
              onLogout={onLogout}
              displayName={`Xin chào ${user?.username || ''}`}
              displayRole={`KTV ${isImaging ? 'Chẩn Đoán Hình Ảnh' : 'Xét Nghiệm'}`}
              accentColor="indigo"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 scroll-smooth">
          {activeTab === 'patients' ? <QuanLyBenhNhan /> : activeTab === 'history' ? (
            <LichSuChuyenKhoa user={user} onReview={(item) => setViewingResult({
              ...item,
              id: item.maPhieuKham,
              tenDichVu: item.tenChuyenKhoa || deptName,
              ngayChiDinh: item.ngayKham,
              ketQua: item.chanDoan || 'Đã khám hoàn thành'
            })} />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TheThongKe title="Chờ thực hiện" value={pendingTests.length} icon="pending_actions" color="from-amber-400 to-orange-500" shadowColor="shadow-orange-500/20" />
                <TheThongKe title="Đã hoàn thành" value={completedTests.length} icon="task_alt" color="from-emerald-400 to-teal-500" shadowColor="shadow-teal-500/20" />
                <TheThongKe title="Tổng tiếp nhận" value={pendingTests.length + completedTests.length} icon="assignment" color="from-indigo-400 to-purple-500" shadowColor="shadow-indigo-500/20" />
              </div>

              <BangDanhSachCongViec 
                list={{ 
                  data: enrichItems(filterList(worklistTab === 'pending' ? pendingTests : worklistTab === 'completed' ? completedTests : absentTests)), 
                  pendingCount: pendingTests.length, 
                  completedCount: completedTests.length,
                  absentCount: absentTests.length
                }}
                worklistTab={worklistTab} setWorklistTab={setWorklistTab}
                isImaging={isImaging} loading={loading} isRefreshing={isRefreshing}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                onOpenResult={handleOpenResult} onOpenView={setViewingResult}
                onOpenVitals={handleOpenVitals}
                onEditResult={handleOpenResult}
                onManualRefresh={handleManualRefresh}
                onMarkAbsent={handleMarkAbsent}
                onMarkPresent={handleMarkPresent}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modal nhập kết quả chuyên môn */}
      {selectedTest && <ModalNhapKetQua test={selectedTest} user={user} isImaging={isImaging} onClose={() => setSelectedTest(null)} onSuccess={() => { setSelectedTest(null); fetchWorklist(); }} />}
      
      {/* Modal xem kết quả */}
      {viewingResult && <ModalXemKetQua viewingResult={viewingResult} user={user} isImaging={isImaging} onClose={() => setViewingResult(null)} />}
      
      {/* Modal khám sinh hiệu */}
      {vitalsPatient && (
        <ModalKhamSinhHieu 
          patient={vitalsPatient} 
          user={user} 
          onClose={handleVitalsClose} 
          onComplete={handleVitalsComplete} 
        />
      )}
    </div>
  );
};

const TheThongKe = ({ title, value, icon, color, shadowColor }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center gap-5 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${color} shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}>
      <span className="material-symbols-outlined text-[32px]">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

export default BangDieuKhienKyThuatVien;