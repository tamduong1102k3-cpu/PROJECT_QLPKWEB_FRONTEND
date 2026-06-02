import React from 'react';

const TabDichVuChiDinh = ({
  serviceSearch,
  setServiceSearch,
  showServiceList,
  setShowServiceList,
  allServices,
  handleAddService,
  handleRemoveService,
  handleSaveReferral,
  selectedServices,
  setSelectedServices,
  isAssistant
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in min-h-[500px] flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Chỉ định dịch vụ cận lâm sàng</h3>
          <p className="text-sm text-gray-500">Tìm kiếm và chọn các dịch vụ kỹ thuật cho bệnh nhân</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input
              type="text"
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-all"
              placeholder="Tìm tên dịch vụ..."
              value={serviceSearch}
              onChange={(e) => { setServiceSearch(e.target.value); setShowServiceList(true); }}
              onFocus={() => setShowServiceList(true)}
              onBlur={() => setTimeout(() => setShowServiceList(false), 200)}
            />
            {showServiceList && (
              <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto">
                {allServices.filter(s => !serviceSearch || s.tenDichVu.toLowerCase().includes(serviceSearch.toLowerCase())).map(s => (
                  <div key={s.maDichVu} className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0" onClick={() => handleAddService(s)}>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{s.tenDichVu}</div>
                      <div className="text-xs text-gray-500">{s.maChuyenKhoa ? 'Kỹ thuật chuyên khoa' : 'Dịch vụ chung'}</div>
                    </div>
                    <div className="text-sm font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.donGia)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSaveReferral} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2">
            <span className="material-symbols-outlined">save</span>
            {isAssistant ? 'LƯU NHÁP CHỈ ĐỊNH' : 'LƯU CHỈ ĐỊNH'}
          </button>
        </div>
      </div>
      
      {selectedServices.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
            <span className="material-symbols-outlined text-3xl">playlist_add</span>
          </div>
          <p className="text-gray-400 font-medium">Chưa có dịch vụ nào được chọn</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 pr-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tên dịch vụ</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">SL</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Đơn giá</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Thành tiền</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedServices.map(s => (
                  <tr key={s.maDichVu} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-gray-800">{s.tenDichVu}</td>
                    <td className="px-4 py-4 text-sm text-center">
                      <input 
                        type="number" 
                        min="1" 
                        className="w-12 border rounded p-1 text-center bg-transparent" 
                        value={s.soLuong} 
                        onChange={(e) => { 
                          const val = parseInt(e.target.value) || 1; 
                          setSelectedServices(selectedServices.map(item => item.maDichVu === s.maDichVu ? {...item, soLuong: val} : item)); 
                        }} 
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-medium text-gray-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.donGia)}</td>
                    <td className="px-4 py-4 text-sm text-right font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.donGia * s.soLuong)}</td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handleRemoveService(s.maDichVu)} className="text-red-400 hover:text-red-600 transition-colors">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="text-gray-500">Tổng cộng: <span className="font-bold text-gray-800">{selectedServices.length} dịch vụ</span></div>
            <div className="text-2xl font-black text-indigo-600">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedServices.reduce((acc, s) => acc + (s.donGia * s.soLuong), 0))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabDichVuChiDinh;
