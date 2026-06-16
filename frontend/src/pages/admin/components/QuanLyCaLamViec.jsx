import React, { useState, useEffect } from 'react';
import { getAllShiftsApi, createShiftApi, deleteShiftApi } from '../../../api/shiftApi';
import { getAllNhanVienApi as getAllEmployeesApi } from '../../../api/employeeApi';
import { getAllChucVuApi as getChucVuApi, getAllPhongApi as getPhongApi, getAllChuyenKhoaApi as getChuyenKhoaApi } from '../../../api/danhMucApi';

const DAYS = [
  { id: 'Thứ 2', label: 'Thứ 2' },
  { id: 'Thứ 3', label: 'Thứ 3' },
  { id: 'Thứ 4', label: 'Thứ 4' },
  { id: 'Thứ 5', label: 'Thứ 5' },
  { id: 'Thứ 6', label: 'Thứ 6' },
  { id: 'Thứ 7', label: 'Thứ 7' },
  { id: 'Chủ Nhật', label: 'CN' },
];

const TH = {
  border: '1px solid #e5e7eb', padding: '11px 8px',
  fontSize: '13px', fontWeight: 600, color: '#374151',
  textAlign: 'center', background: '#f1f5f9', whiteSpace: 'nowrap',
};
const TD = {
  border: '1px solid #e5e7eb', padding: '6px 8px',
  fontSize: '13px', color: '#374151', verticalAlign: 'top',
};

export default function QuanLyCaLamViec() {
  const [staff, setStaff] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [chucVuList, setChucVuList] = useState([]);
  const [chuyenKhoaList, setChuyenKhoaList] = useState([]); // Danh sách để tra cứu ID chuyên khoa
  const [phongList, setPhongList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterChucVu, setFilterChucVu] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [formData, setFormData] = useState({ phong: '', gioLam: '08:00', gioKetThuc: '17:00' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      // Gọi thêm API lấy danh sách chuyên khoa để có ma_chuyen_khoa
      const [nvData, pcData, cvData, phData, ckData] = await Promise.all([
        getAllEmployeesApi(),
        getAllShiftsApi(),
        getChucVuApi(),
        getPhongApi(),
        getChuyenKhoaApi(),
      ]);
      setStaff(nvData || []);
      setAssignments(pcData || []);
      setChucVuList(cvData || []);
      setPhongList(phData || []);
      setChuyenKhoaList(ckData || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const getShiftsFor = (maNV, dayId) =>
    assignments.filter(a => a.maNhanVien === maNV && a.thu === dayId);




  // --- LOGIC: TÌM DANH SÁCH PHÒNG PHÙ HỢP VỚI NHÂN VIÊN ---
  const getRoomsForEmployee = (employee) => {
    // Nếu không có dữ liệu nhân viên truyền vào, trả về mảng rỗng ngay lập tức
    if (!employee) return [];

    // 1. TÌM ĐĐI TƯỢNG CHỨC VỤ (cvObj) ĐỂ LẤY MÃ ID
    // Lọc trong danh sách chucVuList xem dòng nào có "Tên chức vụ" khớp với tên của nhân viên đang chọn
    const cvObj = chucVuList.find(c =>
      (c.tenChucVu || c.ten_chuc_vu) === (employee.chucVu || employee.chuc_vu)
    );
    // Nếu tìm thấy cvObj thì lấy cột ID (ví dụ: 16), nếu không thấy thì gán là null
    const maCv = cvObj ? (cvObj.id || cvObj.ma_chuc_vu) : null;

    // 2. TÌM ĐĐI TƯỢNG CHUYÊN KHOA (ckObj) ĐỂ LẤY MÃ ID
    // Lọc trong danh sách chuyenKhoaList xem dòng nào có "Tên chuyên khoa" khớp với chuyên khoa của nhân viên
    const ckObj = chuyenKhoaList.find(c =>
      (c.ten_chuyen_khoa || c.tenChuyenKhoa) === (employee.chuyenKhoa || employee.chuyen_khoa)
    );
    // Nếu tìm thấy ckObj thì lấy cột mã chuyên khoa (ví dụ: 1), nếu không thấy gán là null
    const maCk = ckObj ? (ckObj.ma_ch_khoa || ckObj.ma_chuyen_khoa || ckObj.maChuyenKhoa) : null;

    // 3. LOGIC SO KHỚP PHÒNG (GIỐNG JAVA - ƯU TIÊN CHUYÊN KHOA TRƯỚC)

    // ƯU TIÊN 1: Nếu nhân viên CÓ chuyên khoa (ví dụ: Bác sĩ, Trợ lý chuyên khoa)
    if (maCk) {
      // Lọc trong danh sách phòng, lấy tất cả phòng có ma_chuyen_khoa khớp với ID chuyên khoa vừa tìm được
      // Tại đây ta bĐ qua mã chức vụ vì Bác sĩ và Trợ lý ngồi chung phòng chuyên khoa đó
      const roomsByCk = phongList.filter(p =>
        Number(p.ma_ch_khoa || p.ma_chuyen_khoa || p.maChuyenKhoa) === Number(maCk)
      );
      // Nếu tìm thấy ít nhất 1 phòng thuộc chuyên khoa này thì trả về danh sách đó luôn
      if (roomsByCk.length > 0) return roomsByCk;
    }

    // ƯU TIÊN 2: Nếu không tìm thấy theo chuyên khoa HOẶC nhân viên KHÔNG có chuyên khoa (ví dụ: Lễ tân)
    if (maCv) {
      // Lọc trong danh sách phòng dựa trên Mã Chức Vụ (ví dụ: Phòng Lễ tân có ma_chuc_vu là 3)
      return phongList.filter(p =>
        Number(p.ma_chuc_vu || p.maChucVu) === Number(maCv)
      );
    }

    // Nếu cả 2 ưu tiên đều không tìm thấy phòng nào, trả về mảng rỗng
    return [];
  };




  const displayedStaff = filterChucVu
    ? staff.filter(s => (s.chucVu || s.chuc_vu) === filterChucVu)
    : staff;

  const openModal = (employee, day) => {
    const matchedRooms = getRoomsForEmployee(employee);
    // Tự động lấy tên phòng đầu tiên nếu tìm thấy kết quả khớp
    const autoPhong = matchedRooms.length > 0 ? (matchedRooms[0].ten_phong || matchedRooms[0].tenPhong) : '';

    setSelectedCell({ employee, day });
    setFormData({ phong: autoPhong, gioLam: '08:00', gioKetThuc: '17:00' });
  };

  const handleAdd = async () => {
    if (!selectedCell) return;
    if (!formData.phong.trim()) { alert('Vui lòng chọn hoặc nhập phòng!'); return; }
    const body = {
      maNhanVien: selectedCell.employee.maNhanVien || selectedCell.employee.ma_nhan_vien,
      thu: selectedCell.day.id,
      gioLam: formData.gioLam + ':00',
      gioKetThuc: formData.gioKetThuc + ':00',
      phong: formData.phong.trim(),
    };
    try { await createShiftApi(body); fetchData(); setSelectedCell(null); }
    catch (e) { alert(e.message); }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Xác nhận xóa ca làm việc này?")) {
      try { await deleteShiftApi(id); fetchData(); }
      catch (e) { alert(e.message); }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px' }}>
      <div style={{ width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTopColor: '#005bc0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#6b7280' }}>Đang tải bảng phân công...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ margin: '20px', padding: '20px', background: '#fee2e2', borderRadius: '10px', color: '#991b1b' }}>
      <strong>Lỗi:</strong> {error}
      <button onClick={fetchData} style={{ marginLeft: '12px', padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Thử lại</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,#005bc0,#0077e6)', padding: '14px 24px', borderRadius: '10px 10px 0 0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>📋 BẢNG PHÂN CÔNG CA LÀM VIỆC</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>Lọc chức vụ:</span>
            <select
              value={filterChucVu}
              onChange={e => setFilterChucVu(e.target.value)}
              style={{ padding: '6px 14px', border: 'none', borderRadius: '8px', fontSize: '13px', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="" style={{ color: '#111', background: '#fff' }}>👥 Tất cả nhân viên</option>
              {chucVuList.map(cv => (
                <option key={cv.id || cv.ma_chuc_vu} value={cv.tenChucVu || cv.ten_chuc_vu} style={{ color: '#111', background: '#fff' }}>
                  {cv.tenChucVu || cv.ten_chuc_vu}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '0 0 10px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...TH, width: '220px', background: '#e8edf3', textAlign: 'left', paddingLeft: '16px' }}>👤 Nhân Viên</th>
              {DAYS.map(d => <th key={d.id} style={TH}>{d.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {displayedStaff.map(nv => (
              <tr key={nv.maNhanVien || nv.ma_nhan_vien}>
                <td style={{ ...TD, background: '#f8fafc', paddingLeft: '16px', borderLeft: '3px solid #3b82f6' }}>
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '13px' }}>{nv.hoTen || nv.ho_ten}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px', lineHeight: '1.5' }}>
                    <div>ID: NV{String(nv.maNhanVien || nv.ma_nhan_vien).padStart(3, '0')}</div>
                    <div>
                      {(nv.chucVu || nv.chuc_vu) && <span style={{ color: '#059669', fontWeight: 600 }}>{nv.chucVu || nv.chuc_vu}</span>}
                      {(nv.chuyenKhoa || nv.chuyen_khoa) && (
                        <>
                          <span style={{ margin: '0 5px', color: '#cbd5e1' }}>|</span>
                          <span style={{ color: '#0284c7', fontStyle: 'italic', fontWeight: 500 }}>
                            {nv.chuyenKhoa || nv.chuyen_khoa}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </td>

                {DAYS.map(day => {
                  const shifts = getShiftsFor(nv.maNhanVien || nv.ma_nhan_vien, day.id);
                  return (
                    <td key={day.id} style={{ ...TD, cursor: 'pointer', height: '85px', minWidth: '120px' }}
                      onClick={() => openModal(nv, day)}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {shifts.length > 0 ? shifts.map(a => (
                        <div key={a.id} onClick={ev => ev.stopPropagation()}
                          style={{ background: 'linear-gradient(135deg,#dbeafe,#eff6ff)', border: '1px solid #93c5fd', borderRadius: '6px', padding: '5px 8px', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 600, fontSize: '12px', color: '#1e40af' }}>📍 {a.phong || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#3b82f6' }}>
                            🕗 {a.gioLam?.substring(0, 5)} – {a.gioKetThuc?.substring(0, 5)}
                          </div>
                          <button onClick={() => handleRemove(a.id)}
                            style={{ marginTop: '4px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}>Xóa</button>
                        </div>
                      )) : <div style={{ color: '#d1d5db', fontSize: '11px', textAlign: 'center', marginTop: '25px' }}>+ Thêm ca</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM CA */}
      {selectedCell && (() => {
        const { employee, day } = selectedCell;
        const matchedRooms = getRoomsForEmployee(employee);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', width: '450px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
              <div style={{ background: '#005bc0', padding: '18px', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Thêm Ca Làm Việc</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>{employee.hoTen || employee.ho_ten} ({day.label})</div>
                </div>
                <button onClick={() => setSelectedCell(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>✕</button>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px' }}>Bắt đầu: <input type="time" value={formData.gioLam} onChange={e => setFormData({ ...formData, gioLam: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} /></label>
                  <label style={{ fontSize: '13px' }}>Kết thúc: <input type="time" value={formData.gioKetThuc} onChange={e => setFormData({ ...formData, gioKetThuc: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} /></label>
                </div>

                <label style={{ fontSize: '13px', display: 'block', marginBottom: '20px' }}>
                  Phòng làm việc:
                  <select
                    value={formData.phong}
                    onChange={e => setFormData({ ...formData, phong: e.target.value })}
                    style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd', background: matchedRooms.length > 0 ? '#f0fdf4' : '#fff' }}
                  >
                    <option value="">-- Chọn phòng --</option>
                    {matchedRooms.map(p => (
                      <option key={p.ma_phong || p.maPhong} value={p.ten_phong || p.tenPhong}>
                        {p.ten_phong || p.tenPhong}
                      </option>
                    ))}
                    {/* Fallback nếu không khớp logic gợi ý thì hiện toàn bộ danh sách phòng để người dùng tự chọn */}
                    {matchedRooms.length === 0 && phongList.map(p => (
                      <option key={p.ma_phong || p.maPhong} value={p.ten_phong || p.tenPhong}>
                        {p.ten_phong || p.tenPhong}
                      </option>
                    ))}
                  </select>
                  {matchedRooms.length > 0 && <small style={{ color: '#059669', display: 'block', marginTop: '4px' }}>✨ Đã tự động lọc phòng khớp với Chức vụ và Chuyên khoa</small>}
                </label>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedCell(null)} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>Hủy</button>
                  <button onClick={handleAdd} style={{ padding: '8px 25px', borderRadius: '6px', background: '#005bc0', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Lưu Ca</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
