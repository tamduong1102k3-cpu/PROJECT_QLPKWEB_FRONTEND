import { getByPhieuKhamApi as _getByPhieuKhamApi, saveAndUpdateApi as _saveVitalsApi } from '../../api/chiSoKhamTongHopApi';
import { updateToWaitingForDoctorApi } from '../../api/phieuKhamApi';
import { useNotification } from '../../components/NotificationContext';
import VitalSignsForm from '../../components/VitalSignsForm';
import React, { useState, useEffect, useCallback } from 'react';
import TabKhamTimMach from '../doctor/components/TabKhamTimMach';

const TroLyTimMachForm = ({ selectedPatient, user, onSaved, initialTab = 'vitals', onBack }) => {
  const [examSubTab, setExamSubTab] = useState(initialTab);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    setExamSubTab(initialTab);
  }, [initialTab]);

  // 1. Sinh Hiệu State
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

  // 2. Exam State (Chỉ số tim mạch)
  const [examData, setExamData] = useState({
    cholesterol: '',
    hdlCholesterol: '',
    ldlCholesterol: '',
    triglyceride: '',
    duongHuyet: '',
    ecgKetQua: '',
    sieuAmTim: ''
  });

  // --- LOAD VITALS & EXAM DATA ---
  const loadData = useCallback(async () => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      const data = await _getByPhieuKhamApi(selectedPatient.maPhieuKham);
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
          ghiChu: data.ghiChu ?? selectedPatient?.ghiChu ?? ''
        });
        setExamData({
          cholesterol: data.cholesterol ?? '',
          hdlCholesterol: data.hdlCholesterol ?? '',
          ldlCholesterol: data.ldlCholesterol ?? '',
          triglyceride: data.triglyceride ?? '',
          duongHuyet: data.duongHuyet ?? '',
          ecgKetQua: data.ecgKetQua ?? '',
          sieuAmTim: data.sieuAmTim ?? ''
        });
      }
    } catch (e) {
      console.error("Lỗi load dữ liệu:", e);
    }
  }, [selectedPatient?.maPhieuKham, selectedPatient?.ghiChu]);

  useEffect(() => {
    if (selectedPatient?.maPhieuKham) {
      loadData();
    }
  }, [selectedPatient, loadData]);

  const vitalsRef = React.useRef(null);

  // --- LƯU SINH HIỆU ---
  const handleSaveVitals = async () => {
    if (vitalsRef.current) {
      const success = await vitalsRef.current.handleSave();
      if (success) loadData();
    }
  };

  const handleFinishAssistant = async () => {
    if (!selectedPatient?.maPhieuKham) return;
    if (vitalsRef.current) {
      const success = await vitalsRef.current.handleSave();
      if (!success) return;
    }
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
        ...examData,
        maNhanVienNhap: user?.maNhanVien || user?.id
      };
      // Format number fields
      if (payload.cholesterol !== '') payload.cholesterol = parseFloat(payload.cholesterol) || null;
      if (payload.hdlCholesterol !== '') payload.hdlCholesterol = parseFloat(payload.hdlCholesterol) || null;
      if (payload.ldlCholesterol !== '') payload.ldlCholesterol = parseFloat(payload.ldlCholesterol) || null;
      if (payload.triglyceride !== '') payload.triglyceride = parseFloat(payload.triglyceride) || null;
      if (payload.duongHuyet !== '') payload.duongHuyet = parseFloat(payload.duongHuyet) || null;

      await _saveVitalsApi(payload);
      await updateToWaitingForDoctorApi(selectedPatient.maPhieuKham);
      showSuccess("✅ Đã hoàn tất quy trình trợ lý và chuyển Bác sĩ khám.");
      onSaved();
    } catch (e) {
      console.error("Lỗi hoàn tất quy trình trợ lý:", e);
      showError("❌ Lỗi hoàn tất quy trình trợ lý: " + e.message);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-100">
        <div className="flex gap-2 p-1 bg-slate-100/80 rounded-xl w-fit">
          {[
            { id: 'vitals', label: 'Sinh Hiệu' },
            { id: 'info', label: 'Khám Tim Mạch' }
          ].map(t => (
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
          <VitalSignsForm ref={vitalsRef} phieuKhamId={selectedPatient.maPhieuKham} assistantId={user?.maNhanVien || user?.id} initialGhiChu={selectedPatient?.ghiChu} />
        )}

        {examSubTab === 'info' && (
          <TabKhamTimMach 
            maPhieuKham={selectedPatient.maPhieuKham} 
            examData={examData} 
            setExamData={setExamData} 
            isAssistant={true} 
          />
        )}
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
         <button onClick={handleFinishAssistant} className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 flex items-center gap-2 shadow-xl transform hover:scale-105 transition-all">
           <span className="material-symbols-outlined text-2xl">check_circle</span>
           XÁC NHẬN HOÀN TẤT QUY TRÌNH TRỢ LÝ
         </button>
      </div>
    </div>
  );
};
export default TroLyTimMachForm;
