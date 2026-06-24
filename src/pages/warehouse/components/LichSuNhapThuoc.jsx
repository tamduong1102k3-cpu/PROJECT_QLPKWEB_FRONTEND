import React from 'react';

const LichSuNhapThuoc = ({ phieuNhapList, handleViewDetail, getTenThuoc, formatCurrency, formatDateTime }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-600">history</span>
          Lịch sử nhập thuốc
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-gray-500">Mã PN</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-gray-500">Ngày nhập</th>
              <th className="text-right px-4 py-3 text-[11px] font-bold uppercase text-gray-500">Tổng tiền</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase text-gray-500">Trạng thái</th>
              <th className="text-center px-4 py-3 text-[11px] font-bold uppercase text-gray-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {phieuNhapList.map(phieu => (
              <tr key={phieu.maPhieuNhapThuoc} className="hover:bg-cyan-50/30 transition-colors">
                <td className="px-4 py-3 text-xs font-bold text-cyan-600">#{phieu.maPhieuNhapThuoc}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(phieu.ngayNhap)}</td>
                <td className="px-4 py-3 text-sm font-bold text-right text-gray-700">{formatCurrency(phieu.tongTienNhap)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${phieu.trangThai === 'Hoan thanh' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600'}`}>
                    {phieu.trangThai}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleViewDetail(phieu)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-cyan-600 hover:text-white text-slate-600 rounded-lg text-xs font-bold transition-all">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>Xem
                  </button>
                </td>
              </tr>
            ))}
            {phieuNhapList.length === 0 && (
              <tr>
                <td colSpan="5" className="py-10 text-center text-gray-400 text-sm">Chưa có phiếu nhập</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LichSuNhapThuoc;