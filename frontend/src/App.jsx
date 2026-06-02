import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { NotificationProvider } from './components/NotificationContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DangNhap from './pages/DangNhap';
import QuenMatKhau from './pages/QuenMatKhau';
import BatBuocDoiMatKhau from './pages/BatBuocDoiMatKhau';
import BangDieuKhienAdmin from './pages/admin/BangDieuKhienAdmin';
import BangDieuKhienLeTan from './pages/receptionist/BangDieuKhienLeTan';
import BangDieuKhienTroLy from './pages/assistant/BangDieuKhienTroLy';
import BangDieuKhienBacSi from './pages/doctor/BangDieuKhienBacSi';
import BangDieuKhienKyThuatVien from './pages/technician/BangDieuKhienKyThuatVien';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('DangNhap');
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.lanDauDangNhap) {
      setCurrentView('force-change-password');
      return;
    }

    const vaiTro = user.vaiTro || '';
    if (vaiTro === 'QUAN_TRI_VIEN' || vaiTro === 'ADMIN') {
      setCurrentView('admin');
    } else if (vaiTro === 'LE_TAN') {
      setCurrentView('receptionist');
    } else if (vaiTro.startsWith('TRO_LY_') || vaiTro === 'TRO_LY_BAC_SI') {
      setCurrentView('assistant');
    } else if (vaiTro.startsWith('BAC_SI_') || vaiTro === 'BAC_SI') {
      setCurrentView('doctor');
    } else if (vaiTro.startsWith('KY_THUAT_VIEN_') || vaiTro.startsWith('KTV_') || vaiTro === 'KY_THUAT_VIEN_XET_NGHIEM') {
      setCurrentView('technician');
    } else {
      setCurrentView('under-development');
    }
  };

  // 2. Tạo một hàm để chứa logic render content
  const renderMainContent = () => {
    if (currentView === 'admin') return <BangDieuKhienAdmin onLogout={() => setCurrentView('DangNhap')} />;
    if (currentView === 'receptionist') return <BangDieuKhienLeTan user={currentUser} onLogout={() => setCurrentView('DangNhap')} />;
    if (currentView === 'assistant') return <BangDieuKhienTroLy user={currentUser} onLogout={() => setCurrentView('DangNhap')} />;
    if (currentView === 'doctor') return <BangDieuKhienBacSi user={currentUser} onLogout={() => setCurrentView('DangNhap')} />;
    if (currentView === 'technician') return <BangDieuKhienKyThuatVien user={currentUser} onLogout={() => setCurrentView('DangNhap')} />;
    
    if (currentView === 'under-development') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
          <div className="bg-white rounded-[2rem] p-10 max-w-md shadow-2xl border border-slate-100 flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl">construction</span>
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 text-lg mb-2">Tính Năng Đang Phát Triển</h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">VAI TRÒ: {currentUser?.vaiTro}</p>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Chào mừng <strong className="text-gray-800 font-black">{currentUser?.hoTen}</strong>! Giao diện làm việc hiện đang được xây dựng.
              </p>
            </div>
            <button onClick={() => setCurrentView('DangNhap')} className="w-full py-3.5 bg-primary text-white font-bold text-xs rounded-xl shadow-lg">
              Quay Lại Đăng Nhập
            </button>
          </div>
        </div>
      );
    }

    // Mặc định trả về giao diện Đăng nhập / Quên mật khẩu
    return (
      <div className="bg-background font-body-md text-on-background min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {currentView === 'DangNhap' && (
            <DangNhap 
              onForgotPassword={() => setCurrentView('forgot-password')} 
              onLoginSuccess={handleLoginSuccess}
            />
          )}
          {currentView === 'forgot-password' && (
            <QuenMatKhau onBackToLogin={() => setCurrentView('DangNhap')} />
          )}
          {currentView === 'force-change-password' && (
            <BatBuocDoiMatKhau 
              user={currentUser} 
              onBackToLogin={() => setCurrentView('DangNhap')} 
            />
          )}
        </main>
        <Footer />
      </div>
    );
  };

  return (
    <NotificationProvider>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Gọi hàm render logic content */}
      {renderMainContent()}
    </NotificationProvider>
  );
}

export default App;