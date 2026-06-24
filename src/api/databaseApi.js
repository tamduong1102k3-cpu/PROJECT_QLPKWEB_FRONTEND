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
  return data.backups || [];
};

export const createBackupApi = async () => {
  const response = await fetchClient(`${API_URL}/backup`, { method: 'POST' });
  if (!response.ok) await handleError(response);
  return response.json();
};

export const restoreBackupApi = async (filename) => {
  const response = await fetchClient(`${API_URL}/restore/${encodeURIComponent(filename)}`, {
    method: 'POST'
  });
  if (!response.ok) await handleError(response);
  return response.json();
};