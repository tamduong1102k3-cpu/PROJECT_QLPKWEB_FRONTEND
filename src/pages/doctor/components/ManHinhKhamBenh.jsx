import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../../../components/NotificationContext';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { getAllApi as _getDichVuAllApi } from '../../../api/dichVuApi';
import { 
  getByBenhNhanApi as _getPhieuChiDinhByBenhNhanApi, 
  getDetailsApi as _getPhieuChiDinhDetailsApi,
  getByPhieuKhamApi as _getPhieuChiDinhByPhieuKhamApi,
  createApi as _createPhieuChiDinhApi,
  getXetNhiemResultsByPhieuKhamApi,
  getCdhaResultsByPhieuKhamApi
} from '../../../api/phieuChiDinhApi';
import { getAllThuocApi as _getAllThuocApi, getKhoCanhBaoApi } from '../../../api/khoThuocApi';
import { 
  getByBenhNhanApi as _getToaThuocByBenhNhanApi, 
  getDetailsApi as _getToaThuocDetailsApi,
  getByPhieuKhamApi as _getToaThuocByPhieuKhamApi,
  createApi as _createToaThuocApi
} from '../../../api/toaThuocApi';
import { 
  getByBenhNhanApi as _getKhamLamSangByBenhNhanApi,
  getByPhieuKhamApi as _getKhamLamSangByPhieuKhamApi
} from '../../../api/khamLamSangApi';
import { getByPhieuKhamApi as _getChiSoKhamByPhieuKhamApi } from '../../../api/chiSoKhamTongHopApi';
import { 
  finishConsultationApi as _finishKhamApi,
  updateToClsApi as _updateToClsApi
} from '../../../api/phieuKhamApi';
import { saveAndUpdateApi as _saveChiSoKhamTongHopApi } from '../../../api/chiSoKhamTongHopApi';

import HienThiSinhHieu from './HienThiSinhHieu';
import TabKhamLamSang from './TabKhamLamSang';
import TabKetQuaCLS from './TabKetQuaCLS';
import TabDichVuChiDinh from './TabDichVuChiDinh';
import TabKeDonThuoc from './TabKeDonThuoc';
import TabLichSuKhamChiTiet from './TabLichSuKhamChiTiet';
import TabKhamTMH from './TabKhamTMH';
import TabKhamRHM from './TabKhamRHM';
import TabKhamTimMach from './TabKhamTimMach';
import TabKhamNhi from './TabKhamNhi';
import TabHenTaiKham from './TabHenTaiKham';

const ManHinhKhamBenh = ({ selectedPatient, setSelectedPatient, user, onBackToQueue }) => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'primary', icon: '' });
  // Mã chuyên khoa: 1: Nội tổng quát, 3: Nhi khoa, 4: TMH, 5: RHM, 11: Tim mạch
  const isTmhDoc = Number(user?.maChuyenKhoa) === 4;
  const isRhmDoc = Number(user?.maChuyenKhoa) === 5;
  const isCardiologyDoc = Number(user?.maChuyenKhoa) === 11;
  const isNhiDoc = Number(user?.maChuyenKhoa) === 3;

  const [examSubTab, setExamSubTab] = useState('info');
  
  const [paraclinicalResults, setParaclinicalResults] = useState({
    lab: [],
    imaging: []
  });
  const [allServices, setAllServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);
  const [prescribedHistory, setPrescribedHistory] = useState([]);
  const [allMeds, setAllMeds] = useState([]);
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [medSearch, setMedSearch] = useState('');
  const [showMedList, setShowMedList] = useState(false);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [examHistory, setExamHistory] = useState([]);

  // TMH/RHM exam data (loaded from chiSoKhamTongHopApi) - shared with TabKhamTMH / TabKhamRHM
  const [examData, setExamData] = useState({
    tinhTrangMui: '',
    tinhTrangHong: '',
    soiTaiMuiHong: '',
    ongTai: '',
    mangNhiPhai: '',
    mangNhiTrai: '',
    vachNgan: '',
    cuonMui: '',
    kheMui: '',
    amidan: '',
    thanhQuan: '',
    thinhLucTaiTrai: '',
    thinhLucTaiPhai: '',
    ghiChu: '',
    tinhTrangRang: '',
    sauRang: '',
    caoRang: '',
    viemNuou: '',
    khopCan: '',
    doLungLay: '',
    niemMacMieng: '',
    phuHinhCu: '',
    benhLyKhacRhm: '',
    cholesterol: '',
    hdlCholesterol: '',
    ldlCholesterol: '',
    triglyceride: '',
    duongHuyet: '',
    ecgKetQua: '',
    sieuAmTim: '',
    // Nhi khoa fields
    nhietDo: '',
    nhipTim: '',
    nhipTho: '',
    huyetApTamThu: '',
    huyetApTamTruong: '',
    canNang: '',
    chieuCao: '',
    spo2: '',
    vongDau: '',
    tinhTrangDinhDuong: '',
    tamLyHanhVi: '',
    khamTaiMuiHongNhi: '',
    khamHoHapNhi: '',
    khamDaNiemMacNhi: '',
    khamDuNiemMacNhi: '',
    coQuanKhacNhi: ''
  });

  // Reference to TabKhamLamSang to trigger auto-save before changing tabs
  const tabKhamLamSangRef = useRef(null);

  // Keep a reference to selectedMeds to avoid state closure race conditions
  const selectedMedsRef = useRef([]);
  useEffect(() => {
    selectedMedsRef.current = selectedMeds;
  }, [selectedMeds]);

  // Fetch initial info for selected patient
  useEffect(() => {
    if (selectedPatient) {
      // Reset lists
      setSelectedServices([]);
      setSelectedMeds([]);

      if (selectedPatient.maPhieuKham) {
        // Tải dịch vụ đã chỉ định
        _getPhieuChiDinhByPhieuKhamApi(selectedPatient.maPhieuKham)
          .then(async phieuList => {
            if (phieuList && phieuList.length > 0) {
              let loadedServices = [];
              for (const p of phieuList) {
                const details = await _getPhieuChiDinhDetailsApi(p.maPhieuChiDinh);
                if (details) {
                  for (const d of details) {
                    if (!loadedServices.some(s => s.maDichVu === d.maDichVu)) {
                      const catalogService = allServices.find(s => s.maDichVu === d.maDichVu);
                      loadedServices.push({
                        maDichVu: d.maDichVu,
                        tenDichVu: catalogService?.tenDichVu || d.tenDichVu || `Dịch vụ #${d.maDichVu}`,
                        donGia: d.donGia,
                        soLuong: d.soLuong
                      });
                    }
                  }
                }
              }
              setSelectedServices(loadedServices);
            }
          })
          .catch(e => console.error("Lỗi tải dịch vụ:", e));
        
        // Tải đơn thuốc đã kê
        _getToaThuocByPhieuKhamApi(selectedPatient.maPhieuKham)
          .then(async toasList => {
            if (toasList && toasList.length > 0) {
              let loadedMeds = [];
              for (const t of toasList) {
                const details = await _getToaThuocDetailsApi(t.maToaThuoc);
                if (details) {
                  for (const d of details) {
                    if (!loadedMeds.some(m => m.maThuoc === d.maThuoc)) {
                      const catalogMed = allMeds.find(m => m.maThuoc === d.maThuoc);
                      loadedMeds.push({
                        maThuoc: d.maThuoc,
                        tenThuoc: catalogMed?.tenThuoc || `Thuốc #${d.maThuoc}`,
                        hoatChat: catalogMed?.hoatChat || '',
                        donViTinh: catalogMed?.donViTinh || '',
                        sang: d.sang || '',
                        trua: d.trua || '',
                        chieu: d.chieu || '',
                        toi: d.toi || '',
                        soNgay: d.soNgay || 1,
                        cachDung: d.cachDung || '',
                        thoiDiemDung: d.thoiDiemDung || '',
                        lieuDung: d.lieuDung || ''
                      });
                    }
                  }
                }
              }
              setSelectedMeds(loadedMeds);
            }
          })
          .catch(e => console.error("Lỗi tải đơn thuốc:", e));

        // Tải dữ liệu khám chuyên khoa (TMH/RHM)
        _getChiSoKhamByPhieuKhamApi(selectedPatient.maPhieuKham)
          .then(data => {
            if (data) {
              setExamData({
                tinhTrangMui: data.tinhTrangMui ?? '',
                tinhTrangHong: data.tinhTrangHong ?? '',
                soiTaiMuiHong: data.soiTaiMuiHong ?? '',
                ongTai: data.ongTai ?? '',
                mangNhiPhai: data.mangNhiPhai ?? '',
                mangNhiTrai: data.mangNhiTrai ?? '',
                vachNgan: data.vachNgan ?? '',
                cuonMui: data.cuonMui ?? '',
                kheMui: data.kheMui ?? '',
                amidan: data.amidan ?? '',
                thanhQuan: data.thanhQuan ?? '',
                thinhLucTaiTrai: data.thinhLucTaiTrai ?? '',
                thinhLucTaiPhai: data.thinhLucTaiPhai ?? '',
                ghiChu: data.ghiChu ?? '',
                tinhTrangRang: data.tinhTrangRang ?? '',
                sauRang: data.sauRang ?? '',
                caoRang: data.caoRang ?? '',
                viemNuou: data.viemNuou ?? '',
                khopCan: data.khopCan ?? '',
                doLungLay: data.doLungLay ?? '',
                niemMacMieng: data.niemMacMieng ?? '',
                phuHinhCu: data.phuHinhCu ?? '',
                benhLyKhacRhm: data.benhLyKhacRhm ?? '',
                cholesterol: data.cholesterol ?? '',
                hdlCholesterol: data.hdlCholesterol ?? '',
                ldlCholesterol: data.ldlCholesterol ?? '',
                triglyceride: data.triglyceride ?? '',
                duongHuyet: data.duongHuyet ?? '',
                ecgKetQua: data.ecgKetQua ?? '',
                sieuAmTim: data.sieuAmTim ?? '',
                // Nhi khoa fields
                nhietDo: data.nhietDo ?? '',
                nhipTim: data.nhipTim ?? '',
                nhipTho: data.nhipTho ?? '',
                huyetApTamThu: data.huyetApTamThu ?? '',
                huyetApTamTruong: data.huyetApTamTruong ?? '',
                canNang: data.canNang ?? '',
                chieuCao: data.chieuCao ?? '',
                spo2: data.spo2 ?? '',
                vongDau: data.vongDau ?? '',
                tinhTrangDinhDuong: data.tinhTrangDinhDuong ?? '',
                tamLyHanhVi: data.tamLyHanhVi ?? '',
                khamTaiMuiHongNhi: data.khamTaiMuiHongNhi ?? '',
                khamHoHapNhi: data.khamHoHapNhi ?? '',
                khamDaNiemMacNhi: data.khamDaNiemMacNhi ?? '',
                khamDuNiemMacNhi: data.khamDuNiemMacNhi ?? '',
                coQuanKhacNhi: data.coQuanKhacNhi ?? ''
              });
            }
          })
          .catch(e => console.error("Lỗi tải dữ liệu khám chuyên khoa:", e));
      }
    }
  }, [selectedPatient, allMeds, allServices]);

  const fetchServices = useCallback(async () => {
    try {
      const data = await _getDichVuAllApi();
      if (data) setAllServices(data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục dịch vụ:", error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const fetchPrescribedHistory = useCallback(async () => {
    if (!selectedPatient?.maBenhNhan) return;
    try {
      const phieus = await _getPhieuChiDinhByBenhNhanApi(selectedPatient.maBenhNhan);
      if (phieus) {
        const historyWithDetails = await Promise.all(phieus.map(async p => {
          let details = [];
          try {
            details = await _getPhieuChiDinhDetailsApi(p.maPhieuChiDinh);
          } catch (e) {}
          return {
            ...p,
            details
          };
        }));
        setPrescribedHistory(historyWithDetails);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử chỉ định:", error);
    }
  }, [selectedPatient]);

  const handleAddService = service => {
    if (selectedServices.find(s => s.maDichVu === service.maDichVu)) {
      showWarning("Dịch vụ này đã có trong danh sách!");
      return;
    }
    setSelectedServices([...selectedServices, {
      ...service,
      soLuong: 1
    }]);
    setShowServiceList(false);
    setServiceSearch('');
  };

  const handleRemoveService = id => {
    setSelectedServices(selectedServices.filter(s => s.maDichVu !== id));
  };

  const handleSaveReferral = async (silent = false) => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      const total = selectedServices.reduce((acc, s) => acc + s.donGia * s.soLuong, 0);
      const payload = {
        phieuChiDinh: {
          maPhieuKham: selectedPatient.maPhieuKham,
          maNhanVienChiDinh: user?.maNhanVien,
          tongTien: total
        },
        chiTietList: selectedServices.map(s => ({
          maDichVu: s.maDichVu,
          donGia: s.donGia,
          soLuong: s.soLuong,
          thanhTien: s.donGia * s.soLuong,
          trangThaiDv: 'CHUA_THUC_HIEN'
        }))
      };
      const res = await _createPhieuChiDinhApi(payload);
      if (!silent) {
        showSuccess("Đã cập nhật chỉ định dịch vụ thành công!");
      }
      fetchPrescribedHistory();

      // Sau khi lưu chỉ định dịch vụ CLS, chuyển trạng thái phiếu khám sang CHO_CLS
      try {
        await _updateToClsApi(selectedPatient.maPhieuKham);
      } catch (err) {
        console.error("Lỗi khi chuyển trạng thái CHO_CLS:", err);
      }
    } catch (error) {
      console.error("Lỗi khi lưu chỉ định:", error);
    }
  };

  const fetchMeds = useCallback(async () => {
    try {
      const [thuocData, khoData] = await Promise.all([
        _getAllThuocApi(),
        getKhoCanhBaoApi()
      ]);
      if (thuocData) {
        // Merge stock info and expiry into medicine list
        const khoMap = {};
        if (khoData) {
          khoData.forEach(k => {
            khoMap[k.maThuoc] = { tonKho: k.soLuongTon, trangThai: k.trangThai };
          });
        }
        const enrichedMeds = thuocData.map(m => ({
          ...m,
          tonKho: khoMap[m.maThuoc]?.tonKho ?? 0,
          trangThaiKho: khoMap[m.maThuoc]?.trangThai || 'BÌNH_THƯỜNG',
        }));
        setAllMeds(enrichedMeds);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục thuốc:", error);
    }
  }, []);

  const fetchPrescriptionHistory = useCallback(async () => {
    if (!selectedPatient?.maBenhNhan) return;
    try {
      const toas = await _getToaThuocByBenhNhanApi(selectedPatient.maBenhNhan);
      if (toas) {
        const historyWithDetails = await Promise.all(toas.map(async t => {
          let details = [];
          try {
            details = await _getToaThuocDetailsApi(t.maToaThuoc);
          } catch (e) {}
          return {
            ...t,
            details
          };
        }));
        setPrescriptionHistory(historyWithDetails);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử đơn thuốc:", error);
    }
  }, [selectedPatient]);

  const fetchExamHistory = useCallback(async () => {
    if (!selectedPatient?.maBenhNhan) return;
    try {
      const data = await _getKhamLamSangByBenhNhanApi(selectedPatient.maBenhNhan);
      if (data) setExamHistory(data);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử khám:", error);
    }
  }, [selectedPatient]);

  const fetchParaclinicalResults = useCallback(async () => {
    if (!selectedPatient?.maPhieuKham) return;
    try {
      const resLab = await getXetNhiemResultsByPhieuKhamApi(selectedPatient.maPhieuKham);
      const resImg = await getCdhaResultsByPhieuKhamApi(selectedPatient.maPhieuKham);
      setParaclinicalResults({
        lab: resLab || [],
        imaging: resImg || []
      });
    } catch (error) {
      console.error("Lỗi fetch kết quả CLS:", error);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (examSubTab === 'services') fetchPrescribedHistory();
    if (examSubTab === 'prescription') fetchPrescriptionHistory();
    if (examSubTab === 'history') fetchExamHistory();
    if (examSubTab === 'results') fetchParaclinicalResults();
  }, [examSubTab, fetchPrescribedHistory, fetchPrescriptionHistory, fetchExamHistory, fetchParaclinicalResults]);

  useEffect(() => {
    fetchMeds();
  }, [fetchMeds]);

  // Handle immediate auto-save for adding and deleting medicines
  const handleSavePrescription = async (silent = false, customMeds = null) => {
    if (!selectedPatient?.maPhieuKham) return true;
    try {
      const targetMeds = customMeds || selectedMedsRef.current;
      // Nếu không có thuốc nào thì không cần lưu, coi như thành công
      if (!targetMeds || targetMeds.length === 0) return true;
      const payload = {
        toaThuoc: {
          maPhieuKham: selectedPatient.maPhieuKham,
          trangThai: 'CHO_THANH_TOAN',
          ghiChu: ''
        },
        chiTietList: targetMeds.map(m => ({
          maThuoc: m.maThuoc,
          lieuDung: m.lieuDung || 'Ngày uống 2 lần',
          sang: m.sang || '',
          trua: m.trua || '',
          chieu: m.chieu || '',
          toi: m.toi || '',
          soNgay: m.soNgay || 1,
          cachDung: m.cachDung || 'Uống sau ăn',
          thoiDiemDung: m.thoiDiemDung || 'Sáng, Tối'
        }))
      };
      await _createToaThuocApi(payload);
      if (!silent) {
        showSuccess("Đã cập nhật đơn thuốc thành công!");
      }
      fetchPrescriptionHistory();
      return true;
    } catch (error) {
      console.error("Lỗi khi kê đơn thuốc:", error);
      if (!silent) {
        showError("Không thể lưu đơn thuốc: " + error.message);
      }
      return false;
    }
  };

  const handleAddMed = med => {
    if (selectedMeds.find(m => m.maThuoc === med.maThuoc)) {
      showWarning("Thuốc này đã có trong đơn!");
      return;
    }
    const newMeds = [...selectedMeds, {
      ...med,
      sang: '1',
      trua: '0',
      chieu: '0',
      toi: '1',
      soNgay: 3,
      cachDung: 'Uống sau ăn',
      thoiDiemDung: 'Sáng, Tối',
      lieuDung: 'Ngày uống 2 lần'
    }];
    setSelectedMeds(newMeds);
    setShowMedList(false);
    setMedSearch('');
    handleSavePrescription(true, newMeds);
  };

  const handleSetSelectedMeds = newMeds => {
    setSelectedMeds(newMeds);
    handleSavePrescription(true, newMeds);
  };

  const handleUpdateMedField = (maThuoc, field, value) => {
    setSelectedMeds(prev => prev.map(m => m.maThuoc === maThuoc ? { ...m, [field]: value } : m));
  };

  const handleTabChange = async (newTabId) => {
    if (examSubTab === 'info' && tabKhamLamSangRef.current) {
      const success = await tabKhamLamSangRef.current.triggerAutoSave();
      if (!success) {
        showError("Lưu dữ liệu khám thất bại! Vui lòng lưu thông tin thành công trước khi rời khỏi tab.");
        return;
      }
    }
    setExamSubTab(newTabId);
  };

  // Save specialty exam data (TMH, RHM, TimMach, Nhi) before finishing
  const saveSpecialtyExamData = async () => {
    if (!selectedPatient?.maPhieuKham) return true;
    
    const isSpecialtyDoc = isTmhDoc || isRhmDoc || isCardiologyDoc || isNhiDoc;
    if (!isSpecialtyDoc) return true; // Not a specialist, skip

    // Check if specialty fields have any data entered
    const hasAnySpecialtyData = Object.entries(examData).some(([key, val]) => {
      if (key === 'nhietDo' || key === 'nhipTim' || key === 'nhipTho' || 
          key === 'huyetApTamThu' || key === 'huyetApTamTruong' || 
          key === 'canNang' || key === 'chieuCao' || key === 'spo2' || 
          key === 'vongDau' || key === 'ghiChu') return false;
      return val && val.toString().trim() !== '';
    });

    if (!hasAnySpecialtyData) return true; // No data entered, nothing to save

    try {
      const userData = user;
      const payload = {
        ...examData,
        maPhieuKham: selectedPatient.maPhieuKham,
        maNhanVienNhap: userData?.maNhanVien
      };
      await _saveChiSoKhamTongHopApi(payload);
      return true;
    } catch (error) {
      console.error("Lỗi lưu dữ liệu khám chuyên khoa:", error);
      return false;
    }
  };

  const handleFinishExam = async () => {
    if (!selectedPatient?.maPhieuKham) return;
    setConfirmState({
      isOpen: true,
      title: 'Xác nhận kết thúc khám',
      message: 'Bạn có chắc chắn muốn kết thúc lượt khám này? Dữ liệu sẽ được kiểm tra và tự động lưu lần cuối.',
      type: 'warning',
      icon: 'done_all',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        try {
          // Step 1: Validate and save clinical exam with strict validation
          let examSuccess = true;
          if (tabKhamLamSangRef.current) {
            examSuccess = await tabKhamLamSangRef.current.triggerFinishAutoSave();
          }
          if (!examSuccess) {
            // Error is already shown by triggerFinishAutoSave
            return;
          }

          // Step 2: Save prescription data
          const prescriptionSuccess = await handleSavePrescription(true);
          if (!prescriptionSuccess) {
            showError("Không thể kết thúc khám vì thông tin đơn thuốc chưa được lưu.");
            return;
          }

          // Step 3: Save specialty exam data (if any)
          const specialtySuccess = await saveSpecialtyExamData();
          if (!specialtySuccess) {
            showError("Không thể lưu dữ liệu khám chuyên khoa. Vui lòng thử lại.");
            return;
          }

          // Step 4: Finish consultation
          const res = await _finishKhamApi(selectedPatient.maPhieuKham);
          if (res) {
            showSuccess("Đã kết thúc lượt khám thành công!");
            setSelectedPatient(null);
            onBackToQueue();
          } else {
            showError("Lỗi khi kết thúc khám.");
          }
        } catch (error) {
          console.error("Error finishing exam:", error);
          showError("Không thể kết thúc khám vì lỗi kết nối hoặc lưu dữ liệu thất bại.");
        }
      }
    });
  };

  return (
    <div className="animate-scale-up space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
            {selectedPatient.hoTen?.[0] || 'BN'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">{selectedPatient.hoTen}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm font-medium text-gray-500">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">#{selectedPatient.maBenhNhan}</span>
              <span>•</span>
              <span>{selectedPatient.gioiTinh === 1 ? 'Nam' : 'Nữ'}</span>
              <span>•</span>
              <span>{selectedPatient.ngaySinh ? new Date(selectedPatient.ngaySinh).toLocaleDateString('vi-VN') : 'N/A'}</span>
              {selectedPatient.ghiChu && (
                <>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md max-w-[200px] truncate" title={selectedPatient.ghiChu}>
                    📝 {selectedPatient.ghiChu}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConfirmDialog
            isOpen={confirmState.isOpen}
            title={confirmState.title}
            message={confirmState.message}
            type={confirmState.type}
            icon={confirmState.icon}
            onConfirm={confirmState.onConfirm}
            onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
          />
          <button onClick={handleFinishExam} className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">done_all</span>
            KẾT THÚC KHÁM
          </button>
          <button onClick={() => { setSelectedPatient(null); onBackToQueue(); }} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="flex p-1 bg-white rounded-xl border border-gray-100 shadow-sm w-fit overflow-x-auto">
        {[
          { id: 'info', label: 'Thông Tin Khám', icon: 'description' },
          ...(isTmhDoc ? [{ id: 'tmh_info', label: 'Khám Tai Mũi Họng', icon: 'hearing' }] : []),
          ...(isRhmDoc ? [{ id: 'rhm_info', label: 'Khám Răng Hàm Mặt', icon: 'dentistry' }] : []),
          ...(isCardiologyDoc ? [{ id: 'cardio_info', label: 'Khám Tim Mạch', icon: 'cardiology' }] : []),
          ...(isNhiDoc ? [{ id: 'nhi_info', label: 'Khám Nhi Khoa', icon: 'child_care' }] : []),
          { id: 'results', label: 'Kết Quả CLS', icon: 'visibility' },
          { id: 'history', label: 'Lịch Sử Khám', icon: 'history' },
          { id: 'services', label: 'Dịch Vụ Chỉ Định', icon: 'medical_services' },
          { id: 'prescription', label: 'Kê Đơn Thuốc', icon: 'medication' },
          { id: 'appointment', label: 'Hẹn Khám', icon: 'calendar_month' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => handleTabChange(t.id)} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${examSubTab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <span className="material-symbols-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 min-w-0">
          <div style={{ display: examSubTab === 'info' ? 'block' : 'none' }}>
            <TabKhamLamSang 
              selectedPatient={selectedPatient}
              user={user}
              ref={tabKhamLamSangRef}
            />
          </div>

          {examSubTab === 'tmh_info' && (
            <TabKhamTMH 
              examData={examData}
              setExamData={setExamData}
              maPhieuKham={selectedPatient.maPhieuKham}
            />
          )}

          {examSubTab === 'rhm_info' && (
            <TabKhamRHM 
              examData={examData}
              setExamData={setExamData}
              maPhieuKham={selectedPatient.maPhieuKham}
            />
          )}

          {examSubTab === 'cardio_info' && (
            <TabKhamTimMach 
              examData={examData}
              setExamData={setExamData}
              maPhieuKham={selectedPatient.maPhieuKham}
            />
          )}

          {examSubTab === 'nhi_info' && (
            <TabKhamNhi 
              examData={examData}
              setExamData={setExamData}
              maPhieuKham={selectedPatient.maPhieuKham}
            />
          )}

          {examSubTab === 'results' && <TabKetQuaCLS maPhieuKham={selectedPatient.maPhieuKham} />}

          {examSubTab === 'services' && (
            <TabDichVuChiDinh 
              serviceSearch={serviceSearch} 
              setServiceSearch={setServiceSearch} 
              showServiceList={showServiceList} 
              setShowServiceList={setShowServiceList} 
              allServices={allServices} 
              handleAddService={handleAddService} 
              handleRemoveService={handleRemoveService} 
              handleSaveReferral={handleSaveReferral} 
              selectedServices={selectedServices} 
              setSelectedServices={setSelectedServices} 
            />
          )}

          {examSubTab === 'history' && <TabLichSuKhamChiTiet examHistory={examHistory} allMeds={allMeds} />}

          {examSubTab === 'prescription' && (
            <TabKeDonThuoc 
              medSearch={medSearch} 
              setMedSearch={setMedSearch} 
              showMedList={showMedList} 
              setShowMedList={setShowMedList} 
              allMeds={allMeds} 
              handleAddMed={handleAddMed} 
              handleSavePrescription={handleSavePrescription} 
              selectedMeds={selectedMeds} 
              setSelectedMeds={handleSetSelectedMeds} 
              onUpdateMedField={handleUpdateMedField}
            />
          )}

          {examSubTab === 'appointment' && (
            <TabHenTaiKham user={user} patient={selectedPatient} />
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Chỉ Số Sinh Hiệu</h3>
            <HienThiSinhHieu phieuKhamId={selectedPatient.maPhieuKham} />
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg border border-indigo-500 text-white">
            <h3 className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-4">Trạng thái phiếu khám</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></div>
              <span className="font-bold text-sm tracking-wide">ĐANG THỰC HIỆN KHÁM</span>
            </div>
            <p className="text-xs text-indigo-200 mt-3 font-medium opacity-90">Mã phiếu: #{selectedPatient.maPhieuKham}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManHinhKhamBenh;
