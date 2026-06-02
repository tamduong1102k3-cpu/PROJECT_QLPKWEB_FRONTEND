import { getTodayApi as _getTodayDangKy, updateStatusApi as _updateDangKyStatus } from '../../api/dangKyKhamBenhApi';
import { getCurrentRoomApi as _getCurrentRoomApi } from '../../api/shiftApi';
import { getAssistantHistoryApi as _getAssistantHistoryApi, updateToWaitingForDoctorApi } from '../../api/phieuKhamApi';
import { getByPhieuKhamApi, saveAndUpdateApi } from '../../api/chiSoKhamTongHopApi';
// ĐẢM BẢO IMPORT apiClient
import { apiClient } from "../../api/apiClient"; 
import { useNotification } from '../../components/NotificationContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import React, { useState, useEffect, useCallback } from 'react';
import QuanLyBenhNhan from '../admin/QuanLyBenhNhan';
import TroLyRHMForm from './TroLyRHMForm';
import TroLyTMHForm from './TroLyTMHForm';
import NhomOSoLieu from '../doctor/components/NhomOSoLieu';
import UserMenu from '../../components/UserMenu';

// KHAI BÁO API_BASE
const API_BASE = 'http://localhost:8080/api';

const BangDieuKhienTroLy = ({ onLogout, user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState({ waiting: [], absent: [] });
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueTab, setQueueTab] = useState('waiting');
  const [stats, setStats] = useState({ waitingToday: 0, processedToday: 0, absentToday: 0 });
  const [currentRoom, setCurrentRoom] = useState("Đang tải...");
  const { showSuccess, showError } = useNotification();
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'primary', icon: '' });

  const isRhmAssistant = user?.tenChuyenKhoa?.toLowerCase()?.includes('răng') || 
                         user?.tenChuyenKhoa?.toLowerCase()?.includes('nha khoa');

  const isTmhAssistant = user?.maChuyenKhoa === 6 ||
                         (user?.tenChuyenKhoa?.toLowerCase()?.includes('tai') && user?.tenChuyenKhoa?.toLowerCase()?.includes('họng')) ||
                         user?.tenChuyenKhoa?.toLowerCase()?.includes('tmh');

  const fetchStats = useCallback(async () => {
    try {
      setLoadingQueue(true);
      const data = await _getTodayDangKy();
      if (data) {
        let filteredData = data;
        if (user?.maChuyenKhoa) {
          filteredData = data.filter(r => r.maChuyenKhoa === user.maChuyenKhoa);
        }
        const waiting = filteredData.filter(r => r.trangThai === 'CHO_KHAM' || r.trangThai === 'DANG_KHAM');
        const absent = filteredData.filter(r => r.trangThai === 'VANG_MAT');
        const processed = filteredData.filter(r => r.trangThai === 'CHO_BAC_SI' || r.trangThai === 'HOAN_THANH').length;
        
        setPatients({ waiting, absent });
        setStats({ waitingToday: waiting.length, processedToday: processed, absentToday: absent.length });
      }
      if (user?.maNhanVien) {
        const roomData = await _getCurrentRoomApi(user.maNhanVien);
        setCurrentRoom(roomData?.phong || "Chưa có lịch trực");
      }
    } catch (error) { console.error(error); } finally { setLoadingQueue(false); }
  }, [user]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleSelectPatient = async (patient) => {
    if (patient.trangThai === 'DANG_KHAM') { 
      setSelectedPatient(patient); 
      return; 
    }

    setConfirmState({
      isOpen: true,
      title: 'Xác nhận tiếp nhận',
      message: `Tiếp nhận bệnh nhân "${patient.hoTen}" để đo sinh hiệu?`,
      type: 'primary',
      icon: 'assignment_ind',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          const maNV = user?.maNhanVien || '';
          const res = await apiClient(`${API_BASE}/phieu-kham/accept-patient/${patient.id}?assistantId=${maNV}`, { 
            method: 'POST' 
          });

          if (res.ok) {
            const data = await res.json();
            await fetchStats();
            setSelectedPatient({ 
              ...patient, 
              trangThai: 'DANG_KHAM', 
              maPhieuKham: data.phieuKhamId 
            });
            showSuccess(`Đã tiếp nhận bệnh nhân "${patient.hoTen}"`);
          }
        } catch (error) { 
          showError("Lỗi tiếp nhận: " + error.message); 
        }
      }
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Bàn Làm Việc', icon: 'desk' },
    { id: 'patients', label: 'Hồ Sơ Bệnh Nhân', icon: 'person_search' },
    { id: 'history', label: 'Lịch Sử Tiếp Đón', icon: 'history' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="animate-fade-in space-y-6">
            <NhomOSoLieu user={user} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] w-full">
              <div className="lg:col-span-4 xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px] lg:h-[calc(100vh-180px)] lg:sticky lg:top-6 w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800"><span className="material-symbols-outlined text-indigo-600">view_list</span>Hàng đợi</h3>
                  <button onClick={fetchStats} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><span className="material-symbols-outlined text-sm">refresh</span></button>
                </div>
                <div className="flex p-1 bg-gray-50 rounded-xl mb-4">
                  <button onClick={() => setQueueTab('waiting')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${queueTab === 'waiting' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Đang chờ</button>
                  <button onClick={() => setQueueTab('absent')} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${queueTab === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>Vắng mặt</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                  <PatientQueue list={queueTab === 'waiting' ? patients.waiting : patients.absent} loading={loadingQueue} onSelectPatient={handleSelectPatient} selectedId={selectedPatient?.maBenhNhan} isAbsentQueue={queueTab === 'absent'} />
                </div>
              </div>

              <div className="lg:col-span-8 xl:col-span-9 w-full">
                {selectedPatient ? (
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-scale-up h-full w-full">
                    <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-50">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
                          {selectedPatient.hoTen?.[0] || 'BN'}
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-gray-800 mb-1">{selectedPatient.hoTen}</h2>
                          <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-md">#{selectedPatient.maBenhNhan}</span>
                            <span>{selectedPatient.gioiTinh ? 'Nam' : 'Nữ'}</span>
                            <span>{new Date(selectedPatient.ngaySinh).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-gray-100 text-gray-400 rounded-xl transition-all"><span className="material-symbols-outlined">close</span></button>
                    </div>
                    <div className="bg-white rounded-2xl p-8 h-full">
                       {isRhmAssistant ? (
                        <TroLyRHMForm selectedPatient={selectedPatient} user={user} onSaved={() => { setSelectedPatient(null); fetchStats(); }} />
                      ) : isTmhAssistant ? (
                        <TroLyTMHForm selectedPatient={selectedPatient} user={user} onSaved={() => { setSelectedPatient(null); fetchStats(); }} />
                      ) : (
                        <VitalSignsForm phieuKhamId={selectedPatient.maPhieuKham} registrationId={selectedPatient.id} assistantId={user?.maNhanVien} initialGhiChu={selectedPatient.ghiChu} onSaved={() => { setSelectedPatient(null); fetchStats(); }} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[500px] bg-white border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-center">
                    <div>
                      <div className="w-24 h-24 bg-gray-50 rounded-full inline-flex items-center justify-center mb-6 text-gray-300"><span className="material-symbols-outlined text-5xl">assignment_ind</span></div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 whitespace-nowrap">Sẵn sàng hỗ trợ</h3>
                      <p className="text-gray-500 text-base leading-relaxed">Vui lòng chọn một bệnh nhân từ danh sách chờ để bắt đầu đo chỉ số sinh hiệu.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'patients': return <QuanLyBenhNhan />;
      case 'history': return <LichSuKham user={user} onEdit={item => {
          setSelectedPatient({...item, trangThai: 'DANG_KHAM'});
          setActiveTab('dashboard');
        }} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-body-md overflow-hidden text-gray-900">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <span className="material-symbols-outlined text-[20px]">medical_information</span>
            </div>
            {isSidebarOpen && <span className="font-bold text-xl text-indigo-600 tracking-tight">MedCore</span>}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.id}>
                <button onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 font-bold translate-x-1' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <span className="material-symbols-outlined">logout</span>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors"><span className="material-symbols-outlined">menu</span></button>
            <h1 className="text-xl font-bold text-gray-800">{navItems.find(i => i.id === activeTab)?.label}</h1>
          </div>
          <UserMenu
            user={user}
            onLogout={onLogout}
            displayName={`Xin chào ${user?.username || ''}`}
            displayRole={user?.tenChuyenKhoa || ''}
            accentColor="indigo"
          />
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa]">
          {renderContent()}
          <ConfirmDialog
            isOpen={confirmState.isOpen}
            title={confirmState.title}
            message={confirmState.message}
            type={confirmState.type}
            icon={confirmState.icon}
            onConfirm={confirmState.onConfirm}
            onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
          />
        </main>
      </div>
    </div>
  );
};

// CÁC COMPONENT PHỤ (TheThongKe, PatientQueue, VitalSignsForm, LichSuKham)
const TheThongKe = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-lg transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${color} shadow-lg group-hover:scale-110 transition-transform`}><span className="material-symbols-outlined text-3xl">{icon}</span></div>
      <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p><h3 className="text-2xl font-black text-gray-800">{value}</h3></div>
    </div>
);

const PatientQueue = ({ list, loading, onSelectPatient, selectedId, isAbsentQueue }) => {
    if (loading && list.length === 0) return <div className="text-center py-4 text-gray-400 italic text-sm">Đang tải...</div>;
    if (list.length === 0) return (<div className="text-center py-12 flex flex-col items-center gap-3"><span className="material-symbols-outlined text-4xl text-gray-200">{isAbsentQueue ? 'person_check' : 'group_off'}</span><p className="text-gray-400 text-sm italic">{isAbsentQueue ? 'Không có bệnh nhân vắng mặt' : 'Không có bệnh nhân đang chờ'}</p></div>);
    return list.map(p => (
      <div key={p.id} className="relative group">
        <button onClick={() => onSelectPatient(p)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${selectedId === p.maBenhNhan ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-md'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedId === p.maBenhNhan ? 'bg-white/20' : (isAbsentQueue ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600')}`}>{p.soThuTu}</div>
            <div className="min-w-0"><p className="font-bold text-sm truncate">{p.hoTen}</p><p className={`text-[10px] truncate ${selectedId === p.maBenhNhan ? 'text-indigo-100' : 'text-gray-500'}`}>#{p.maBenhNhan} • {p.tenChuyenKhoa}</p></div>
          </div>
          {!isAbsentQueue && <span className="material-symbols-outlined text-lg opacity-50">chevron_right</span>}
        </button>
      </div>
    ));
};

const VitalSignsForm = ({ phieuKhamId, registrationId, assistantId, initialGhiChu, onSaved }) => {
  const { showSuccess, showError } = useNotification();
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'primary', icon: '' });
  const [vitals, setVitals] = useState({ nhietDo: '', nhipTim: '', huyetApThu: '', huyetApTruong: '', nhipTho: '', canNang: '', chieuCao: '', spo2: '', ghiChu: initialGhiChu || '' });

  useEffect(() => {
    if (phieuKhamId) {
      getByPhieuKhamApi(phieuKhamId).then(data => {
        if (data) {
          setVitals(prev => ({ ...prev, nhietDo: data.nhietDo || '', nhipTim: data.nhipTim || '', huyetApThu: data.huyetApTamThu || '', huyetApTruong: data.huyetApTamTruong || '', nhipTho: data.nhipTho || '', canNang: data.canNang || '', chieuCao: data.chieuCao || '', spo2: data.spo2 || '' }));
        }
      });
    }
  }, [phieuKhamId]);

  const handleConfirm = async () => {
    try {
      const payload = {
        maPhieuKham: phieuKhamId,
        nhietDo: parseFloat(vitals.nhietDo) || null,
        nhipTim: parseInt(vitals.nhipTim) || null,
        nhipTho: parseInt(vitals.nhipTho) || null,
        huyetApTamThu: parseInt(vitals.huyetApThu) || null,
        huyetApTamTruong: parseInt(vitals.huyetApTruong) || null,
        canNang: parseFloat(vitals.canNang) || null,
        chieuCao: parseFloat(vitals.chieuCao) || null,
        spo2: parseFloat(vitals.spo2) || null,
        maNhanVienNhap: assistantId
      };
      await saveAndUpdateApi(payload);
      await updateToWaitingForDoctorApi(phieuKhamId);
      showSuccess("✅ Đã hoàn tất đo sinh hiệu và chuyển Bác sĩ khám.");
      onSaved();
    } catch (e) { showError("Lỗi: " + e.message); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h3 className="text-xl font-bold text-indigo-700 text-center uppercase border-b pb-4">Thông tin chỉ số sinh tồn</h3>
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Nhiệt độ (°C)</label><input type="number" step="0.1" className="w-32 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={vitals.nhietDo} onChange={e => setVitals({...vitals, nhietDo: e.target.value})} /></div>
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Huyết áp thu</label><input type="number" className="w-32 p-2 border rounded" value={vitals.huyetApThu} onChange={e => setVitals({...vitals, huyetApThu: e.target.value})} /></div>
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Nhịp thở</label><input type="number" className="w-32 p-2 border rounded" value={vitals.nhipTho} onChange={e => setVitals({...vitals, nhipTho: e.target.value})} /></div>
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Chiều cao (cm)</label><input type="number" className="w-32 p-2 border rounded" value={vitals.chieuCao} onChange={e => setVitals({...vitals, chieuCao: e.target.value})} /></div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Nhịp tim</label><input type="number" className="w-32 p-2 border rounded" value={vitals.nhipTim} onChange={e => setVitals({...vitals, nhipTim: e.target.value})} /></div>
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Huyết áp trương</label><input type="number" className="w-32 p-2 border rounded" value={vitals.huyetApTruong} onChange={e => setVitals({...vitals, huyetApTruong: e.target.value})} /></div>
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Cân nặng (kg)</label><input type="number" step="0.1" className="w-32 p-2 border rounded" value={vitals.canNang} onChange={e => setVitals({...vitals, canNang: e.target.value})} /></div>
          <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Chỉ số SpO2 (%)</label><input type="number" className="w-32 p-2 border rounded" value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} /></div>
        </div>
      </div>
      <div className="flex gap-4 pt-6">
        <button onClick={handleConfirm} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all">XÁC NHẬN & CHUYỂN BÁC SĨ</button>
        <button onClick={() => setConfirmState({
          isOpen: true,
          title: 'Xác nhận vắng mặt',
          message: 'Bệnh nhân vắng mặt?',
          type: 'warning',
          icon: 'person_off',
          onConfirm: async () => {
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            await _updateDangKyStatus(registrationId, {trangThai: 'VANG_MAT'});
            onSaved();
          }
        })} className="px-10 py-4 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-all">VẮNG MẶT</button>
      </div>
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        icon={confirmState.icon}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

const LichSuKham = ({ user, onEdit }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user?.maChuyenKhoa) {
      setLoading(true);
      _getAssistantHistoryApi(user.maChuyenKhoa).then(data => setHistory(data || [])).finally(() => setLoading(false));
    }
  }, [user]);
  if (loading) return <div className="p-10 text-center italic text-gray-400">Đang tải lịch sử...</div>;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-6 border-b font-bold text-lg text-gray-800 flex items-center gap-2"><span className="material-symbols-outlined text-indigo-600">history</span>Lịch sử tiếp đón trong ngày</div>
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider"><tr className="border-b"><th className="p-4">Mã Phiếu</th><th className="p-4">Bệnh Nhân</th><th className="p-4">Trạng Thái</th><th className="p-4 text-right">Thao tác</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {history.map(item => (
            <tr key={item.maPhieuKham} className="hover:bg-gray-50/50 transition-colors">
              <td className="p-4 text-indigo-600 font-medium">#{item.maPhieuKham}</td>
              <td className="p-4 font-bold text-gray-800">{item.hoTen}</td>
              <td className="p-4"><span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold">Chờ bác sĩ khám</span></td>
              <td className="p-4 text-right"><button onClick={() => onEdit(item)} className="text-indigo-600 font-bold text-sm inline-flex items-center gap-1 hover:text-indigo-800 transition-colors"><span className="material-symbols-outlined text-sm">edit</span> Sửa sinh hiệu</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BangDieuKhienTroLy;