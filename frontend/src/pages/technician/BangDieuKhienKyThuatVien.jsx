import React, { useState, useEffect, useCallback } from 'react';
import { getPendingTestsApi, getCompletedTestsTodayApi } from '../../api/phieuChiDinhApi';
import { removeVietnameseTones } from './component/TienIchKyThuatVien';
import BangDanhSachCongViec from './component/BangDanhSachCongViec';
import ModalNhapKetQua from './component/ModalNhapKetQua';
import ModalXemKetQua from './component/ModalXemKetQua';
import QuanLyBenhNhan from '../admin/QuanLyBenhNhan';
import UserMenu from '../../components/UserMenu';

const BangDieuKhienKyThuatVien = ({ onLogout, user }) => {
  const isImaging = user?.vaiTro?.includes('CHAN_DOAN_HINH_ANH') || user?.vaiTro?.includes('CDHA');
  const deptName = isImaging ? 'Chẩn Đoán Hình Ảnh' : 'Xét Nghiệm';
  const [activeTab, setActiveTab] = useState('worklist');
  const [worklistTab, setWorklistTab] = useState('pending');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingTests, setPendingTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);

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

  return (
    <div className="flex h-screen bg-slate-50 font-body-md overflow-hidden text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar - Design Premium */}
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
            {[{id:'worklist', label: deptName, icon: isImaging ? 'image' : 'biotech'}, {id:'patients', label: 'Hồ Sơ', icon:'person_search'}].map(i => (
              <li key={i.id}>
                <button onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === i.id ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                  <span className={`material-symbols-outlined ${activeTab === i.id ? 'text-indigo-600' : ''}`}>{i.icon}</span>
                  {isSidebarOpen && <span className="text-[15px]">{i.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-bold transition-colors group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">logout</span>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 p-2.5 hover:bg-slate-100 rounded-xl transition-colors ring-1 ring-transparent hover:ring-slate-200">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{activeTab === 'worklist' ? `Phòng ${deptName}` : 'Hồ Sơ Bệnh Nhân'}</h1>
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
          {activeTab === 'patients' ? <QuanLyBenhNhan /> : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TheThongKe title="Chờ thực hiện" value={pendingTests.length} icon="pending_actions" color="from-amber-400 to-orange-500" shadowColor="shadow-orange-500/20" />
                <TheThongKe title="Đã hoàn thành" value={completedTests.length} icon="task_alt" color="from-emerald-400 to-teal-500" shadowColor="shadow-teal-500/20" />
                <TheThongKe title="Tổng tiếp nhận" value={pendingTests.length + completedTests.length} icon="assignment" color="from-indigo-400 to-purple-500" shadowColor="shadow-indigo-500/20" />
              </div>

              <BangDanhSachCongViec 
                list={{ data: filterList(worklistTab === 'pending' ? pendingTests : completedTests), pendingCount: pendingTests.length, completedCount: completedTests.length }}
                worklistTab={worklistTab} setWorklistTab={setWorklistTab}
                isImaging={isImaging} loading={loading} isRefreshing={isRefreshing}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                onOpenResult={setSelectedTest} onOpenView={setViewingResult}
                onManualRefresh={handleManualRefresh}
              />
            </div>
          )}
        </main>
      </div>

      {selectedTest && <ModalNhapKetQua test={selectedTest} user={user} isImaging={isImaging} onClose={() => setSelectedTest(null)} onSuccess={() => { setSelectedTest(null); fetchWorklist(); }} />}
      {viewingResult && <ModalXemKetQua viewingResult={viewingResult} user={user} isImaging={isImaging} onClose={() => setViewingResult(null)} />}
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