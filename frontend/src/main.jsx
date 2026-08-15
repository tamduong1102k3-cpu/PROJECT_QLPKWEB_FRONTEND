import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ensureAuthenticated } from './api/accountApi'
import { cleanupLegacyTokens } from './api/tokenStore'

/**
 * Khởi động app:
 * - Khi F5/reload, access token trong memory bị mất.
 * - Nếu có user trong localStorage (đã đăng nhập trước), gọi ensureAuthenticated()
 *   để silent refresh qua HttpOnly cookie lấy access token mới vào memory.
 * - Xóa token cũ còn sót trong localStorage (migration 1 lần).
 */
const boot = async () => {
  cleanupLegacyTokens(); // xóa token/refreshToken cũ khỏi localStorage

  // Chỉ refresh nếu có phiên đăng nhập trước đó (user/maNhanVien trong localStorage)
  const hasSession = !!localStorage.getItem('user') || !!localStorage.getItem('maNhanVien');
  if (hasSession) {
    try {
      await ensureAuthenticated();
    } catch (e) {
      // Phiên không hợp lệ -> App sẽ hiển thị trang đăng nhập
      console.warn('Không thể khôi phục phiên:', e);
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

boot();