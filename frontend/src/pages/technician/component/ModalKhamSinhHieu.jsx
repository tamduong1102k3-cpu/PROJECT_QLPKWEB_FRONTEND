import React, { useState, useEffect } from 'react';
import { getByPhieuKhamApi, saveAndUpdateApi } from '../../../api/chiSoKhamTongHopApi';
import { useNotification } from '../../../components/NotificationContext';

const ModalKhamSinhHieu = ({ patient, user, onClose, onComplete }) => {
  const { showSuccess, showError } = useNotification();
  const [vitals, setVitals] = useState({
    nhietDo: '', nhipTim: '', huyetApThu: '', huyetApTruong: '',
    nhipTho: '', canNang: '', chieuCao: '', spo2: '', ghiChu: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVitals = async () => {
      setLoading(true);
      try {
        const maPhieuKham = patient.maPhieuKham;
        if (maPhieuKham) {
          const data = await getByPhieuKhamApi(maPhieuKham);
          if (data) {
            setVitals(prev => ({
              ...prev,
              nhietDo: data.nhietDo || '',
              nhipTim: data.nhipTim || '',
              huyetApThu: data.huyetApTamThu || '',
              huyetApTruong: data.huyetApTamTruong || '',
              nhipTho: data.nhipTho || '',
              canNang: data.canNang || '',
              chieuCao: data.chieuCao || '',
              spo2: data.spo2 || '',
              ghiChu: data.ghiChu || ''
            }));
          }
        }
      } catch (error) {
        console.error("Loi tai chi so sinh hieu:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVitals();
  }, [patient.maPhieuKham]);

  const handleSave = async () => {
    if (!patient?.maPhieuKham) {
      showError("Chua co ma phieu kham!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        maPhieuKham: patient.maPhieuKham,
        nhietDo: parseFloat(vitals.nhietDo) || null,
        nhipTim: parseInt(vitals.nhipTim) || null,
        nhipTho: parseInt(vitals.nhipTho) || null,
        huyetApTamThu: parseInt(vitals.huyetApThu) || null,
        huyetApTamTruong: parseInt(vitals.huyetApTruong) || null,
        canNang: parseFloat(vitals.canNang) || null,
        chieuCao: parseFloat(vitals.chieuCao) || null,
        spo2: parseFloat(vitals.spo2) || null,
        ghiChu: vitals.ghiChu || null,
        maNhanVienNhap: user?.maNhanVien || ''
      };

      await saveAndUpdateApi(payload);
      showSuccess("Da luu chi so sinh hieu!");
      
      if (onComplete) {
        onComplete(patient);
      }
    } catch (error) {
      showError("Loi: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 transition-all duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200/50">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-white border-b border-slate-100 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="material-symbols-outlined text-[28px]">monitor_heart</span>
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800 tracking-tight">Kham Sinh Hieu</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded border border-slate-200/60">
                  {patient.hoTen}
                </span>
                <span className="text-slate-400 text-xs font-medium">#{patient.maPhieuKham}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-colors ring-1 ring-transparent hover:ring-rose-100 group">
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">close</span>
          </button>
        </div>

        {/* Body - Form chi so sinh hieu */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-slate-400 italic">Dang tai...</span>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-lg">monitor_heart</span>
                Chỉ số sinh hiệu
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                {/* Cot trai */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Nhiet do (C)</label>
                    <input type="number" step="0.1" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-right" value={vitals.nhietDo} onChange={e => setVitals({...vitals, nhietDo: e.target.value})} placeholder="36.5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Huyet ap tam thu (mmHg)</label>
                    <input type="number" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right" value={vitals.huyetApThu} onChange={e => setVitals({...vitals, huyetApThu: e.target.value})} placeholder="120" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Nhip tho (l/ph)</label>
                    <input type="number" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right" value={vitals.nhipTho} onChange={e => setVitals({...vitals, nhipTho: e.target.value})} placeholder="16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Chieu cao (cm)</label>
                    <input type="number" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right" value={vitals.chieuCao} onChange={e => setVitals({...vitals, chieuCao: e.target.value})} placeholder="165" />
                  </div>
                </div>
                {/* Cot phai */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Nhip tim (l/ph)</label>
                    <input type="number" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right" value={vitals.nhipTim} onChange={e => setVitals({...vitals, nhipTim: e.target.value})} placeholder="80" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Huyet ap tam truong (mmHg)</label>
                    <input type="number" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right" value={vitals.huyetApTruong} onChange={e => setVitals({...vitals, huyetApTruong: e.target.value})} placeholder="80" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Can nang (kg)</label>
                    <input type="number" step="0.1" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right" value={vitals.canNang} onChange={e => setVitals({...vitals, canNang: e.target.value})} placeholder="60" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">SpO2 (%)</label>
                    <input type="number" className="w-32 p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-right" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} placeholder="98" />
                  </div>
                </div>
              </div>

              {/* Ghi chu */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700 block mb-2">Ghi chu</label>
                <textarea className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none" rows="2" value={vitals.ghiChu} onChange={e => setVitals({...vitals, ghiChu: e.target.value})} placeholder="Nhap ghi chu (neu co)..." />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-xl transition-colors ring-1 ring-slate-200/60">
            HUY BO
          </button>
          <button onClick={handleSave} disabled={saving || loading} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transform active:scale-95 transition-all text-sm flex items-center gap-2">
            {saving ? (
              <><span className="material-symbols-outlined animate-spin">refresh</span> DANG LUU...</>
            ) : (
              <><span className="material-symbols-outlined">check_circle</span> LUU & TIEP TUC</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalKhamSinhHieu;