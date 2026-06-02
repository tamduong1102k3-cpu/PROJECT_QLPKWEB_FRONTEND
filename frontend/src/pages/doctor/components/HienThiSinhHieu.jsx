import React, { useState, useEffect } from 'react';
import { getByPhieuKhamApi } from '../../../api/chiSoKhamTongHopApi';

const HienThiSinhHieu = ({
  phieuKhamId
}) => {
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (phieuKhamId) {
      setLoading(true);
      getByPhieuKhamApi(phieuKhamId)
        .then(data => {
          if (data && !data.message) setVitals(data);
          else setVitals(null);
        })
        .catch(() => setVitals(null))
        .finally(() => setLoading(false));
    }
  }, [phieuKhamId]);

  if (loading) return <div className="text-center py-4 text-gray-400 italic text-xs">Đang tải sinh hiệu...</div>;
  if (!vitals) return <div className="text-center py-4 text-gray-400 italic text-xs">Chưa có dữ liệu sinh hiệu</div>;

  const items = [{
    label: 'Nhiệt độ',
    value: vitals.nhietDo,
    unit: '°C',
    icon: 'device_thermostat',
    color: 'text-orange-500'
  }, {
    label: 'Nhịp tim',
    value: vitals.nhipTim,
    unit: 'l/p',
    icon: 'favorite',
    color: 'text-red-500'
  }, {
    label: 'Huyết áp',
    value: `${vitals.huyetApTamThu}/${vitals.huyetApTamTruong}`,
    unit: 'mmHg',
    icon: 'blood_pressure',
    color: 'text-blue-500'
  }, {
    label: 'SpO2',
    value: vitals.spo2,
    unit: '%',
    icon: 'air',
    color: 'text-cyan-500'
  }, {
    label: 'Cân nặng',
    value: vitals.canNang,
    unit: 'kg',
    icon: 'weight',
    color: 'text-emerald-500'
  }, {
    label: 'Chiều cao',
    value: vitals.chieuCao,
    unit: 'cm',
    icon: 'straighten',
    color: 'text-indigo-500'
  }];

  return <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-gray-800">{item.value || '--'}</span>
            <span className="text-[10px] text-gray-500 uppercase">{item.unit}</span>
          </div>
        </div>)}
    </div>;
};

export default HienThiSinhHieu;
