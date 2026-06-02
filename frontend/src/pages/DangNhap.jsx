import React, { useState } from 'react';
import { loginApi } from '../api/accountApi';

const DangNhap = ({ onForgotPassword, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identity.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginApi({ identity, password });
      
      // LƯU TOKEN VÀ THÔNG TIN VÀO LOCALSTORAGE
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          username: data.username,
          email: data.email,
          maTaiKhoan: data.maTaiKhoan,
          vaiTro: data.role,
          maNhanVien: data.maNhanVien,
          maChuyenKhoa: data.maChuyenKhoa,
          tenChuyenKhoa: data.tenChuyenKhoa
        }));
      }

      // Xử lý khi đăng nhập thành công
      if (onLoginSuccess) {
        onLoginSuccess({
          ...data,
          vaiTro: data.role // Đồng bộ tên trường với App.jsx
        });
      }
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend.');
      } else {
        setErrorMessage(error.message || 'Đăng nhập thất bại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center relative overflow-hidden px-gutter py-xl">
      {/* Abstract Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/10 rounded-full blur-[120px]"></div>
      </div>
      <div className="w-full max-w-[448px] z-10">
        {/* DangNhap Card */}
        <div className="bg-white rounded-xl border border-outline-variant p-xl shadow-sm">
          <div className="flex flex-col items-center mb-lg">
            <div className="mb-md">
              <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              </div>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Đăng nhập vào hệ thống</h1>
            <p className="font-body-sm text-body-sm text-outline">Quản lý phòng khám chuyên nghiệp cùng MedCore</p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-error-container text-error rounded-lg text-sm font-medium border border-red-200">
              {errorMessage}
            </div>
          )}

          <form className="space-y-md" onSubmit={handleLogin}>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="identity">Email/Số điện thoại</label>
              <div className="relative">
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all placeholder:text-outline-variant text-body-md font-body-md" 
                  id="identity" 
                  name="identity" 
                  placeholder="name@clinic.com hoặc 090..." 
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-xs">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Mật khẩu</label>
                <button 
                  type="button" 
                  onClick={onForgotPassword} 
                  className="font-label-sm text-label-sm text-primary hover:underline bg-transparent border-none cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input 
                  className="w-full px-md py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all placeholder:text-outline-variant text-body-md font-body-md" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary" id="remember" type="checkbox"/>
              <label className="ml-2 font-body-sm text-body-sm text-on-surface-variant" htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>
            <button 
              className="w-full py-md bg-primary-container text-white font-label-md text-body-md rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              {!isLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </button>
          </form>
        </div>
        {/* Trust Badges or Security Text */}
        <div className="mt-lg flex justify-center gap-md text-outline">
          <div className="flex items-center gap-1 opacity-70">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="text-label-sm font-label-sm">Bảo mật SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-1 opacity-70">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span className="text-label-sm font-label-sm">Tuân thủ HIPAA</span>
          </div>
        </div>
      </div>
      {/* Optional background image element as per prompt */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3 z-[-1]">
        <img className="w-full h-full object-cover opacity-20 grayscale-50" alt="A clean, high-end medical laboratory setting with soft focus on advanced diagnostic equipment. The lighting is bright and clinical but warm, creating a professional and trustworthy healthcare atmosphere. Subtle blue and white tones dominate the palette, aligning with a modern minimalist aesthetic that emphasizes clarity and innovation in medical technology." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkO1T4M7jPmNEKa4hVYhHT0IQqPGrreXAi_uVYnUf5BDSqK0RPGB-wbPTKDSRHJB5F_1zQuDw5W4FPkPNhjaeL8IdTRsCfesFjc_xPJNEK7lY3VJYHuAyDHmn4JNCRdkwCtYbcLKQxawtobziY2BB7Y1HjU57ocRGA8ibhDvSOnfq2txivjHdQMFX37-NypGp8qNUDf440iq64UZJsP0HO0CZOtGYFF9fg3xpJxZDzM8C3iqD0_mHqPLtYiWYKPul21Q-Rw-8n28nz"/>
      </div>
    </main>
  );
};

export default DangNhap;

