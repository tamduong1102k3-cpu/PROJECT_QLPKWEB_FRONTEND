import { deleteThuocApi as _deleteThuocApi } from '../../api/khoThuocApi';
import { apiClient } from "../../api/apiClient";
import React, { useState, useEffect } from 'react';
const API = 'http://localhost:8080/api/kho-thuoc';
const NV_API = 'http://localhost:8080/api/nhan_vien';
const formatCurrency = v => v == null ? '—' : new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(v);
const formatDate = s => {
  if (!s) return '—';
  return new Date(s).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
const card = {
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,.06)'
};
const th = {
  padding: '11px 16px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'left',
  whiteSpace: 'nowrap'
};
const td = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#374151',
  borderBottom: '1px solid #f3f4f6'
};

// ── Hook: load lookup maps ────────────────────────────────────────────────────
const useLookups = refreshTrigger => {
  const [nvMap, setNvMap] = useState({}); // maNhanVien → hoTen
  const [thuocMap, setThuocMap] = useState({}); // maThuoc    → tenThuoc
  const [thuocList, setThuocList] = useState([]);
  useEffect(() => {
    Promise.all([apiClient(NV_API).then(r => r.json()), apiClient(`${API}/thuoc`).then(r => r.json())]).then(([nvList, tList]) => {
      const nv = {};
      nvList.forEach(n => {
        nv[n.maNhanVien] = n.hoTen;
      });
      setNvMap(nv);
      const th = {};
      tList.forEach(t => {
        th[t.maThuoc] = t.tenThuoc;
      });
      setThuocMap(th);
      setThuocList(tList);
    }).catch(() => {});
  }, [refreshTrigger]);
  return {
    nvMap,
    thuocMap,
    thuocList
  };
};

// ── Danh Mục Thuốc Tab ────────────────────────────────────────────────────────
const ThuocTab = ({
  items,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thuốc này?')) return;
    try {
      try {
        await _deleteThuocApi(id);
        onRefresh();
      } catch (e) {
        alert('Lỗi khi xóa thuốc');
      }
    } catch (e) {
      alert(e.message);
    }
  };
  const handleSave = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Convert numeric fields
    data.donGiaNhap = parseFloat(data.donGiaNhap) || 0;
    data.donGiaBan = parseFloat(data.donGiaBan) || 0;
    setLoading(true);
    try {
      const url = editing?.maThuoc ? `${API}/thuoc/${editing.maThuoc}` : `${API}/thuoc`;
      const method = editing?.maThuoc ? 'PUT' : 'POST';
      const res = await apiClient(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setEditing(null);
        onRefresh();
      } else alert('Lỗi khi lưu thuốc');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };
  const filtered = items.filter(i => !search || i.tenThuoc.toLowerCase().includes(search.toLowerCase()) || i.hoatChat?.toLowerCase().includes(search.toLowerCase()));
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }}>
      <div style={{
      ...card,
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
        <div style={{
        position: 'relative',
        width: '380px'
      }}>
          <span className="material-symbols-outlined" style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
          fontSize: '20px'
        }}>search</span>
          <input type="text" placeholder="Tìm theo tên thuốc, hoạt chất..." value={search} onChange={e => setSearch(e.target.value)} style={{
          width: '100%',
          paddingLeft: '38px',
          paddingRight: '12px',
          height: '40px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none'
        }} />
        </div>
        <button onClick={() => setEditing({})} style={{
        background: '#005bc0',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
      }}>
          <span className="material-symbols-outlined">add</span> Thêm Thuốc Mới
        </button>
      </div>

      <div style={{
      ...card,
      overflow: 'hidden'
    }}>
        <table style={{
        width: '100%',
        borderCollapse: 'collapse'
      }}>
          <thead style={{
          background: '#f9fafb'
        }}>
            <tr>
              <th style={th}>Tên Thuốc / Hoạt Chất</th>
              <th style={th}>Loại / Dạng</th>
              <th style={th}>Đơn Vị</th>
              <th style={th}>Giá Nhập / Bán</th>
              <th style={th}>Hạn SD</th>
              <th style={th}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => <tr key={i.maThuoc}>
                <td style={td}>
                  <div style={{
                fontWeight: 600
              }}>{i.tenThuoc}</div>
                  <div style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>{i.hoatChat} - {i.hamLuong}</div>
                </td>
                <td style={td}>{i.loaiThuoc} / {i.dangThuoc}</td>
                <td style={td}>{i.donViTinh}</td>
                <td style={td}>
                  <div style={{
                color: '#059669',
                fontSize: '13px'
              }}>N: {formatCurrency(i.donGiaNhap)}</div>
                  <div style={{
                color: '#005bc0',
                fontSize: '13px'
              }}>B: {formatCurrency(i.donGiaBan)}</div>
                </td>
                <td style={td}>{i.hanSuDung ? new Date(i.hanSuDung).toLocaleDateString('vi-VN') : '—'}</td>
                <td style={td}>
                  <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                    <button onClick={() => setEditing(i)} style={{
                  background: 'none',
                  border: 'none',
                  color: '#005bc0',
                  cursor: 'pointer'
                }} title="Sửa"><span className="material-symbols-outlined">edit</span></button>
                    <button onClick={() => handleDelete(i.maThuoc)} style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer'
                }} title="Xóa"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {editing && <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
          <div style={{
        ...card,
        width: '600px',
        padding: '24px'
      }}>
            <h3 style={{
          marginTop: 0,
          marginBottom: '20px'
        }}>{editing.maThuoc ? 'Sửa Thuốc' : 'Thêm Thuốc Mới'}</h3>
            <form onSubmit={handleSave} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
              <div style={{
            gridColumn: 'span 2'
          }}>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Tên thuốc *</label>
                <input name="tenThuoc" defaultValue={editing.tenThuoc} required style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Hoạt chất</label>
                <input name="hoatChat" defaultValue={editing.hoatChat} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Hàm lượng</label>
                <input name="hamLuong" defaultValue={editing.hamLuong} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Dạng thuốc</label>
                <input name="dangThuoc" defaultValue={editing.dangThuoc} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Loại thuốc</label>
                <input name="loaiThuoc" defaultValue={editing.loaiThuoc} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Đơn vị tính</label>
                <input name="donViTinh" defaultValue={editing.donViTinh} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Hạn sử dụng</label>
                <input type="date" name="hanSuDung" defaultValue={editing.hanSuDung} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Giá nhập</label>
                <input type="number" name="donGiaNhap" defaultValue={editing.donGiaNhap} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div>
                <label style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '4px'
            }}>Giá bán</label>
                <input type="number" name="donGiaBan" defaultValue={editing.donGiaBan} style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db'
            }} />
              </div>
              <div style={{
            gridColumn: 'span 2',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '10px'
          }}>
                <button type="button" onClick={() => setEditing(null)} style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: 'none'
            }}>Hủy</button>
                <button type="submit" disabled={loading} style={{
              padding: '8px 24px',
              borderRadius: '6px',
              background: '#005bc0',
              color: '#fff',
              border: 'none',
              fontWeight: 600
            }}>
                  {loading ? 'Đang lưu...' : 'Lưu Lại'}
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};

// ── Kho Thuốc Tab ─────────────────────────────────────────────────────────────
const KhoThuocTab = ({
  thuocMap
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient(API);
        if (!res.ok) throw new Error('Lỗi tải kho thuốc');
        setItems(await res.json());
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const filtered = items.filter(i => {
    if (!search) return true;
    const t = search.toLowerCase();
    const tenThuoc = (thuocMap[i.maThuoc] || '').toLowerCase();
    return String(i.maThuoc).includes(t) || tenThuoc.includes(t) || String(i.idKho).includes(t);
  });
  const stockBadge = qty => {
    if (qty == null) return {
      bg: '#f3f4f6',
      color: '#6b7280',
      label: '—'
    };
    if (qty === 0) return {
      bg: '#fee2e2',
      color: '#991b1b',
      label: 'Hết hàng'
    };
    if (qty < 20) return {
      bg: '#fef9c3',
      color: '#a16207',
      label: 'Sắp hết'
    };
    return {
      bg: '#dcfce7',
      color: '#166534',
      label: 'Còn hàng'
    };
  };
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }}>
      <div style={{
      ...card,
      padding: '20px 24px'
    }}>
        <div style={{
        marginBottom: '14px'
      }}>
          <h3 style={{
          margin: 0,
          fontSize: '17px',
          fontWeight: 700,
          color: '#1f2937'
        }}>Tồn Kho Thuốc</h3>
          <p style={{
          margin: '4px 0 0',
          fontSize: '13px',
          color: '#6b7280'
        }}>
            Tổng: <strong style={{
            color: '#005bc0'
          }}>{items.length}</strong> loại thuốc
          </p>
        </div>
        <div style={{
        position: 'relative',
        maxWidth: '380px'
      }}>
          <span className="material-symbols-outlined" style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
          fontSize: '20px'
        }}>search</span>
          <input type="text" placeholder="Tìm theo mã thuốc, tên thuốc..." value={search} onChange={e => setSearch(e.target.value)} style={{
          width: '100%',
          paddingLeft: '38px',
          paddingRight: '12px',
          height: '40px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none'
        }} />
        </div>
      </div>

      <div style={{
      ...card,
      overflow: 'hidden'
    }}>
        <div style={{
        overflowX: 'auto'
      }}>
          <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
            <thead style={{
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
              <tr>
                <th style={th}>Mã Kho</th>
                <th style={th}>Mã Thuốc</th>
                <th style={th}>Tên Thuốc</th>
                <th style={th}>Số Lượng Tồn</th>
                <th style={th}>Trạng Thái</th>
                <th style={th}>Cập Nhật Lần Cuối</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{
                ...td,
                textAlign: 'center',
                padding: '48px',
                color: '#9ca3af'
              }}>Đang tải...</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" style={{
                ...td,
                textAlign: 'center',
                padding: '48px',
                color: '#9ca3af'
              }}>Không có dữ liệu.</td></tr> : filtered.map(item => {
              const badge = stockBadge(item.soLuongTon);
              return <tr key={item.idKho} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}><strong>KHO{item.idKho?.toString().padStart(3, '0')}</strong></td>
                    <td style={{
                  ...td,
                  color: '#6b7280',
                  fontSize: '13px'
                }}>TH{item.maThuoc?.toString().padStart(3, '0')}</td>
                    <td style={{
                  ...td,
                  fontWeight: 500
                }}>{thuocMap[item.maThuoc] || <span style={{
                    color: '#9ca3af'
                  }}>—</span>}</td>
                    <td style={td}>
                      <span style={{
                    fontWeight: 700,
                    fontSize: '15px',
                    color: item.soLuongTon < 20 ? '#dc2626' : '#1f2937'
                  }}>
                        {item.soLuongTon ?? '—'}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: badge.bg,
                    color: badge.color
                  }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={td}>{formatDate(item.ngayCapNhatCuoi)}</td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};

// ── Phiếu Nhập Tab ────────────────────────────────────────────────────────────
const PhieuNhapTab = ({
  nvMap,
  thuocMap,
  thuocList,
  onRefresh
}) => {
  const [phieuList, setPhieuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating new slip
  const [newSlip, setNewSlip] = useState({
    maNhanVienNhap: 1,
    // Default to admin or first user
    ghiChu: '',
    chiTiet: [] // { maThuoc, soLuongNhap, donGiaNhap }
  });
  const loadPhieu = async () => {
    setLoading(true);
    try {
      const res = await apiClient(`${API}/phieu-nhap`);
      if (!res.ok) throw new Error('Lỗi tải phiếu nhập');
      setPhieuList(await res.json());
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPhieu();
  }, []);
  const openDetail = async phieu => {
    setSelected(phieu);
    setDetails([]);
    setLoadingDetail(true);
    try {
      const res = await apiClient(`${API}/phieu-nhap/${phieu.maPhieuNhapThuoc}/chi-tiet`);
      if (!res.ok) throw new Error('Lỗi tải chi tiết');
      setDetails(await res.json());
    } catch (e) {
      alert(e.message);
    } finally {
      setLoadingDetail(false);
    }
  };
  const handleAddRow = () => {
    setNewSlip(prev => ({
      ...prev,
      chiTiet: [...prev.chiTiet, {
        maThuoc: thuocList[0]?.maThuoc,
        soLuongNhap: 1,
        donGiaNhap: 0
      }]
    }));
  };
  const handleRemoveRow = idx => {
    setNewSlip(prev => ({
      ...prev,
      chiTiet: prev.chiTiet.filter((_, i) => i !== idx)
    }));
  };
  const handleUpdateRow = (idx, field, value) => {
    const list = [...newSlip.chiTiet];
    list[idx][field] = field === 'maThuoc' || field === 'soLuongNhap' ? parseInt(value) : parseFloat(value);
    setNewSlip({
      ...newSlip,
      chiTiet: list
    });
  };
  const handleSubmitImport = async () => {
    if (newSlip.chiTiet.length === 0) {
      alert('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }
    const tongTien = newSlip.chiTiet.reduce((sum, item) => sum + item.soLuongNhap * item.donGiaNhap, 0);
    const body = {
      ...newSlip,
      tongTienNhap: tongTien
    };
    try {
      const res = await apiClient(`${API}/phieu-nhap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsCreating(false);
        setNewSlip({
          maNhanVienNhap: 1,
          ghiChu: '',
          chiTiet: []
        });
        loadPhieu();
        onRefresh(); // Refresh inventory
      } else {
        const err = await res.text();
        alert('Lỗi: ' + err);
      }
    } catch (e) {
      alert(e.message);
    }
  };
  const filtered = phieuList.filter(p => {
    if (!search) return true;
    const t = search.toLowerCase();
    const tenNV = (nvMap[p.maNhanVienNhap] || '').toLowerCase();
    return String(p.maPhieuNhapThuoc).includes(t) || (p.trangThai || '').toLowerCase().includes(t) || tenNV.includes(t);
  });
  const statusStyle = s => {
    const map = {
      'hoan thanh': {
        bg: '#dcfce7',
        color: '#166534'
      },
      'cho xu ly': {
        bg: '#fef9c3',
        color: '#a16207'
      },
      'da huy': {
        bg: '#fee2e2',
        color: '#991b1b'
      }
    };
    return map[(s || '').toLowerCase()] || {
      bg: '#f3f4f6',
      color: '#6b7280'
    };
  };
  return <div style={{
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start'
  }}>
      {/* LIST */}
      <div style={{
      flex: selected ? '0 0 55%' : '1',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
        <div style={{
        ...card,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <div>
            <h3 style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 700,
            color: '#1f2937'
          }}>Phiếu Nhập Thuốc</h3>
            <p style={{
            margin: '4px 0 0',
            fontSize: '13px',
            color: '#6b7280'
          }}>
              Tổng: <strong style={{
              color: '#005bc0'
            }}>{phieuList.length}</strong> phiếu
            </p>
          </div>
          <div style={{
          display: 'flex',
          gap: '12px'
        }}>
            <div style={{
            position: 'relative',
            width: '300px'
          }}>
              <span className="material-symbols-outlined" style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '20px'
            }}>search</span>
              <input type="text" placeholder="Tìm kiếm phiếu..." value={search} onChange={e => setSearch(e.target.value)} style={{
              width: '100%',
              paddingLeft: '38px',
              paddingRight: '12px',
              height: '40px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }} />
            </div>
            <button onClick={() => setIsCreating(true)} style={{
            background: '#059669',
            color: '#fff',
            border: 'none',
            padding: '0 20px',
            borderRadius: '8px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
              <span className="material-symbols-outlined">add_box</span> Nhập Thuốc
            </button>
          </div>
        </div>

        <div style={{
        ...card,
        overflow: 'hidden'
      }}>
          <div style={{
          overflowX: 'auto'
        }}>
            <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
              <thead style={{
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
                <tr>
                  <th style={th}>Mã Phiếu</th>
                  <th style={th}>Ngày Nhập</th>
                  <th style={th}>Họ Tên NV</th>
                  <th style={th}>Tổng Tiền</th>
                  <th style={th}>Trạng Thái</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan="6" style={{
                  ...td,
                  textAlign: 'center',
                  padding: '48px',
                  color: '#9ca3af'
                }}>Đang tải...</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" style={{
                  ...td,
                  textAlign: 'center',
                  padding: '48px',
                  color: '#9ca3af'
                }}>Không có dữ liệu.</td></tr> : filtered.map(p => {
                const st = statusStyle(p.trangThai);
                const isActive = selecteđộ.maPhieuNhapThuoc === p.maPhieuNhapThuoc;
                return <tr key={p.maPhieuNhapThuoc} onClick={() => openDetail(p)} style={{
                  background: isActive ? '#eff6ff' : 'transparent',
                  cursor: 'pointer'
                }} onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = '#f9fafb';
                }} onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = isActive ? '#eff6ff' : 'transparent';
                }}>
                      <td style={td}><strong>#PN{p.maPhieuNhapThuoc?.toString().padStart(3, '0')}</strong></td>
                      <td style={td}>{formatDate(p.ngayNhap)}</td>
                      <td style={{
                    ...td,
                    fontWeight: 500
                  }}>{nvMap[p.maNhanVienNhap] || '—'}</td>
                      <td style={{
                    ...td,
                    fontWeight: 600,
                    color: '#059669'
                  }}>{formatCurrency(p.tongTienNhap)}</td>
                      <td style={td}>
                        <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: st.bg,
                      color: st.color
                    }}>
                          {p.trangThai || '—'}
                        </span>
                      </td>
                      <td style={td}>
                        <span className="material-symbols-outlined" style={{
                      fontSize: '20px',
                      color: isActive ? '#2563eb' : '#9ca3af'
                    }}>
                          {isActive ? 'chevron_right' : 'open_in_new'}
                        </span>
                      </td>
                    </tr>;
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL PANEL */}
      {selected && <div style={{
      flex: '1',
      minWidth: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'sticky',
      top: 0
    }}>
          <div style={{
        ...card,
        padding: '20px 24px'
      }}>
            <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
              <div>
                <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: '#1f2937'
            }}>
                  Phiếu #PN{selected.maPhieuNhapThuoc?.toString().padStart(3, '0')}
                </h3>
                <p style={{
              margin: '3px 0 0',
              fontSize: '13px',
              color: '#6b7280'
            }}>{formatDate(selected.ngayNhap)}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9ca3af'
          }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px'
        }}>
              {[{
            label: 'Tổng Tiền Nhập',
            value: formatCurrency(selected.tongTienNhap),
            highlight: true
          }, {
            label: 'Trạng Thái',
            value: selected.trangThai || '—'
          }, {
            label: 'NV Nhập (Mã)',
            value: `NV${selected.maNhanVienNhap?.toString().padStart(3, '0')}`
          }, {
            label: 'NV Nhập (Tên)',
            value: nvMap[selected.maNhanVienNhap] || '—'
          }].map(item => <div key={item.label} style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '10px 12px'
          }}>
                  <p style={{
              margin: 0,
              fontSize: '11px',
              color: '#9ca3af',
              marginBottom: '2px'
            }}>{item.label}</p>
                  <p style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: item.highlight ? '#059669' : '#1f2937'
            }}>{item.value}</p>
                </div>)}
            </div>
          </div>

          <div style={{
        ...card,
        overflow: 'hidden'
      }}>
            <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #f3f4f6'
        }}>
              <h4 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: '#1f2937'
          }}>Chi Tiết Thuốc Nhập</h4>
            </div>
            {loadingDetail ? <div style={{
          padding: '32px',
          textAlign: 'center',
          color: '#9ca3af'
        }}>Đang tải...</div> : <div style={{
          overflowX: 'auto'
        }}>
                <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px'
          }}>
                  <thead style={{
              background: '#f9fafb'
            }}>
                    <tr>
                      <th style={{
                  ...th,
                  fontSize: '11px'
                }}>Tên Thuốc</th>
                      <th style={{
                  ...th,
                  fontSize: '11px',
                  textAlign: 'right'
                }}>SL</th>
                      <th style={{
                  ...th,
                  fontSize: '11px',
                  textAlign: 'right'
                }}>Đơn Giá</th>
                      <th style={{
                  ...th,
                  fontSize: '11px',
                  textAlign: 'right'
                }}>Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map(d => <tr key={d.id} style={{
                borderBottom: '1px solid #f3f4f6'
              }}>
                        <td style={{
                  ...td,
                  padding: '10px 16px',
                  fontWeight: 500
                }}>{thuocMap[d.maThuoc] || '—'}</td>
                        <td style={{
                  ...td,
                  padding: '10px 16px',
                  textAlign: 'right'
                }}>{d.soLuongNhap}</td>
                        <td style={{
                  ...td,
                  padding: '10px 16px',
                  textAlign: 'right'
                }}>{formatCurrency(d.donGiaNhap)}</td>
                        <td style={{
                  ...td,
                  padding: '10px 16px',
                  textAlign: 'right',
                  fontWeight: 600,
                  color: '#059669'
                }}>{formatCurrency(d.thanhTien)}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </div>
        </div>}

      {/* CREATE MODAL */}
      {isCreating && <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
          <div style={{
        ...card,
        width: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
            <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
              <h3 style={{
            margin: 0
          }}>Tạo Phiếu Nhập Thuốc</h3>
              <button onClick={() => setIsCreating(false)} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
              <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
                <div>
                  <label style={{
                display: 'block',
                fontSize: '13px',
                marginBottom: '4px'
              }}>Nhân viên thực hiện</label>
                  <select value={newSlip.maNhanVienNhap} onChange={e => setNewSlip({
                ...newSlip,
                maNhanVienNhap: parseInt(e.target.value)
              })} style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }}>
                    {Object.entries(nvMap).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{
                display: 'block',
                fontSize: '13px',
                marginBottom: '4px'
              }}>Ghi chú</label>
                  <input placeholder="Lý do nhập, nhà cung cấp..." value={newSlip.ghiChu} onChange={e => setNewSlip({
                ...newSlip,
                ghiChu: e.target.value
              })} style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #d1d5db'
              }} />
                </div>
              </div>

              <div style={{
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
                <h4 style={{
              margin: 0
            }}>Danh sách thuốc nhập</h4>
                <button onClick={handleAddRow} style={{
              background: '#eff6ff',
              color: '#005bc0',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>+ Thêm dòng</button>
              </div>
              
              <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
                <thead>
                  <tr style={{
                background: '#f9fafb'
              }}>
                    <th style={{
                  ...th,
                  padding: '8px'
                }}>Tên Thuốc</th>
                    <th style={{
                  ...th,
                  padding: '8px',
                  width: '100px'
                }}>Số lượng</th>
                    <th style={{
                  ...th,
                  padding: '8px',
                  width: '150px'
                }}>Giá nhập</th>
                    <th style={{
                  ...th,
                  padding: '8px',
                  width: '150px'
                }}>Thành tiền</th>
                    <th style={{
                  ...th,
                  padding: '8px',
                  width: '50px'
                }}></th>
                  </tr>
                </thead>
                <tbody>
                  {newSlip.chiTiet.map((row, idx) => <tr key={idx}>
                      <td style={{
                  ...td,
                  padding: '8px'
                }}>
                        <select value={row.maThuoc} onChange={e => handleUpdateRow(idx, 'maThuoc', e.target.value)} style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }}>
                          {thuocList.map(t => <option key={t.maThuoc} value={t.maThuoc}>{t.tenThuoc}</option>)}
                        </select>
                      </td>
                      <td style={{
                  ...td,
                  padding: '8px'
                }}>
                        <input type="number" min="1" value={row.soLuongNhap} onChange={e => handleUpdateRow(idx, 'soLuongNhap', e.target.value)} style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }} />
                      </td>
                      <td style={{
                  ...td,
                  padding: '8px'
                }}>
                        <input type="number" value={row.donGiaNhap} onChange={e => handleUpdateRow(idx, 'donGiaNhap', e.target.value)} style={{
                    width: '100%',
                    padding: '6px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px'
                  }} />
                      </td>
                      <td style={{
                  ...td,
                  padding: '8px',
                  textAlign: 'right',
                  fontWeight: 600
                }}>
                        {formatCurrency(row.soLuongNhap * row.donGiaNhap)}
                      </td>
                      <td style={{
                  ...td,
                  padding: '8px'
                }}>
                        <button onClick={() => handleRemoveRow(idx)} style={{
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}><span className="material-symbols-outlined">delete</span></button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
              {newSlip.chiTiet.length === 0 && <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#9ca3af'
          }}>Chưa có thuốc nào được chọn</div>}
            </div>
            <div style={{
          padding: '20px 24px',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
              <div style={{
            fontSize: '18px'
          }}>
                Tổng cộng: <strong style={{
              color: '#059669'
            }}>{formatCurrency(newSlip.chiTiet.reduce((sum, item) => sum + item.soLuongNhap * item.donGiaNhap, 0))}</strong>
              </div>
              <div style={{
            display: 'flex',
            gap: '12px'
          }}>
                <button onClick={() => setIsCreating(false)} style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#fff'
            }}>Hủy</button>
                <button onClick={handleSubmitImport} style={{
              padding: '10px 32px',
              borderRadius: '8px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              fontWeight: 700
            }}>Xác Nhận Nhập</button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};

// ── Main Component ─────────────────────────────────────────────────────────────
const QuanLyNhaThuoc = () => {
  const [activeTab, setActiveTab] = useState('thuoc');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const {
    nvMap,
    thuocMap,
    thuocList
  } = useLookups(refreshTrigger);
  const onRefresh = () => setRefreshTrigger(t => t + 1);
  const tabs = [{
    id: 'thuoc',
    label: 'Danh Mục Thuốc',
    icon: 'medication'
  }, {
    id: 'kho',
    label: 'Tồn Kho',
    icon: 'inventory_2'
  }, {
    id: 'nhap',
    label: 'Phiếu Nhập',
    icon: 'local_shipping'
  }];
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }}>
      <div style={{
      display: 'flex',
      gap: '8px',
      background: '#fff',
      padding: '8px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      alignSelf: 'flex-start',
      boxShadow: '0 1px 3px rgba(0,0,0,.06)'
    }}>
        {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all .2s',
        background: activeTab === t.id ? '#005bc0' : 'transparent',
        color: activeTab === t.id ? '#fff' : '#6b7280'
      }}>
            <span className="material-symbols-outlined" style={{
          fontSize: '18px'
        }}>{t.icon}</span>
            {t.label}
          </button>)}
      </div>

      {activeTab === 'thuoc' && <ThuocTab items={thuocList} onRefresh={onRefresh} />}
      {activeTab === 'kho' && <KhoThuocTab thuocMap={thuocMap} />}
      {activeTab === 'nhap' && <PhieuNhapTab nvMap={nvMap} thuocMap={thuocMap} thuocList={thuocList} onRefresh={onRefresh} />}
    </div>;
};
export default QuanLyNhaThuoc;
