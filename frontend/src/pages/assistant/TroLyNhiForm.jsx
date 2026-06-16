import React, { useState, useEffect, useCallback } from 'react';
import { getByPhieuKhamApi, saveAndUpdateApi } from '../../api/chiSoKhamTongHopApi';
import { updateToWaitingForDoctorApi } from '../../api/phieuKhamApi';
import { useNotification } from '../../components/NotificationContext';
import VitalSignsForm from '../../components/VitalSignsForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import TabKhamNhi from '../doctor/components/TabKhamNhi';

const TroLyNhiForm = ({ selectedPatient, user, onSaved, initialTab = 'vitals', onBack }) => {
  const [examSubTab, setExamSubTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'primary', icon: '' });

  useEffect(() => {
    setExamSubTab(initialTab);
  }, [initialTab]);

  // 1. Sinh Hiệu State (chỉ số sinh hiệu thuần túy)
  const [vitals, setVitals] = useState({
    nhietDo: '',
    nhipTim: '',
    huyetApThu: '',
    huyetApTruong: '',
    nhipTho: '',
    canNang: '',
    chieuCao: '',
    spo2: '',
    vongDau: '',
    ghiChu: ''
  });

  // 2. Exam State for Nhi (các trường khám chuyên khoa Nhi)
  const [examData, setExamData] = useState({
    tinhTrangDinhDuong: '',
    tamLyHanhVi: '',
    khamTaiMuiHongNhi: '',
    khamHoHapNhi: '',
    khamDaNiemMacNhi: '',
    khamDuNiemMacNhi: '',
    coQuanKhacNhi: '',
    ghiChu: ''
  });

  // --- HÀM LOAD DỮ LIỆU SINH HIỆU & NHI ---
  const loadVitalsAndExam = useCallback(async () => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      const data = await getByPhieuKhamApi(selectedPatient.maPhieuKham);
      if (data) {
        setVitals({
          nhietDo: data.nhietDo ?? '',
          nhipTim: data.nhipTim ?? '',
          huyetApThu: data.huyetApTamThu ?? '',
          huyetApTruong: data.huyetApTamTruong ?? '',
          nhipTho: data.nhipTho ?? '',
          canNang: data.canNang ?? '',
          chieuCao: data.chieuCao ?? '',
          spo2: data.spo2 ?? '',
          vongDau: data.vongDau ?? '',
          ghiChu: data.ghiChu ?? selectedPatient?.ghiChu ?? ''
        });

        setExamData({
          tinhTrangDinhDuong: data.tinhTrangDinhDuong ?? '',
          tamLyHanhVi: data.tamLyHanhVi ?? '',
          khamTaiMuiHongNhi: data.khamTaiMuiHongNhi ?? '',
          khamHoHapNhi: data.khamHoHapNhi ?? '',
          khamDaNiemMacNhi: data.khamDaNiemMacNhi ?? '',
          khamDuNiemMacNhi: data.khamDuNiemMacNhi ?? '',
          coQuanKhacNhi: data.coQuanKhacNhi ?? '',
          ghiChu: data.ghiChu ?? ''
        });
      }
    } catch (e) {
      console.error("Lỗi load sinh hiệu Nhi:", e);
    }
  }, [selectedPatient?.maPhieuKham, selectedPatient?.ghiChu]);

  useEffect(() => {
    loadVitalsAndExam();
  }, [selectedPatient, loadVitalsAndExam]);

  const vitalsRef = React.useRef(null);

  // --- HÀM LƯU SINH HIỆU (chỉ các chỉ số sinh hiệu) ---
  const handleSaveVitals = async () => {
    if (vitalsRef.current) {
      const success = await vitalsRef.current.handleSave();
      if (success) loadVitalsAndExam();
    }
  };

  const handleFinishAssistant = async () => {
    if (!selectedPatient?.maPhieuKham) return;
    if (vitalsRef.current) {
      const success = await vitalsRef.current.handleSave();
      if (!success) return;
    }
    setConfirmState({
      isOpen: true,
      title: 'Xác nhận hoàn tất',
      message: 'Xác nhận hoàn tất quy trình trợ lý và chuyển hồ sơ cho Bác sĩ Nhi khoa?',
      type: 'primary',
      icon: 'check_circle',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        setLoading(true);
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
            vongDau: vitals.vongDau === '' ? null : parseFloat(vitals.vongDau),
            ghiChu: vitals.ghiChu || null,
            maNhanVienNhap: user?.maNhanVien || user?.id
          };
          await saveAndUpdateApi(payload);

          await updateToWaitingForDoctorApi(selectedPatient.maPhieuKham);
          onSaved();
        } catch (e) {
          showError("❌ Lỗi hoàn tất quy trình: " + e.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Sub-Tabs Navigation */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-100">
        <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl w-fit">
          {[{
            id: 'vitals',
            label: 'Sinh Hiệu'
          }, {
            id: 'info',
            label: 'Khám Nhi Khoa'
          }].map(t => (
            <button 
              key={t.id} 
              onClick={() => setExamSubTab(t.id)} 
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${examSubTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-bold rounded-lg transition-all">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            QUAY LẠI DANH SÁCH
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {examSubTab === 'vitals' && (
          <div>
            <VitalSignsForm ref={vitalsRef} phieuKhamId={selectedPatient.maPhieuKham} assistantId={user?.maNhanVien || user?.id} initialGhiChu={selectedPatient?.ghiChu} />
            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-600">Vòng đầu (cm - Bệnh nhi)</label>
              <input type="number" step="0.1" className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                value={vitals.vongDau} onChange={e => setVitals({ ...vitals, vongDau: e.target.value })} />
            </div>
          </div>
        )}

        {examSubTab === 'info' && (
          <TabKhamNhi 
            maPhieuKham={selectedPatient.maPhieuKham} 
            examData={examData} 
            setExamData={setExamData} 
            isAssistant={true} 
          />
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
        <button 
          disabled={loading}
          onClick={handleFinishAssistant} 
          className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 flex items-center gap-2 shadow-xl transform hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          XÁC NHẬN HOÀN TẤT QUY TRÌNH TRỢ LÝ
        </button>
      </div>
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        icon={confirmState.icon}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default TroLyNhiForm;