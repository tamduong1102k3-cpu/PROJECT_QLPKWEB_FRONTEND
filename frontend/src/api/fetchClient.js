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