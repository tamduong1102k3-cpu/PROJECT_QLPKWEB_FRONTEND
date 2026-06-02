import React, { useState, useEffect, useCallback } from 'react';
import { 
  getCdhaResultsByPhieuKhamApi, 
  approveCdhaResultApi, 
  rejectCdhaResultApi 
} from "../../../api/phieuChiDinhApi";

const DuyetKetQuaCDHA = ({
  patient,
  user,
  onBack
}) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [activeImageKey, setActiveImageKey] = useState('duongDanAnh1');
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [pan, setPan] = useState({
    x: 0,
    y: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });
  const handleMouseDown = e => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };
  const handleMouseMove = e => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleResetFilters = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setRotate(0);
    setPan({
      x: 0,
      y: 0
    });
  };
  const fetchCdhaResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCdhaResultsByPhieuKhamApi(patient.maPhieuKham);
      if (data) {
        setResults(data.map(item => ({
          ...item,
          moTaHinhAnh: item.moTaHinhAnh || '',
          ketLuan: item.ketLuan || '',
          deNghi: item.deNghi || '',
          duongDanAnh1: item.duongDanAnh1 || '',
          duongDanAnh2: item.duongDanAnh2 || ''
        })));
      }
    } catch (e) {
      console.error("Lỗi khi tải kết quả CĐHA:", e);
    } finally {
      setLoading(false);
    }
  }, [patient.maPhieuKham]);
  useEffect(() => {
    fetchCdhaResults();
  }, [fetchCdhaResults]);
  const handleTextChange = (field, value) => {
    if (results.length === 0) return;
    const updated = [...results];
    updated[selectedResultIndex][field] = value;
    setResults(updated);
  };
  const handleApprove = async () => {
    const currentResult = results[selectedResultIndex];
    if (!currentResult) return;
    if (!currentResult.ketLuan.trim()) {
      alert("Vui lòng điền kết luận chẩn đoán trước khi ký duyệt!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        maBacSiThucHien: user?.maNhanVien || null,
        moTaHinhAnh: currentResult.moTaHinhAnh,
        ketLuan: currentResult.ketLuan,
        deNghi: currentResult.deNghi,
        duongDanAnh1: currentResult.duongDanAnh1,
        duongDanAnh2: currentResult.duongDanAnh2
      };
      const detailId = currentResult.maChiTietChiDinh || currentResult.idChiTietChiDinh;
      await approveCdhaResultApi(detailId, payload);
      alert("Đã ký duyệt kết quả chẩn đoán hình ảnh thành công!");
      onBack();
    } catch (e) {
      console.error(e);
      alert("Lỗi khi ký duyệt kết quả: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleReject = async () => {
    const currentResult = results[selectedResultIndex];
    if (!currentResult) return;
    const reason = prompt("Nhập lý do không duyệt / yêu cầu kỹ thuật viên chụp lại:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Lý do từ chối không được để trống!");
      return;
    }
    setSubmitting(true);
    try {
      const detailId = currentResult.maChiTietChiDinh || currentResult.idChiTietChiDinh;
      await rejectCdhaResultApi(detailId, {
        reason: reason.trim()
      });
      alert("Đã từ chối kết quả và gửi yêu cầu thực hiện lại cho kỹ thuật viên!");
      onBack();
    } catch (e) {
      console.error(e);
      alert("Lỗi khi gửi yêu cầu từ chối: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };
  const applyTemplate = type => {
    let findings = "";
    let conclusion = "";
    let recommendation = "Theo dõi lâm sàng và kết hợp lâm sàng.";
    if (type === 'ultrasound') {
      findings = "SIÊU ÂM BỤNG TỔNG QUÁT:\nGAN: Kích thước bình thường, nhu mô đều, không thấy tổn thương khu trú.\nMẬT: Túi mật căng thành mỏng, không sỏi. Đường mật trong và ngoài gan không giãn.\nTỤY, LÁCH: Kích thước bình thường, nhu mô đồng nhất.\nTHẬN: Vị trí bình thường, kích thước đều hai bên, nhu mô phân biệt tủy về rõ, không sỏi, không ứ nước.\nBÀNG QUANG: Thành mỏng, không sỏi.";
      conclusion = "Hiện chưa thấy hình ảnh bất thường trên siêu âm bụng tổng quát.";
    } else if (type === 'xray') {
      findings = "X-QUANG NGỰC THẲNG:\nPHẾ TRƯỜNG: Hai phế trường sáng đều, nhu mô phổi bình thường, không thấy tổn thương thâm nhiễm hay xơ xẹp.\nBÓNG TIM: Chỉ số tim ngực trong giới hạn bình thường.\nCƠ HOÀNH: Vòm hoành hai bên đều, góc sườn hoành hai bên nhọn.";
      conclusion = "Hình ảnh tim phổi thẳng bình thường.";
    } else if (type === 'ct') {
      findings = "CT-SCANNER SỌ NÃO KHÔNG CẢN QUANG:\nNHU MÔ NÃO: Nhu mô não đều, không thấy ổ giảm đậm độ hay xuất huyết cấp tính.\nHỆ THỐNG NÃO THẤT: Cân đối, không giãn, đường giữa không lệch.\nXƯƠNG SỌ: Không thấy đường nứt xương sọ.";
      conclusion = "Hiện chưa phát hiện tổn thương sọ não cấp tính trên phim CT.";
    } else if (type === 'mri') {
      findings = "MRI CỘT SỐNG THẮT LƯNG:\nCỘT SỐNG: Trục cột sống thắt lưng bình thường. Chiều cao đốt sống bình thường.\nĐĨA ĐỆM: Đĩa đệm L4-L5, L5-S1 giảm tín hiệu nhẹ trên T2W, không thấy phồng hay thoát vị đĩa đệm chèn ép rễ thần kinh.\nTỦY SỐNG: Tín hiệu đoạn tủy thắt lưng bình thường.";
      conclusion = "Chưa phát hiện thoát vị đĩa đệm gây hẹp ống sống hay chèn ép rễ thần kinh.";
    }
    handleTextChange('moTaHinhAnh', findings);
    handleTextChange('ketLuan', conclusion);
    handleTextChange('deNghi', recommendation);
  };
  const currentResult = results[selectedResultIndex];
  const currentImgUrl = currentResult ? currentResult[activeImageKey] : null;
  const imageStyle = {
    transform: `scale(${zoom}) rotate(${rotate}deg) translate(${pan.x}px, ${pan.y}px)`,
    filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : 'invert(0)'}`,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    cursor: isDragging ? 'grabbing' : 'grab',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  };
  return <div className="space-y-6 animate-scale-up">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
            {patient.hoTen?.[0] || 'BN'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">{patient.hoTen}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm font-medium text-gray-500">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">#{patient.maBenhNhan}</span>
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
          Bệnh nhân này chưa có kết quả chỉ định chẩn đoán hình ảnh nào được tải lên.
        </div> : <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: DICOM/Imaging Viewer (7 cols) */}
          <div className="lg:col-span-7 bg-[#0b0f19] rounded-2xl shadow-xl overflow-hidden border border-slate-800 p-5 flex flex-col space-y-4">
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">videocam</span>
                <span className="font-bold text-sm tracking-wider uppercase text-slate-200">
                  {currentResult?.tenDichVu || 'Đầu phim chẩn đoán'}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveImageKey('duongDanAnh1')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeImageKey === 'duongDanAnh1' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                  Ảnh 1
                </button>
                <button onClick={() => setActiveImageKey('duongDanAnh2')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeImageKey === 'duongDanAnh2' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                  Ảnh 2
                </button>
              </div>
            </div>

            {/* Interactive Image Panel */}
            <div className="relative flex-1 bg-[#050811] flex items-center justify-center overflow-hidden border border-slate-900 rounded-xl h-[480px]" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              {currentImgUrl ? <img src={currentImgUrl} alt="Medical scan" style={imageStyle} draggable={false} /> : <div className="flex flex-col items-center justify-center p-8 text-slate-500 w-full h-full select-none">
                  <svg viewBox="0 0 400 400" className="w-64 h-64 opacity-50">
                    <rect width="400" height="400" fill="#050811" rx="20" />
                    <path d="M100 120 C100 80, 180 80, 180 180 C180 280, 100 320, 100 320 C100 320, 80 280, 80 180 C80 80, 100 120, 100 120 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" opacity="0.3" />
                    <path d="M300 120 C300 80, 220 80, 220 180 C220 280, 300 320, 300 320 C300 320, 320 280, 320 180 C320 80, 300 120, 300 120 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" opacity="0.3" />
                    <line x1="200" y1="50" x2="200" y2="350" stroke="#64748b" strokeWidth="10" strokeDasharray="15,5" opacity="0.4" />
                    <path d="M200 100 C150 90, 80 120, 80 120" stroke="#64748b" strokeWidth="4" fill="none" opacity="0.4" />
                    <path d="M200 100 C250 90, 320 120, 320 120" stroke="#64748b" strokeWidth="4" fill="none" opacity="0.4" />
                    <path d="M200 150 C160 140, 110 160, 90 190" stroke="#64748b" strokeWidth="3" fill="none" opacity="0.3" />
                    <path d="M200 150 C240 140, 290 160, 310 190" stroke="#64748b" strokeWidth="3" fill="none" opacity="0.3" />
                    <path d="M200 190 C150 180, 100 210, 92 240" stroke="#64748b" strokeWidth="3" fill="none" opacity="0.3" />
                    <path d="M200 190 C250 180, 300 210, 308 240" stroke="#64748b" strokeWidth="3" fill="none" opacity="0.3" />
                    <path d="M170 190 Q200 220 220 250 T170 280 Q140 250 170 190 Z" fill="#334155" opacity="0.4" />
                  </svg>
                  <p className="text-xs mt-4 text-slate-400 text-center font-medium">Bệnh nhân chưa có ảnh chẩn đoán từ kỹ thuật viên.<br />Hiển thị ảnh phác họa giải phẫu ngực.</p>
                </div>}
              
              {showGrid && <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="absolute w-full h-[1px] bg-emerald-500/20"></div>
                  <div className="absolute h-full w-[1px] bg-emerald-500/20"></div>
                  <div className="absolute w-24 h-24 rounded-full border border-emerald-500/10"></div>
                  <div className="absolute w-48 h-48 rounded-full border border-emerald-500/5"></div>
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 border border-emerald-500/5">
                    {[...Array(16)].map((_, i) => <div key={i} className="border border-emerald-500/5"></div>)}
                  </div>
                </div>}

              {/* HUD Telemetry Overlay */}
              <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-400 space-y-0.5 shadow-lg select-none">
                <div>ZOOM: {Math.round(zoom * 100)}%</div>
                <div>BRIGHTNESS: {brightness}%</div>
                <div>CONTRAST: {contrast}%</div>
                <div>NEGATIVE: {invert ? 'ON' : 'OFF'}</div>
                <div>ANGLE: {rotate}°</div>
              </div>
            </div>

            {/* Slider and Buttons Control Panel */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sliders */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">wb_sunny</span>Độ sáng</span>
                    <span className="font-mono font-bold text-slate-200">{brightness}%</span>
                  </div>
                  <input type="range" min="50" max="200" value={brightness} onChange={e => setBrightness(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">contrast</span>Độ tương phản</span>
                    <span className="font-mono font-bold text-slate-200">{contrast}%</span>
                  </div>
                  <input type="range" min="50" max="200" value={contrast} onChange={e => setContrast(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>

                {/* Adjust Tools */}
                <div className="flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">zoom_in</span>Thu phóng</span>
                    <span className="font-mono font-bold text-slate-200">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />

                  <div className="flex items-center gap-2 pt-1.5">
                    <button onClick={() => setInvert(!invert)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${invert ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`} title="Chuyển chế độ âm bản X-quang">
                      <span className="material-symbols-outlined text-sm">invert_colors</span>
                      Âm bản
                    </button>
                    <button onClick={() => setRotate(prev => (prev + 90) % 360)} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">rotate_right</span>
                      Xoay 90°
                    </button>
                    <button onClick={() => setShowGrid(!showGrid)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${showGrid ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>
                      <span className="material-symbols-outlined text-sm">grid_on</span>
                      Lưới định vị
                    </button>
                    <button onClick={handleResetFilters} className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 rounded-lg text-xs transition-all flex items-center justify-center" title="Khôi phục trạng thái ảnh ban đầu">
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Diagnostic Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col p-6 space-y-6">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="material-symbols-outlined text-indigo-600">assignment_turned_in</span>
              Kết quả chẩn đoán chuyên môn
            </h3>

            {/* Multiple service tabs */}
            {results.length > 1 && <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chọn dịch vụ cần chẩn đoán</label>
                <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl">
                  {results.map((res, index) => <button key={res.id} onClick={() => {
              setSelectedResultIndex(index);
              setActiveImageKey('duongDanAnh1');
              handleResetFilters();
            }} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${selectedResultIndex === index ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-gray-600 hover:bg-white hover:text-indigo-600'}`}>
                      {res.tenDichVu}
                    </button>)}
                </div>
              </div>}

            {/* Medical templates */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mẫu kết luận mẫu</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyTemplate('ultrasound')} className="px-3 py-2 bg-slate-50 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-700 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between">
                  Siêu âm ổ bụng
                  <span className="material-symbols-outlined text-xs text-gray-400">arrow_right_alt</span>
                </button>
                <button onClick={() => applyTemplate('xray')} className="px-3 py-2 bg-slate-50 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-700 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between">
                  X-Quang tim phổi
                  <span className="material-symbols-outlined text-xs text-gray-400">arrow_right_alt</span>
                </button>
                <button onClick={() => applyTemplate('ct')} className="px-3 py-2 bg-slate-50 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-700 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between">
                  CT SĐ não
                  <span className="material-symbols-outlined text-xs text-gray-400">arrow_right_alt</span>
                </button>
                <button onClick={() => applyTemplate('mri')} className="px-3 py-2 bg-slate-50 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-700 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between">
                  MRI Cột sống
                  <span className="material-symbols-outlined text-xs text-gray-400">arrow_right_alt</span>
                </button>
              </div>
            </div>

            {/* Findings Form */}
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mô tả hình ảnh (Findings)</label>
                <textarea rows="5" value={currentResult?.moTaHinhAnh} onChange={e => handleTextChange('moTaHinhAnh', e.target.value)} placeholder="Ghi nhận mô tả chi tiết giải phẫu học..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Kết luận chẩn đoán (Impression) <span className="text-rose-500">*</span>
                </label>
                <textarea rows="3" value={currentResult?.ketLuan} onChange={e => handleTextChange('ketLuan', e.target.value)} placeholder="VD: Viêm phổi thùy phải / Không có bất thường rõ..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm font-bold text-indigo-950" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Đề nghị / Lời dặn thêm</label>
                <input type="text" value={currentResult?.deNghi} onChange={e => handleTextChange('deNghi', e.target.value)} placeholder="VD: Kết hợp lâm sàng hoặc đĐ nghị làm thêm xét nghiệm..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all text-sm" />
              </div>
            </div>

            {/* Actions Panel */}
            <div className="border-t border-gray-100 pt-4 bg-gray-50/50 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                <span>KTV thực hiện: ID #{currentResult?.maNhanVienThucHien || 'Chưa rõ'}</span>
                <span>Bác sĩ ký duyệt: {user?.hoTen}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={submitting} onClick={handleReject} className="px-4 py-2.5 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 text-xs font-bold rounded-xl transition-all border border-gray-200 flex items-center justify-center gap-1.5 flex-1">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  TỪ CHỐI DUYỆT
                </button>
                <button type="button" disabled={submitting} onClick={handleApprove} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 flex-1.5">
                  <span className="material-symbols-outlined text-sm">draw</span>
                  KĐ & DUYỆT KẾT QUẢ
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};
export default DuyetKetQuaCDHA;
