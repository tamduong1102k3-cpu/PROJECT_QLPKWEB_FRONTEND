import { apiClient } from "../../../api/apiClient";
import { createApi, updateApi, deleteApi } from '../../../api/dichVuApi';
import React, { useState, useEffect } from 'react';
const BASE_DV = 'https://qlpk-backend-spring-boot.onrender.com/api/dich-vu';
const BASE_DM = 'https://qlpk-backend-spring-boot.onrender.com/api/danhmuc';
const empty = {
  tenDichVu: '',
  donGia: '',
  loaiDichVu: '',
  phong: '',
  maChuyenKhoa: ''
};
const fmtGia = val => {
  if (!val && val !== 0) return '—';
  return Number(val).toLocaleString('vi-VN') + ' đ';
};
export default function QuanLyDichVu() {
  const [list, setList] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [ckList, setCkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dv, ph, ck] = await Promise.all([apiClient(BASE_DV).then(r => r.json()), apiClient(`${BASE_DM}/phong`).then(r => r.json()), apiClient(`${BASE_DM}/chuyen-khoa`).then(r => r.json())]);
      setList(dv || []);
      setPhongList(ph || []);
      setCkList(ck || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const tenPhong = id => phongList.find(p => p.maPhong === id)?.tenPhong || '—';
  const tenCK = id => ckList.find(c => c.maChuyenKhoa === id)?.tenChuyenKhoa || '—';

  // Unique loai for filter
  const loaiOptions = [...new Set(list.map(d => d.loaiDichVu).filter(Boolean))];
  const displayed = list.filter(d => {
    const matchSearch = d.tenDichVu?.toLowerCase().includes(search.toLowerCase());
    const matchLoai = filterLoai ? d.loaiDichVu === filterLoai : true;
    return matchSearch && matchLoai;
  });
  const openAdd = () => {
    setForm(empty);
    setEditId(null);
    setModal('add');
  };
  const openEdit = d => {
    setForm({
      tenDichVu: d.tenDichVu || '',
      donGia: d.donGia ?? '',
      loaiDichVu: d.loaiDichVu || '',
      phong: d.phong ?? '',
      maChuyenKhoa: d.maChuyenKhoa ?? ''
    });
    setEditId(d.maDichVu);
    setModal('edit');
  };
  const handleSave = async () => {
    if (!form.tenDichVu.trim()) {
      alert('Vui lòng nhập tên dịch vụ!');
      return;
    }
    if (!form.donGia || isNaN(Number(form.donGia))) {
      alert('Vui lòng nhập đơn giá hợp lệ!');
      return;
    }
    setSaving(true);
    const body = {
      tenDichVu: form.tenDichVu.trim(),
      donGia: Number(form.donGia),
      loaiDichVu: form.loaiDichVu || null,
      phong: form.phong !== '' ? Number(form.phong) : null,
      maChuyenKhoa: form.maChuyenKhoa !== '' ? Number(form.maChuyenKhoa) : null
    };
    try {
      const res = {
        ok: false
      };
      try {
        if (modal === 'edit') {
          await updateApi(editId, body);
        } else {
          await createApi(body);
        }
        res.ok = true;
      } catch (e) {}
      if (!res.ok) throw new Error('Lỗi lưu dữ liệu');
      setModal(null);
      fetchAll();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async id => {
    if (!window.confirm('Xóa dịch vụ này?')) return;
    setDeleting(id);
    try {
      await deleteApi(id);
      fetchAll();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(null);
    }
  };

  // Stats
  const totalDV = displayed.length;
  const avgGia = totalDV > 0 ? displayed.reduce((s, d) => s + (Number(d.donGia) || 0), 0) / totalDV : 0;
  const maxGia = Math.max(...displayed.map(d => Number(d.donGia) || 0), 0);
  return <div style={{
    fontFamily: 'Inter, sans-serif'
  }}>
      <style>{`input::placeholder { color: #fff !important; }`}</style>

      {/* Header */}
      <div style={{
      background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
      borderRadius: '12px',
      padding: '18px 24px',
      color: '#fff',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
        <div>
          <h2 style={{
          margin: 0,
          fontSize: '17px',
          fontWeight: 700
        }}>QUẢN LÝ DỊCH VỤ</h2>
          <p style={{
          margin: '4px 0 0',
          fontSize: '12px',
          opacity: 0.8
        }}>{list.length} dịch vụ trong hệ thống</p>
        </div>
        <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên dịch vụ..." style={{
          padding: '8px 14px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '13px',
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          outline: 'none',
          minWidth: '180px'
        }} />
          <select value={filterLoai} onChange={e => setFilterLoai(e.target.value)} style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '13px',
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          outline: 'none',
          cursor: 'pointer'
        }}>
            <option value="" style={{
            color: '#111'
          }}>Tất cả loại</option>
            {loaiOptions.map(l => <option key={l} value={l} style={{
            color: '#111'
          }}>{l}</option>)}
          </select>
          <button onClick={openAdd} style={{
          padding: '8px 18px',
          background: '#fff',
          color: '#7c3aed',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer'
        }}>
            ➕ Thêm Dịch Vụ
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: '12px',
      marginBottom: '16px'
    }}>
        {[{
        label: 'Đang hiển thị',
        val: `${totalDV} dịch vụ`,
        icon: '📋',
        color: '#7c3aed',
        bg: '#f5f3ff'
      }, {
        label: 'Giá trung bình',
        val: fmtGia(Math.round(avgGia)),
        icon: '💰',
        color: '#059669',
        bg: '#f0fdf4'
      }, {
        label: 'Giá cao nhất',
        val: fmtGia(maxGia),
        icon: '📈',
        color: '#d97706',
        bg: '#fffbeb'
      }].map((c, i) => <div key={i} style={{
        background: c.bg,
        borderRadius: '10px',
        padding: '14px 18px',
        border: `1px solid ${c.color}22`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
            <span style={{
          fontSize: '22px'
        }}>{c.icon}</span>
            <div>
              <div style={{
            fontSize: '11px',
            color: '#6b7280'
          }}>{c.label}</div>
              <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: c.color
          }}>{c.val}</div>
            </div>
          </div>)}
      </div>

      {/* Table */}
      <div style={{
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    }}>
        {loading ? <div style={{
        padding: '60px',
        textAlign: 'center',
        color: '#9ca3af'
      }}>Đang tải...</div> : <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
      }}>
            <thead>
              <tr style={{
            background: '#faf5ff'
          }}>
                {['#', 'Tên Dịch Vụ', 'Loại', 'Đơn Giá', 'Phòng', 'Chuyên Khoa', 'Thao Tác'].map(h => <th key={h} style={{
              padding: '12px 14px',
              textAlign: h === 'Thao Tác' || h === 'Đơn Giá' ? 'center' : 'left',
              color: '#6b7280',
              fontWeight: 600,
              borderBottom: '1px solid #e5e7eb',
              whiteSpace: 'nowrap'
            }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? <tr><td colSpan={7} style={{
              padding: '50px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>Không có dữ liệu</td></tr> : displayed.map((d, i) => <tr key={d.maDichVu} style={{
            borderBottom: '1px solid #f1f5f9',
            transition: 'background 0.15s'
          }} onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{
              padding: '10px 14px',
              color: '#9ca3af'
            }}>{i + 1}</td>
                  <td style={{
              padding: '10px 14px'
            }}>
                    <div style={{
                fontWeight: 600,
                color: '#1e293b'
              }}>{d.tenDichVu}</div>
                    <div style={{
                fontSize: '11px',
                color: '#9ca3af'
              }}>ID: {d.maDichVu}</div>
                  </td>
                  <td style={{
              padding: '10px 14px'
            }}>
                    {d.loaiDichVu ? <span style={{
                background: d.loaiDichVu.includes('KHAM') ? '#ede9fe' : d.loaiDichVu.includes('CLS') ? '#dbeafe' : '#fef9c3',
                color: d.loaiDichVu.includes('KHAM') ? '#7c3aed' : d.loaiDichVu.includes('CLS') ? '#1e40af' : '#92400e',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600
              }}>{d.loaiDichVu.replace(/_/g, ' ')}</span> : '—'}
                  </td>
                  <td style={{
              padding: '10px 14px',
              textAlign: 'center',
              fontWeight: 700,
              color: '#059669'
            }}>
                    {fmtGia(d.donGia)}
                  </td>
                  <td style={{
              padding: '10px 14px',
              color: '#374151',
              fontSize: '12px'
            }}>
                    {d.phong ? tenPhong(d.phong) : '—'}
                  </td>
                  <td style={{
              padding: '10px 14px',
              color: '#374151',
              fontSize: '12px'
            }}>
                    {d.maChuyenKhoa ? tenCK(d.maChuyenKhoa) : '—'}
                  </td>
                  <td style={{
              padding: '10px 14px',
              textAlign: 'center'
            }}>
                    <div style={{
                display: 'flex',
                gap: '6px',
                justifyContent: 'center'
              }}>
                      <button onClick={() => openEdit(d)} style={{
                  padding: '5px 12px',
                  background: '#ede9fe',
                  color: '#7c3aed',
                  border: '1px solid #ddd6fe',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(d.maDichVu)} disabled={deleting === d.maDichVu} style={{
                  padding: '5px 12px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                        {deleting === d.maDichVu ? '...' : '🗑 Xóa'}
                      </button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>}
      </div>

      {/* Modal */}
      {modal && <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
          <div style={{
        background: '#fff',
        width: '520px',
        maxWidth: '95vw',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
      }}>

            <div style={{
          background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
          padding: '18px 24px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
              <div style={{
            fontWeight: 700,
            fontSize: '15px'
          }}>
                {modal === 'add' ? '➕ Thêm Dịch Vụ Mới' : 'Cập Nhật Dịch Vụ'}
              </div>
              <button onClick={() => setModal(null)} style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px'
          }}>✕</button>
            </div>

            <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>

              <label style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            fontSize: '13px'
          }}>
                <span style={{
              fontWeight: 600,
              color: '#374151'
            }}>Tên Dịch Vụ <span style={{
                color: '#dc2626'
              }}>*</span></span>
                <input value={form.tenDichVu} onChange={e => setForm({
              ...form,
              tenDichVu: e.target.value
            })} placeholder="VD: Khám Nội Tổng Quát" style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '13px'
            }} />
              </label>

              <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
                <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              fontSize: '13px'
            }}>
                  <span style={{
                fontWeight: 600,
                color: '#374151'
              }}>Đơn Giá (đ) <span style={{
                  color: '#dc2626'
                }}>*</span></span>
                  <input type="number" min="0" value={form.donGia} onChange={e => setForm({
                ...form,
                donGia: e.target.value
              })} placeholder="VD: 100000" style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '13px'
              }} />
                </label>

                <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              fontSize: '13px'
            }}>
                  <span style={{
                fontWeight: 600,
                color: '#374151'
              }}>Loại Dịch Vụ</span>
                  <select value={form.loaiDichVu} onChange={e => setForm({
                ...form,
                loaiDichVu: e.target.value
              })} style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                    <option value="">-- Chọn loại --</option>
                    <option value="KHAM_BENH">KHAM BENH</option>
                    <option value="CLS_XET_NGHIEM">CLS XET NGHIEM</option>
                    <option value="CLS_CHAN_DOAN_HINH_ANH">CLS CHAN DOAN HINH ANH</option>
                  </select>
                </label>
              </div>

              <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
                <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              fontSize: '13px'
            }}>
                  <span style={{
                fontWeight: 600,
                color: '#374151'
              }}>Phòng</span>
                  <select value={form.phong} onChange={e => setForm({
                ...form,
                phong: e.target.value
              })} style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                    <option value="">-- Không có --</option>
                    {phongList.map(p => <option key={p.maPhong} value={p.maPhong}>{p.tenPhong}</option>)}
                  </select>
                </label>

                <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              fontSize: '13px'
            }}>
                  <span style={{
                fontWeight: 600,
                color: '#374151'
              }}>Chuyên Khoa</span>
                  <select value={form.maChuyenKhoa} onChange={e => setForm({
                ...form,
                maChuyenKhoa: e.target.value
              })} style={{
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '13px'
              }}>
                    <option value="">-- Không có --</option>
                    {ckList.map(c => <option key={c.maChuyenKhoa} value={c.maChuyenKhoa}>{c.tenChuyenKhoa}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
              <button onClick={() => setModal(null)} style={{
            padding: '9px 20px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '13px'
          }}>Hủy</button>
              <button onClick={handleSave} disabled={saving} style={{
            padding: '9px 24px',
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            opacity: saving ? 0.7 : 1
          }}>
                {saving ? '⏳ Đang lưu...' : '✔ Lưu'}
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
