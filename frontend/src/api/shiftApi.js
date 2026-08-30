import fetchClient from './fetchClient';
const API_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/phan-cong';
const CA_LAM_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/ca-lam';

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

/**
 * Cập nhật ca làm việc theo ID
 */
export const updateShiftApi = async (id, data) => {
  try {
    const response = await fetchClient(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể cập nhật ca làm việc");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in updateShiftApi:", error);
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

/**
 * Lấy lịch làm việc (các thứ trong tuần) của một nhân viên theo mã nhân viên
 * Endpoint: GET /api/phan-cong/by-nhan-vien/{maNhanVien}
 */
export const getShiftsByNhanVienApi = async (maNhanVien) => {
  try {
    const response = await fetchClient(`${API_URL}/by-nhan-vien/${maNhanVien}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể lấy lịch làm việc của nhân viên`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getShiftsByNhanVienApi:", error);
    throw error;
  }
};

/**
 * Lấy lịch cả tháng đã gộp (ca mặc định + ngoại lệ) của 1 nhân viên.
 * GET /api/ca-lam/thang?maNhanVien=&nam=&thang=
 */
export const getMonthScheduleApi = async (maNhanVien, nam, thang) => {
  try {
    const response = await fetchClient(`${CA_LAM_URL}/thang?maNhanVien=${maNhanVien}&nam=${nam}&thang=${thang}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể tải lịch tháng`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getMonthScheduleApi:', error);
    throw error;
  }
};

/**
 * Tạo ngoại lệ ca làm việc (nghỉ phép / đổi ca / thêm ca) cho 1 ngày.
 * POST /api/ca-lam/ngoai-le
 */
export const createExceptionApi = async (payload) => {
  try {
    const response = await fetchClient(`${CA_LAM_URL}/ngoai-le`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Lỗi: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in createExceptionApi:', error);
    throw error;
  }
};

/**
 * Cập nhật ngoại lệ ca làm việc theo id.
 * PUT /api/ca-lam/ngoai-le/{id}
 */
export const updateExceptionApi = async (id, payload) => {
  try {
    const response = await fetchClient(`${CA_LAM_URL}/ngoai-le/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Lỗi: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in updateExceptionApi:', error);
    throw error;
  }
};

/**
 * Xóa ngoại lệ ca làm việc theo id.
 * DELETE /api/ca-lam/ngoai-le/{id}
 */
export const deleteExceptionApi = async (id) => {
  try {
    const response = await fetchClient(`${CA_LAM_URL}/ngoai-le/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể xóa ngoại lệ`);
    }
    return true;
  } catch (error) {
    console.error('Error in deleteExceptionApi:', error);
    throw error;
  }
};