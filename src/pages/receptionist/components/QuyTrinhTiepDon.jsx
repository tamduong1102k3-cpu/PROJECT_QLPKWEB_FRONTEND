import { getAllNhanVienApi as _getNhanVienAll } from '../../../api/employeeApi';
import { getAllApi as _getDichVuAll } from '../../../api/dichVuApi';
import { getWorkingTodayApi as _getWorkingToday } from '../../../api/shiftApi';
import { getAllApi as getBenhNhanAll, searchApi } from '../../../api/benhNhanApi';
import { createApi as createDangKyApi } from '../../../api/dangKyKhamBenhApi';
import { getAllChuyenKhoaApi as _getChuyenKhoaAll } from '../../../api/danhMucApi';
import { useNotification } from '../../../components/NotificationContext';
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import InPhieuTiepDon from './InPhieuTiepDon';

const removeVietnameseTones = str => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const QuyTrinhTiepDon = ({
  onCancel,
  onSuccess,
  waitingCount,
  presetDepartment,
  presetDoctor,
  presetPatient,
  appointmentId
}) => {
  const [step, setStep] = useState(1);
  const [searchKw, setSearchKw] = useState('');
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [shiftsToday, setShiftsToday] = useState([]);
  
  const { showSuccess, showError, showWarning } = useNotification();

  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState(null);

  const [checkInData, setCheckInData] = useState({
    maChuyenKhoa: presetDepartment ? presetDepartment.toString() : '',
    maNhanVien: presetDoctor ? presetDoctor.toString() : '',
    maDichVu: '',
    tenDichVuDisplay: '',
    ghiChu: ''
  });

  const API_BASE = 'https://qlpk-backend-spring-boot.onrender.com/api';

  const loadPatients = useCallback(async () => {
    setSearching(true);
    try {
      const data = await getBenhNhanAll();
      setPatients(data || []);
      setAllPatients(data || []);
    } catch (e) {
      console.error("Lỗi khi tải danh sách bệnh nhân:", e);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    // Load danh mục
    _getChuyenKhoaAll().then(setDepartments).catch(() => setDepartments([]));
    _getNhanVienAll().then(setDoctors).catch(() => setDoctors([]));
    _getDichVuAll().then(setServices).catch(() => setServices([]));
    
    // Load lịch trực hôm nay
    _getWorkingToday()
      .then(data => setShiftsToday(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Lỗi fetch lịch trực:", err);
        setShiftsToday([]);
      });

    loadPatients();

    // Nếu có presetPatient thì tự động set và chuyển sang bước 3
    if (presetPatient) {
      setSelectedPatient(presetPatient);
      setStep(3);
    }
  }, [loadPatients]);

  const availableServices = services.filter(s => 
    !checkInData.maChuyenKhoa || s.maChuyenKhoa === parseInt(checkInData.maChuyenKhoa)
  );

  const availableDoctors = doctors.filter(doc => {
    const shifts = Array.isArray(shiftsToday) ? shiftsToday : [];
    const isWorkingToday = shifts.some(shift => shift.maNhanVien === doc.maNhanVien);
    if (!isWorkingToday) return false;
    if (!checkInData.maChuyenKhoa) return true;
    return Number(doc.chuyenKhoa) === Number(checkInData.maChuyenKhoa);
  });

  // Effect cho bác sĩ: tự động chọn bác sĩ đầu tiên có lịch trực khi chuyên khoa thay đổi hoặc lịch trực load xong
  useEffect(() => {
    if (checkInData.maChuyenKhoa) {
      const filtered = doctors.filter(doc => {
        const shifts = Array.isArray(shiftsToday) ? shiftsToday : [];
        const isWorkingToday = shifts.some(shift => shift.maNhanVien === doc.maNhanVien);
        if (!isWorkingToday) return false;
        return Number(doc.chuyenKhoa) === Number(checkInData.maChuyenKhoa);
      });
      if (filtered.length > 0) {
        setCheckInData(prev => ({ ...prev, maNhanVien: filtered[0].maNhanVien.toString() }));
      } else {
        setCheckInData(prev => ({ ...prev, maNhanVien: '' }));
      }
    }
  }, [checkInData.maChuyenKhoa, shiftsToday, doctors]);

  // Effect cho dịch vụ: tự động chọn dịch vụ đầu tiên của chuyên khoa khi chuyên khoa thay đổi hoặc services load xong
  useEffect(() => {
    if (checkInData.maChuyenKhoa) {
      const filteredServices = services.filter(s => 
        s.maChuyenKhoa === parseInt(checkInData.maChuyenKhoa)
      );
      if (filteredServices.length > 0) {
        const firstService = filteredServices[0];
        setCheckInData(prev => ({ 
          ...prev, 
          maDichVu: firstService.maDichVu.toString(), 
          tenDichVuDisplay: `#${firstService.maDichVu} ${firstService.tenDichVu} - ${new Intl.NumberFormat('vi-VN').format(firstService.donGia)}đ` 
        }));
      } else {
        setCheckInData(prev => ({ ...prev, maDichVu: '', tenDichVuDisplay: '' }));
      }
    }
  }, [checkInData.maChuyenKhoa, services]);

  const handleInputChange = val => {
    setSearchKw(val);
    if (!val.trim()) {
      setPatients(allPatients);
    } else {
      const normalizedQuery = removeVietnameseTones(val.toLowerCase());
      const filtered = allPatients.filter(p => {
        const hoTen = p.hoTen ? removeVietnameseTones(p.hoTen.toLowerCase()) : '';
        const soDienThoai = p.soDienThoai || '';
        const cccd = p.cccd || '';
        const maBenhNhan = p.maBenhNhan ? p.maBenhNhan.toString() : '';
        return hoTen.includes(normalizedQuery) || soDienThoai.includes(normalizedQuery) || cccd.includes(normalizedQuery) || maBenhNhan.includes(normalizedQuery);
      });
      setPatients(filtered);
    }
  };

  const handleSearch = async e => {
    if (e) e.preventDefault();
    const normalizedQuery = removeVietnameseTones(searchKw.toLowerCase().trim());
    if (!normalizedQuery) {
      setPatients(allPatients);
      return;
    }
    setSearching(true);
    try {
      const data = await searchApi({ keyword: searchKw });
      setPatients(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const startCheckIn = patient => {
    setSelectedPatient(patient);
    setStep(3);
  };

  const handleCompleteCheckIn = async e => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    let maLeTan = 72; // Default dự phòng

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        maLeTan = payload.maNhanVien || payload.userId || maLeTan;
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
      }
    }

    // Bắt buộc chọn chuyên khoa
    if (!checkInData.maChuyenKhoa) {
        showWarning("Vui lòng chọn Chuyên khoa khám!");
        return;
    }

    try {
      // Log request details để debug
      console.log("=== DEBUG REQUEST ===");
      console.log("Token gửi đi:", token ? token.substring(0, 30) + "..." : "KHÔNG CÓ TOKEN");
      console.log("URL:", 'https://qlpk-backend-spring-boot.onrender.com/api/dang-ky');
      console.log("Headers:", { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : 'N/A' });

      // Bước 1: Tạo đăng ký khám bệnh (DangKyKhamBenh)
      const dangKyData = {
        maBenhNhan: selectedPatient.maBenhNhan,
        maNhanVien: maLeTan,
        maChuyenKhoa: parseInt(checkInData.maChuyenKhoa),
        maDichVu: checkInData.maDichVu ? parseInt(checkInData.maDichVu) : null,
        ghiChu: checkInData.ghiChu || ''
      };
      console.log("Request body:", JSON.stringify(dangKyData));

      const dangKyResult = await createDangKyApi(dangKyData);
      const soThuTu = dangKyResult.soThuTu;
      const dangKyId = dangKyResult.id;


      setPrintData({
        soThuTu,
        benhNhan: selectedPatient,
        chuyenKhoa: departments.find(d => d.maChuyenKhoa === parseInt(checkInData.maChuyenKhoa)),
        dichVu: services.find(s => s.maDichVu === parseInt(checkInData.maDichVu)),
        bacSi: doctors.find(d => d.maNhanVien === parseInt(checkInData.maNhanVien)),
        ghiChu: checkInData.ghiChu,
        ngayDangKy: new Date().toLocaleString('vi-VN'),
        maLeTan
      });
      setShowPrintModal(true);
    } catch (error) {
      console.error("Lỗi check-in:", error);
      const errorMsg = error.message || '';
      if (errorMsg.includes('403') || errorMsg.includes('401')) {
        showError(`Lỗi xác thực: ${errorMsg}. Vui lòng kiểm tra tài khoản có quyền tiếp đón không, hoặc đăng nhập lại.`);
      } else {
        showError(`Lỗi: ${errorMsg}`);
      }
    }
  };



  return <>
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3].map(s => <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${step === s ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : step > s ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
              {step > s ? <span className="material-symbols-outlined">check</span> : s}
            </div>
            {s < 3 && <div className={`h-1 flex-1 mx-4 rounded-full transition-colors ${step > s ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
          </div>)}
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        {step === 1 && <div className="p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-2">Tìm kiếm & Chọn Bệnh Nhân</h2>
            <p className="text-gray-500 mb-8">Chọn bệnh nhân từ danh sách bên dưới hoặc nhập Tên, Số điện thoại, CCCD để tìm kiếm</p>
            
            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input autoFocus placeholder="Nhập tên, số điện thoại, CCCD hoặc mã bệnh nhân..." className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-lg font-medium" value={searchKw} onChange={e => handleInputChange(e.target.value)} />
              </div>
              <button disabled={searching} className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                {searching ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">search</span>}
                Tìm kiếm
              </button>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {patients.length > 0 ? patients.map(p => <div key={p.maBenhNhan} className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-primary/30 hover:bg-white transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary font-black text-lg border border-gray-100">
                        {p.hoTen ? p.hoTen[0] : 'BN'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{p.hoTen}</h4>
                        <p className="text-sm text-gray-500">SĐT: {p.soDienThoai} • CCCD: {p.cccd || 'N/A'}</p>
                      </div>
                    </div>
                    <button onClick={() => startCheckIn(p)} className="px-6 py-2.5 bg-white text-primary border border-primary/20 font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                      Chọn
                    </button>
                  </div>) : searchKw && !searching ? <div className="text-center py-12">
                  <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl">person_search</span>
                  </div>
                  <p className="text-gray-600 font-bold mb-2">Không tìm thấy bệnh nhân nào</p>
                  <button onClick={() => setStep(2)} className="text-primary font-bold hover:underline">Tạo hồ sơ mới ngay</button>
                </div> : null}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-center">
               <button onClick={onCancel} className="text-gray-400 font-bold hover:text-gray-600">Thoát</button>
               <button onClick={() => setStep(2)} className="flex items-center gap-2 text-primary font-black">
                 <span className="material-symbols-outlined">add_circle</span>
                 Đăng ký mới
               </button>
            </div>
          </div>}

        {step === 3 && selectedPatient && <div className="p-8 animate-scale-up">
             <div className="flex items-center gap-4 mb-8 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-primary/20">
                  {selectedPatient.hoTen ? selectedPatient.hoTen[0] : 'BN'}
                </div>
                <div className="flex-1">
                   <h2 className="text-2xl font-black text-gray-800">{selectedPatient.hoTen}</h2>
                   <p className="text-gray-500">Mã BN: {selectedPatient.maBenhNhan}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Số Thứ Tự Dự Kiến</p>
                   <div className="text-4xl font-black text-primary">#{waitingCount + 1}</div>
                </div>
             </div>

             <form onSubmit={handleCompleteCheckIn} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Chuyên khoa khám</label>
                      <select required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold" value={checkInData.maChuyenKhoa} onChange={e => setCheckInData({...checkInData, maChuyenKhoa: e.target.value})}>
                         <option value="">-- Chọn chuyên khoa --</option>
                         {departments.map(d => <option key={d.maChuyenKhoa} value={d.maChuyenKhoa}>{d.tenChuyenKhoa}</option>)}
                      </select>
                   </div>
                   <div className="relative">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dịch vụ khám</label>
                      <input
                        required
                        placeholder="-- Gõ tên dịch vụ hoặc chọn --"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold"
                        style={{ color: checkInData.maDichVu ? 'transparent' : 'inherit' }}
                        value={checkInData.tenDichVuDisplay || ''}
                        onChange={e => {
                          const val = e.target.value;
                          const match = val.match(/^#(\d+)\s*/);
                          const maDichVu = match ? match[1] : '';
                          setCheckInData(prev => ({ ...prev, maDichVu, tenDichVuDisplay: val }));
                        }}
                        onFocus={() => setShowServiceDropdown(true)}
                        onBlur={() => setTimeout(() => setShowServiceDropdown(false), 200)}
                      />
                      {checkInData.maDichVu && (
                        <div className="absolute left-5 top-[calc(50%+8px)] -translate-y-1/2 pointer-events-none font-bold text-gray-800">
                          {checkInData.tenDichVuDisplay.replace(/^#\d+\s*/, '')}
                        </div>
                      )}
                      {checkInData.maDichVu && (
                        <span className="absolute right-4 top-[calc(50%+8px)] -translate-y-1/2 text-emerald-600">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                        </span>
                      )}
                      {showServiceDropdown && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                          {availableServices
                            .filter(s => {
                              const searchVal = checkInData.tenDichVuDisplay ? checkInData.tenDichVuDisplay.replace(/^#\d+\s*/, '') : '';
                              return !searchVal || removeVietnameseTones(s.tenDichVu.toLowerCase()).includes(removeVietnameseTones(searchVal.toLowerCase()));
                            })
                            .map(s => (
                              <div
                                key={s.maDichVu}
                                className={`px-5 py-3.5 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 hover:bg-indigo-50 transition-colors ${checkInData.maDichVu === s.maDichVu.toString() ? 'bg-indigo-50' : ''}`}
                                onMouseDown={() => {
                                  setCheckInData(prev => ({ ...prev, maDichVu: s.maDichVu.toString(), tenDichVuDisplay: `#${s.maDichVu} ${s.tenDichVu} - ${new Intl.NumberFormat('vi-VN').format(s.donGia)}đ` }));
                                  setShowServiceDropdown(false);
                                }}
                              >
                                <div>
                                  <div className="text-sm font-bold text-gray-800">{s.tenDichVu}</div>
                                  <div className="text-xs text-gray-400">Mã: #{s.maDichVu}</div>
                                </div>
                                <span className="text-sm font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN').format(s.donGia)}đ</span>
                              </div>
                            ))}
                          {availableServices.filter(s => {
                            const searchVal = checkInData.tenDichVuDisplay ? checkInData.tenDichVuDisplay.replace(/^#\d+\s*/, '') : '';
                            return !searchVal || removeVietnameseTones(s.tenDichVu.toLowerCase()).includes(removeVietnameseTones(searchVal.toLowerCase()));
                          }).length === 0 && (
                            <div className="px-5 py-8 text-center text-gray-400 italic text-sm">Không tìm thấy dịch vụ phù hợp</div>
                          )}
                        </div>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bác sĩ chỉ định (Tùy chọn)</label>
                      <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold" value={checkInData.maNhanVien} onChange={e => setCheckInData({...checkInData, maNhanVien: e.target.value})}>
                         <option value="">-- Để trống nếu chưa rõ --</option>
                         {availableDoctors.map(d => <option key={d.maNhanVien} value={d.maNhanVien}>{d.hoTen}</option>)}
                      </select>
                      {checkInData.maChuyenKhoa && availableDoctors.length === 0 && <p className="text-[10px] text-orange-500 mt-1 font-bold italic">
                          * Hiện không có bác sĩ nào trực ở chuyên khoa này hôm nay
                        </p>}
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Lý do khám / Ghi chú</label>
                   <textarea rows="4" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium resize-none" placeholder="Đau đầu, sốt nhẹ, tái khám..." value={checkInData.ghiChu} onChange={e => setCheckInData({...checkInData, ghiChu: e.target.value})}></textarea>
                </div>

                <div className="pt-8 border-t border-gray-50 flex gap-4">
                   <button type="button" onClick={() => setStep(1)} className="px-8 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors">Quay lại</button>
                   <button type="submit" className="flex-1 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">
                     HOÀN TẤT TIẾP ĐÓN & CẤP SỐ
                   </button>
                </div>
              </form>
          </div>}
      </div>
    </div>

    {/* Print Modal - placed outside the card to avoid overflow clipping */}
    {showPrintModal && printData && createPortal(
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          width: '100vw',
          height: '100vh'
        }}
        onClick={() => {}}
      >
        <div 
          style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '480px',
            maxWidth: 'calc(100vw - 32px)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            animation: 'scaleUp 0.3s ease-out forwards'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-4xl">print</span>
            </div>
            <h2 className="text-2xl font-black mb-1">TIẾP ĐÓN THÀNH CÔNG</h2>
            <p className="text-white/80 text-sm">Phiếu đăng ký khám bệnh</p>
          </div>

          {/* Số thứ tự */}
          <div className="px-6 py-6 text-center border-b border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Số Thứ Tự</p>
            <div className="text-6xl font-black text-primary">#{printData.soThuTu}</div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Bệnh nhân</span>
              <span className="text-sm font-bold text-gray-800">{printData.benhNhan.hoTen}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Mã bệnh nhân</span>
              <span className="text-sm font-bold text-gray-800">#{printData.benhNhan.maBenhNhan}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Chuyên khoa</span>
              <span className="text-sm font-bold text-gray-800">{printData.chuyenKhoa?.tenChuyenKhoa || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Dịch vụ</span>
              <span className="text-sm font-bold text-gray-800">{printData.dichVu?.tenDichVu || 'Không có'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Đơn giá</span>
              <span className="text-sm font-bold text-indigo-600">{printData.dichVu ? `${new Intl.NumberFormat('vi-VN').format(printData.dichVu.donGia)}đ` : 'N/A'}</span>
            </div>
            {printData.bacSi && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-sm text-gray-500">Bác sĩ</span>
                <span className="text-sm font-bold text-gray-800">{printData.bacSi.hoTen}</span>
              </div>
            )}
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Thời gian</span>
              <span className="text-sm font-bold text-gray-800">{printData.ngayDangKy}</span>
            </div>
            {printData.ghiChu && (
              <div className="flex justify-between items-start pb-3 border-b border-gray-50">
                <span className="text-sm text-gray-500">Ghi chú</span>
                <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{printData.ghiChu}</span>
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={() => {
                setShowPrintModal(false);
                onSuccess();
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Đóng
            </button>
            <InPhieuTiepDon
              printData={printData}
              className="flex-1 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
            />
          </div>
        </div>
      </div>,
      document.body
    )}
  </>;
};

export default QuyTrinhTiepDon;
