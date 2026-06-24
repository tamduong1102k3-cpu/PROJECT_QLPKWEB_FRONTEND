import React, { useState, useEffect, useCallback } from 'react';
import { getByPhieuKhamApi, saveAndUpdateApi } from '../../api/chiSoKhamTongHopApi';
import { useNotification } from '../../components/NotificationContext';
import AssistantLayout from '../../components/AssistantLayout';
import TabKhamRHM from '../doctor/components/TabKhamRHM';

const TroLyRHMForm = ({ selectedPatient, user, onSaved, initialTab = 'vitals', onBack }) => {
  const { showError } = useNotification();

  const [vitals, setVitals] = useState({
    nhietDo: '', nhipTim: '', huyetApThu: '', huyetApTruong: '',
    nhipTho: '', canNang: '', chieuCao: '', spo2: '', ghiChu: ''
  });

  const [examData, setExamData] = useState({
    lyDoKham: '', tienSuBanThan: '', benhSu: '', chanDoanSoBo: '',
    loiDanBacSi: '', ketQuaKhamCanLamSang: '', khamLamSang: '',
    sauRang: '', caoRang: '', viemNuou: '', khopCan: '',
    doLungLay: '', niemMacMieng: '', phuHinhCu: '', benhLyKhacRhm: ''
  });

  useEffect(() => {
    if (selectedPatient?.maPhieuKham) {
      getByPhieuKhamApi(selectedPatient.maPhieuKham).then(data => {
        if (data) {
          setVitals({
            nhietDo: data.nhietDo ?? '', nhipTim: data.nhipTim ?? '',
            huyetApThu: data.huyetApTamThu ?? '', huyetApTruong: data.huyetApTamTruong ?? '',
            nhipTho: data.nhipTho ?? '', canNang: data.canNang ?? '',
            chieuCao: data.chieuCao ?? '', spo2: data.spo2 ?? '',
            ghiChu: data.ghiChu ?? selectedPatient?.ghiChu ?? ''
          });
          setExamData(prev => ({
            ...prev,
            sauRang: data.sauRang || '', caoRang: data.caoRang || '',
            viemNuou: data.viemNuou || '', khopCan: data.khopCan || '',
            doLungLay: data.doLungLay || '', niemMacMieng: data.niemMacMieng || '',
            phuHinhCu: data.phuHinhCu || '', benhLyKhacRhm: data.benhLyKhacRhm || ''
          }));
        }
      }).catch(e => console.error("Lỗi load:", e));
    }
  }, [selectedPatient?.maPhieuKham, selectedPatient?.ghiChu]);

  // Validate RHM exam data: ít nhất một field chuyên khoa phải có dữ liệu
  const validateRhmExam = (data) => {
    const errors = [];
    const fields = ['tinhTrangRang', 'sauRang', 'caoRang', 'viemNuou', 'niemMacMieng', 'doLungLay', 'phuHinhCu', 'benhLyKhacRhm', 'khopCan'];
    const hasAny = fields.some(f => data[f] && data[f].toString().trim());
    if (!hasAny) {
      errors.push('Vui lòng nhập ít nhất một thông tin khám Răng Hàm Mặt');
    }
    return errors.length > 0 ? errors : null;
  };

  return (
    <AssistantLayout
      selectedPatient={selectedPatient}
      user={user}
      onSaved={onSaved}
      onBack={onBack}
      initialTab={initialTab}
      specialtyLabel="Khám RHM"
      vitalsFields={vitals}
      setVitalsFields={setVitals}
      examData={examData}
      setExamData={setExamData}
      validateExamData={validateRhmExam}
      specialtyForm={
        <TabKhamRHM maPhieuKham={selectedPatient.maPhieuKham} examData={examData} setExamData={setExamData} isAssistant={true} />
      }
    />
  );
};
export default TroLyRHMForm;