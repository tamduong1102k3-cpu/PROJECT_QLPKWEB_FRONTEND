import fetchClient from './fetchClient';

const API_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/taikhoan';

/**
 * Helper: parse response text hoặc JSON
 */
const handleResponse = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

/**
 * Helper: xử lý lỗi response
 */
const handleError = async (response) => {
  let errorMsg = `Lỗi: ${response.status}`;
  try {
    const text = await response.text();
    if (text) {
      try {
        const errorData = JSON.parse(text);
        errorMsg = errorData.message || errorData || errorMsg;
      } catch {
        errorMsg = text;
      }
    }
  } catch (e) {}
  throw new Error(errorMsg);
};

/**
 * GET /
 */
export const getAllApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}`, { method: 'GET' });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in getAllApi:", error);
    throw error;
  }
};

/**
 * GET /{id}
 */
export const getByIdApi = async id => {
  try {
    const response = await fetchClient(`${API_URL}/${id}`, { method: 'GET' });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in getByIdApi:", error);
    throw error;
  }
};

/**
 * POST /
 */
export const createApi = async data => {
  try {
    const response = await fetchClient(`${API_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in createApi:", error);
    throw error;
  }
};

/**
 * PUT /{id}
 */
export const updateApi = async (id, data) => {
  try {
    const response = await fetchClient(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in updateApi:", error);
    throw error;
  }
};

/**
 * DELETE /{id}
 */
export const deleteApi = async id => {
  try {
    const response = await fetchClient(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in deleteApi:", error);
    throw error;
  }
};

/**
 * POST /login
 * Không cần JWT (public endpoint)
 */
export const loginApi = async data => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in loginApi:", error);
    throw error;
  }
};

/**
 * POST /forgot-password/send-otp
 * Không cần JWT (public endpoint)
 */
export const sendOtpApi = async (data) => {
  // Nếu data là string (email) thì wrap thành object, nếu không thì giữ nguyên object
  const payload = typeof data === 'string' ? { email: data } : data;
  
  // Tạo AbortController để timeout sau 30 giây (tránh bị treo do Render.com cold start)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(`${API_URL}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error in sendOtpApi:", error);
    if (error.name === 'AbortError') {
      throw new Error('Yêu cầu bị timeout. Vui lòng thử lại sau.');
    }
    throw error;
  }
};

/**
 * POST /forgot-password/reset
 * Không cần JWT (public endpoint)
 */
export const resetPasswordApi = async data => {
  try {
    const response = await fetch(`${API_URL}/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in resetPasswordApi:", error);
    throw error;
  }
};

/**
 * POST /forgot-password/verify-otp
 * Không cần JWT (public endpoint)
 */
export const verifyOtpApi = async (data) => {
  try {
    const payload = typeof data === 'object' ? data : { email: data.email, otp: data.otp };
    const response = await fetch(`${API_URL}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in verifyOtpApi:", error);
    throw error;
  }
};

/**
 * POST /first-time-change-password
 * Không cần JWT (public endpoint)
 */
export const firstTimeChangePasswordApi = async data => {
  try {
    const response = await fetch(`${API_URL}/first-time-change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in firstTimeChangePasswordApi:", error);
    throw error;
  }
};

/**
 * PUT /{id}/change-password
 * Cần JWT (yêu cầu xác thực)
 */
export const changePasswordApi = async (id, data) => {
  try {
    const response = await fetchClient(`${API_URL}/${id}/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) await handleError(response);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in changePasswordApi:", error);
    throw error;
  }
};