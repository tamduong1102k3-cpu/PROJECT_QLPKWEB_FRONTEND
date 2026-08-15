import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { NotificationProvider } from './components/NotificationContext';
import { LoadingProvider } from './components/LoadingContext';
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
import BangDieuKhienThuNgan from './pages/cashier/BangDieuKhienThuNgan';
import BangDieuKhienDuocSi from './pages/pharmacist/BangDieuKhienDuocSi';
import BangDieuKhienKho from './pages/warehouse/BangDieuKhienKho';
import PaymentResult from './pages/cashier/components/PaymentResult';
import { logoutApi } from './api/accountApi';
import { clearAccessToken, cleanupLegacyTokens } from './api/tokenStore';
import './App.css';

/** Map vaiTro -> tên view dashboard. Dùng chung cho login + khôi phục phiên sau F5. */
const getViewForRole = (vaiTro) => {
  if (vaiTro === 'QUAN_TRI_VIEN' || vaiTro === 'ADMIN') return 'admin';
  if (vaiTro === 'LE_TAN') return 'receptionist';
  if (vaiTro.startsWith('TRO_LY_') || vaiTro === 'TRO_LY_BAC_SI') return 'assistant';
  if (vaiTro.startsWith('BAC_SI_') || vaiTro === 'BAC_SI') return 'doctor';
  if (vaiTro === 'THU_NGAN') return 'cashier';
  if (vaiTro === 'DUOC_SI' || vaiTro.startsWith('DUOC_') || vaiTro === 'NHAN_VIEN_NHA_THUOC') return 'pharmacist';
  if (vaiTro === 'NHAN_VIEN_KHO' || vaiTro === 'NHAN_VIEN_NHAP_KHO') return 'warehouse';
  if (vaiTro.startsWith('KY_THUAT_VIEN_') || vaiTro.startsWith('KTV_') || vaiTro === 'KY_THUAT_VIEN_XET_NGHIEM') return 'technician';
  return 'under-development';
};

/** Đọc user từ localStorage (không nhạy cảm) - dùng để khôi phục phiên sau F5. */
const getStoredUser = () => {
  try {
    const str = localStorage.getItem('user');
    if (!str) return null;
    const user = JSON.parse(str);
    // Phải có vai trò mới đủ để xác định view
    if (!user || (!user.role && !user.vaiTro)) return null;
    return user;
  } catch (e) {
    return null;
  }
};

function App() {
  // Khôi phục phiên từ localStorage ngay khi mount.
  // main.jsx đã gọi ensureAuthenticated() trước khi render để access token vào memory
  // (nếu có HttpOnly refresh cookie hợp lệ).
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [currentView, setCurrentView] = useState(() => {
    const user = getStoredUser();
    if (!user) return 'DangNhap';
    const vt = user.vaiTro || user.role || '';
    return getViewForRole(vt);
  });

  /** Đăng xuất: gọi backend xóa cookie/revoke, xóa access token memory + user localStorage. */
  const handleLogout = async () => {
    try {
      await logoutApi(); // gọi /logout qua cookie -> revoke DB + xóa HttpOnly cookie
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    clearAccessToken();
    cleanupLegacyTokens();
    localStorage.removeItem('user');
    localStorage.removeItem('maNhanVien');
    setCurrentUser(null);
    setCurrentView('DangNhap');
    // Reset toàn bộ state (access token trong memory sẽ mất khi reload)
    window.location.href = '/';
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    // Lưu user (không nhạy cảm) vào localStorage để ensureAuthenticated nhận diện phiên khi F5
    try {
      localStorage.setItem('user', JSON.stringify({
        username: user.username,
        email: user.email,
        role: user.role || user.vaiTro,
        vaiTro: user.vaiTro || user.role,
        maNhanVien: user.maNhanVien,
        hoTen: user.hoTen
      }));
    } catch (e) { /* ignore */ }

    if (user.lanDauDangNhap) {
      setCurrentView('force-change-password');
      return;
    }

    setCurrentView(getViewForRole(user.vaiTro || ''));
  };

  const renderMainContent = () => {
    if (window.location.pathname === '/payment/result') {
      return <PaymentResult />;
    }
    if (currentView === 'admin') return <BangDieuKhienAdmin onLogout={handleLogout} />;
    if (currentView === 'receptionist') return <BangDieuKhienLeTan user={currentUser} onLogout={handleLogout} />;
    if (currentView === 'assistant') return <BangDieuKhienTroLy user={currentUser} onLogout={handleLogout} />;
    if (currentView === 'doctor') return <BangDieuKhienBacSi user={currentUser} onLogout={handleLogout} />;
    if (currentView === 'technician') return <BangDieuKhienKyThuatVien user={currentUser} onLogout={handleLogout} />;
    if (currentView === 'cashier') return <BangDieuKhienThuNgan user={currentUser} onLogout={handleLogout} />;
    if (currentView === 'pharmacist') return <BangDieuKhienDuocSi user={currentUser} onLogout={handleLogout} />;
    if (currentView === 'warehouse') return <BangDieuKhienKho user={currentUser} onLogout={handleLogout} />;

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
            <button onClick={handleLogout} className="w-full py-3.5 bg-primary text-white font-bold text-xs rounded-xl shadow-lg">
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
    <LoadingProvider>
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
    </LoadingProvider>
  );
}

export default App;