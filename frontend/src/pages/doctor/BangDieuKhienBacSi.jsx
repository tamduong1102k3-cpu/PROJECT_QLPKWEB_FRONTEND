import React, { useState } from 'react';
import QuanLyBenhNhan from '../../pages/admin/components/QuanLyBenhNhan';
import LichSuChuyenKhoa from '../../components/LichSuChuyenKhoa';
import DuyetKetQuaXetNghiem from './components/DuyetKetQuaXetNghiem';
import DuyetKetQuaCDHA from './components/DuyetKetQuaCDHA';
import HangDoiKham from './components/HangDoiKham';
import ManHinhKhamBenh from './components/ManHinhKhamBenh';
import TabHenTaiKham from './components/TabHenTaiKham';
import UserMenu from '../../components/UserMenu';
import WebSocketAutoRefresh from '../../hooks/WebSocketAutoRefresh';

const BangDieuKhienBacSi = ({ onLogout, user }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Dựa vào mã chuyên khoa và tên chuyên khoa:
  // 1: Nội tổng quát, 3: Nhi khoa, 4: TMH, 5: RHM, 7: Xét nghiệm, 11: Tim mạch, 12: CĐHA
  const maCK = Number(user?.maChuyenKhoa);
  const tenCK = (user?.tenChuyenKhoa || '').toLowerCase();
  const vaiTro = (user?.vaiTro || '').toUpperCase();

  // Kiểm tra nhiều nguồn để đảm bảo phát hiện chính xác
  const isXetNghiemDoc = maCK === 7 || vaiTro.includes('XET_NGHIEM') || tenCK.includes('xét nghiệm');
  const isCdhaDoc = maCK === 12 || vaiTro.includes('CDHA') || vaiTro.includes('CHAN_DOAN_HINH_ANH') || tenCK.includes('chẩn đoán') || tenCK.includes('hình ảnh');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('examination');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Hàng Đợi',
      icon: 'format_list_numbered'
    }, 
    {
      id: 'examination',
      label: isXetNghiemDoc ? 'Duyệt Xét Nghiệm' : isCdhaDoc ? 'Duyệt CĐHA' : 'Khám Bệnh',
      icon: isXetNghiemDoc ? 'science' : isCdhaDoc ? 'image' : 'medical_services'
    }, 
    {
      id: 'history',
      label: 'Lịch Sử Khám',
      icon: 'history'
    }, 
    {
      id: 'patients',
      label: 'Hồ Sơ Bệnh Nhân',
      icon: 'person_search'
    }, 
    {
      id: 'appointments',
      label: 'Lịch Hẹn',
      icon: 'calendar_month'
    }
  ];

  // Luôn mount HangDoiKham (dùng display:none khi không active) để giữ state khi chuyển tab
  const renderContent = () => {
    return (
      <>
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <HangDoiKham 
            user={user} 
            handleSelectPatient={handleSelectPatient} 
            refreshTrigger={refreshTrigger}
          />
        </div>
        {activeTab === 'examination' && (
          <>
            {isXetNghiemDoc ? (
              selectedPatient ? (
                <DuyetKetQuaXetNghiem 
                  patient={selectedPatient} 
                  user={user} 
                  onBack={() => {
                    setSelectedPatient(null);
                    setActiveTab('dashboard');
                  }} 
                />
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                  <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">person_search</span>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa chọn bệnh nhân</h3>
                  <p className="text-gray-400 mx-auto w-full block" style={{ maxWidth: '400px' }}>
                    Vui lòng chọn bệnh nhân từ hàng đợi hoặc hồ sơ để duyệt kết quả xét nghiệm.
                  </p>
                  <button onClick={() => setActiveTab('dashboard')} className="mt-6 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-100 transition-all text-xs uppercase">
                    Tới hàng đợi
                  </button>
                </div>
              )
            ) : isCdhaDoc ? (
              selectedPatient ? (
                <DuyetKetQuaCDHA 
                  patient={selectedPatient} 
                  user={user} 
                  onBack={() => {
                    setSelectedPatient(null);
                    setActiveTab('dashboard');
                  }} 
                />
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
                  <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">person_search</span>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa chọn bệnh nhân</h3>
                  <p className="text-gray-400 mx-auto w-full block" style={{ maxWidth: '400px' }}>
                    Vui lòng chọn bệnh nhân từ hàng đợi hoặc hồ sơ để duyệt kết quả chẩn đoán hình ảnh.
                  </p>
                  <button onClick={() => setActiveTab('dashboard')} className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all text-xs uppercase">
                    Tới hàng đợi
                  </button>
                </div>
              )
            ) : selectedPatient ? (
              <ManHinhKhamBenh 
                selectedPatient={selectedPatient} 
                setSelectedPatient={setSelectedPatient} 
                user={user} 
                onBackToQueue={() => {
                  setSelectedPatient(null);
                  setActiveTab('dashboard');
                }} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-300">
                  <span className="material-symbols-outlined text-5xl">person_search</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa chọn bệnh nhân</h3>
                <p className="text-gray-500 mb-6">Vui lòng chọn bệnh nhân từ hàng đợi để bắt đầu khám</p>
                <button onClick={() => setActiveTab('dashboard')} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
                  ĐẾN HÀNG ĐỢI
                </button>
              </div>
            )}
          </>
        )}
        {activeTab === 'history' && <LichSuChuyenKhoa user={user} onReview={handleSelectPatient} />}
        {activeTab === 'patients' && <QuanLyBenhNhan />}
        {activeTab === 'appointments' && <TabHenTaiKham user={user} />}
      </>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-body-md text-on-background overflow-hidden">
      <WebSocketAutoRefresh
        topics={['/topic/phieu-kham', '/topic/dang-ky-kham', '/topic/cls']}
        onMessage={(topic, data) => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <span className="material-symbols-outlined text-[20px]">medical_information</span>
            </div>
            {isSidebarOpen && <span className="font-bold text-xl text-indigo-600 tracking-tight">MedCore</span>}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveTab(item.id)} 
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 font-bold translate-x-1 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Bác sĩ</span>
              <span className="text-gray-300">/</span>
              <h1 className="text-lg font-bold text-gray-800">{navItems.find(i => i.id === activeTab)?.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
                <UserMenu
                user={user}
                onLogout={onLogout}
                displayName={`Xin chào ${user?.username || ''}`}
                displayRole={user?.tenChuyenKhoa || 'Khoa Nội'}
                accentColor="indigo"
              />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa]">{renderContent()}</main>
      </div>
    </div>
  );
};

export default BangDieuKhienBacSi;