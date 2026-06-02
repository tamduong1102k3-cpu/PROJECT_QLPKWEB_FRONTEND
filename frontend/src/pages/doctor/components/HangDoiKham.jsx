import React, { useState, useEffect, useCallback } from 'react';
import NhomOSoLieu from './NhomOSoLieu';
import { getTodayApi } from '../../../api/dangKyKhamBenhApi';
import { getTodayResultsApi as getTodayResultsXetNghiemApi } from '../../../api/ketQuaXetNghiemApi';
import { getTodayResultsApi as getTodayResultsCdhaApi } from '../../../api/ketQuaCdhaApi';

const HangDoiKham = ({ user, handleSelectPatient }) => {
  const [patients, setPatients] = useState({
    waiting: [],
    completed: []
  });
  const [loadingQueue, setLoadingQueue] = useState(true);

  const isXetNghiemDoc = user?.maChuyenKhoa === 7 || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xét nghiệm') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xact nghiem') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xact nghi?m');

  const isCdhaDoc = user?.maChuyenKhoa === 8 || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('chẩn đoán hình ảnh') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('chan doan hinh anh') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('cdha') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('siêu âm') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('sieu am') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('x-quang') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('xquang');

  const isRhmDoc = user?.maChuyenKhoa === 5 ||
    user?.tenChuyenKhoa?.toLowerCase()?.includes('răng') || 
    user?.tenChuyenKhoa?.toLowerCase()?.includes('nha khoa');

  const fetchQueue = useCallback(async () => {
    try {
      setLoadingQueue(true);
      let data = null;
      if (isXetNghiemDoc) {
        data = await getTodayResultsXetNghiemApi();
      } else if (isCdhaDoc) {
        data = await getTodayResultsCdhaApi();
      } else {
        data = await getTodayApi();
      }

      if (data) {
        let waiting = [];
        let completed = [];
        if (isXetNghiemDoc || isCdhaDoc) {
          waiting = data.filter(r => r.trangThai === 'CHO_DUYET');
          completed = data.filter(r => r.trangThai === 'DA_DUYET' || r.trangThai === 'HOAN_THANH' || r.trangThai === 'CHO_BAC_SI');
        } else {
          if (user?.maChuyenKhoa) {
            data = data.filter(r => r.maChuyenKhoa === user.maChuyenKhoa);
          }
          waiting = data.filter(r => r.trangThai === 'CHO_BAC_SI' || r.trangThai === 'DA_KHAM_LAM_SANG' || (isRhmDoc && r.trangThai === 'DANG_KHAM'));
          completed = data.filter(r => r.trangThai === 'HOAN_THANH');
        }
        setPatients({
          waiting,
          completed
        });
      }
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setLoadingQueue(false);
    }
  }, [user, isXetNghiemDoc, isCdhaDoc, isRhmDoc]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  return (
    <div className="animate-fade-in space-y-6">
      <NhomOSoLieu user={user} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">person_search</span>
            Danh Sách Bệnh Nhân Chờ Khám
          </h3>
          <button onClick={fetchQueue} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-indigo-600 shadow-sm border border-transparent hover:border-gray-200">
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">STT</th>
                <th className="px-6 py-4">Mã BN</th>
                <th className="px-6 py-4">Họ Tên</th>
                <th className="px-6 py-4">Giới Tính</th>
                <th className="px-6 py-4">Năm Sinh</th>
                <th className="px-6 py-4">Lý Do Khám</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingQueue ? (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-400 italic">Đang tải dữ liệu...</td></tr>
              ) : patients.waiting.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-400">Không có bệnh nhân nào trong hàng đợi</td></tr>
              ) : (
                patients.waiting.map((p, index) => (
                  <tr key={p.id || index} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {p.soThuTu || index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-500">#{p.maBenhNhan}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{p.hoTen}</td>
                    <td className="px-6 py-4 text-gray-600">{p.gioiTinh === 1 ? 'Nam' : 'Nữ'}</td>
                    <td className="px-6 py-4 text-gray-600">{p.ngaySinh ? new Date(p.ngaySinh).getFullYear() : 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{p.ghiChu || 'Khám tổng quát'}</td>
                    <td className="px-6 py-4">
                      {p.trangThai === 'CHO_DUYET' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Chờ duyệt KQ
                        </span>
                      ) : p.trangThai === 'DA_KHAM_LAM_SANG' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Đang làm CLS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Chờ khám
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleSelectPatient(p)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 mx-auto">
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        MỜI KHÁM
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HangDoiKham;
