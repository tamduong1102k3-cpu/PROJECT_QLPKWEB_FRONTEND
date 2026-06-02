import React, { useState } from 'react';
import QuanLyBenhNhan from '../admin/QuanLyBenhNhan';
import LichSuKham from './components/LichSuKham';
import DuyetKetQuaXetNghiem from './components/DuyetKetQuaXetNghiem';
import DuyetKetQuaCDHA from './components/DuyetKetQuaCDHA';
import HangDoiKham from './components/HangDoiKham';
import ManHinhKhamBenh from './components/ManHinhKhamBenh';
import UserMenu from '../../components/UserMenu';

const BangDieuKhienBacSi = ({ onLogout, user }) => {
  const isXetNghiemDoc = user?.maChuyenKhoa === 7 || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xét nghiệm') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xact nghiem') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xact nghi?m');

  const isCdhaDoc = user?.maChuyenKhoa === 8 || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('chẩn đoán hình ảnh') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('chan doan hinh anh') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('cdha') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('siêu âm') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('sieu am') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('x-quang') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xquang');

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
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <HangDoiKham 
            user={user} 
            handleSelectPatient={handleSelectPatient} 
          />
        );
      case 'examination':
        if (isXetNghiemDoc) {
          return selectedPatient ? (
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
          );
        }
        if (isCdhaDoc) {
          return selectedPatient ? (
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
          );
        }
        return selectedPatient ? (
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
        );
      case 'history':
        return <LichSuKham user={user} onSelectPatient={handleSelectPatient} />;
      case 'patients':
        return <QuanLyBenhNhan />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-body-md text-on-background overflow-hidden">
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
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <span className="material-symbols-outlined">logout</span>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
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
