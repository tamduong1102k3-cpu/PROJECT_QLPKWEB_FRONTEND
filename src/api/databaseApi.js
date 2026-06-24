import fetchClient from './fetchClient';

const API_URL = 'https://qlpk-backend-spring-boot.onrender.com/api/database';

const handleError = async (response) => {
  let errorMsg = `Lỗi: ${response.status}`;
  try {
    const text = await response.text();
    if (text) {
      try {
        const errorData = JSON.parse(text);
        errorMsg = errorData.message || errorMsg;
      } catch {
        errorMsg = text;
      }
    }
  } catch (e) {}
  throw new Error(errorMsg);
};

export const getDatabaseInfoApi = async () => {
  const response = await fetchClient(`${API_URL}/info`);
  if (!response.ok) await handleError(response);
  return response.json();
};

export const listBackupsApi = async () => {
  const response = await fetchClient(`${API_URL}/backups`);
  if (!response.ok) await handleError(response);
  const data = await response.json();
  // API trả về { success: true, backups: [...] }
  return data.backups || [];
};

export const createBackupApi = async () => {
  // Aiven tự động backup hàng ngày, không có endpoint tạo backup thủ công.
  // Thay vào đó, chỉ cần refresh danh sách backup từ Aiven
  throw new Error('Aiven tự động backup database hàng ngày. Không cần tạo backup thủ công.');
};

export const downloadBackupApi = async (backupId) => {
  // Aiven backups được quản lý trên cloud, không hỗ trợ download file SQL
  throw new Error('Aiven quản lý backup trên cloud. Vui lòng vào Aiven Console để tải backup.');
};

export const restoreBackupApi = async (backupId) => {
  const response = await fetchClient(`${API_URL}/restore/${encodeURIComponent(backupId)}`, {
    method: 'POST'
  });
  if (!response.ok) await handleError(response);
  return response.json();
};

export const restoreUploadApi = async (file) => {
  throw new Error('Aiven không hỗ trợ restore từ file upload. Chỉ có thể restore từ backup snapshot trên cloud.');
};

export const deleteBackupApi = async (filename) => {
  throw new Error('Aiven quản lý backup tự động. Không thể xóa backup qua API.');
};