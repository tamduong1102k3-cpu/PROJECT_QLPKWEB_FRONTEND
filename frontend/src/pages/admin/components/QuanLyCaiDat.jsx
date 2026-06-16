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
  const [isBackingUp, setIsBackingUp] = useState(false);
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
    setIsBackingUp(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await createBackupApi();
      setMessage({ type: 'success', text: result.message || 'Sao lưu thành công' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Sao lưu thất bại' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      await downloadBackupApi(filename);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Tải file thất bại' });
    }
  };

  const handleRestoreFromList = async (filename) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn phục hồi database từ "${filename}"?\n\n` +
      'Toàn bộ dữ liệu hiện tại sẽ bị ghi đè. Hãy tạo bản sao lưu trước khi thực hiện.'
    );
    if (!confirmed) return;

    setIsRestoring(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await restoreBackupApi(filename);
      setMessage({ type: 'success', text: result.message || 'Phục hồi thành công' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Phục hồi thất bại' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file .sql để phục hồi' });
      return;
    }

    const confirmed = window.confirm(
      `Phục hồi database từ file "${selectedFile.name}"?\n\n` +
      'Toàn bộ dữ liệu hiện tại sẽ bị ghi đè. Hãy tạo bản sao lưu trước khi thực hiện.'
    );
    if (!confirmed) return;

    setIsRestoring(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await restoreUploadApi(selectedFile);
      setMessage({ type: 'success', text: result.message || 'Phục hồi thành công' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Phục hồi thất bại' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDelete = async (filename) => {
    const confirmed = window.confirm(`Xóa bản sao lưu "${filename}"?`);
    if (!confirmed) return;

    try {
      await deleteBackupApi(filename);
      setMessage({ type: 'success', text: `Đã xóa ${filename}` });
      await loadData();
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
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600">database</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Sao Lưu & Phục Hồi Database</h2>
            <p className="text-sm text-gray-500 mt-1">
              Cùng database với phpMyAdmin (WAMP). File .sql tạo ra tương thích Import/Export trên phpMyAdmin.
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
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Database</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{dbInfo?.databaseName || '—'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Máy chủ</p>
              <p className="text-lg font-bold text-gray-800 mt-1">
                {dbInfo ? `${dbInfo.host}:${dbInfo.port}` : '—'}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Công cụ</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{dbInfo?.tool || 'MySQL localhost'}</p>
            </div>
          </div>
        )}

        {dbInfo?.mysqldumpPath && (
          <p className="text-xs text-gray-400 mb-4 break-all">
            mysqldump: {dbInfo.mysqldumpPath}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateBackup}
            disabled={isBackingUp || isRestoring}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isBackingUp ? 'progress_activity' : 'backup'}
            </span>
            {isBackingUp ? 'Đang sao lưu...' : 'Tạo bản sao lưu ngay'}
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
            disabled={!selectedFile || isRestoring || isBackingUp}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">restore</span>
            {isRestoring ? 'Đang phục hồi...' : 'Phục hồi từ file'}
          </button>
        </div>

        <p className="text-xs text-red-500 mt-3 font-medium">
          Cảnh báo: Phục hồi sẽ ghi đè toàn bộ dữ liệu hiện tại. Nên tạo bản sao lưu trước khi thực hiện.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">folder_open</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Danh Sách Bản Sao Lưu</h3>
              <p className="text-sm text-gray-500">{backups.length} file trong hệ thống</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Đang tải...</div>
        ) : backups.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-2 opacity-40">inventory_2</span>
            <p>Chưa có bản sao lưu nào. Nhấn "Tạo bản sao lưu ngay" để bắt đầu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 font-medium">Tên file</th>
                  <th className="pb-3 font-medium">Kích thước</th>
                  <th className="pb-3 font-medium">Thời gian</th>
                  <th className="pb-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((item) => (
                  <tr key={item.filename} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                    <td className="py-3 pr-4">
                      <span className="text-sm font-semibold text-gray-800">{item.filename}</span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{formatSize(item.size)}</td>
                    <td className="py-3 text-sm text-gray-600">{formatDate(item.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleDownload(item.filename)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          Tải về
                        </button>
                        <button
                          onClick={() => handleRestoreFromList(item.filename)}
                          disabled={isRestoring}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                        >
                          Phục hồi
                        </button>
                        <button
                          onClick={() => handleDelete(item.filename)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuanLyCaiDat;