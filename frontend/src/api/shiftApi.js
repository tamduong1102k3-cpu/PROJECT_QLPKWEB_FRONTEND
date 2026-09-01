import fetchClient from "./fetchClient";
const API_URL = "https://qlpk-backend-spring-boot.onrender.com/api/phan-cong";
const CA_LAM_URL = "https://qlpk-backend-spring-boot.onrender.com/api/ca-lam";

/**
 * Lấy tất cả danh sách phân công ca làm
 */
export const getAllShiftsApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}`, {
      method: "GET",
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
const parseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    const cleanText = text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleanText ? { message: cleanText } : null;
  }
};

const getErrorMessage = async (response, fallback) => {
  try {
    const errorData = await parseJsonResponse(response);
    if (errorData?.message) return errorData.message;
    if (typeof errorData === "string" && errorData.trim()) return errorData;
    if (response && response.status)
      return `${fallback} (HTTP ${response.status})`;
    return fallback;
  } catch (error) {
    return fallback;
  }
};

const normalizeExceptionPayload = (payload) => {
  if (!payload || !payload.loai) return payload;

  const mapped = {
    ...payload,
    kieuPhanCong: "THEO_NGAY",
    hanhDong:
      payload.loai === "NGHI_PHEP"
        ? "NGHI_PHEP"
        : payload.loai === "DOI_CA"
          ? "THAY_THE"
          : "THEM",
    maCa:
      payload.maCaMacDinh ??
      payload.maCa ??
      (Array.isArray(payload.caIds) ? payload.caIds[0] : null),
    phong: payload.loai === "NGHI_PHEP" ? null : payload.phong,
    lyDo: payload.lyDo ?? null,
  };

  if (payload.loai === "NGHI_PHEP") {
    return {
      ...mapped,
      maCa: null,
      gioLam: null,
      gioKetThuc: null,
    };
  }

  if (mapped.maCa !== null && mapped.maCa !== undefined) {
    return {
      ...mapped,
      maCa: Number(mapped.maCa),
      gioLam: payload.gioLam || null,
      gioKetThuc: payload.gioKetThuc || null,
    };
  }

  return {
    ...mapped,
    gioLam: payload.gioLam || null,
    gioKetThuc: payload.gioKetThuc || null,
  };
};

const normalizeMonthData = (data) => {
  if (!data || !Array.isArray(data.days)) return data;

  return {
    ...data,
    days: data.days.map((day) => {
      const theoNgay = Array.isArray(day.theoNgay)
        ? day.theoNgay
        : Array.isArray(day.ngoaiLe)
          ? day.ngoaiLe
          : [];

      return {
        ...day,
        ngoaiLe: theoNgay.map((item) => ({
          ...item,
          loai:
            item.loai ??
            (item.hanhDong === "NGHI_PHEP"
              ? "NGHI_PHEP"
              : item.hanhDong === "THAY_THE"
                ? "DOI_CA"
                : "THEM_CA"),
          maCaMacDinh:
            item.maCaMacDinh ?? item.maCa ?? item.ca?.id ?? null,
          gioLam: item.gioLam ?? item.ca?.gioBatDau ?? null,
          gioKetThuc: item.gioKetThuc ?? item.ca?.gioKetThuc ?? null,
        })),
      };
    }),
  };
};

export const createShiftApi = async (data) => {
  try {
    const response = await fetchClient(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Không thể tạo ca làm việc"),
      );
    }
    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Error in createShiftApi:", error);
    throw error;
  }
};

export const createDefaultShiftMonthApi = async (payload) => {
  try {
    const response = await fetchClient(`${API_URL}/default-month`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Không thể tạo ca mặc định cho tháng"),
      );
    }
    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Error in createDefaultShiftMonthApi:", error);
    throw error;
  }
};

export const deleteDefaultShiftByWeekdayApi = async ({
  maNhanVien,
  nam,
  thang,
  thu,
}) => {
  try {
    const params = new URLSearchParams({
      maNhanVien: String(maNhanVien),
      nam: String(nam),
      thang: String(thang),
      thu,
    });
    const response = await fetchClient(
      `${API_URL}/default-month?${params.toString()}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Không thể xóa ca mặc định theo thứ trong tháng",
        ),
      );
    }
    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Error in deleteDefaultShiftByWeekdayApi:", error);
    throw error;
  }
};

/**
 * Xóa một ca làm việc theo ID
 */
export const deleteShiftApi = async (id) => {
  try {
    const response = await fetchClient(`${API_URL}/${id}`, {
      method: "DELETE",
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
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "Không thể cập nhật ca làm việc"),
      );
    }
    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Error in updateShiftApi:", error);
    throw error;
  }
};

// Giữ lại các hàm khác của bạn nếu cần
export const getWorkingTodayApi = async () => {
  try {
    const response = await fetchClient(`${API_URL}/working-today`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(
        `Lỗi: ${response.status} - Không thể lấy lịch trực hôm nay`,
      );
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
    const response = await fetchClient(
      `${API_URL}/current-room/${maNhanVien}`,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error(
        `Lỗi: ${response.status} - Không thể lấy thông tin phòng hiện tại`,
      );
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
    const response = await fetchClient(
      `${API_URL}/by-nhan-vien/${maNhanVien}`,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error(
        `Lỗi: ${response.status} - Không thể lấy lịch làm việc của nhân viên`,
      );
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
    const response = await fetchClient(
      `${CA_LAM_URL}/thang?maNhanVien=${maNhanVien}&nam=${nam}&thang=${thang}`,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể tải lịch tháng`);
    }
    const raw = await response.json();
    return normalizeMonthData(raw);
  } catch (error) {
    console.error("Error in getMonthScheduleApi:", error);
    throw error;
  }
};

/**
 * Tạo ngoại lệ ca làm việc (nghỉ phép / đổi ca / thêm ca) cho 1 ngày.
 * POST /api/ca-lam/ngoai-le
 */
export const createExceptionApi = async (payload) => {
  try {
    const mapped = normalizeExceptionPayload(payload);
    const response = await fetchClient(`${CA_LAM_URL}/ngoai-le`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped),
    });
    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, `Lỗi: ${response.status}`),
      );
    }
    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Error in createExceptionApi:", error);
    throw error;
  }
};

/**
 * Cập nhật ngoại lệ ca làm việc theo id.
 * PUT /api/ca-lam/ngoai-le/{id}
 */
export const updateExceptionApi = async (id, payload) => {
  try {
    const mapped = normalizeExceptionPayload(payload);
    const response = await fetchClient(`${CA_LAM_URL}/ngoai-le/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped),
    });
    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, `Lỗi: ${response.status}`),
      );
    }
    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Error in updateExceptionApi:", error);
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
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status} - Không thể xóa ngoại lệ`);
    }
    return true;
  } catch (error) {
    console.error("Error in deleteExceptionApi:", error);
    throw error;
  }
};
