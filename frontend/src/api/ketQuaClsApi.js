import fetchClient from './fetchClient';
const API_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/ket-qua-cls';

/**
 * GET /api/ket-qua-cls/{chiDinhId}
 */
export const getDetailClsResultApi = async chiDinhId => {
  try {
    const response = await fetchClient(`${API_URL}/${chiDinhId}`, {
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
    console.error("Error in getDetailClsResultApi:", error);
    throw error;
  }
};
