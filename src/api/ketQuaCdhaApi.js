import fetchClient from './fetchClient';
const API_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/ket-qua-cdha';

// Lấy kết quả CĐHA dựa trên mã chi tiết chỉ định (Dùng cho Modal xem ảnh/kết quả)
// ĐƯỜNG DẪN MỚI: /api/ket-qua-cdha/chi-tiet/{id}
export const getCdhaResultApi = async (detailId) => {
  const res = await fetchClient(`${API_URL}/chi-tiet/${detailId}`);
  if (!res.ok) return null;
  return await res.json();
};

// Kỹ thuật viên nộp kết quả (Lưu vào bảng ket_qua_cdha)
export const submitCdhaResultApi = async (data) => {
  const res = await fetchClient(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res;
};

// Bác sĩ duyệt kết quả
export const approveCdhaApi = async (id) => {
  const res = await fetchClient(`${API_URL}/${id}/approve`, { method: 'PUT' });
  return await res.json();
};

// Lấy danh sách chờ duyệt trong ngày
export const getTodayResultsApi = async () => {
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
    console.error("Error in getTodayResultsApi:", error);
    throw error;
  }
};

// Upload ảnh lên server (Nên để ở một service dùng chung hoặc ở đây)
export const uploadImageApi = async (formData) => {
    const res = await fetchClient(`${API_URL}/upload-image`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
};