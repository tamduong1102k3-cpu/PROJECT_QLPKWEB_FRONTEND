import React, { useState } from 'react';
import { firstTimeChangePasswordApi, validateSessionApi } from '../api/accountApi';
import { useNotification } from '../components/NotificationContext';

const BatBuocDoiMatKhau = ({ user, onPasswordChanged, onLogout }) => {
  const { showSuccess } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (newPassword.length < 5) {
      setError('Mật khẩu mới phải có ít nhất 5 ký tự!');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Mật khẩu mới không được trùng mật khẩu hiện tại!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await firstTimeChangePasswordApi({ currentPassword, newPassword });
      const session = await validateSessionApi();
      if (session?.mustChangePassword !== false) {
        throw new Error('Chưa thể xác nhận trạng thái mật khẩu mới. Vui lòng thử lại.');
      }
      showSuccess('Đổi mật khẩu thành công!');
      onPasswordChanged(session);
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden px-gutter py-xl w-full">
      <div className="w-full max-w-[448px] z-10 animate-fade-in">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl shadow-sm">
          <div className="flex flex-col items-center mb-lg">
            <div className="mb-md">
              <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
              </div>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs text-center">Đổi Mật Khẩu Lần Đầu</h2>
            <p className="font-body-sm text-body-sm text-outline text-center">Vì lý do bảo mật, bạn bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.</p>
          </div>

          {error && (
            <div className="mb-md p-3 bg-error-container text-error rounded-lg text-body-sm font-medium border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Mật khẩu hiện tại</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all placeholder:text-outline-variant text-body-md font-body-md"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Mật khẩu mới</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input
                  type="password"
                  required
                  minLength={5}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all placeholder:text-outline-variant text-body-md font-body-md"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs">Nhập lại mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock_check</span>
                <input
                  type="password"
                  required
                  minLength={5}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all placeholder:text-outline-variant text-body-md font-body-md"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-md bg-primary-container text-white font-label-md text-body-md rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : 'Lưu mật khẩu mới'}
            </button>
          </form>
          <button
            type="button"
            onClick={onLogout}
            className="w-full mt-md py-sm text-outline hover:text-on-surface font-label-md transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatBuocDoiMatKhau;
