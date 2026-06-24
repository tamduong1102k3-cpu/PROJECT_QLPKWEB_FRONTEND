import React, { useState, useEffect } from 'react';
import { getByPhieuKhamApi } from '../../api/chiSoKhamTongHopApi';
import { useNotification } from '../../components/NotificationContext';
import AssistantLayout from '../../components/AssistantLayout';
import TabKhamTMH from '../doctor/components/TabKhamTMH';

const TroLyTMHForm = ({ selectedPatient, user, onSaved, initialTab = 'vitals', onBack }) => {
  const { showError } = useNotification();
  const [vitals, setVitals] = useState({
    nhietDo: '', nhipTim: '', huyetApThu: '', huyetApTruong: '',
    nhipTho: '', canNang: '', chieuCao: '', spo2: '', ghiChu: ''
  });

  const [examData, setExamData] = useState({
    tinhTrangMui: '', tinhTrangHong: '', soiTaiMuiHong: '', ongTai: '',
    mangNhiPhai: '', mangNhiTrai: '', vachNgan: '', cuonMui: '', kheMui: '',
    amidan: '', thanhQuan: '', thinhLucTaiTrai: '', thinhLucTaiPhai: '', ghiChu: ''
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
          setExamData({
            tinhTrangMui: data.tinhTrangMui ?? '', tinhTrangHong: data.tinhTrangHong ?? '',
            soiTaiMuiHong: data.soiTaiMuiHong ?? '', ongTai: data.ongTai ?? '',
            mangNhiPhai: data.mangNhiPhai ?? '', mangNhiTrai: data.mangNhiTrai ?? '',
            vachNgan: data.vachNgan ?? '', cuonMui: data.cuonMui ?? '', kheMui: data.kheMui ?? '',
            amidan: data.amidan ?? '', thanhQuan: data.thanhQuan ?? '',
            thinhLucTaiTrai: data.thinhLucTaiTrai ?? '', thinhLucTaiPhai: data.thinhLucTaiPhai ?? '',
            ghiChu: data.ghiChu ?? ''
          });
        }
      }).catch(e => console.error("Lỗi load TMH:", e));
    }
  }, [selectedPatient?.maPhieuKham, selectedPatient?.ghiChu]);

  // Validate TMH exam data: ít nhất một field chuyên khoa phải có dữ liệu
  const validateTmhExam = (data) => {
    const errors = [];
    const fields = ['tinhTrangMui', 'tinhTrangHong', 'soiTaiMuiHong', 'ongTai', 'mangNhiPhai', 'mangNhiTrai', 'vachNgan', 'cuonMui', 'kheMui', 'amidan', 'thanhQuan', 'thinhLucTaiTrai', 'thinhLucTaiPhai'];
    const hasAny = fields.some(f => data[f] && data[f].toString().trim());
    if (!hasAny) {
      errors.push('Vui lòng nhập ít nhất một thông tin khám Tai Mũi Họng');
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
      specialtyLabel="Khám Tai Mũi Họng"
      vitalsFields={vitals}
      setVitalsFields={setVitals}
      examData={examData}
      setExamData={setExamData}
      validateExamData={validateTmhExam}
      specialtyForm={
        <TabKhamTMH maPhieuKham={selectedPatient.maPhieuKham} examData={examData} setExamData={setExamData} isAssistant={true} />
      }
    />
  );
};

export default TroLyTMHForm;