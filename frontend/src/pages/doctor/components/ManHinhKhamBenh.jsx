import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../../../components/NotificationContext';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { getAllApi as _getDichVuAllApi } from '../../../api/dichVuApi';
import { 
  getByBenhNhanApi as _getPhieuChiDinhByBenhNhanApi, 
  getDetailsApi as _getPhieuChiDinhDetailsApi,
  getByPhieuKhamApi as _getPhieuChiDinhByPhieuKhamApi,
  createApi as _createPhieuChiDinhApi,
  getXetNhiemResultsByPhieuKhamApi,
  getCdhaResultsByPhieuKhamApi
} from '../../../api/phieuChiDinhApi';
import { getAllThuocApi as _getAllThuocApi } from '../../../api/khoThuocApi';
import { 
  getByBenhNhanApi as _getToaThuocByBenhNhanApi, 
  getDetailsApi as _getToaThuocDetailsApi,
  getByPhieuKhamApi as _getToaThuocByPhieuKhamApi,
  createApi as _createToaThuocApi
} from '../../../api/toaThuocApi';
import { 
  getByBenhNhanApi as _getKhamLamSangByBenhNhanApi,
  getByPhieuKhamApi as _getKhamLamSangByPhieuKhamApi
} from '../../../api/khamLamSangApi';
import { 
  finishConsultationApi as _finishKhamApi 
} from '../../../api/phieuKhamApi';

import HienThiSinhHieu from './HienThiSinhHieu';
import TabKhamLamSang from './TabKhamLamSang';
import TabKetQuaCLS from './TabKetQuaCLS';
import TabDichVuChiDinh from './TabDichVuChiDinh';
import TabKeDonThuoc from './TabKeDonThuoc';
import TabLichSuKhamChiTiet from './TabLichSuKhamChiTiet';

const ManHinhKhamBenh = ({ selectedPatient, setSelectedPatient, user, onBackToQueue }) => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'primary', icon: '' });
  const isTmhDoc = user?.maChuyenKhoa === 6 ||
    (user?.tenChuyenKhoa?.toLowerCase()?.includes('tai') && user?.tenChuyenKhoa?.toLowerCase()?.includes('họng')) ||
    user?.tenChuyenKhoa?.toLowerCase()?.includes('tmh');

  const [examSubTab, setExamSubTab] = useState('info');
  
  const [paraclinicalResults, setParaclinicalResults] = useState({
    lab: [],
    imaging: []
  });
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);
  const [prescribedHistory, setPrescribedHistory] = useState([]);
  const [allMeds, setAllMeds] = useState([]);
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [medSearch, setMedSearch] = useState('');
  const [showMedList, setShowMedList] = useState(false);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [examHistory, setExamHistory] = useState([]);

  // Reference to TabKhamLamSang to trigger auto-save before changing tabs
  const tabKhamLamSangRef = useRef(null);

  // Keep a reference to selectedMeds to avoid state closure race conditions
  const selectedMedsRef = useRef([]);
  useEffect(() => {
    selectedMedsRef.current = selectedMeds;
  }, [selectedMeds]);

  // Fetch initial info for selected patient
  useEffect(() => {
    if (selectedPatient) {
      // Reset lists
      setSelectedServices([]);
      setSelectedMeds([]);

      if (selectedPatient.maPhieuKham) {
        // Tải dịch vụ đã chỉ định
        _getPhieuChiDinhByPhieuKhamApi(selectedPatient.maPhieuKham)
          .then(async phieuList => {
            if (phieuList && phieuList.length > 0) {
              let loadedServices = [];
              for (const p of phieuList) {
                const details = await _getPhieuChiDinhDetailsApi(p.maPhieuChiDinh);
                if (details) {
                  for (const d of details) {
                    if (!loadedServices.some(s => s.maDichVu === d.maDichVu)) {
                      const catalogService = allServices.find(s => s.maDichVu === d.maDichVu);
                      loadedServices.push({
                        maDichVu: d.maDichVu,
                        tenDichVu: catalogService?.tenDichVu || d.tenDichVu || `Dịch vụ #${d.maDichVu}`,
                        donGia: d.donGia,
                        soLuong: d.soLuong
                      });
                    }
                  }
                }
              }
              setSelectedServices(loadedServices);
            }
          })
          .catch(e => console.error("Lỗi tải dịch vụ:", e));
        
        // Tải đơn thuốc đã kê
        _getToaThuocByPhieuKhamApi(selectedPatient.maPhieuKham)
          .then(async toasList => {
            if (toasList && toasList.length > 0) {
              let loadedMeds = [];
              for (const t of toasList) {
                const details = await _getToaThuocDetailsApi(t.maToaThuoc);
                if (details) {
                  for (const d of details) {
                    if (!loadedMeds.some(m => m.maThuoc === d.maThuoc)) {
                      const catalogMed = allMeds.find(m => m.maThuoc === d.maThuoc);
                      loadedMeds.push({
                        maThuoc: d.maThuoc,
                        tenThuoc: catalogMed?.tenThuoc || `Thuốc #${d.maThuoc}`,
                        hoatChat: catalogMed?.hoatChat || '',
                        donViTinh: catalogMed?.donViTinh || '',
                        sang: d.sang || '',
                        trua: d.trua || '',
                        chieu: d.chieu || '',
                        toi: d.toi || '',
                        soNgay: d.soNgay || 1,
                        cachDung: d.cachDung || '',
                        thoiDiemDung: d.thoiDiemDung || '',
                        lieuDung: d.lieuDung || ''
                      });
                    }
                  }
                }
              }
              setSelectedMeds(loadedMeds);
            }
          })
          .catch(e => console.error("Lỗi tải đơn thuốc:", e));
      }
    }
  }, [selectedPatient, allMeds, allServices]);

  const fetchServices = useCallback(async () => {
    try {
      const data = await _getDichVuAllApi();
      if (data) setAllServices(data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục dịch vụ:", error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const fetchPrescribedHistory = useCallback(async () => {
    if (!selectedPatient?.maBenhNhan) return;
    try {
      const phieus = await _getPhieuChiDinhByBenhNhanApi(selectedPatient.maBenhNhan);
      if (phieus) {
        const historyWithDetails = await Promise.all(phieus.map(async p => {
          let details = [];
          try {
            details = await _getPhieuChiDinhDetailsApi(p.maPhieuChiDinh);
          } catch (e) {}
          return {
            ...p,
            details
          };
        }));
        setPrescribedHistory(historyWithDetails);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử chỉ định:", error);
    }
  }, [selectedPatient]);

  const handleAddService = service => {
    if (selectedServices.find(s => s.maDichVu === service.maDichVu)) {
      showWarning("Dịch vụ này đã có trong danh sách!");
      return;
    }
    setSelectedServices([...selectedServices, {
      ...service,
      soLuong: 1
    }]);
    setShowServiceList(false);
    setServiceSearch('');
  };

  const handleRemoveService = id => {
    setSelectedServices(selectedServices.filter(s => s.maDichVu !== id));
  };

  const handleSaveReferral = async (silent = false) => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      const total = selectedServices.reduce((acc, s) => acc + s.donGia * s.soLuong, 0);
      const payload = {
        phieuChiDinh: {
          maPhieuKham: selectedPatient.maPhieuKham,
          maNhanVienChiDinh: user?.maNhanVien,
          tongTien: total
        },
        chiTietList: selectedServices.map(s => ({
          maDichVu: s.maDichVu,
          donGia: s.donGia,
          soLuong: s.soLuong,
          thanhTien: s.donGia * s.soLuong,
          trangThaiDv: 'CHUA_THUC_HIEN'
        }))
      };
      const res = await _createPhieuChiDinhApi(payload);
      if (!silent) {
        showSuccess("Đã cập nhật chỉ định dịch vụ thành công!");
      }
      fetchPrescribedHistory();
    } catch (error) {
      console.error("Lỗi khi lưu chỉ định:", error);
    }
  };

  const fetchMeds = useCallback(async () => {
    try {
      const data = await _getAllThuocApi();
      if (data) setAllMeds(data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục thuốc:", error);
    }
  }, []);

  const fetchPrescriptionHistory = useCallback(async () => {
    if (!selectedPatient?.maBenhNhan) return;
    try {
      const toas = await _getToaThuocByBenhNhanApi(selectedPatient.maBenhNhan);
      if (toas) {
        const historyWithDetails = await Promise.all(toas.map(async t => {
          let details = [];
          try {
            details = await _getToaThuocDetailsApi(t.maToaThuoc);
          } catch (e) {}
          return {
            ...t,
            details
          };
        }));
        setPrescriptionHistory(historyWithDetails);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử đơn thuốc:", error);
    }
  }, [selectedPatient]);

  const fetchExamHistory = useCallback(async () => {
    if (!selectedPatient?.maBenhNhan) return;
    try {
      const data = await _getKhamLamSangByBenhNhanApi(selectedPatient.maBenhNhan);
      if (data) setExamHistory(data);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử khám:", error);
    }
  }, [selectedPatient]);

  const fetchParaclinicalResults = useCallback(async () => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      const resLab = await getXetNhiemResultsByPhieuKhamApi(selectedPatient.maPhieuKham);
      const resImg = await getCdhaResultsByPhieuKhamApi(selectedPatient.maPhieuKham);
      setParaclinicalResults({
        lab: resLab || [],
        imaging: resImg || []
      });
    } catch (error) {
      console.error("Lỗi fetch kết quả CLS:", error);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (examSubTab === 'services') fetchPrescribedHistory();
    if (examSubTab === 'prescription') fetchPrescriptionHistory();
    if (examSubTab === 'history') fetchExamHistory();
    if (examSubTab === 'results') fetchParaclinicalResults();
  }, [examSubTab, fetchPrescribedHistory, fetchPrescriptionHistory, fetchExamHistory, fetchParaclinicalResults]);

  useEffect(() => {
    fetchMeds();
  }, [fetchMeds]);

  // Handle immediate auto-save for adding and deleting medicines
  const handleSavePrescription = async (silent = false, customMeds = null) => {
    if (!selectedPatient?.maPhieuKham) return true;
    try {
      const targetMeds = customMeds || selectedMedsRef.current;
      const payload = {
        toaThuoc: {
          maPhieuKham: selectedPatient.maPhieuKham,
          trangThai: 'CHO_THANH_TOAN',
          ghiChu: ''
        },
        chiTietList: targetMeds.map(m => ({
          maThuoc: m.maThuoc,
          lieuDung: m.lieuDung || 'Ngày uống 2 lần',
          sang: m.sang || '',
          trua: m.trua || '',
          chieu: m.chieu || '',
          toi: m.toi || '',
          soNgay: m.soNgay || 1,
          cachDung: m.cachDung || 'Uống sau ăn',
          thoiDiemDung: m.thoiDiemDung || 'Sáng, Tối'
        }))
      };
      await _createToaThuocApi(payload);
      if (!silent) {
        showSuccess("Đã cập nhật đơn thuốc thành công!");
      }
      fetchPrescriptionHistory();
      return true;
    } catch (error) {
      console.error("Lỗi khi kê đơn thuốc:", error);
      if (!silent) {
        showError("Không thể lưu đơn thuốc: " + error.message);
      }
      return false;
    }
  };

  const handleAddMed = med => {
    if (selectedMeds.find(m => m.maThuoc === med.maThuoc)) {
      showWarning("Thuốc này đã có trong đơn!");
      return;
    }
    const newMeds = [...selectedMeds, {
      ...med,
      sang: '1',
      trua: '0',
      chieu: '0',
      toi: '1',
      soNgay: 3,
      cachDung: 'Uống sau ăn',
      thoiDiemDung: 'Sáng, Tối',
      lieuDung: 'Ngày uống 2 lần'
    }];
    setSelectedMeds(newMeds);
    setShowMedList(false);
    setMedSearch('');
    // Auto-save silently on addition
    handleSavePrescription(true, newMeds);
  };

  const handleSetSelectedMeds = newMeds => {
    setSelectedMeds(newMeds);
    // Auto-save silently on deletion
    handleSavePrescription(true, newMeds);
  };

  const handleUpdateMedField = (maThuoc, field, value) => {
    setSelectedMeds(prev => prev.map(m => m.maThuoc === maThuoc ? { ...m, [field]: value } : m));
  };

  // Modern tab change interceptor with auto-save & block on fail
  const handleTabChange = async (newTabId) => {
    if (examSubTab === 'info' && tabKhamLamSangRef.current) {
      const success = await tabKhamLamSangRef.current.triggerAutoSave();
      if (!success) {
        showError("Lưu dữ liệu khám thất bại! Vui lòng lưu thông tin thành công trước khi rời khỏi tab.");
        return;
      }
    }
    setExamSubTab(newTabId);
  };

  const handleFinishExam = async () => {
    if (!selectedPatient?.maPhieuKham) return;
    setConfirmState({
      isOpen: true,
      title: 'Xác nhận kết thúc khám',
      message: 'Bạn có chắc chắn muốn kết thúc lượt khám này? Dữ liệu sẽ được tự động lưu lần cuối.',
      type: 'warning',
      icon: 'done_all',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          // 1. Flush clinical examination and vitals
          let examPromise = Promise.resolve(true);
          if (tabKhamLamSangRef.current) {
            examPromise = tabKhamLamSangRef.current.triggerAutoSave();
          }

          // 2. Flush prescription
          const prescriptionPromise = handleSavePrescription(true);

          // 3. Wait for all saves to successfully commit
          const [examSuccess, prescriptionSuccess] = await Promise.all([
            examPromise,
            prescriptionPromise
          ]);

          if (!examSuccess) {
            showError("Không thể kết thúc khám vì thông tin khám lâm sàng/sinh hiệu chưa được lưu.");
            return;
          }
          if (!prescriptionSuccess) {
            showError("Không thể kết thúc khám vì thông tin đơn thuốc chưa được lưu.");
            return;
          }

          // 4. Update consultation status
          const res = await _finishKhamApi(selectedPatient.maPhieuKham);
          if (res) {
            showSuccess("Đã kết thúc lượt khám thành công!");
            setSelectedPatient(null);
            onBackToQueue();
          } else {
            showError("Lỗi khi kết thúc khám.");
          }
        } catch (error) {
          console.error("Error finishing exam:", error);
          showError("Không thể kết thúc khám vì lỗi kết nối hoặc lưu dữ liệu thất bại.");
        }
      }
    });
  };

  return (
    <div className="animate-scale-up space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
            {selectedPatient.hoTen?.[0] || 'BN'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">{selectedPatient.hoTen}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm font-medium text-gray-500">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">#{selectedPatient.maBenhNhan}</span>
              <span>•</span>
              <span>{selectedPatient.gioiTinh === 1 ? 'Nam' : 'Nữ'}</span>
              <span>•</span>
              <span>{selectedPatient.ngaySinh ? new Date(selectedPatient.ngaySinh).toLocaleDateString('vi-VN') : 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConfirmDialog
            isOpen={confirmState.isOpen}
            title={confirmState.title}
            message={confirmState.message}
            type={confirmState.type}
            icon={confirmState.icon}
            onConfirm={confirmState.onConfirm}
            onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
          />
          <button onClick={handleFinishExam} className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">done_all</span>
            KẾT THÚC KHÁM
          </button>
          <button onClick={() => { setSelectedPatient(null); onBackToQueue(); }} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="flex p-1 bg-white rounded-xl border border-gray-100 shadow-sm w-fit overflow-x-auto">
        {[
          { id: 'info', label: 'Thông Tin Khám', icon: 'description' },
          ...(isTmhDoc ? [{ id: 'tmh_info', label: 'Khám Tai Mũi Họng', icon: 'hearing' }] : []),
          { id: 'results', label: 'Kết Quả CLS', icon: 'visibility' },
          { id: 'history', label: 'Lịch Sử Khám', icon: 'history' },
          { id: 'services', label: 'Dịch Vụ Chỉ Định', icon: 'medical_services' },
          { id: 'prescription', label: 'Kê Đơn Thuốc', icon: 'medication' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => handleTabChange(t.id)} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${examSubTab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 min-w-0">
          <div style={{ display: examSubTab === 'info' ? 'block' : 'none' }}>
            <TabKhamLamSang 
              selectedPatient={selectedPatient}
              user={user}
              ref={tabKhamLamSangRef}
            />
          </div>

          {examSubTab === 'tmh_info' && (
            <TabKhamTMH 
              examData={{}} 
              setExamData={() => {}} 
              maPhieuKham={selectedPatient.maPhieuKham} 
            />
          )}

          {examSubTab === 'results' && <TabKetQuaCLS maPhieuKham={selectedPatient.maPhieuKham} />}

          {examSubTab === 'services' && (
            <TabDichVuChiDinh 
              serviceSearch={serviceSearch} 
              setServiceSearch={setServiceSearch} 
              showServiceList={showServiceList} 
              setShowServiceList={setShowServiceList} 
              allServices={allServices} 
              handleAddService={handleAddService} 
              handleRemoveService={handleRemoveService} 
              handleSaveReferral={handleSaveReferral} 
              selectedServices={selectedServices} 
              setSelectedServices={setSelectedServices} 
            />
          )}

          {examSubTab === 'history' && <TabLichSuKhamChiTiet examHistory={examHistory} allMeds={allMeds} />}

          {examSubTab === 'prescription' && (
            <TabKeDonThuoc 
              medSearch={medSearch} 
              setMedSearch={setMedSearch} 
              showMedList={showMedList} 
              setShowMedList={setShowMedList} 
              allMeds={allMeds} 
              handleAddMed={handleAddMed} 
              handleSavePrescription={handleSavePrescription} 
              selectedMeds={selectedMeds} 
              setSelectedMeds={handleSetSelectedMeds} 
              onUpdateMedField={handleUpdateMedField}
            />
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Chỉ Số Sinh Hiệu</h3>
            <HienThiSinhHieu phieuKhamId={selectedPatient.maPhieuKham} />
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg border border-indigo-500 text-white">
            <h3 className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-4">Trạng thái phiếu khám</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></div>
              <span className="font-bold text-sm tracking-wide">ĐANG THỰC HIỆN KHÁM</span>
            </div>
            <p className="text-xs text-indigo-200 mt-3 font-medium opacity-90">Mã phiếu: #{selectedPatient.maPhieuKham}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple stub components to avoid errors if other imports were using local variables
const TabKhamTMH = ({ maPhieuKham }) => <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">Khám Tai Mũi Họng - Mã Phiếu: #{maPhieuKham}</div>;

export default ManHinhKhamBenh;
