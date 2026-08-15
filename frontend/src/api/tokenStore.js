/**
 * tokenStore.js
 * Lưu Access Token TRONG MEMORY (JavaScript module singleton).
 * KHÔNG lưu vào localStorage/sessionStorage để tránh bị đánh cắp qua XSS.
 *
 * Refresh Token (web) nằm trong HttpOnly cookie do backend quản lý.
 */
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

/**
 * Xóa toàn bộ token cũ còn sót trong localStorage (migration 1 lần).
 * Sau kiến trúc mới, token/refreshToken KHÔNG còn được lưu ở đây.
 */
export const cleanupLegacyTokens = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  } catch (e) {
    // ignore
  }
};