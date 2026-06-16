import React, { useState, useEffect, useCallback } from 'react';
import { getAllApi, getChiTietApi, getBillingItemsApi, createInvoiceFromPhieuKhamApi, thanhToanApi } from '../../../api/hoaDonApi';
import { apiClient } from '../../../api/apiClient';
import { useNotification } from '../../../components/NotificationContext';
import BangBenhNhan from './BangBenhNhan';
import ChiTietHoaDon from './ChiTietHoaDon';
import ModalThanhToan from './ModalThanhToan';
import InHoaDon from './InHoaDon';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import Stomp from 'stompjs';

const API_NHAN_VIEN = 'https://qlpk-backend-spring-boot.onrender.com/api/nhan_vien';
const API_PHIEU_KHAM = 'https://qlpk-backend-spring-boot.onrender.com/api/phieu-kham';

const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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

const STATS_NHOM = [
  { id: 'pending', title: 'Chờ thanh toán', icon: 'pending_actions', color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
  { id: 'paid', title: 'Đã thanh toán', icon: 'task_alt', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-teal-500/20' },
  { id: 'total', title: 'Tổng tiếp nhận', icon: 'assignment', color: 'from-indigo-400 to-purple-500', shadow: 'shadow-indigo-500/20' },
];

const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const ThanhToan = ({ user, onPaymentSuccess, refreshTrigger }) => {
  const { showSuccess, showError } = useNotification();

  const [completedPatients, setCompletedPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [worklistTab, setWorklistTab] = useState('pending');

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [billingItems, setBillingItems] = useState(null);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [invoices, setInvoices] = useState([]);

  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('tien_mat');
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getMaNhanVien = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.maNhanVien || payload.userId || 1;
      } catch (e) { console.error('Error decoding token:', e); }
    }
    return 1;
  };

  const fetchData = useCallback(async (keyword = '') => {
    setIsLoading(true);
    try {
      const url = keyword ? `${API_PHIEU_KHAM}/completed-patients?keyword=${encodeURIComponent(keyword)}` : `${API_PHIEU_KHAM}/completed-patients`;
      const [pkRes, invRes] = await Promise.all([
        apiClient(url),
        apiClient('https://qlpk-backend-spring-boot.onrender.com/api/hoa-don'),
      ]);
      setCompletedPatients(pkRes.ok ? await pkRes.json() : []);
      setInvoices(invRes.ok ? await invRes.json() : []);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchData]);

  useEffect(() => { if (refreshTrigger > 0) fetchData(searchTerm); }, [refreshTrigger, fetchData, searchTerm]);

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setBillingItems(null);
    setCurrentInvoice(null);
    setInvoiceDetails([]);
    setLoadingBilling(true);
    try {
      const items = await getBillingItemsApi(patient.maPhieuKham);
      setBillingItems(items);
      const existingInvoices = invoices.filter(
        inv => inv.maPhieuKham === patient.maPhieuKham && inv.trangThai?.toLowerCase() === 'chua thanh toan'
      );
      if (existingInvoices.length > 0) {
        setCurrentInvoice(existingInvoices[0]);
        setInvoiceDetails(await getChiTietApi(existingInvoices[0].maHoaDon) || []);
      }
    } catch (e) {
      console.error('Error loading billing items:', e);
    } finally {
      setLoadingBilling(false);
    }
  };

  const handleSelectPaidPatient = async (patient) => {
    setSelectedPatient(patient);
    setBillingItems(null);
    setCurrentInvoice(null);
    setInvoiceDetails([]);
    setLoadingBilling(true);
    try {
      const paidInv = invoices.find(
        inv => inv.maPhieuKham === patient.maPhieuKham && inv.trangThai?.toLowerCase() === 'da thanh toan'
      );
      if (paidInv) {
        setCurrentInvoice(paidInv);
        setInvoiceDetails(await getChiTietApi(paidInv.maHoaDon) || []);
      } else {
        setBillingItems(await getBillingItemsApi(patient.maPhieuKham));
      }
    } catch (e) {
      console.error('Error loading paid invoice details:', e);
    } finally {
      setLoadingBilling(false);
    }
  };

  const handlePayClick = async (patient, e) => {
    e.stopPropagation();
    setSelectedPatient(patient);
    setBillingItems(null);
    setCurrentInvoice(null);
    setInvoiceDetails([]);
    setLoadingBilling(true);
    try {
      const items = await getBillingItemsApi(patient.maPhieuKham);
      setBillingItems(items);
      let inv = invoices.find(
        i => i.maPhieuKham === patient.maPhieuKham && i.trangThai?.toLowerCase() === 'chua thanh toan'
      );
      if (!inv) {
        inv = await createInvoiceFromPhieuKhamApi(patient.maPhieuKham, { maNhanVien: getMaNhanVien() });
        const invRes = await apiClient('https://qlpk-backend-spring-boot.onrender.com/api/hoa-don');
        if (invRes.ok) setInvoices(await invRes.json() || []);
      }
      setCurrentInvoice(inv);
      setInvoiceDetails(await getChiTietApi(inv.maHoaDon) || []);
    } catch (err) {
      showError(`Lỗi thanh toán: ${err.message}`);
    } finally {
      setLoadingBilling(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedPatient) return;
    setCreatingInvoice(true);
    try {
      const invoice = await createInvoiceFromPhieuKhamApi(selectedPatient.maPhieuKham, { maNhanVien: getMaNhanVien() });
      setCurrentInvoice(invoice);
      setInvoiceDetails(await getChiTietApi(invoice.maHoaDon) || []);
      showSuccess(`Đã tạo hóa đơn #${invoice.maHoaDon?.toString().padStart(4, '0')} thành công!`);
      fetchData();
    } catch (e) {
      showError(`Lỗi tạo hóa đơn: ${e.message}`);
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handlePay = () => {
    setPaymentAmount(tongTien);
    setTransactionId('');
    setShowPaymentModal(true);
  };

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
    if (!currentInvoice) return;
    const maNhanVien = getMaNhanVien();
    if (method === 'vnpay') {
      handleVnpayPayment(maNhanVien);
    } else {
      handleCashTransferPayment(maNhanVien, method);
    }
  };

  const handleVnpayPayment = async (maNhanVien) => {
    setShowPaymentModal(false);
    const vnpayWindow = window.open('', '_blank');
    if (!vnpayWindow) {
      const response = await apiClient(`https://qlpk-backend-spring-boot.onrender.com/api/payment/vnpay/create/${currentInvoice.maHoaDon}`, { method: 'POST' });
      if (response.ok) window.location.href = (await response.json()).url;
      else throw new Error((await response.json()).error || 'Lỗi VNPay');
      return;
    }
    try {
      const response = await apiClient(`https://qlpk-backend-spring-boot.onrender.com/api/payment/vnpay/create/${currentInvoice.maHoaDon}`, { method: 'POST' });
      if (response.ok) {
        vnpayWindow.location.href = (await response.json()).url;
      } else {
        vnpayWindow.close();
        throw new Error((await response.json()).error || 'Lỗi VNPay');
      }
    } catch (e) {
      vnpayWindow.close();
      showError(`Lỗi thanh toán: ${e.message}`);
    }
  };

  const handleCashTransferPayment = async (maNhanVien, method) => {
    setProcessing(true);
    try {
      const autoAmount = tongTien;
      const autoTransId = method === 'chuyen_khoan' ? `CK_${Date.now()}` : `TM_${Date.now()}`;
      await thanhToanApi(currentInvoice.maHoaDon, { maNhanVien, phuongThuc: method, soTienNhan: autoAmount, maGiaoDich: autoTransId });
      showSuccess(`Thanh toán hóa đơn #${currentInvoice.maHoaDon?.toString().padStart(4, '0')} thành công!`);
      setShowPaymentModal(false);
      setSelectedPatient(null);
      setBillingItems(null);
      setCurrentInvoice(null);
      setInvoiceDetails([]);
      onPaymentSuccess?.();
      fetchData();
    } catch (e) {
      showError(`Lỗi thanh toán: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const pendingPaymentPatients = completedPatients.filter(p => {
    const hasPaid = invoices.some(inv => inv.maPhieuKham === p.maPhieuKham && inv.trangThai?.toLowerCase() === 'da thanh toan');
    return !hasPaid;
  });

  const paidPatients = completedPatients.filter(p => {
    return invoices.some(inv => inv.maPhieuKham === p.maPhieuKham && inv.trangThai?.toLowerCase() === 'da thanh toan');
  });

  const targetList = worklistTab === 'pending' ? pendingPaymentPatients : paidPatients;

  const filtered = targetList.filter(p => {
    if (!searchTerm) return true;
    const t = removeVietnameseTones(searchTerm.toLowerCase());
    const hoTen = removeVietnameseTones((p.hoTen || '').toLowerCase());
    const soDienThoai = (p.soDienThoai || '');
    const maPK = String(p.maPhieuKham || '');
    return hoTen.includes(t) || soDienThoai.includes(t) || maPK.includes(t);
  });

  const tongTien = currentInvoice ? Number(currentInvoice.tongTien || 0) : 0;
  const hasInvoiceForSelected = currentInvoice?.maPhieuKham === selectedPatient?.maPhieuKham;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS_NHOM.map(s => (
          <TheThongKe key={s.id} title={s.title} value={s.id === 'pending' ? pendingPaymentPatients.length : s.id === 'paid' ? paidPatients.length : completedPatients.length} icon={s.icon} color={s.color} shadowColor={s.shadow} />
        ))}
      </div>

      <div className="flex gap-6 h-full items-start">
        {/* LEFT: Patient List */}
        <div className={`flex flex-col gap-4 ${selectedPatient ? 'w-[60%]' : 'w-full'} transition-all duration-300 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/60`}>
          <BangBenhNhan
            worklistTab={worklistTab}
            setWorklistTab={setWorklistTab}
            setSelectedPatient={setSelectedPatient}
            pendingCount={pendingPaymentPatients.length}
            paidCount={paidPatients.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isLoading={isLoading}
            filtered={filtered}
            selectedPatient={selectedPatient}
            handleSelectPatient={handleSelectPatient}
            handleSelectPaidPatient={handleSelectPaidPatient}
            handlePayClick={handlePayClick}
          />
        </div>

        {/* RIGHT: Patient Detail & Invoice */}
        {selectedPatient && (
          <div className="w-[40%] flex flex-col gap-4 animate-in slide-in-from-right duration-300">
            {/* Patient info */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm">
                    {selectedPatient.hoTen ? selectedPatient.hoTen[0] : 'BN'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{selectedPatient.hoTen}</h3>
                    <p className="text-xs text-gray-400">PK#{selectedPatient.maPhieuKham} • {selectedPatient.tenChuyenKhoa || '—'}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedPatient(null); setBillingItems(null); setCurrentInvoice(null); setInvoiceDetails([]); }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Billing items */}
            {loadingBilling ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Đang tải...
              </div>
            ) : billingItems && !hasInvoiceForSelected ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h4 className="font-bold text-gray-700 text-sm">Danh sách cần thanh toán</h4>
                  <button onClick={handleCreateInvoice} disabled={creatingInvoice}
                    className={`px-5 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1 ${creatingInvoice ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}>
                    {creatingInvoice ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Đang tạo...</>
                      : <><span className="material-symbols-outlined text-sm">receipt_long</span> Tạo hóa đơn</>}
                  </button>
                </div>
                {billingItems.dichVu?.length > 0 && (
                  <div className="p-4 border-b border-gray-50">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-3">Dịch vụ</p>
                    {billingItems.dichVu.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 text-sm border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{item.noiDung}</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-800">{formatCurrency(item.thanhTien)}</span>
                          <span className="text-[10px] text-gray-400 block">SL: {item.soLuong} x {formatCurrency(item.donGia)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {billingItems.thuoc?.length > 0 && (
                  <div className="p-4 border-b border-gray-50">
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-3">Thuốc</p>
                    {billingItems.thuoc.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 text-sm border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{item.noiDung}</span>
                        <div className="text-right">
                          <span className="font-bold text-gray-800">{formatCurrency(item.thanhTien)}</span>
                          <span className="text-[10px] text-gray-400 block">SL: {item.soLuong} x {formatCurrency(item.donGia)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Tổng cộng</span>
                  <span className="font-black text-emerald-600 text-lg">{formatCurrency(billingItems.tongCong)}</span>
                </div>
              </div>
            ) : null}

            {/* Invoice detail */}
            {hasInvoiceForSelected && (
              <ChiTietHoaDon
                invoice={currentInvoice}
                selectedPatient={selectedPatient}
                invoiceDetails={invoiceDetails}
                onPay={handlePay}
              />
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <ModalThanhToan
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentInvoice={currentInvoice}
        tongTien={tongTien}
        processing={processing}
        onSelectMethod={handleSelectPaymentMethod}
      />
    </div>
  );
};

export default ThanhToan;