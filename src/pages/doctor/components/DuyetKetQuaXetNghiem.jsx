import React, { useState, useEffect, useCallback } from 'react';
import { 
  getXetNhiemResultsByPhieuKhamApi, 
  approveTestResultApi, 
  rejectTestResultApi 
} from "../../../api/phieuChiDinhApi";
import { useNotification } from '../../../components/NotificationContext';
import ConfirmDialog from '../../../components/ConfirmDialog';
import PrintButton from '../../../components/PrintButton';

const DuyetKetQuaXetNghiem = ({
  patient,
  user,
  onBack
}) => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'primary', icon: '' });
  const [promptState, setPromptState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, value: '' });

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
      showWarning("Vui lòng điền kết luận trước khi duyệt kết quả!");
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
      showSuccess("Đã ký duyệt kết quả xét nghiệm thành công!");
      fetchResults();
    } catch (e) {
      console.error(e);
      showError("Lỗi khi duyệt kết quả: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (result, index) => {
    const reason = prompt("Vui lòng nhập lý do không duyệt / yêu cầu làm lại xét nghiệm:");
    if (reason === null) return;
    if (!reason.trim()) {
      showWarning("Lý do không duyệt không được để trống!");
      return;
    }
    setSubmitting(true);
    try {
      await rejectTestResultApi(result.id, {
        reason: reason.trim()
      });
      showSuccess("Đã từ chối kết quả xét nghiệm và yêu cầu kỹ thuật viên làm lại!");
      onBack();
    } catch (e) {
      console.error(e);
      showError("Lỗi khi từ chối kết quả: " + e.message);
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
                        {!isApproved ? (
                          <div className="flex gap-2">
                            <button type="button" disabled={submitting} onClick={() => handleReject(result, rIdx)} className="px-5 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-bold rounded-xl transition-all border border-gray-200 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              KHÔNG DUYỆT
                            </button>
                            <button type="button" disabled={submitting} onClick={() => handleApprove(result, rIdx)} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-100 flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">draw</span>
                              DUYỆT & KĐ KẾT QUẢ
                            </button>
                          </div>
                        ) : (
                          <PrintButton 
                            targetId={`test-print-area-${result.id}`} 
                            variant="success" 
                            title="IN KẾT QUẢ XÉT NGHIỆM" 
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- PHẦN TỬ IN PHIẾU XÉT NGHIỆM (ẨN TRÊN MÀN HÌNH, CHỈ HIỂN THỊ KHI IN) --- */}
                  {isApproved && (
                    <div id={`test-print-area-${result.id}`} className="hidden print:block p-8 bg-white text-black font-sans leading-relaxed text-sm">
                      <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-4 mb-6">
                        <div>
                          <h2 className="text-md font-bold uppercase text-indigo-900">HỆ THỐNG PHÒNG KHÁM QUỐC TẾ MEDCORE</h2>
                          <p className="text-xs text-gray-600">Địa chỉ: 123 Đường Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh</p>
                          <p className="text-xs text-gray-600">Điện thoại: 1900 6000 • Website: www.medcore.vn</p>
                        </div>
                        <div className="text-right">
                          <h3 className="text-lg font-black text-indigo-900 tracking-wide uppercase">PHIẾU KẾT QUẢ XÉT NGHIỆM</h3>
                          <p className="text-xs text-gray-500 font-bold">Mã kết quả: #{result.id}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 border bg-gray-50/50 p-4 rounded-xl text-xs">
                        <div>
                          <p><strong>Họ tên bệnh nhân:</strong> <span className="font-bold text-sm">{patient.hoTen}</span></p>
                          <p><strong>Năm sinh:</strong> {new Date(patient.ngaySinh).getFullYear()} • <strong>Giới tính:</strong> {patient.gioiTinh ? 'Nam' : 'Nữ'}</p>
                          <p><strong>Mã bệnh nhân:</strong> #{patient.maBenhNhan}</p>
                        </div>
                        <div>
                          <p><strong>Dịch vụ thực hiện:</strong> <span className="font-bold">{result.tenDichVu}</span></p>
                          <p><strong>Thời gian thực hiện:</strong> {new Date(result.ngayThucHien).toLocaleString('vi-VN')}</p>
                          <p><strong>Mã phiếu khám:</strong> #{patient.maPhieuKham}</p>
                        </div>
                      </div>

                      {result.chiSoList.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-bold border-b border-gray-300 pb-1 mb-3 uppercase text-[11px] tracking-wider">Chỉ số xét nghiệm chi tiết</h3>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-gray-300 font-bold">
                                <th className="py-2">Tên chỉ số</th>
                                <th className="py-2 text-center w-28">Kết quả</th>
                                <th className="py-2 text-center w-20">Bất thường</th>
                                <th className="py-2">Đơn vị</th>
                                <th className="py-2">Khoảng tham chiếu</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.chiSoList.map((cs, idx) => (
                                <tr key={cs.id || idx} className="border-b border-gray-100">
                                  <td className="py-2.5 font-semibold text-gray-700">{cs.tenChiSo}</td>
                                  <td className={`py-2.5 text-center font-bold ${cs.batThuong ? 'text-red-600' : 'text-gray-800'}`}>{cs.giaTri || '---'}</td>
                                  <td className="py-2.5 text-center">{cs.batThuong ? <span className="font-bold text-red-600">H</span> : 'Bình thường'}</td>
                                  <td className="py-2.5 text-gray-600">{cs.donVi || '---'}</td>
                                  <td className="py-2.5 text-gray-600">{cs.chiSoThamChieu || '---'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        {result.nhomMau && (
                          <div className="p-3 border rounded-lg bg-gray-50/20">
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Nhóm máu</span>
                            <span className="font-bold text-sm text-gray-800">{result.nhomMau}</span>
                          </div>
                        )}
                        {result.dongMauCoBan && (
                          <div className="p-3 border rounded-lg bg-gray-50/20">
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Đông máu cơ bản</span>
                            <span className="font-bold text-sm text-gray-800">{result.dongMauCoBan}</span>
                          </div>
                        )}
                      </div>

                      {result.ghiChuThem && (
                        <div className="mb-6 p-3 border rounded-xl bg-gray-50/30 text-xs">
                          <strong className="text-[10px] text-gray-400 uppercase block mb-1">Ghi chú thêm</strong>
                          <p className="text-gray-700 italic">{result.ghiChuThem}</p>
                        </div>
                      )}

                      <div className="mb-8 p-4 border-2 border-indigo-900/10 rounded-2xl bg-indigo-50/10 text-xs">
                        <strong className="text-[11px] text-indigo-900 uppercase block mb-1">Kết luận chuyên môn</strong>
                        <p className="font-bold text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{result.ketLuan}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-gray-100">
                        <div className="text-center min-w-[200px]">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-12">Kỹ thuật viên thực hiện</p>
                          <span className="font-semibold text-xs text-gray-600">Mã nhân viên: #{result.nguoiThucHien}</span>
                        </div>
                        <div className="text-center ml-auto min-w-[200px]">
                          <p className="text-xs italic mb-1">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                          <p className="font-bold text-xs uppercase mb-12">Bác sĩ kết luận & ký duyệt</p>
                          <p className="font-serif italic text-lg text-indigo-800">{user?.hoTen || user?.username || 'Bác sĩ chuyên khoa'}</p>
                          <p className="text-[10px] text-gray-400 mt-1">Đã ký điện tử</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>;
      })}
        </div>}
    </div>;
};
export default DuyetKetQuaXetNghiem;