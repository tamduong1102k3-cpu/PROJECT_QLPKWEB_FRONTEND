import fetchClient from './fetchClient';
const API_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/phieu-kham';

/**
 * GET /
 */
export const getAllApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}`, {
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
    console.error("Error in getAllApi:", error);
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
    console.error("Error in updateApi:", error);
    throw error;
  }
};

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
 * POST /full-check-in
 */
export const fullCheckInApi = async data => {
  try {
    const response = await fetchClient(`${API_URL}/full-check-in`, {
      method: 'POST',
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
    console.error("Error in fullCheckInApi:", error);
    throw error;
  }
};

/**
 * POST /accept-patient/{registrationId}
 */
export const acceptPatientApi = async registrationId => {
  try {
    const response = await fetchClient(`${API_URL}/accept-patient/${registrationId}`, {
      method: 'POST'
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
    console.error("Error in acceptPatientApi:", error);
    throw error;
  }
};

/**
 * GET /history
 */
export const getHistoryApi = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_URL}/history?${queryString}` : `${API_URL}/history`;
    const response = await fetchClient(url, {
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
    console.error("Error in getHistoryApi:", error);
    throw error;
  }
};

/**
 * POST /finish/{maPhieuKham}
 */
export const finishConsultationApi = async maPhieuKham => {
  try {
    const response = await fetchClient(`${API_URL}/finish/${maPhieuKham}`, {
      method: 'POST'
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
    console.error("Error in finishConsultationApi:", error);
    throw error;
  }
};

export const getAssistantHistoryApi = async (maChuyenKhoa) => {
  try {
    const response = await fetchClient(`${API_URL}/assistant-history?maChuyenKhoa=${maChuyenKhoa}`, {
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
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error in getAssistantHistoryApi:", error);
    throw error;
  }
};

/**
 * PUT /{maPhieuKham}/status-cls
 * Cập nhật trạng thái phiếu khám và đăng ký sang CHO_CLS
 * Dùng khi Bác sĩ chỉ định dịch vụ CLS
 */
export const updateToClsApi = async (maPhieuKham) => {
  try {
    const response = await fetchClient(`${API_URL}/${maPhieuKham}/status-cls`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
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
    console.error("Error in updateToClsApi:", error);
    throw error;
  }
};

/**
 * PUT /{maPhieuKham}/status-waiting
 * Cập nhật trạng thái phiếu khám và đăng ký sang CHO_BAC_SI
 * Dùng khi Trợ lý hoàn tất đo sinh hiệu/khám RHM sơ bộ
 */
export const updateToWaitingForDoctorApi = async (maPhieuKham) => {
  try {
    const response = await fetchClient(`${API_URL}/${maPhieuKham}/status-waiting`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
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
    console.error("Error in updateToWaitingForDoctorApi:", error);
    throw error;
  }
};

/**
 * GET /api/phieu-kham/{id}/available-cls-results
 */
export const getAvailableClsResultsApi = async id => {
  try {
    const response = await fetchClient(`${API_URL}/${id}/available-cls-results`, {
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
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error in getAvailableClsResultsApi:", error);
    throw error;
  }
};

/**
 * GET /specialty-history
 */
/**
 * POST /accept-cls-patient/{registrationId}
 * KTV tiếp nhận bệnh nhân CLS: tạo PhieuKham
 */
export const acceptClsPatientApi = async (registrationId, technicianId) => {
  try {
    const response = await fetchClient(`${API_URL}/accept-cls-patient/${registrationId}?technicianId=${technicianId}`, {
      method: 'POST'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi: ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error in acceptClsPatientApi:", error);
    throw error;
  }
};

/**
 * POST /{maPhieuKham}/tech-confirm-cls
 * Kỹ thuật viên xác nhận dịch vụ CLS: tạo TiepNhanCls + PhieuChiDinh + ChiTietChiDinh
 */
export const techConfirmClsApi = async (maPhieuKham, technicianId, data) => {
  try {
    const response = await fetchClient(`${API_URL}/${maPhieuKham}/tech-confirm-cls?technicianId=${technicianId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi: ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error in techConfirmClsApi:", error);
    throw error;
  }
};

/**
 * POST /{maPhieuKham}/confirm-cls
 * Bác sĩ CLS xác nhận thực hiện dịch vụ: tạo PhieuChiDinh
 */
export const confirmClsServiceApi = async (maPhieuKham, doctorId) => {
  try {
    const response = await fetchClient(`${API_URL}/${maPhieuKham}/confirm-cls?doctorId=${doctorId}`, {
      method: 'POST'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi: ${response.status}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error in confirmClsServiceApi:", error);
    throw error;
  }
};

/**
 * GET /pending-cls-confirmation
 * Lấy danh sách bệnh nhân CLS chờ bác sĩ xác nhận
 */
export const getPendingClsConfirmationApi = async (maChuyenKhoa) => {
  try {
    const response = await fetchClient(`${API_URL}/pending-cls-confirmation?maChuyenKhoa=${maChuyenKhoa}`, {
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
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error in getPendingClsConfirmationApi:", error);
    throw error;
  }
};

export const getSpecialtyHistoryApi = async maChuyenKhoa => {
  try {
    const response = await fetchClient(`${API_URL}/specialty-history?maChuyenKhoa=${maChuyenKhoa}`, {
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
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error in getSpecialtyHistoryApi:", error);
    throw error;
  }
};
