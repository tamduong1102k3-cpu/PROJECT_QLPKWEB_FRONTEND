import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllApi } from '../../api/hoaDonApi';
import { getTodayApi } from '../../api/phieuKhamApi';
import { apiClient } from '../../api/apiClient';
import UserMenu from '../../components/UserMenu';
import ThanhToan from './components/ThanhToan';
import LichSuThanhToan from './components/LichSuThanhToan';
import useWebSocket from '../../hooks/useWebSocket';
import NotificationBell from '../../components/NotificationBell';
import { useNotification } from '../../components/NotificationContext';

const BangDieuKhienThuNgan = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('payment');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    hoaDonHomNay: 0,
    choThanhToan: 0,
    daThanhToan: 0,
    doanhThuHomNay: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { showSuccess } = useNotification();
  const lastHandledRef = useRef({ maHoaDon: null, ts: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const invoices = await getAllApi();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayInvoices = (invoices || []).filter(inv => {
        if (!inv.ngayThanhToan) return false;
        const invDate = new Date(inv.ngayThanhToan);
        return invDate >= today;
      });

      const choThanhToan = (invoices || []).filter(
        inv => inv.trangThai?.toLowerCase() === 'chua thanh toan'
      );
      const daThanhToan = todayInvoices.filter(
        inv => inv.trangThai?.toLowerCase() === 'da thanh toan'
      );
      const doanhThu = daThanhToan.reduce(
        (sum, inv) => sum + (Number(inv.tongTien) || 0),
        0
      );

      setStats({
        hoaDonHomNay: todayInvoices.length,
        choThanhToan: choThanhToan.length,
        daThanhToan: daThanhToan.length,
        doanhThuHomNay: doanhThu,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // WebSocket subscription for realtime payment notifications and invoice updates
  useWebSocket({
    topics: ['/topic/payment', '/topic/hoa-don', '/topic/phieu-kham', '/topic/dang-ky-kham'],
    onMessage: (topic, data) => {
      if (topic === '/topic/payment') {
        const now = Date.now();
        // Dedup: bỏ qua nếu cùng maHoaDon trong vòng 2 giây
        if (
          lastHandledRef.current.maHoaDon === data.maHoaDon &&
          now - lastHandledRef.current.ts < 2000
        ) {
          return;
        }
        lastHandledRef.current = { maHoaDon: data.maHoaDon, ts: now };

        const newNotif = {
          id: Date.now() + Math.random(),
          title: 'Thanh toán thành công',
          message: `Hóa đơn #${data.maHoaDon} đã thanh toán thành công qua VNPay.`,
          type: 'success',
          createdAt: new Date(),
          read: false
        };

        setNotifications(prev => [newNotif, ...prev]);
        fetchStats();
        setRefreshTrigger(prev => prev + 1);
      } else if (topic === '/topic/hoa-don' || topic === '/topic/phieu-kham' || topic === '/topic/dang-ky-kham') {
        fetchStats();
        setRefreshTrigger(prev => prev + 1);
      }
    }
  });

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const navItems = [
    { id: 'payment', label: 'Thanh Toán', icon: 'payments' },
    { id: 'history', label: 'Lịch Sử', icon: 'receipt_long' },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-body-md text-on-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm z-20`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <span className="material-symbols-outlined text-[20px]">
                account_balance
              </span>
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl text-emerald-600 tracking-tight">
                MedCore
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-700 font-bold translate-x-1 border border-emerald-200'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Summary section in sidebar */}
        {isSidebarOpen && (
          <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Chờ thanh toán:</span>
                <span className="font-bold text-amber-600">
                  {stats.choThanhToan}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Hôm nay:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(stats.doanhThuHomNay)}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {navItems.find((i) => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={handleClearAll}
            />
            <UserMenu
              user={user}
              onLogout={onLogout}
              displayName={`Xin chào ${user?.username || ''}`}
              displayRole="Thu ngân"
              accentColor="emerald"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] scroll-smooth">
          {activeTab === 'payment' && (
            <ThanhToan 
              user={user} 
              onPaymentSuccess={fetchStats} 
              refreshTrigger={refreshTrigger} 
            />
          )}

          {activeTab === 'history' && (
            <LichSuThanhToan
              formatCurrency={formatCurrency}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default BangDieuKhienThuNgan;
