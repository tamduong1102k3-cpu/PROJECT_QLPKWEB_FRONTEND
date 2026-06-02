import { getAllApi as _getDichVuAll } from '../../api/dichVuApi';
import { getByPhieuKhamApi as _getByPhieuKhamApi } from '../../api/chiSoKhamTongHopApi';
import { apiClient } from "../../api/apiClient";
import { useNotification } from '../../components/NotificationContext';
import React, { useState, useEffect, useCallback } from 'react';
import TabKhamRHM from '../doctor/components/TabKhamRHM';
import TabDichVuChiDinh from '../doctor/components/TabDichVuChiDinh';
import TabKeDonThuoc from '../doctor/components/TabKeDonThuoc';

const TroLyRHMForm = ({
  selectedPatient,
  user,
  onSaved
}) => {
  const [examSubTab, setExamSubTab] = useState('vitals');
  const { showSuccess, showError } = useNotification();

  // 1. Sinh Hiệu State (Khớp tên trường với DB/Backend)
  const [vitals, setVitals] = useState({
    nhietDo: '',
    nhipTim: '',
    huyetApThu: '',
    huyetApTruong: '',
    nhipTho: '',
    canNang: '',
    chieuCao: '',
    spo2: '',
    ghiChu: ''
  });

  // 2. Exam State
  const [examData, setExamData] = useState({
    lyDoKham: '',
    tienSuBanThan: '',
    benhSu: '',
    chanDoanSoBo: '',
    loiDanBacSi: '',
    ketQuaKhamCanLamSang: '',
    khamLamSang: '',
    sauRang: '',
    caoRang: '',
    viemNuou: '',
    khopCan: '',
    doLungLay: '',
    niemMacMieng: '',
    phuHinhCu: '',
    benhLyKhacRhm: ''
  });
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [allMeds, setAllMeds] = useState([]);
  const [selectedMeds, setSelectedMeds] = useState([]);

  // --- HÀM LOAD DỮ LIỆU SINH HIỆU (TÁCH RIÊNG) ---
  const loadVitals = useCallback(async () => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      let res = {
        ok: false
      };
      let data = null;
      try {
        data = await _getByPhieuKhamApi(selectedPatient.maPhieuKham);
        res.ok = true;
      } catch (e) {}
      if (res.ok) {
        if (data) {
          setVitals({
            nhietDo: data.nhietDo ?? '',
            nhipTim: data.nhipTim ?? '',
            // QUAN TRỌNG: Map đúng tên trường từ Backend (huyetApTamThu -> huyetApThu)
            huyetApThu: data.huyetApTamThu ?? '',
            huyetApTruong: data.huyetApTamTruong ?? '',
            nhipTho: data.nhipTho ?? '',
            canNang: data.canNang ?? '',
            chieuCao: data.chieuCao ?? '',
            spo2: data.spo2 ?? '',
            ghiChu: data.ghiChu ?? selectedPatient?.ghiChu ?? ''
          });

          // Cập nhật cả các trường RHM nếu chúng nằm chung bảng chi_so_kham_tong_hop
          setExamData(prev => ({
            ...prev,
            sauRang: data.sauRang || '',
            caoRang: data.caoRang || '',
            viemNuou: data.viemNuou || '',
            khopCan: data.khopCan || '',
            doLungLay: data.doLungLay || '',
            niemMacMieng: data.niemMacMieng || '',
            phuHinhCu: data.phuHinhCu || '',
            benhLyKhacRhm: data.benhLyKhacRhm || ''
          }));
        }
      }
    } catch (e) {
      console.error("Lỗi load sinh hiệu:", e);
    }
  }, [selectedPatient?.maPhieuKham, selectedPatient?.ghiChu]);

  // Load tất cả dữ liệu khi chọn bệnh nhân
  useEffect(() => {
    if (selectedPatient?.maPhieuKham) {
      loadVitals();
      // Các hàm load khác (Services, Toa thuốc) giữ nguyên logic của bạn...
    }
  }, [selectedPatient, loadVitals]);

  // Fetch danh mục dùng chung
  useEffect(() => {
    (async () => ({
      ok: true,
      json: async () => await _getDichVuAll()
    }))().then(r => r.json()).then(setAllServices).catch(console.error);
    apiClient(`${API_BASE}/kho-thuoc/thuoc`).then(r => r.json()).then(setAllMeds).catch(console.error);
  }, []);

  // --- HÀM LƯU SINH HIỆU ---
  const handleSaveVitals = async () => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      const payload = {
        maPhieuKham: selectedPatient.maPhieuKham,
        nhietDo: vitals.nhietDo === '' ? null : parseFloat(vitals.nhietDo),
        nhipTim: vitals.nhipTim === '' ? null : parseInt(vitals.nhipTim),
        nhipTho: vitals.nhipTho === '' ? null : parseInt(vitals.nhipTho),
        huyetApTamThu: vitals.huyetApThu === '' ? null : parseInt(vitals.huyetApThu),
        huyetApTamTruong: vitals.huyetApTruong === '' ? null : parseInt(vitals.huyetApTruong),
        canNang: vitals.canNang === '' ? null : parseFloat(vitals.canNang),
        chieuCao: vitals.chieuCao === '' ? null : parseFloat(vitals.chieuCao),
        spo2: vitals.spo2 === '' ? null : parseFloat(vitals.spo2),
        ghiChu: vitals.ghiChu,
        maNhanVienNhap: user?.maNhanVien
      };
      const res = await apiClient(`${API_BASE}/chi-so-tong-hop/save-and-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showSuccess("✅ Đã lưu chỉ số sinh hiệu thành công.");
        loadVitals(); // Load lại để đồng bộ dữ liệu
      }
    } catch (e) {
      showError("❌ Lỗi lưu sinh hiệu.");
    }
  };

  const handleFinishAssistant = async () => {
    onSaved();
  };

  // Giữ các hàm handleSaveClinicalExam, handleSaveReferral... giống của bạn

  return <div className="flex flex-col h-full space-y-4">
      {/* Sub-Tabs Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[{
        id: 'vitals',
        label: 'Sinh Hiệu'
      }, {
        id: 'info',
        label: 'Khám RHM'
      }, {
        id: 'services',
        label: 'Chỉ Định'
      }, {
        id: 'prescription',
        label: 'Kê Đơn'
      }].map(t => <button key={t.id} onClick={() => setExamSubTab(t.id)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${examSubTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
            {t.label}
          </button>)}
      </div>

      <div className="flex-1 overflow-y-auto">
        {examSubTab === 'vitals' && <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-indigo-700 uppercase border-b pb-4">Thông tin chỉ số sinh tồn</h3>
            <div className="grid grid-cols-2 gap-x-20 gap-y-6">
              {/* Cột 1 */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Nhiệt độ (°C)</label>
                    <input type="number" step="0.1" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.nhietDo} onChange={e => setVitals({
                ...vitals,
                nhietDo: e.target.value
              })} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Huyết áp thu (mmHg)</label>
                    <input type="number" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.huyetApThu} onChange={e => setVitals({
                ...vitals,
                huyetApThu: e.target.value
              })} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Nhịp thở (lần/phút)</label>
                    <input type="number" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.nhipTho} onChange={e => setVitals({
                ...vitals,
                nhipTho: e.target.value
              })} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Chiều cao (cm)</label>
                    <input type="number" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.chieuCao} onChange={e => setVitals({
                ...vitals,
                chieuCao: e.target.value
              })} />
                </div>
              </div>
              {/* Cột 2 */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Nhịp tim (lần/phút)</label>
                    <input type="number" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.nhipTim} onChange={e => setVitals({
                ...vitals,
                nhipTim: e.target.value
              })} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Huyết áp trương (mmHg)</label>
                    <input type="number" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.huyetApTruong} onChange={e => setVitals({
                ...vitals,
                huyetApTruong: e.target.value
              })} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Cân nặng (kg)</label>
                    <input type="number" step="0.1" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.canNang} onChange={e => setVitals({
                ...vitals,
                canNang: e.target.value
              })} />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-600">Chỉ số SpO2 (%)</label>
                    <input type="number" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.spo2} onChange={e => setVitals({
                ...vitals,
                spo2: e.target.value
              })} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Ghi chú / Triệu chứng lâm sàng</label>
              <textarea className="w-full px-4 py-3 bg-gray-50 border rounded-xl min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nhập ghi chú hoặc triệu chứng bệnh nhân mô tả..." value={vitals.ghiChu} onChange={e => setVitals({
            ...vitals,
            ghiChu: e.target.value
          })}></textarea>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSaveVitals} className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">save</span>
                LƯU CHỈ SỐ SINH HIỆU
              </button>
            </div>
          </div>}

        {examSubTab === 'info' && <TabKhamRHM maPhieuKham={selectedPatient.maPhieuKham} examData={examData} setExamData={setExamData} handleSaveVitals={handleSaveVitals} isAssistant={true} />}
        
        {/* Render các tab Services và Prescription giữ nguyên */}
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
         <button onClick={handleFinishAssistant} className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 flex items-center gap-2 shadow-xl transform hover:scale-105 transition-all">
           <span className="material-symbols-outlined text-2xl">check_circle</span>
           XÁC NHẬN HOÀN TẤT QUY TRÌNH TRỢ LÝ
         </button>
      </div>
    </div>;
};
export default TroLyRHMForm;