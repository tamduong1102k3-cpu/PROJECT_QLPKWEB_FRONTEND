/**
 * fetchClient - wrapper cho fetch() tự động gắn JWT token, handle 401 auto-logout,
 * và tự động bật/tắt loading overlay để chống double-click khi gọi API.
 */
import { loadingManager } from './loadingManager';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleUnauthorized = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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
 * fetchClient(url, options) - tự động gắn JWT, handle 401, và bật loading overlay
 * 
 * options.skipLoading = true để bỏ qua loading overlay (dùng cho background polling)
 */
const fetchClient = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const skipLoading = options.skipLoading === true;
  
  // Tự động bật loading overlay (trừ khi skipLoading = true)
  if (!skipLoading) {
    loadingManager.show(getLoadingMessage(method, url));
  }

  // Tự động gắn Authorization header (loại bỏ skipLoading trước khi truyền xuống fetch)
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

    // Log chi tiết response khi bị 403
    if (response.status === 403) {
      try {
        const cloned = response.clone();
        const textBody = await cloned.text();
        console.error("=== 403 FORBIDDEN DEBUG ===");
        console.error("URL:", url);
        console.error("Method:", method);
        console.error("Status text:", response.statusText);
        console.error("Response body:", textBody || "(empty)");
        console.error("===========================");
      } catch (e) {
        console.error("Could not read 403 response body:", e);
      }
    }

    // Handle 401 - token hết hạn hoặc không hợp lệ
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    return response;
  } catch (error) {
    // Nếu đã là lỗi handleUnauthorized thì throw luôn
    if (error.message === 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') {
      throw error;
    }
    // Network error hoặc lỗi khác
    throw error;
  } finally {
    // Tự động tắt loading overlay (trừ khi skipLoading = true)
    if (!skipLoading) {
      loadingManager.hide();
    }
  }
};

export default fetchClient;
export { handleUnauthorized };
