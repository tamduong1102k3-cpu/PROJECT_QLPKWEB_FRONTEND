import React from 'react';

const ModalGoiLai = ({ isOpen, patient, onSauNguoiDangKham, onXepCuoiHang, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel}>
      
      {/* 
          SỬA TẠI ĐÂY: 
          - Thêm min-w-[360px] để chống vạch trắng
          - Dùng w-full max-w-lg để form to và rõ ràng hơn
      */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg min-w-[360px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <span className="material-symbols-outlined text-3xl font-light">person_search</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Xếp vị trí gọi lại</h3>
              <p className="text-emerald-600 font-bold text-sm mt-0.5">Bệnh nhân: {patient?.hoTen}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Chọn vị trí ưu tiên trong hàng đợi:</p>
          
          <button
            onClick={onSauNguoiDangKham}
            className="w-full p-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-400 transition-all group text-left flex items-center gap-4 shadow-sm active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">skip_next</span>
            </div>
            <div className="flex-1">
              <p className="font-black text-gray-800 text-base group-hover:text-emerald-700">Sau người đang khám</p>
              <p className="text-xs text-emerald-600/70 font-medium mt-0.5">Bệnh nhân sẽ được gọi ngay sau ca hiện tại</p>
            </div>
            <span className="material-symbols-outlined text-emerald-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>

          <button
            onClick={onXepCuoiHang}
            className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-sky-400 hover:bg-sky-50 transition-all group text-left flex items-center gap-4 shadow-sm active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-500 shadow-sm group-hover:scale-110 group-hover:text-sky-600 transition-transform">
              <span className="material-symbols-outlined text-2xl">last_page</span>
            </div>
            <div className="flex-1">
              <p className="font-black text-gray-800 text-base group-hover:text-sky-700">Xếp xuống cuối hàng</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Bệnh nhân sẽ chờ sau tất cả người cũ</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onCancel}
            className="px-8 py-3 text-sm font-black text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-xl transition-all uppercase"
          >
            Đóng hộp thoại
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGoiLai;