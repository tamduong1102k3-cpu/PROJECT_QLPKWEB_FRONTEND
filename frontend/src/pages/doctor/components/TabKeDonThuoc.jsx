import React from 'react';

const TabKeDonThuoc = ({
  medSearch,
  setMedSearch,
  showMedList,
  setShowMedList,
  allMeds,
  handleAddMed,
  handleSavePrescription,
  selectedMeds,
  setSelectedMeds,
  onUpdateMedField,
  isAssistant
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in min-h-[500px] flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Kê đơn thuốc</h3>
          <p className="text-sm text-gray-500">Tìm kiếm thuốc và nhập hướng dẫn sử dụng</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input 
              type="text" 
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:text-sm" 
              placeholder="Tìm tên thuốc..." 
              value={medSearch} 
              onChange={(e) => { setMedSearch(e.target.value); setShowMedList(true); }} 
              onFocus={() => setShowMedList(true)} 
              onBlur={() => setTimeout(() => setShowMedList(false), 200)} 
            />
            {showMedList && (
              <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto">
                {allMeds.filter(m => !medSearch || m.tenThuoc.toLowerCase().includes(medSearch.toLowerCase())).map(m => (
                  <div key={m.maThuoc} className="p-3 hover:bg-emerald-50 cursor-pointer flex justify-between border-b border-gray-50" onClick={() => handleAddMed(m)}>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{m.tenThuoc}</div>
                      <div className="text-xs text-gray-500">{m.hoatChat}</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{m.donViTinh}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => handleSavePrescription(false)} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 flex items-center gap-2">
            <span className="material-symbols-outlined">save</span>
            {isAssistant ? 'LƯU NHÁP ĐƠN THUỐC' : 'LƯU ĐƠN THUỐC'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {selectedMeds.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Chưa có thuốc nào trong đơn</div>
        ) : (
          selectedMeds.map((m, idx) => (
            <div key={m.maThuoc || idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between mb-4">
                <h4 className="font-bold text-gray-800">{idx + 1}. {m.tenThuoc} ({m.hoatChat})</h4>
                <button onClick={() => setSelectedMeds(selectedMeds.filter(item => item.maThuoc !== m.maThuoc))} className="text-gray-300 hover:text-red-500">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {['sang', 'trua', 'chieu', 'toi'].map(time => (
                  <div key={time}>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{time}</label>
                    <input 
                      type="text" 
                      value={m[time] || ''} 
                      onChange={(e) => onUpdateMedField(m.maThuoc, time, e.target.value)}
                      onBlur={() => handleSavePrescription(true)}
                      className="w-full p-2 bg-gray-50 border rounded-lg text-sm" 
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Số ngày</label>
                  <input 
                    type="number" 
                    value={m.soNgay || ''} 
                    onChange={(e) => onUpdateMedField(m.maThuoc, 'soNgay', parseInt(e.target.value) || '')}
                    onBlur={() => handleSavePrescription(true)}
                    className="w-full p-2 bg-gray-50 border rounded-lg text-sm" 
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabKeDonThuoc;
