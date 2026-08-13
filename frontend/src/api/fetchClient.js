/**
 * fetchClient - wrapper cho fetch() tự động gắn JWT token,
 * handle 401 auto-refresh + queue, và tự động bật/tắt loading overlay.
 * 
 * Khi gặp 401, thay vì logout ngay, tự động gọi refresh token.
 * Nếu nhiều request 401 cùng lúc, chỉ gọi refresh 1 lần, các request khác chờ.
 */
import { loadingManager } from './loadingManager';

let isRefreshing = false;
let refreshSubscribers = [];

// Hàng đợi các request đang chờ refresh xong
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const refreshTokenRequest = async () => {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) return null;

  try {
    // Xác định endpoint dựa trên token type (patient hay employee)
    // decode JWT để biết, fallback dùng employee nếu không decode được
    let endpoint = '/api/taikhoan/refresh-token';
    try {
      const payload = JSON.parse(atob(currentRefreshToken.split('.')[1]));
      if (payload.tokenType === 'refresh' && payload.maTaiKhoanBn !== undefined) {
        endpoint = '/api/tai-khoan-benh-nhan/refresh-token';
      }
    } catch (e) {
      // fallback: employee endpoint
    }

    const baseUrl = localStorage.getItem('apiBaseUrl') || 'https://qlpk-backend-spring-boot.onrender.com';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken })
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data.token;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  } else {
    window.location.reload();
  }
};

// Map method -> message tiếng Việt cho loading overlay
const getLoadingMessage = (method, url) => {
  const baseMsg = {
    GET: 'Đang tải dữ liệu...',
    POST: 'Đang lưu dữ liệu...',
    PUT: 'Đang cập nhật...',
    DELETE: 'Đang xóa...',
    PATCH: 'Đang cập nhật...'
  };
  return baseMsg[method] || 'Đang xử lý...';
};

/**
 * fetchClient(url, options) - tự động gắn JWT, handle 401 + refresh queue, và bật loading overlay
 * 
 * options.skipLoading = true để bỏ qua loading overlay (dùng cho background polling)
 * options.skipRefresh = true để bỏ qua auto-refresh (dùng cho chính request refresh token)
 */
const fetchClient = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const defaultSkip = method === 'GET';
  const skipLoading = options.skipLoading !== undefined ? options.skipLoading === true : defaultSkip;
  
  if (!skipLoading) {
    loadingManager.show(getLoadingMessage(method, url));
  }

  const { skipLoading: _, ...cleanOptions } = options;
  const enhancedOptions = {
    ...cleanOptions,
    headers: {
      ...(options.headers || {}),
      ...getAuthHeaders()
    }
  };

  try {
    const response = await fetch(url, enhancedOptions);

    // Nếu 401 và không phải chính request refresh, thử refresh + retry
    if (response.status === 401 && !options.skipRefresh) {
      // Bỏ qua nếu là request login
      if (url.includes('/login')) {
        handleUnauthorized();
        throw new Error('Sai tài khoản hoặc mật khẩu!');
      }

      // Nếu chưa có refresh token thì logout luôn
      if (!localStorage.getItem('refreshToken')) {
        handleUnauthorized();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Queue cơ chế: nếu đang refresh thì chờ, nếu chưa thì refresh
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshTokenRequest();

        if (newToken) {
          // Refresh thành công
          isRefreshing = false;
          onRefreshed(newToken);
          // Retry request ban đầu với token mới
          const retryOptions = {
            ...cleanOptions,
            skipRefresh: true, // tránh loop refresh
            headers: {
              ...(options.headers || {}),
              'Authorization': `Bearer ${newToken}`
            }
          };
          const retryResponse = await fetch(url, retryOptions);
          if (!skipLoading) loadingManager.hide();
          return retryResponse;
        } else {
          // Refresh thất bại
          isRefreshing = false;
          refreshSubscribers = [];
          handleUnauthorized();
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      } else {
        // Đang có request refresh khác chạy, chờ token mới
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(async (newToken) => {
            try {
              const retryOptions = {
                ...cleanOptions,
                skipRefresh: true,
                headers: {
                  ...(options.headers || {}),
                  'Authorization': `Bearer ${newToken}`
                }
              };
              const retryResponse = await fetch(url, retryOptions);
              if (!skipLoading) loadingManager.hide();
              resolve(retryResponse);
            } catch (err) {
              if (!skipLoading) loadingManager.hide();
              reject(err);
            }
          });
        });
      }
    }

    // Handle 403
    if (response.status === 403) {
      try {
        const cloned = response.clone();
        const bodyText = await cloned.text();
        let bodyJson = null;
        try { bodyJson = JSON.parse(bodyText); } catch (e) {}
        
        if (bodyJson && bodyJson.message && bodyJson.message.includes('quyền')) {
          throw new Error(bodyJson.message);
        }
      } catch (e) {
        if (e.message && e.message.includes('quyền')) throw e;
      }
      
      handleUnauthorized();
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    return response;
  } catch (error) {
    if (error.message === 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') {
      throw error;
    }
    throw error;
  } finally {
    if (!skipLoading) {
      loadingManager.hide();
    }
  }
};

export default fetchClient;
export { handleUnauthorized };