import fetchClient from './fetchClient';
const API_URL = 'http://localhost:8080/api/phan-cong';

/**
 * Lấy tất cả danh sách phân công ca làm
 */
export const getAllShiftsApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể tải bảng phân công`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getAllShiftsApi:", error);
    throw error;
  }
};

/**
 * Tạo mới một ca làm việc
 */
export const createShiftApi = async (data) => {
  try {
    const response = await fetchClient(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể tạo ca làm việc");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in createShiftApi:", error);
    throw error;
  }
};

/**
 * Xóa một ca làm việc theo ID
 */
export const deleteShiftApi = async (id) => {
  try {
    const response = await fetchClient(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error("Không thể xóa ca làm việc");
    }
    return true;
  } catch (error) {
    console.error("Error in deleteShiftApi:", error);
    throw error;
  }
};

// Giữ lại các hàm khác của bạn nếu cần
export const getWorkingTodayApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}/working-today`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể lấy lịch trực hôm nay`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getWorkingTodayApi:", error);
    throw error;
  }
};

/**
 * Lấy phòng làm việc hiện tại của một nhân viên dựa trên thời gian thực
 * Endpoint: GET /api/phan-cong/current-room/{maNhanVien}
 */
export const getCurrentRoomApi = async (maNhanVien) => {
  try {
    const response = await fetchClient(`${API_URL}/current-room/${maNhanVien}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể lấy thông tin phòng hiện tại`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getCurrentRoomApi:", error);
    throw error;
  }
};