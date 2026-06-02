import React, { useState, useEffect, useCallback } from 'react';
import { getByPhieuKhamApi, saveAndUpdateApi } from '../../api/chiSoKhamTongHopApi';
import { updateToWaitingForDoctorApi } from '../../api/phieuKhamApi';
import { useNotification } from '../../components/NotificationContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import TabKhamTMH from '../doctor/components/TabKhamTMH';

const TroLyTMHForm = ({ selectedPatient, user, onSaved }) => {
  const [examSubTab, setExamSubTab] = useState('vitals');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'primary', icon: '' });

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
    vongDau: '',
    tinhTrangDinhDuong: '',
    tamLyHanhVi: '',
    ghiChu: ''
  });

  // 2. Exam State for TMH
  const [examData, setExamData] = useState({
    tinhTrangMui: '',
    tinhTrangHong: '',
    soiTaiMuiHong: '',
    ongTai: '',
    mangNhiPhai: '',
    mangNhiTrai: '',
    vachNgan: '',
    cuonMui: '',
    kheMui: '',
    amidan: '',
    thanhQuan: '',
    thinhLucTaiTrai: '',
    thinhLucTaiPhai: '',
    ghiChu: ''
  });

  // --- HÀM LOAD DỮ LIỆU SINH HIỆU & TMH ---
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
          tinhTrangDinhDuong: data.tinhTrangDinhDuong ?? '',
          tamLyHanhVi: data.tamLyHanhVi ?? '',
          ghiChu: data.ghiChu ?? selectedPatient?.ghiChu ?? ''
        });

        setExamData({
          tinhTrangMui: data.tinhTrangMui ?? '',
          tinhTrangHong: data.tinhTrangHong ?? '',
          soiTaiMuiHong: data.soiTaiMuiHong ?? '',
          ongTai: data.ongTai ?? '',
          mangNhiPhai: data.mangNhiPhai ?? '',
          mangNhiTrai: data.mangNhiTrai ?? '',
          vachNgan: data.vachNgan ?? '',
          cuonMui: data.cuonMui ?? '',
          kheMui: data.kheMui ?? '',
          amidan: data.amidan ?? '',
          thanhQuan: data.thanhQuan ?? '',
          thinhLucTaiTrai: data.thinhLucTaiTrai ?? '',
          thinhLucTaiPhai: data.thinhLucTaiPhai ?? '',
          ghiChu: data.ghiChu ?? ''
        });
      }
    } catch (e) {
      console.error("Lỗi load sinh hiệu TMH:", e);
    }
  }, [selectedPatient?.maPhieuKham, selectedPatient?.ghiChu]);

  useEffect(() => {
    loadVitalsAndExam();
  }, [selectedPatient, loadVitalsAndExam]);

  // --- HÀM LƯU SINH HIỆU ---
  const handleSaveVitals = async () => {
    if (!selectedPatient?.maPhieuKham) return;
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
        tinhTrangDinhDuong: vitals.tinhTrangDinhDuong,
        tamLyHanhVi: vitals.tamLyHanhVi,
        ghiChu: vitals.ghiChu,
        maNhanVienNhap: user?.maNhanVien || user?.id
      };

      const res = await saveAndUpdateApi(payload);
      if (res) {
        showSuccess("✅ Đã lưu chỉ số sinh hiệu thành công.");
        loadVitalsAndExam();
      }
    } catch (e) {
      showError("❌ Lỗi lưu sinh hiệu: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishAssistant = async () => {
    if (!selectedPatient?.maPhieuKham) return;
    setConfirmState({
      isOpen: true,
      title: 'Xác nhận hoàn tất',
      message: 'Xác nhận hoàn tất quy trình trợ lý và chuyển hồ sơ cho Bác sĩ?',
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
            tinhTrangDinhDuong: vitals.tinhTrangDinhDuong,
            tamLyHanhVi: vitals.tamLyHanhVi,
            ghiChu: vitals.ghiChu,
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
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[{
          id: 'vitals',
          label: 'Sinh Hiệu'
        }, {
          id: 'info',
          label: 'Khám Tai Mũi Họng'
        }].map(t => (
          <button 
            key={t.id} 
            onClick={() => setExamSubTab(t.id)} 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${examSubTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {examSubTab === 'vitals' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-indigo-700 uppercase border-b pb-4">Thông tin chỉ số sinh tồn</h3>
            <div className="grid grid-cols-2 gap-x-20 gap-y-6">
              {/* Cột 1 */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Nhiệt độ (°C)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.nhietDo} 
                    onChange={e => setVitals({ ...vitals, nhietDo: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Huyết áp thu (mmHg)</label>
                  <input 
                    type="number" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.huyetApThu} 
                    onChange={e => setVitals({ ...vitals, huyetApThu: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Nhịp thở (lần/phút)</label>
                  <input 
                    type="number" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.nhipTho} 
                    onChange={e => setVitals({ ...vitals, nhipTho: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Chiều cao (cm)</label>
                  <input 
                    type="number" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.chieuCao} 
                    onChange={e => setVitals({ ...vitals, chieuCao: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Vòng đầu (cm - Bệnh nhi)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.vongDau} 
                    onChange={e => setVitals({ ...vitals, vongDau: e.target.value })} 
                  />
                </div>
              </div>
              {/* Cột 2 */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Nhịp tim (lần/phút)</label>
                  <input 
                    type="number" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.nhipTim} 
                    onChange={e => setVitals({ ...vitals, nhipTim: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Huyết áp trương (mmHg)</label>
                  <input 
                    type="number" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.huyetApTruong} 
                    onChange={e => setVitals({ ...vitals, huyetApTruong: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Cân nặng (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.canNang} 
                    onChange={e => setVitals({ ...vitals, canNang: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Chỉ số SpO2 (%)</label>
                  <input 
                    type="number" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={vitals.spo2} 
                    onChange={e => setVitals({ ...vitals, spo2: e.target.value })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-600">Tình trạng dinh dưỡng</label>
                  <input 
                    type="text" 
                    className="w-40 px-4 py-2 bg-gray-50 border rounded-xl text-right focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                    value={vitals.tinhTrangDinhDuong} 
                    onChange={e => setVitals({ ...vitals, tinhTrangDinhDuong: e.target.value })} 
                    placeholder="Bình thường, còi cọc..."
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Tâm lý hành vi</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                  value={vitals.tamLyHanhVi} 
                  onChange={e => setVitals({ ...vitals, tamLyHanhVi: e.target.value })} 
                  placeholder="Bình thường, tăng động..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Ghi chú / Triệu chứng lâm sàng</label>
                <textarea 
                  className="w-full px-4 py-3 bg-gray-50 border rounded-xl min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                  placeholder="Nhập ghi chú hoặc triệu chứng bệnh nhân mô tả..." 
                  value={vitals.ghiChu} 
                  onChange={e => setVitals({ ...vitals, ghiChu: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                disabled={loading}
                onClick={handleSaveVitals} 
                className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                LƯU CHỈ SỐ SINH HIỆU
              </button>
            </div>
          </div>
        )}

        {examSubTab === 'info' && (
          <TabKhamTMH 
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

export default TroLyTMHForm;