/**
 * fetchClient - wrapper cho fetch() tự động gắn JWT token và handle 401 auto-logout
 */
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

/**
 * fetchClient(url, options) - tự động gắn JWT và handle 401
 */
const fetchClient = async (url, options = {}) => {
  // Tự động gắn Authorization header
  const enhancedOptions = {
    ...options,
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
        console.error("Method:", options.method || 'GET');
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
  }
};

export default fetchClient;
export { handleUnauthorized };