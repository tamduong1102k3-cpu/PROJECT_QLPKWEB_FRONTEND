import fetchClient from './fetchClient';
const API_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/lich-kham';

export const getAllApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}`, { method: 'GET' });
    if (!response.ok) {
      let errorMsg = `Lỗi: ${response.status}`;
      try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
      throw new Error(errorMsg);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('Error in lichKhamApi.getAllApi:', error);
    throw error;
  }
};

export const updateTrangThaiApi = async (id, trangThai) => {
  try {
    const response = await fetchClient(`${API_URL}/${id}/trang-thai`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trangThai })
    });
    if (!response.ok) {
      let errorMsg = `Lỗi: ${response.status}`;
      try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
      throw new Error(errorMsg);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('Error in lichKhamApi.updateTrangThaiApi:', error);
    throw error;
  }
};