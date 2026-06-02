import React, { useState, useEffect } from 'react';
import { getByPhieuKhamApi as getChiSoKhamByMaPhieuKhamApi, saveAndUpdateApi as saveAndUpdatePhieuKhamApi } from '../../../api/chiSoKhamTongHopApi';


const TabKhamRHM = ({ examData, setExamData, isAssistant, maPhieuKham }) => {
  const [selectedTooth, setSelectedTooth] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIC LOAD DỮ LIỆU ---
  useEffect(() => {
    const loadRhmData = async () => {
      // 1. Kiểm tra mã phiếu
      if (!maPhieuKham) {
        console.warn("TabKhamRHM: Không tìm thấy maPhieuKham");
        return;
      }

      try {
        console.log("TabKhamRHM: Đang gọi API load dữ liệu cho phiếu #" + maPhieuKham);
        const data = await getChiSoKhamByMaPhieuKhamApi(maPhieuKham);
        
        if (data) {
          console.log("TabKhamRHM: Đã nhận dữ liệu từ DB:", data);
          
          // 2. Cập nhật state chung của Bác sĩ/Trợ lý
          // Sử dụng hàm callback setExamData(prev => ...) để đảm bảo không mất các trường khám lâm sàng cũ
          setExamData(prev => ({
            ...prev,
            // Map chính xác từng trường (Ưu tiên camelCase, fallback snake_case)
            tinhTrangRang: data.tinhTrangRang || data.tinh_trang_rang || '',
            sauRang: data.sauRang || data.sau_rang || '',
            caoRang: data.caoRang || data.cao_rang || '',
            viemNuou: data.viemNuou || data.viem_nuou || '',
            khopCan: data.khopCan || data.khop_can || '',
            doLungLay: data.doLungLay || data.do_lung_lay || '',
            niemMacMieng: data.niemMacMieng || data.niem_mac_mieng || '',
            phuHinhCu: data.phuHinhCu || data.phu_hinh_cu || '',
            benhLyKhacRhm: data.benhLyKhacRhm || data.benh_ly_khac_rhm || '',
            // Gán lại maPhieuKham vào state để tránh bị null khi lưu
            maPhieuKham: maPhieuKham 
          }));
        } else {
          console.log("TabKhamRHM: Phiếu này chưa có dữ liệu khám chuyên khoa RHM.");
          // Reset các trường RHM về rỗng nếu là phiếu mới hoàn toàn
          setExamData(prev => ({
            ...prev,
            sauRang: '', caoRang: '', viemNuou: '', khopCan: '', doLungLay: '',
            tinhTrangRang: '', niemMacMieng: '', phuHinhCu: '', benhLyKhacRhm: '',
            maPhieuKham: maPhieuKham
          }));
        }
      } catch (error) {
        console.error("TabKhamRHM: Lỗi khi load dữ liệu:", error);
      }
    };

    loadRhmData();
  }, [maPhieuKham]); // Chỉ chạy lại khi mã phiếu thay đổi

  // --- HÀM LƯU ---
  const handleSaveClinicalExam = async () => {
    if (!maPhieuKham) return alert("Không tìm thấy mã phiếu!");
    
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Đảm bảo Payload đầy đủ thông tin
    const payload = {
      ...examData,
      maPhieuKham: maPhieuKham,
      maNhanVienNhap: user?.maNhanVien || user?.id
    };

    try {
      await saveAndUpdatePhieuKhamApi(payload);
      alert(`✅ Đã lưu kết quả khám RHM thành công!`);
    } catch (error) {
      alert("❌ Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TEMPLATE NHẬP LIỆU ---
  const insertDentalTemplate = (template) => {
    const prefix = selectedTooth ? `[Răng ${selectedTooth}] ` : '- ';
    const current = examData.tinhTrangRang ? examData.tinhTrangRang + '\n' : '';
    setExamData({ ...examData, tinhTrangRang: current + prefix + template });
  };

  // Render các cụm răng
  const q1 = ['18', '17', '16', '15', '14', '13', '12', '11'];
  const q2 = ['21', '22', '23', '24', '25', '26', '27', '28'];
  const q4 = ['48', '47', '46', '45', '44', '43', '42', '41'];
  const q3 = ['31', '32', '33', '34', '35', '36', '37', '38'];

  const ToothBtn = ({ num }) => (
    <button
      key={num}
      onClick={() => setSelectedTooth(num === selectedTooth ? '' : num)}
      className={`w-7 h-9 flex items-center justify-center rounded text-[10px] font-bold transition-all border 
        ${selectedTooth === num ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-indigo-500'}`}
    >
      {num}
    </button>
  );

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 text-3xl">dentistry</span>
          Khám Chuyên Khoa Răng Hàm Mặt {maPhieuKham && <span className="text-sm font-normal text-gray-400">(#{maPhieuKham})</span>}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Sâu răng</label>
              <input type="text" value={examData.sauRang || ''} onChange={(e) => setExamData({...examData, sauRang: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="Vị trí..." />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Cao răng</label>
              <select value={examData.caoRang || ''} onChange={(e) => setExamData({...examData, caoRang: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                <option value="">-- Chọn --</option>
                <option value="Độ 1">Độ 1</option>
                <option value="Độ 2">Độ 2</option>
                <option value="Độ 3">Độ 3</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Viêm nướu</label>
              <select value={examData.viemNuou || ''} onChange={(e) => setExamData({...examData, viemNuou: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                <option value="">-- Chọn --</option>
                <option value="Không">Không</option>
                <option value="Nhẹ">Nhẹ</option>
                <option value="Nặng">Nặng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-indigo-600 uppercase mb-2 flex justify-between">
              <span>Tình trạng răng (Mô tả chi tiết)</span>
              {selectedTooth && <span className="text-white bg-indigo-600 px-2 py-0.5 rounded text-[10px]">Đang chọn: {selectedTooth}</span>}
            </label>
            <textarea value={examData.tinhTrangRang || ''} onChange={(e) => setExamData({...examData, tinhTrangRang: e.target.value})} className="w-full p-4 border border-indigo-200 rounded-xl min-h-[140px] text-sm bg-indigo-50/10" placeholder="Mô tả các răng sâu, mất, lung lay..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">Niêm mạc miệng</label>
              <textarea value={examData.niemMacMieng || ''} onChange={(e) => setExamData({...examData, niemMacMieng: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm min-h-[80px]" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">Phục hình cũ</label>
              <textarea value={examData.phuHinhCu || ''} onChange={(e) => setExamData({...examData, phuHinhCu: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl text-sm min-h-[80px]" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl shadow-xl border border-slate-800">
            <h4 className="font-bold text-white mb-4 text-sm uppercase">Sơ Đồ Răng (Odontogram)</h4>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[440px]">
                <div className="flex justify-center gap-1 mb-1">
                  <div className="flex gap-1 pr-1 border-r border-slate-700">{q1.map(n => <ToothBtn key={n} num={n} />)}</div>
                  <div className="flex gap-1 pl-1">{q2.map(n => <ToothBtn key={n} num={n} />)}</div>
                </div>
                <div className="h-[1px] bg-slate-700 my-3"></div>
                <div className="flex justify-center gap-1">
                  <div className="flex gap-1 pr-1 border-r border-slate-700">{q4.map(n => <ToothBtn key={n} num={n} />)}</div>
                  <div className="flex gap-1 pl-1">{q3.map(n => <ToothBtn key={n} num={n} />)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase">Nhập nhanh</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => insertDentalTemplate('Sâu ngà')} className="px-2 py-1 bg-slate-50 border rounded text-xs">Sâu ngà</button>
              <button onClick={() => insertDentalTemplate('Viêm tủy cấp')} className="px-2 py-1 bg-slate-50 border rounded text-xs">Viêm tủy</button>
              <button onClick={() => insertDentalTemplate('Răng mất')} className="px-2 py-1 bg-slate-50 border rounded text-xs">Mất răng</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-4">
        <button 
          disabled={loading}
          onClick={handleSaveClinicalExam} 
          className={`px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2 ${loading ? 'opacity-50' : ''}`}
        >
          <span className="material-symbols-outlined">{loading ? 'sync' : 'how_to_reg'}</span>
          {loading ? 'ĐANG LƯU...' : (isAssistant ? 'HOÀN TẤT VÀ CHUYỂN BÁC SĨ KIỂM TRA' : 'XÁC NHẬN KẾT QUẢ KHÁM RHM')}
        </button>
      </div>
    </div>
  );
};

export default TabKhamRHM;
