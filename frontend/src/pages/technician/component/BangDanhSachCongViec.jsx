import React from 'react';
import { formatDateOfBirth, calculateAge, formatDateTime } from './TienIchKyThuatVien';

const BangDanhSachCongViec = ({ 
  list, 
  worklistTab, 
  setWorklistTab, 
  isImaging, 
  title, 
  onOpenResult, 
  onOpenView, 
  onOpenVitals, 
  onEditResult, 
  onMarkAbsent, 
  onMarkPresent, 
  searchQuery, 
  setSearchQuery, 
  isRefreshing, 
  onManualRefresh, 
  loading, 
  onAcceptPatient 
}) => {
  const headerTitle = title || (isImaging ? 'Bệnh nhân chờ Chụp chiếu' : 'Bệnh nhân chờ Xét nghiệm');

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200/60 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-xl">pending_actions</span>
          </div>
          {headerTitle}
        </h3>
        <button onClick={onManualRefresh} disabled={isRefreshing} className="text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center p-2.5 hover:bg-indigo-50 rounded-xl group ring-1 ring-transparent hover:ring-indigo-100">
          <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin text-indigo-500' : 'group-hover:rotate-180 transition-transform duration-500'}`}>refresh</span>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 w-fit backdrop-blur-sm">
          {list.receptionCount !== undefined && (
            <button onClick={() => setWorklistTab('reception')} className={`flex-1 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${worklistTab === 'reception' ? 'bg-white text-sky-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
              <span>CHỜ TIẾP NHẬN</span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${worklistTab === 'reception' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-600'}`}>{list.receptionCount}</span>
            </button>
          )}
          <button onClick={() => setWorklistTab('pending')} className={`flex-1 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${worklistTab === 'pending' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <span>CHỜ THỰC HIỆN</span>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${worklistTab === 'pending' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>{list.pendingCount}</span>
          </button>
          <button onClick={() => setWorklistTab('completed')} className={`flex-1 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${worklistTab === 'completed' ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <span>ĐÃ HOÀN THÀNH</span>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${worklistTab === 'completed' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>{list.completedCount}</span>
          </button>
          <button onClick={() => setWorklistTab('absent')} className={`flex-1 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${worklistTab === 'absent' ? 'bg-white text-red-700 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <span>VẮNG MẶT</span>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${worklistTab === 'absent' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>{list.absentCount || 0}</span>
          </button>
        </div>

        <div className="relative w-full md:w-80 lg:w-96 group flex-shrink-0">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">search</span>
          <input type="text" placeholder="Tìm tên bệnh nhân..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-sm font-semibold outline-none transition-all placeholder:font-medium placeholder:text-slate-400" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[11px]">
              <th className="py-5 px-6 w-16">STT</th>
              <th className="py-5 px-6">Bệnh nhân</th>
              <th className="py-5 px-6">SĐT</th>
              <th className="py-5 px-6">CCCD</th>
              <th className="py-5 px-6">Dịch vụ</th>
              <th className="py-5 px-6 text-center w-48">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {list.data.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                    <p className="font-medium">Không tìm thấy dữ liệu.</p>
                  </div>
                </td>
              </tr>
            ) : list.data.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors duration-200 group">
                <td className="py-4 px-6">
                  <span className="font-extrabold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">{idx + 1}</span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shadow-sm flex-shrink-0 ${item.gioiTinh === 'Nam' || item.gioiTinh === 1 ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50' : 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 border border-rose-200/50'}`}>
                      {item.hoTen ? item.hoTen[0].toUpperCase() : 'BN'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-800 text-base truncate">{item.hoTen}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.gioiTinh === 'Nam' || item.gioiTinh === 1 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>{item.gioiTinh === 1 || item.gioiTinh === 'Nam' ? 'Nam' : 'Nữ'}</span>
                        <span>•</span>
                        <span>{formatDateOfBirth(item.ngaySinh)}</span>
                        <span className="text-slate-400">({calculateAge(item.ngaySinh)})</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-slate-700">{item.soDienThoai || item.sdt || '-'}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-slate-700">{item.cccd || '-'}</span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${worklistTab === 'pending' ? 'bg-amber-400 animate-pulse' : worklistTab === 'completed' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className="font-bold text-slate-700">{item.tenDichVu || item.tenChuyenKhoa || 'Khám bệnh'}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  {worklistTab === 'pending' ? (
                    <div className="flex items-center justify-center gap-2">
                      {/* Nút KHÁM BỆNH - gộp sinh hiệu + kết quả */}
                      <button 
                        onClick={() => {
                          if (item.hasVitals) {
                            onOpenResult(item);
                          } else {
                            onOpenVitals(item);
                          }
                        }} 
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-indigo-600 shadow-md shadow-indigo-500/20 text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">stethoscope</span> KHÁM BỆNH
                      </button>
                      {/* Nút VẮNG MẶT */}
                      {onMarkAbsent && (
                        <button onClick={() => onMarkAbsent(item)} className="px-3 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-bold rounded-xl border border-red-200 hover:from-red-100 hover:to-red-200 text-xs flex items-center gap-1.5 transition-all">
                          <span className="material-symbols-outlined text-[18px]">person_off</span> VẮNG
                        </button>
                      )}
                    </div>
                  ) : worklistTab === 'reception' ? (
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onAcceptPatient && onAcceptPatient(item)} 
                        className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/20 text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">stethoscope_arrow</span> KHÁM
                      </button>
                      {onMarkAbsent && (
                        <button onClick={() => onMarkAbsent(item)} className="px-3 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-bold rounded-xl border border-red-200 hover:from-red-100 hover:to-red-200 text-xs flex items-center gap-1.5 transition-all">
                          <span className="material-symbols-outlined text-[18px]">person_off</span> VẮNG
                        </button>
                      )}
                    </div>
                  ) : worklistTab === 'absent' ? (
                    <div className="flex items-center justify-center gap-2">
                      {onMarkPresent && (
                        <button onClick={() => onMarkPresent(item)} className="px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-600 shadow-md shadow-emerald-500/20 text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">person</span> GỌI LẠI
                        </button>
                      )}
                      {onOpenView ? (
                        <button onClick={() => onOpenView(item)} className="px-3 py-2.5 bg-gradient-to-r from-slate-600 to-slate-500 text-white font-bold rounded-xl hover:from-slate-700 hover:to-slate-600 shadow-md shadow-slate-500/20 text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">visibility</span> XEM
                        </button>
                      ) : (
                        <button onClick={() => onOpenResult(item)} className="px-3 py-2.5 bg-gradient-to-r from-slate-600 to-slate-500 text-white font-bold rounded-xl hover:from-slate-700 hover:to-slate-600 shadow-md shadow-slate-500/20 text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">visibility</span> XEM
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {onOpenView ? (
                        <>
                          {/* Nút SINH HIỆU - sửa lại chỉ số */}
                          <button 
                            onClick={() => onOpenVitals(item)} 
                            className={`px-3 py-2.5 font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm ${
                              item.hasVitals 
                                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200 hover:from-emerald-200 hover:to-teal-200 shadow-emerald-500/10' 
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20'
                            }`}
                            title={item.hasVitals ? 'Sửa chỉ số sinh hiệu' : 'Nhập chỉ số sinh hiệu'}
                          >
                            <span className="material-symbols-outlined text-[18px]">monitor_heart</span> 
                            <span className="flex items-center gap-1">
                              SINH HIỆU
                              {item.hasVitals && <span className="material-symbols-outlined text-sm">check_circle</span>}
                            </span>
                          </button>
                          {/* Nút SỬA kết quả chuyên môn - yêu cầu có sinh hiệu trước */}
                          <button 
                            onClick={() => {
                              if (!item.hasVitals) {
                                if (onOpenVitals) {
                                  onOpenVitals(item);
                                }
                                return;
                              }
                              onEditResult ? onEditResult(item) : onOpenResult(item);
                            }} 
                            className={`px-3 py-2.5 font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm ${
                              item.hasVitals 
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-amber-500/20' 
                                : 'bg-gradient-to-r from-slate-300 to-slate-400 text-white cursor-not-allowed shadow-slate-500/10'
                            }`}
                            title={item.hasVitals ? 'Nhập kết quả chuyên môn' : 'Cần nhập chỉ số sinh hiệu trước'}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span> KẾT QUẢ
                          </button>
                          {/* Nút XEM */}
                          <button onClick={() => onOpenView(item)} className="px-3 py-2.5 bg-gradient-to-r from-slate-600 to-slate-500 text-white font-bold rounded-xl hover:from-slate-700 hover:to-slate-600 shadow-md shadow-slate-500/20 text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">visibility</span> XEM
                          </button>
                        </>
                      ) : (
                        <button onClick={() => onOpenResult(item)} className="px-3 py-2.5 bg-gradient-to-r from-slate-600 to-slate-500 text-white font-bold rounded-xl hover:from-slate-700 hover:to-slate-600 shadow-md shadow-slate-500/20 text-xs flex items-center gap-1.5 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">visibility</span> XEM / SỬA
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangDanhSachCongViec;
