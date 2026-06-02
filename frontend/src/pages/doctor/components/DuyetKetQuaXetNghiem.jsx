import React, { useState, useEffect, useCallback } from 'react';
import { 
  getXetNhiemResultsByPhieuKhamApi, 
  approveTestResultApi, 
  rejectTestResultApi 
} from "../../../api/phieuChiDinhApi";

const DuyetKetQuaXetNghiem = ({
  patient,
  user,
  onBack
}) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    fetchResults();
  }, [patient.maPhieuKham]);
  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await getXetNhiemResultsByPhieuKhamApi(patient.maPhieuKham);
      if (data) {
        setResults(data.map(item => ({
          ...item,
          ketLuan: item.ketLuan || '',
          nhomMau: item.nhomMau || '',
          dongMauCoBan: item.dongMauCoBan || '',
          ghiChuThem: item.ghiChuThem || '',
          chiSoList: item.chiSoList || []
        })));
      }
    } catch (e) {
      console.error("Lỗi khi tải kết quả xét nghiệm:", e);
    } finally {
      setLoading(false);
    }
  };
  const handleValueChange = (resultIndex, chiSoIndex, field, value) => {
    const updated = [...results];
    updated[resultIndex].chiSoList[chiSoIndex][field] = value;
    setResults(updated);
  };
  const handleMetaChange = (resultIndex, field, value) => {
    const updated = [...results];
    updated[resultIndex][field] = value;
    setResults(updated);
  };
  const handleApprove = async (result, index) => {
    if (!result.ketLuan.trim()) {
      alert("Vui lòng điền kết luận trước khi duyệt kết quả!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        maBsKetLuan: user?.maNhanVien || null,
        ketLuan: result.ketLuan,
        nhomMau: result.nhomMau,
        dongMauCoBan: result.dongMauCoBan,
        ghiChuThem: result.ghiChuThem,
        chiSoList: result.chiSoList.map(cs => ({
          id: cs.id,
          giaTri: cs.giaTri,
          batThuong: cs.batThuong
        }))
      };
      await approveTestResultApi(result.id, payload);
      alert("Đã ký duyệt kết quả xét nghiệm thành công!");
      fetchResults();
    } catch (e) {
      console.error(e);
      alert("Lỗi khi duyệt kết quả: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleReject = async (result, index) => {
    const reason = prompt("Vui lòng nhập lý do không duyệt / yêu cầu làm lại xét nghiệm:");
    if (reason === null) return; // Nhấn Cancel
    if (!reason.trim()) {
      alert("Lý do không duyệt không được để trống!");
      return;
    }
    setSubmitting(true);
    try {
      await rejectTestResultApi(result.id, {
        reason: reason.trim()
      });
      alert("Đã từ chối kết quả xét nghiệm và yêu cầu kỹ thuật viên làm lại!");
      onBack(); // Quay lại hàng đợi
    } catch (e) {
      console.error(e);
      alert("Lỗi khi từ chối kết quả: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center p-20 text-indigo-600 font-bold italic">
        <span className="material-symbols-outlined animate-spin mr-2">sync</span>
        Đang tải kết quả cận lâm sàng của bệnh nhân...
      </div>;
  }
  return <div className="space-y-6 animate-scale-up">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-rose-200">
            {patient.hoTen?.[0] || 'BN'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">{patient.hoTen}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm font-medium text-gray-500">
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md">#{patient.maBenhNhan}</span>
              <span>•</span>
              <span>{patient.gioiTinh ? 'Nam' : 'Nữ'}</span>
              <span>•</span>
              <span>{new Date(patient.ngaySinh).getFullYear()}</span>
            </div>
          </div>
        </div>
        <button onClick={onBack} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 border border-gray-200">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          QUAY LẠI HÀNG ĐỢI
        </button>
      </div>

      {results.length === 0 ? <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 text-gray-400 italic">
          Chưa có kết quả xét nghiệm nào được kỹ thuật viên nhập cho lượt khám này.
        </div> : <div className="space-y-6">
          {results.map((result, rIdx) => {
        const isApproved = result.trangThai === 'DA_DUYET';
        return <div key={result.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">science</span>
                    </span>
                    <div>
                      <h3 className="font-extrabold text-gray-800">{result.tenDichVu}</h3>
                      <p className="text-[11px] text-gray-400">ID Kết quả: #{result.id} • Ngày thực hiện: {new Date(result.ngayThucHien).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  {isApproved ? <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      ĐÃ PHÊ DUYỆT
                    </span> : <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                      <span className="material-symbols-outlined text-sm">pending_actions</span>
                      CHỜ PHÊ DUYỆT
                    </span>}
                </div>

                <div className="p-6 space-y-6">
                  {result.chiSoList.length > 0 && <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                            <th className="px-6 py-3">Tên Chỉ Số</th>
                            <th className="px-6 py-3 w-40">Giá Trị</th>
                            <th className="px-6 py-3 w-28 text-center">Bất ThưĐng</th>
                            <th className="px-6 py-3">Đơn Vị</th>
                            <th className="px-6 py-3">Khoảng Tham Chiếu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {result.chiSoList.map((cs, csIdx) => <tr key={cs.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-3.5 font-bold text-gray-700">{cs.tenChiSo}</td>
                              <td className="px-6 py-3.5">
                                <input type="text" value={cs.giaTri || ''} disabled={isApproved} onChange={e => handleValueChange(rIdx, csIdx, 'giaTri', e.target.value)} className={`w-full px-3 py-1.5 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-indigo-100 ${cs.batThuong ? 'border-rose-300 bg-rose-50/20 text-rose-700 font-bold' : 'border-gray-200'}`} />
                              </td>
                              <td className="px-6 py-3.5 text-center">
                                <input type="checkbox" checked={!!cs.batThuong} disabled={isApproved} onChange={e => handleValueChange(rIdx, csIdx, 'batThuong', e.target.checked)} className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500 cursor-pointer" />
                              </td>
                              <td className="px-6 py-3.5 text-gray-500 font-medium">{cs.donVi || '---'}</td>
                              <td className="px-6 py-3.5 text-gray-500 font-medium">{cs.chiSoThamChieu || '---'}</td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nhóm Máu</label>
                        <input type="text" value={result.nhomMau} disabled={isApproved} placeholder="VD: O, A, B, AB, Rh+..." onChange={e => handleMetaChange(rIdx, 'nhomMau', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Đông Máu Cơ Bản</label>
                        <input type="text" value={result.dongMauCoBan} disabled={isApproved} placeholder="VD: Thời gian đông máu bình thường" onChange={e => handleMetaChange(rIdx, 'dongMauCoBan', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ghi Chú Thêm</label>
                        <textarea rows="2" value={result.ghiChuThem} disabled={isApproved} placeholder="Ghi chú thêm từ kỹ thuật viên hoặc bác sĩ..." onChange={e => handleMetaChange(rIdx, 'ghiChuThem', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-medium" />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Kết Luận Của Bác Sĩ Xét Nghiệm <span className="text-rose-500">*</span></label>
                        <textarea rows="6" value={result.ketLuan} disabled={isApproved} placeholder="VD: Các chỉ số huyết học trong giới hạn bình thường. Không có biểu hiện bệnh lý..." onChange={e => handleMetaChange(rIdx, 'ketLuan', e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-bold text-gray-800" />
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 bg-gray-50/50 p-4 rounded-xl">
                        <span className="text-xs text-gray-400 font-bold">KTV Thực hiện: ID #{result.nguoiThucHien}</span>
                        {!isApproved && <div className="flex gap-2">
                            <button type="button" disabled={submitting} onClick={() => handleReject(result, rIdx)} className="px-5 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-bold rounded-xl transition-all border border-gray-200 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              KHÔNG DUYỆT
                            </button>
                            <button type="button" disabled={submitting} onClick={() => handleApprove(result, rIdx)} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-100 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">draw</span>
                              DUYỆT & KĐ KẾT QUẢ
                            </button>
                          </div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>;
      })}
        </div>}
    </div>;
};
export default DuyetKetQuaXetNghiem;
