import { getAllApi as _getAllAppointments } from '../../api/appointmentApi';
import { getTodayApi as _getTodayDangKy } from '../../api/dangKyKhamBenhApi';
import { getTodayApi as _getTodayPhieuKham } from '../../api/phieuKhamApi';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import QuanLyBenhNhan from '../../pages/admin/components/QuanLyBenhNhan';
import TheThongKe from './components/TheThongKe';
import DanhSachCho from './components/DanhSachCho';
import LichHenHomNay from './components/LichHenHomNay';
import QuyTrinhTiepDon from './components/QuyTrinhTiepDon';
import DangKyBenhNhan from './components/DangKyBenhNhan';
import NhomOSoLieu from '../doctor/components/NhomOSoLieu';

import UserMenu from '../../components/UserMenu';
import QuanLyLichHen from '../../pages/admin/components/QuanLyLichHen';
import QuanLyHoaDon from '../../pages/admin/components/QuanLyHoaDon';
import QuanLyDichVu from '../../pages/admin/components/QuanLyDichVu';
import WebSocketAutoRefresh from '../../hooks/WebSocketAutoRefresh';



const BangDieuKhienLeTan = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    LichHenHomNay: 0,
    waitingPatients: 0,
    completedToday: 0,
    todayRevenue: 0
  });
  const [quickCheckInAppt, setQuickCheckInAppt] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      // Today's appointments
      const appRes = await (async () => ({ ok: true, json: async () => await _getAllAppointments() }))();
      const appointments = appRes.ok ? await appRes.json() : [];
      const todayApp = appointments.filter(a => {
        const d = new Date(a.ngayTaiKham);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }).length;

      // Lấy danh sách đăng ký hôm nay (Bảng Đăng ký khám bệnh)
      const dkRes = await (async () => ({ ok: true, json: async () => await _getTodayDangKy() }))();
      const registrations = dkRes.ok ? await dkRes.json() : [];
      const waitingRegs = registrations.filter(r => r.trangThai === 'CHO_KHAM');

      // Waiting patients (PhieuKham with status 'CHO')
      const pkRes = await (async () => ({ ok: true, json: async () => await _getTodayPhieuKham() }))();
      const pks = pkRes.ok ? await pkRes.json() : [];
      const completed = pks.filter(p => p.trangThai === 'HOAN_THANH').length;

      setStats({
        LichHenHomNay: todayApp,
        waitingPatients: waitingRegs.length,
        completedToday: completed,
        todayRevenue: 0 // Fetch from statistics if needed
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: 'dashboard' },
    { id: 'checkin', label: 'Tiếp Đón', icon: 'person_add' },
    { id: 'patients', label: 'Bệnh Nhân', icon: 'patient_list' },
    { id: 'appointments', label: 'Lịch Hẹn', icon: 'calendar_month' },
    { id: 'invoices', label: 'Thanh Toán', icon: 'payments' },
    { id: 'services', label: 'Bảng Giá Dịch Vụ', icon: 'medical_services' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="animate-fade-in space-y-6">
            <NhomOSoLieu user={user} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Cột trái: DS chờ khám */}
              <div className="xl:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">pending_actions</span>
                      Bệnh nhân đang chờ (Hôm nay)
                    </h3>
                    <button onClick={fetchStats} className="text-gray-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">refresh</span>
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    <DanhSachCho refreshTrigger={refreshTrigger} />
                  </div>
                  <button onClick={() => setActiveTab('checkin')} className="w-full mt-4 py-2 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg border border-dashed border-primary/30 transition-colors">
                    + Tiếp đón bệnh nhân mới
                  </button>
                </div>
              </div>

              {/* Cột phải: Danh sách hủy */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-red-500">cancel_schedule_send</span>
                  <h3 className="text-lg font-bold text-gray-700">Danh sách hủy</h3>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  <DanhSachCho type="cancelled" refreshTrigger={refreshTrigger} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'checkin':
        return <QuyTrinhTiepDon
          onCancel={() => { setActiveTab('dashboard'); setQuickCheckInAppt(null); }}
          onSuccess={() => { setActiveTab('dashboard'); setQuickCheckInAppt(null); fetchStats(); }}
          waitingCount={stats.waitingPatients}
          presetPatient={quickCheckInAppt ? { maBenhNhan: quickCheckInAppt.maBenhNhan, hoTen: quickCheckInAppt.tenBenhNhan } : undefined}
          presetDepartment={quickCheckInAppt ? quickCheckInAppt.maChuyenKhoa : undefined}
          presetDoctor={quickCheckInAppt ? quickCheckInAppt.maNhanVien : undefined}
          appointmentId={quickCheckInAppt ? quickCheckInAppt.id : undefined}
        />;
      case 'patients':
        return <QuanLyBenhNhan allowViewDetail={false} />;
      case 'appointments':
        return <QuanLyLichHen
          showActions="checkin"
          onQuickCheckIn={(appt) => {
            setQuickCheckInAppt(appt);
            setActiveTab('checkin');
          }}
        />;
      case 'invoices':
        return <QuanLyHoaDon />;
      case 'services':
        return <QuanLyDichVu />;
      default:
        return <div>Chưa có nội dung cho tab này</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-body-md text-on-background overflow-hidden">
      <WebSocketAutoRefresh
        topics={['/topic/phieu-kham', '/topic/dang-ky-kham']}
        onMessage={(topic, data) => {
          fetchStats();
          setRefreshTrigger(prev => prev + 1);
        }}
      />
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm shadow-primary/30">
              <span className="material-symbols-outlined text-[20px]">local_hospital</span>
            </div>
            {isSidebarOpen && <span className="font-bold text-xl text-primary tracking-tight">MedCore</span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${activeTab === item.id
                    ? 'bg-primary/10 text-primary font-bold translate-x-1'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>

        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <UserMenu
              user={user}
              onLogout={onLogout}
              displayName={`Xin chào ${user?.username || ''}`}
              displayRole="Quầy tiếp đón"
              accentColor="primary"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] scroll-smooth">
          {renderContent()}
        </main>

      </div>
    </div>
  );
};




const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};



export default BangDieuKhienLeTan;