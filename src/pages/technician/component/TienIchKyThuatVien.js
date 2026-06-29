export const removeVietnameseTones = str => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').trim();
};

export const formatDateTime = isoString => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateOfBirth = dateString => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export const calculateAge = dateString => {
  if (!dateString) return '';
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age > 0 ? `${age} tuổi` : 'Dưới 1 tuổi';
};

export const getValueStatus = (field, value) => {
  if (value === undefined || value === '' || field.min === undefined) return 'normal';
  const numVal = parseFloat(value);
  if (isNaN(numVal)) return 'normal';
  if (numVal < field.min) return 'low';
  if (numVal > field.max) return 'high';
  return 'normal';
};

export const LAB_TEMPLATES = {
  HEMATOLOGY: {
    key: 'HEMATOLOGY',
    title: 'Xét nghiệm Huyết học (Công thức máu)',
    fields: [
      { key: 'rbc', label: 'Hồng cầu (RBC)', unit: 'T/L', min: 3.8, max: 5.8, defaultValue: '4.5' },
      { key: 'wbc', label: 'Bạch cầu (WBC)', unit: 'G/L', min: 4.0, max: 10.0, defaultValue: '6.5' },
      { key: 'hgb', label: 'Hemoglobin (HGB)', unit: 'g/dL', min: 12.0, max: 16.5, defaultValue: '14.2' },
      { key: 'plt', label: 'Tiểu cầu (PLT)', unit: 'G/L', min: 150, max: 400, defaultValue: '260' }
    ]
  },
  BIOCHEMISTRY: {
    key: 'BIOCHEMISTRY',
    title: 'Xét nghiệm Sinh hóa máu',
    fields: [
      { key: 'glucose', label: 'Glucose', unit: 'mmol/L', min: 3.9, max: 6.4, defaultValue: '5.2' },
      { key: 'ure', label: 'Ure', unit: 'mmol/L', min: 2.5, max: 7.5, defaultValue: '4.8' },
      { key: 'creatinin', label: 'Creatinin', unit: 'µmol/L', min: 44, max: 106, defaultValue: '76' }
    ]
  },
  URINALYSIS: {
    key: 'URINALYSIS',
    title: 'Xét nghiệm Nước tiểu',
    fields: [
      { key: 'ph', label: 'Độ pH', unit: '', min: 5.0, max: 8.5, defaultValue: '6.0' },
      { key: 'glucose_uri', label: 'Glucose', type: 'select', options: ['Negative', 'Positive'], defaultValue: 'Negative' }
    ]
  }
};

export const IMAGING_TEMPLATES = {
  GENERIC: {
    key: 'CDHA_GENERIC',
    title: 'Kết quả Chẩn Đoán Hình Ảnh',
    fields: [
      { key: 'mo_ta', label: 'Mô tả hình ảnh', type: 'textarea', defaultValue: 'Không phát hiện bất thường.' }
    ]
  }
};

export const getTemplateForService = (serviceName, isImaging) => {
  if (!serviceName) return null;
  const nameLower = removeVietnameseTones(serviceName.toLowerCase());
  
  if (isImaging || nameLower.includes('sieu am') || nameLower.includes('x quang') || nameLower.includes('ct') || nameLower.includes('mri') || nameLower.includes('noi soi')) {
    return {
      key: 'CDHA_GENERIC',
      title: serviceName,
      fields: [
        { key: 'mo_ta', label: 'Mô tả hình ảnh', type: 'textarea', defaultValue: 'Không phát hiện bất thường.' }
      ]
    };
  }
  
  if (nameLower.includes('mau') || nameLower.includes('sinh hoa')) return LAB_TEMPLATES.BIOCHEMISTRY;
  if (nameLower.includes('nuoc tieu')) return LAB_TEMPLATES.URINALYSIS;
  return null;
};

export const generateTextFromTemplate = (template, values, serviceName) => {
  if (!template) return '';
  const isImaging = ['ULTRASOUND', 'XRAY', 'CDHA_GENERIC'].includes(template.key);
  let text = isImaging ? `=== PHIẾU BÁO CÁO KẾT QUẢ CHẨN ĐOÁN HÌNH ẢNH ===\n\n` : `=== PHIẾU BÁO CÁO XÉT NGHIỆM LÂM SÀNG ===\n\n`;
  const title = serviceName || template.title;
  text += `Dịch vụ thực hiện: ${title.toUpperCase()}\n--------------------------------------------------------\n`;
  template.fields.forEach(f => {
    const val = values[f.key] !== undefined ? values[f.key] : f.defaultValue || '';
    if (isImaging) text += `+ ${f.label}:\n  ${val}\n\n`;
    else {
      const unit = f.unit ? ` ${f.unit}` : '';
      text += `+ ${f.label}: ${val}${unit}\n`;
    }
  });
  return text;
};