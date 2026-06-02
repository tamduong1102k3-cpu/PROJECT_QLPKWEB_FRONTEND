import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { getByPhieuKhamApi as getClinicalExamByPhieuKhamApi, saveWithVitalsApi } from '../../../api/khamLamSangApi';
import { getByPhieuKhamApi as getVitalsByPhieuKhamApi } from '../../../api/chiSoKhamTongHopApi';
import { getAvailableClsResultsApi } from '../../../api/phieuKhamApi';
import { getDetailClsResultApi } from '../../../api/ketQuaClsApi';

const TabKhamLamSang = forwardRef(({ selectedPatient, user }, ref) => {
  const [examData, setExamData] = useState({
    lyDoKham: '',
    tienSuBanThan: '',
    benhSu: '',
    chanDoanSoBo: '',
    loiDanBacSi: '',
    ketQuaKhamCanLamSang: '',
    khamLamSang: ''
  });

  const [vitals, setVitals] = useState({
    nhietDo: '',
    nhipTim: '',
    huyetApThu: '',
    huyetApTruong: '',
    nhipTho: '',
    canNang: '',
    chieuCao: '',
    spo2: '',
    ghiChu: '',
    tinhTrangRang: '',
    sauRang: '',
    caoRang: '',
    viemNuou: '',
    khopCan: '',
    niemMacMieng: '',
    doLungLay: '',
    phuHinhCu: '',
    benhLyKhacRhm: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // editing | saving | saved | error
  const [hasChanges, setHasChanges] = useState(false);

  // CLS selection integration state
  const [availableCls, setAvailableCls] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState('');
  const [selectedCdhaId, setSelectedCdhaId] = useState('');

  // Load initial data when patient changes
  useEffect(() => {
    if (selectedPatient?.maPhieuKham) {
      setHasChanges(false);
      setSaveStatus("saved");
      setSelectedLabId('');
      setSelectedCdhaId('');

      // 1. Fetch clinical exam data
      getClinicalExamByPhieuKhamApi(selectedPatient.maPhieuKham)
        .then(data => {
          if (data) {
            setExamData({
              lyDoKham: data.lyDoKham || selectedPatient.ghiChu || '',
              tienSuBanThan: data.tienSuBanThan || '',
              benhSu: data.benhSu || '',
              chanDoanSoBo: data.chanDoanSoBo || '',
              loiDanBacSi: data.loiDanBacSi || '',
              ketQuaKhamCanLamSang: data.ketQuaKhamCanLamSang || '',
              khamLamSang: data.khamLamSang || ''
            });
          } else {
            setExamData({
              lyDoKham: selectedPatient.ghiChu || '',
              tienSuBanThan: '',
              benhSu: '',
              chanDoanSoBo: '',
              loiDanBacSi: '',
              ketQuaKhamCanLamSang: '',
              khamLamSang: ''
            });
          }
        })
        .catch(e => console.error("Lỗi tải khám lâm sàng:", e));

      // 2. Fetch vitals data
      getVitalsByPhieuKhamApi(selectedPatient.maPhieuKham)
        .then(data => {
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
              ghiChu: data.ghiChu ?? '',
              tinhTrangRang: data.tinhTrangRang || '',
              sauRang: data.sauRang || '',
              caoRang: data.caoRang || '',
              viemNuou: data.viemNuou || '',
              khopCan: data.khopCan || '',
              niemMacMieng: data.niemMacMieng || '',
              doLungLay: data.doLungLay || '',
              phuHinhCu: data.phuHinhCu || '',
              benhLyKhacRhm: data.benhLyKhacRhm || ''
            });
          } else {
            setVitals({
              nhietDo: '',
              nhipTim: '',
              huyetApThu: '',
              huyetApTruong: '',
              nhipTho: '',
              canNang: '',
              chieuCao: '',
              spo2: '',
              ghiChu: '',
              tinhTrangRang: '',
              sauRang: '',
              caoRang: '',
              viemNuou: '',
              khopCan: '',
              niemMacMieng: '',
              doLungLay: '',
              phuHinhCu: '',
              benhLyKhacRhm: ''
            });
          }
        })
        .catch(e => console.error("Lỗi tải sinh hiệu:", e));

      // 3. Fetch available CLS results
      getAvailableClsResultsApi(selectedPatient.maPhieuKham)
        .then(data => {
          if (data) setAvailableCls(data);
        })
        .catch(err => console.error("Lỗi tải danh sách dịch vụ CLS:", err));
    }
  }, [selectedPatient]);

  const handleFieldChange = (setter, value) => {
    setter(value);
    setHasChanges(true);
    setSaveStatus("editing");
  };

  const autoSave = async (latestExamData = examData, latestVitals = vitals, force = false) => {
    if (!hasChanges && !force) return true;

    try {
      setIsSaving(true);
      setSaveStatus("saving");

      const payload = {
        khamLamSang: {
          ...latestExamData,
          maPhieuKham: selectedPatient.maPhieuKham,
          maBacSi: user?.maNhanVien
        },
        chiSoKhamTongHop: {
          maPhieuKham: selectedPatient.maPhieuKham,
          nhietDo: latestVitals.nhietDo === '' ? null : parseFloat(latestVitals.nhietDo),
          nhipTim: latestVitals.nhipTim === '' ? null : parseInt(latestVitals.nhipTim),
          nhipTho: latestVitals.nhipTho === '' ? null : parseInt(latestVitals.nhipTho),
          huyetApTamThu: latestVitals.huyetApThu === '' ? null : parseInt(latestVitals.huyetApThu),
          huyetApTamTruong: latestVitals.huyetApTruong === '' ? null : parseInt(latestVitals.huyetApTruong),
          canNang: latestVitals.canNang === '' ? null : parseFloat(latestVitals.canNang),
          chieuCao: latestVitals.chieuCao === '' ? null : parseFloat(latestVitals.chieuCao),
          spo2: latestVitals.spo2 === '' ? null : parseFloat(latestVitals.spo2),
          maNhanVienNhap: user?.maNhanVien,
          tinhTrangRang: latestVitals.tinhTrangRang || null,
          sauRang: latestVitals.sauRang || null,
          caoRang: latestVitals.caoRang || null,
          viemNuou: latestVitals.viemNuou || null,
          khopCan: latestVitals.khopCan || null,
          niemMacMieng: latestVitals.niemMacMieng || null,
          doLungLay: latestVitals.doLungLay || null,
          phuHinhCu: latestVitals.phuHinhCu || null,
          benhLyKhacRhm: latestVitals.benhLyKhacRhm || null,
          ghiChu: latestVitals.ghiChu || null
        }
      };

      await saveWithVitalsApi(payload);

      setHasChanges(false);
      setSaveStatus("saved");
      return true;
    } catch (error) {
      console.error("Lỗi auto save khám lâm sàng & sinh hiệu:", error);
      setSaveStatus("error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Expose autoSave capability to parent container
  useImperativeHandle(ref, () => ({
    triggerAutoSave: async () => {
      return await autoSave(examData, vitals);
    }
  }));

  const handleClsSelect = async (chiDinhId, loai) => {
    if (!chiDinhId) return;

    if (loai === 'XET_NGHIEM') {
      setSelectedLabId(chiDinhId);
    } else {
      setSelectedCdhaId(chiDinhId);
    }

    try {
      const detail = await getDetailClsResultApi(chiDinhId);
      if (detail) {
        // Check for duplicates
        const servicePattern = `[${detail.loaiDichVu === 'XET_NGHIEM' ? 'XÉT NGHIỆM' : 'CĐHA'}] ${detail.tenDichVu}`;
        if (examData.ketQuaKhamCanLamSang.includes(servicePattern)) {
          alert(`Kết quả dịch vụ "${detail.tenDichVu}" đã được chọn trước đó!`);
          if (loai === 'XET_NGHIEM') setSelectedLabId('');
          else setSelectedCdhaId('');
          return;
        }

        // Format and append output
        const formatted = `[${detail.loaiDichVu === 'XET_NGHIEM' ? 'XÉT NGHIỆM' : 'CĐHA'}] ${detail.tenDichVu}\n\n${detail.noiDungKetQua}\n\nKết luận:\n${detail.ketLuan || 'Chưa có kết luận'}\n\n--------------------\n`;

        // Store referenced ID in localStorage for TabKetQuaCLS highlights
        const refKey = `ref-cls-${selectedPatient.maPhieuKham}`;
        const refIds = JSON.parse(localStorage.getItem(refKey) || "[]");
        if (!refIds.includes(chiDinhId)) {
          refIds.push(chiDinhId);
          localStorage.setItem(refKey, JSON.stringify(refIds));
        }

        const currentText = examData.ketQuaKhamCanLamSang ? examData.ketQuaKhamCanLamSang + "\n" : "";
        const newExamData = {
          ...examData,
          ketQuaKhamCanLamSang: currentText + formatted
        };
        
        setExamData(newExamData);
        setHasChanges(true);
        setSaveStatus("editing");

        // Save immediately to DB
        await autoSave(newExamData, vitals, true);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết kết quả CLS:", error);
      alert("Không thể tải chi tiết kết quả cận lâm sàng!");
    } finally {
      // Reset dropdowns to permit repeated selects of other elements
      if (loai === 'XET_NGHIEM') setSelectedLabId('');
      else setSelectedCdhaId('');
    }
  };

  const renderStatus = () => {
    switch (saveStatus) {
      case 'editing':
        return <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>⚪ Chưa lưu</span>;
      case 'saving':
        return <span className="flex items-center gap-1.5 text-xs text-indigo-500 font-bold bg-indigo-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>🔄 Đang lưu...</span>;
      case 'saved':
        return <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>✅ Đã lưu</span>;
      case 'error':
        return <span className="flex items-center gap-1.5 text-xs text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>❌ Lưu thất bại</span>;
      default:
        return null;
    }
  };

  const labs = availableCls.filter(item => item.loai === 'XET_NGHIEM');
  const cdhas = availableCls.filter(item => item.loai === 'CDHA');

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in relative">
      <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600">assignment</span>
          Khám Lâm Sàng
        </h3>
        <div>{renderStatus()}</div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Lý do khám</label>
          <textarea
            value={examData.lyDoKham}
            onChange={(e) => handleFieldChange(setExamData, { ...examData, lyDoKham: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] transition-all text-sm shadow-sm"
            placeholder="Triệu chứng khiến bệnh nhân đi khám..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Tiền sử bản thân</label>
            <textarea
              value={examData.tienSuBanThan}
              onChange={(e) => handleFieldChange(setExamData, { ...examData, tienSuBanThan: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] transition-all text-sm shadow-sm"
              placeholder="Các bệnh lý đã mắc, dị ứng..."
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Bệnh sử</label>
            <textarea
              value={examData.benhSu}
              onChange={(e) => handleFieldChange(setExamData, { ...examData, benhSu: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] transition-all text-sm shadow-sm"
              placeholder="Quá trình diễn biến bệnh..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Khám lâm sàng</label>
          <textarea
            value={examData.khamLamSang}
            onChange={(e) => handleFieldChange(setExamData, { ...examData, khamLamSang: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] transition-all text-sm shadow-sm"
            placeholder="Ghi nhận khi thăm khám trực tiếp..."
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Kết quả cận lâm sàng</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-indigo-900 w-32">- Xét nghiệm:</span>
                <select
                  value={selectedLabId}
                  className="flex-1 p-2 border border-indigo-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  onChange={(e) => handleClsSelect(e.target.value, 'XET_NGHIEM')}
                >
                  <option value="">-- Chọn KQ Xét Nghiệm ({labs.length}) --</option>
                  {labs.map(item => (
                    <option key={item.id} value={item.id}>{item.tenDichVu}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-indigo-900 w-32">- CĐ Hình ảnh:</span>
                <select
                  value={selectedCdhaId}
                  className="flex-1 p-2 border border-indigo-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  onChange={(e) => handleClsSelect(e.target.value, 'CDHA')}
                >
                  <option value="">-- Chọn KQ CĐHA ({cdhas.length}) --</option>
                  {cdhas.map(item => (
                    <option key={item.id} value={item.id}>{item.tenDichVu}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <textarea
                value={examData.ketQuaKhamCanLamSang}
                onChange={(e) => handleFieldChange(setExamData, { ...examData, ketQuaKhamCanLamSang: e.target.value })}
                className="w-full p-4 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] transition-all text-sm bg-white shadow-sm"
                placeholder="Chi tiết kết quả cận lâm sàng..."
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Chẩn đoán sơ bộ / Xác định</label>
          <input
            type="text"
            value={examData.chanDoanSoBo}
            onChange={(e) => handleFieldChange(setExamData, { ...examData, chanDoanSoBo: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold text-indigo-700 shadow-sm"
            placeholder="Tên bệnh chẩn đoán..."
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Lời dặn bác sĩ</label>
          <textarea
            value={examData.loiDanBacSi}
            onChange={(e) => handleFieldChange(setExamData, { ...examData, loiDanBacSi: e.target.value })}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] transition-all text-sm shadow-sm"
            placeholder="Chế độ ăn uống, sinh hoạt, hẹn tái khám..."
          />
        </div>
      </div>
    </div>
  );
});

export default TabKhamLamSang;
