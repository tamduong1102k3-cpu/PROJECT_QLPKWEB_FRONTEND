import React, { useEffect, useRef, useState } from 'react';
import {
  createBackupApi,
  deleteBackupApi,
  downloadBackupApi,
  getDatabaseInfoApi,
  listBackupsApi,
  restoreBackupApi,
  restoreUploadApi
} from '../../../api/databaseApi';

const formatSize = (bytes) => {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
};

const QuanLyCaiDat = () => {
  const [dbInfo, setDbInfo] = useState(null);
  const [backups, setBackups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const loadData = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const [info, backupList] = await Promise.all([
        getDatabaseInfoApi(),
        listBackupsApi()
      ]);
      setDbInfo(info);
      setBackups(backupList || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Không thể tải dữ liệu cài đặt' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBackup = async () => {
    // Aiven tự động backup hàng ngày, chỉ cần thông báo
    setMessage({ type: 'info', text: 'Aiven tự động backup database hàng ngày. Danh sách backup sẽ được cập nhật.' });
    await loadData();
  };

  const handleDownload = async (backupId) => {
    try {
      await downloadBackupApi(backupId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Tải file thất bại' });
    }
  };

  const handleRestoreFromList = async (backupId) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn phục hồi database từ backup "${backupId}"?\n\n` +
      'Toàn bộ dữ liệu hiện tại sẽ bị ghi đè.'
    );
    if (!confirmed) return;

    setIsRestoring(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await restoreBackupApi(backupId);
      setMessage({ type: 'success', text: result.message || 'Đã gửi yêu cầu phục hồi. Vui lòng đợi vài phút.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Phục hồi thất bại' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreUpload = async () => {
    setMessage({ type: 'info', text: 'Aiven không hỗ trợ restore từ file upload. Chỉ có thể restore từ backup snapshot trên cloud.' });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (filename) => {
    try {
      await deleteBackupApi(filename);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Xóa file thất bại' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {message.text && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : message.type === 'info'
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">cloud</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Sao Lưu & Phục Hồi Database (Aiven Cloud)</h2>
            <p className="text-sm text-gray-500 mt-1">
              Database được lưu trữ trên Aiven Cloud. Backup tự động hàng ngày, quản lý qua Aiven Console.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 py-8">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            <span>Đang tải thông tin...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Service</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{dbInfo?.serviceName || '—'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Trạng thái</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{dbInfo?.state || '—'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Công cụ</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{dbInfo?.backupTool || 'Aiven Cloud'}</p>
            </div>
          </div>
        )}

        {dbInfo?.plan && (
          <p className="text-xs text-gray-400 mb-4">
            Plan: {dbInfo.plan} | Backup hour: {dbInfo.backupHour !== undefined ? `${dbInfo.backupHour}:00 UTC` : 'Auto'}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateBackup}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
            Làm mới danh sách backup
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Làm mới
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Aiven tự động backup database mỗi ngày. Để xem và quản lý backup chi tiết, truy cập{' '}
          <a href="https://console.aiven.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Aiven Console
          </a>.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 opacity-60 pointer-events-none">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-orange-500">upload_file</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Phục Hồi Từ File Upload</h3>
            <p className="text-sm text-gray-500">Tải lên file .sql từ máy tính để phục hồi database</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="block w-full md:max-w-md text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
          />
          <button
            onClick={handleRestoreUpload}
            disabled={!selectedFile || isRestoring}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">restore</span>
            {isRestoring ? 'Đang phục hồi...' : 'Phục hồi từ file'}
          </button>
        </div>
        <p className="text-xs text-orange-500 mt-3 font-medium">
          Aiven không hỗ trợ restore từ file upload. Chỉ có thể restore từ backup snapshot trên cloud.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">folder_open</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Danh Sách Backup Từ Aiven Cloud</h3>
              <p className="text-sm text-gray-500">{backups.length} bản backup trên hệ thống</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Đang tải...</div>
        ) : backups.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-2 opacity-40">inventory_2</span>
            <p>Chưa có bản sao lưu nào. Aiven sẽ tự động backup vào giờ đã cấu hình.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 font-medium">Backup ID</th>
                  <th className="pb-3 font-medium">Kích thước</th>
                  <th className="pb-3 font-medium">Ngày</th>
                  <th className="pb-3 font-medium">Giờ</th>
                  <th className="pb-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((item, index) => {
                  const backupId = item.backup_id || item.backup_name || `backup_${index}`;
                  // Parse thời gian từ backupId (vd: "2026-06-21T15:23:00.913365+00:00Z_xxx")
                  let datePart = '—';
                  let timePart = '—';
                  const timeMatch = backupId.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
                  if (timeMatch) {
                    datePart = timeMatch[1];
                    timePart = timeMatch[2];
                  } else if (item.start_time || item.createdAt) {
                    const ts = item.start_time || item.createdAt;
                    datePart = new Date(ts).toLocaleDateString('vi-VN');
                    timePart = new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  }
                  return (
                    <tr key={backupId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                      <td className="py-3 pr-4">
                        <span className="text-sm font-semibold text-gray-800">{backupId}</span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{formatSize(item.data_size || item.size)}</td>
                      <td className="py-3 text-sm text-gray-600">{datePart}</td>
                      <td className="py-3 text-sm text-gray-600">{timePart}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => handleRestoreFromList(backupId)}
                            disabled={isRestoring}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                          >
                            Phục hồi
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuanLyCaiDat;