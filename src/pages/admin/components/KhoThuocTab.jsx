import React, { useState, useEffect } from 'react';
import { getAllKhoApi as _getAllKhoApi } from '../../../api/khoThuocApi';
import { card, th, td, formatDate } from './styles';

const stockBadge = qty => {
  if (qty == null) return { bg: '#f3f4f6', color: '#6b7280', label: '—' };
  if (qty === 0) return { bg: '#fee2e2', color: '#991b1b', label: 'Hết hàng' };
  if (qty < 20) return { bg: '#fef9c3', color: '#a16207', label: 'Sắp hết' };
  return { bg: '#dcfce7', color: '#166534', label: 'Còn hàng' };
};

const KhoThuocTab = ({ thuocMap }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await _getAllKhoApi();
        setItems(data || []);
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
    const tenThuoc = (thuocMap[i.maThuoc]?.tenThuoc || '').toLowerCase();
    return String(i.maThuoc).includes(t) || tenThuoc.includes(t) || String(i.idKho).includes(t);
  });

  return <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div style={{ ...card, padding: '20px 24px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1f2937' }}>Tồn Kho Thuốc</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
          Tổng: <strong style={{ color: '#005bc0' }}>{items.length}</strong> loại thuốc
        </p>
      </div>
      <div style={{ position: 'relative', maxWidth: '380px' }}>
        <span className="material-symbols-outlined" style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          color: '#9ca3af', fontSize: '20px'
        }}>search</span>
        <input type="text" placeholder="Tìm theo mã thuốc, tên thuốc..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', paddingLeft: '38px', paddingRight: '12px', height: '40px',
            border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none'
          }} />
      </div>
    </div>

    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
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
            {loading
              ? <tr><td colSpan="6" style={{ ...td, textAlign: 'center', padding: '48px', color: '#9ca3af' }}>Đang tải...</td></tr>
              : filtered.length === 0
                ? <tr><td colSpan="6" style={{ ...td, textAlign: 'center', padding: '48px', color: '#9ca3af' }}>Không có dữ liệu.</td></tr>
                : filtered.map(item => {
                    const badge = stockBadge(item.soLuongTon);
                    return <tr key={item.idKho}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={td}><strong>KHO{item.idKho?.toString().padStart(3, '0')}</strong></td>
                      <td style={{ ...td, color: '#6b7280', fontSize: '13px' }}>TH{item.maThuoc?.toString().padStart(3, '0')}</td>
                      <td style={{ ...td, fontWeight: 500 }}>
                        {thuocMap[item.maThuoc]?.tenThuoc || <span style={{ color: '#9ca3af' }}>—</span>}
                      </td>
                      <td style={td}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: item.soLuongTon < 20 ? '#dc2626' : '#1f2937' }}>
                          {item.soLuongTon ?? '—'}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: badge.bg, color: badge.color }}>
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

export default KhoThuocTab;