import fetchClient from './fetchClient';
const API_URL = 'http://localhost:8080/api/dang-ky';

/**
 * GET /today
 */
export const getTodayApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}/today`, {
      method: 'GET'
    });
    if (!response.ok) {
      let errorMsg = `Lỗi: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error in getTodayApi:", error);
    throw error;
  }
};

/**
 * PUT /{id}/status
 */
export const updateStatusApi = async (id, data) => {
  try {
    const response = await fetchClient(`${API_URL}/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      let errorMsg = `Lỗi: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error in updateStatusApi:", error);
    throw error;
  }
};
