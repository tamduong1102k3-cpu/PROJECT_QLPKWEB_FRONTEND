import { apiClient } from "../../../api/apiClient";
import { createApi } from '../../../api/benhNhanApi';
import React, { useState, useEffect } from 'react';

const DangKyBenhNhan = ({
  onCancel,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: true,
    soDienThoai: '',
    cccd: '',
    email: '',
    diaChi: '',
    nhomMau: '',
    diUngThuoc: '',
    nguoiGiamHo: '',
    soDienThoaiNguoiGiamHo: '',
    ngheNghiep: '',
    ghiChu: ''
  });
  const [errors, setErrors] = useState({});
  const validate = () => {
    const newErrors = {};
    if (!formData.hoTen.trim()) newErrors.hoTen = 'Họ tên không được để trống';
    if (!formData.ngaySinh) newErrors.ngaySinh = 'Vui lòng chọn ngày sinh';
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.soDienThoai) {
      newErrors.soDienThoai = 'Số điện thoại là bắt buộc';
    } else if (!phoneRegex.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại phải có đúng 10 chữ số';
    }
    if (formData.cccd && !/^[0-9]{12}$/.test(formData.cccd)) {
      newErrors.cccd = 'CCCD phải có đúng 12 chữ số';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Xóa lỗi của trường đang nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await apiClient(`${API_BASE}/benh-nhan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = createdData;
        onSuccess(data);
      } else {
        const errorText = await response.text().catch(() => 'Không thể đọc nội dung lỗi');
        let errorMessage = errorText;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorText;
        } catch (e) {
          // Không phải JSON, giữ nguyên text
        }
        alert(`Lỗi đăng ký: ${errorMessage}`);
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
    }
  };
  return <div className="bg-white">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Đăng ký Hồ sơ mới</h2>
          <p className="text-sm text-gray-500 font-medium">Vui lòng nhập chính xác thông tin để tránh trùng lặp</p>
        </div>
        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded-xl transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Thông tin cá nhân</h3>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Họ và Tên *</label>
              <input name="hoTen" value={formData.hoTen} onChange={handleChange} className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.hoTen ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold`} placeholder="VD: NGUYEN VAN A" />
              {errors.hoTen && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.hoTen}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Ngày Sinh *</label>
                <input name="ngaySinh" type="date" value={formData.ngaySinh} onChange={handleChange} className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.ngaySinh ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold`} />
                {errors.ngaySinh && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.ngaySinh}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Giới Tính</label>
                <select name="gioiTinh" value={formData.gioiTinh} onChange={e => setFormData({
                ...formData,
                gioiTinh: e.target.value === 'true'
              })} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold">
                  <option value="true">Nam</option>
                  <option value="false">Nữ</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CCCD / CMND</label>
              <input name="cccd" value={formData.cccd} onChange={handleChange} className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.cccd ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold`} placeholder="001200012345" />
              {errors.cccd && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.cccd}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Số Điện Thoại *</label>
              <input name="soDienThoai" value={formData.soDienThoai} onChange={handleChange} className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.soDienThoai ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-primary`} placeholder="0987654321" />
              {errors.soDienThoai && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.soDienThoai}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Thông tin bổ sung</h3>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className={`w-full px-5 py-3.5 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold`} placeholder="benhnhan@example.com" />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Địa Chỉ</label>
              <input name="diaChi" value={formData.diaChi} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold" placeholder="TP. Hồ Chí Minh..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nhóm Máu</label>
                  <input name="nhomMau" value={formData.nhomMau} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold" placeholder="O+" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">NghĐ nghiệp</label>
                  <input name="ngheNghiep" value={formData.ngheNghiep} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold" placeholder="Tự do..." />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Người giám hộ</label>
                <input name="nguoiGiamHo" value={formData.nguoiGiamHo} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold" placeholder="Tên người giám hộ" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">SĐT người giám hộ</label>
                <input name="soDienThoaiNguoiGiamHo" value={formData.soDienThoaiNguoiGiamHo} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold" placeholder="09xxxxxxxx" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Dị ứng thuốc</label>
              <input name="diUngThuoc" value={formData.diUngThuoc} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-red-500" placeholder="Không..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-50">
          <button type="button" onClick={onCancel} className="px-8 py-3.5 text-gray-400 font-bold hover:text-gray-600 transition-colors">
            Quay lại
          </button>
          <button type="submit" className="px-12 py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">
            TIẾP TỤC ĐẾN CHECK-IN
          </button>
        </div>
      </form>
    </div>;
};
export default DangKyBenhNhan;
