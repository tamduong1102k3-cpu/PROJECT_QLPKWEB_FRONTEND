import fetchClient from './fetchClient';

const API_URL = 'http://localhost:8080/api/database';

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
  return response.json();
};

export const createBackupApi = async () => {
  const response = await fetchClient(`${API_URL}/backup`, { method: 'POST' });
  if (!response.ok) await handleError(response);
  return response.json();
};

export const downloadBackupApi = async (filename) => {
  const response = await fetchClient(`${API_URL}/backups/${encodeURIComponent(filename)}/download`);
  if (!response.ok) await handleError(response);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const restoreBackupApi = async (filename) => {
  const response = await fetchClient(`${API_URL}/restore/${encodeURIComponent(filename)}`, {
    method: 'POST'
  });
  if (!response.ok) await handleError(response);
  return response.json();
};

export const restoreUploadApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetchClient(`${API_URL}/restore/upload`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) await handleError(response);
  return response.json();
};

export const deleteBackupApi = async (filename) => {
  const response = await fetchClient(`${API_URL}/backups/${encodeURIComponent(filename)}`, {
    method: 'DELETE'
  });
  if (!response.ok) await handleError(response);
  return response.json();
};