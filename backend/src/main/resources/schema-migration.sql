-- Migration script: Add missing columns to dang_ky_kham_benh table
-- Run this manually if Hibernate ddl-auto=update fails due to insufficient permissions

-- Add ma_dich_vu column if it doesn't exist
ALTER TABLE dang_ky_kham_benh 
ADD COLUMN IF NOT EXISTS ma_dich_vu INT NULL AFTER ma_phieu_kham;

-- Add ma_phieu_kham column if it doesn't exist
ALTER TABLE dang_ky_kham_benh 
ADD COLUMN IF NOT EXISTS ma_phieu_kham INT NULL AFTER trang_thai;

-- Ensure ma_dich_vu column exists in phieu_kham table
ALTER TABLE phieu_kham 
ADD COLUMN IF NOT EXISTS ma_dich_vu INT NULL AFTER ghi_chu;

-- ============================================================
-- FIX: Drop incorrect foreign key constraint fk_mactchidinh
-- The constraint incorrectly references chi_tiet_chi_dinh(id)
-- but ma_dich_vu should reference dich_vu(ma_dich_vu)
-- ============================================================

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE dang_ky_kham_benh 
DROP FOREIGN KEY IF EXISTS fk_mactchidinh;

-- Step 2: Add the correct foreign key constraint referencing dich_vu table
ALTER TABLE dang_ky_kham_benh 
ADD CONSTRAINT fk_dangky_dichvu 
FOREIGN KEY (ma_dich_vu) REFERENCES dich_vu(ma_dich_vu) 
ON DELETE SET NULL ON UPDATE CASCADE;