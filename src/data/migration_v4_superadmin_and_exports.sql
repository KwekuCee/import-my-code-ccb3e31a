-- ============================================================================
-- GCYC GROUP CHURCH MANAGEMENT SYSTEM - SQL SCHEMA MIGRATION V4
-- Safe, Idempotent Migration: Superadmin Settings, Service Types, Audit Logs & Exports
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Churches Table (ensure exists)
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50),
  zone VARCHAR(100) DEFAULT 'Zone 1 (Korle Bu)',
  pastor VARCHAR(255),
  established VARCHAR(50) DEFAULT '2024',
  status VARCHAR(50) DEFAULT 'Healthy',
  members_count INT DEFAULT 0,
  pcf_count INT DEFAULT 0,
  cell_count INT DEFAULT 0,
  bsct_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Service Types Catalog (Ensure table & all columns exist)
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_global BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add any missing columns to existing service_types table
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS church_id UUID;
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT TRUE;
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add UNIQUE constraint on service_types(name) if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_service_types_name'
  ) THEN
    ALTER TABLE public.service_types ADD CONSTRAINT uq_service_types_name UNIQUE (name);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. Admin Preferences & Superadmin Global Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR(100) DEFAULT 'global',
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  setting_type VARCHAR(50) DEFAULT 'json',
  is_global BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add any missing columns to existing admin_settings table
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS admin_id VARCHAR(100) DEFAULT 'global';
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS setting_type VARCHAR(50) DEFAULT 'json';
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT TRUE;
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.admin_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add UNIQUE constraint on admin_settings(setting_key) if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_admin_settings_key'
  ) THEN
    ALTER TABLE public.admin_settings ADD CONSTRAINT uq_admin_settings_key UNIQUE (setting_key);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 5. Church Admin Accounts Directory (Branch Administrators)
CREATE TABLE IF NOT EXISTS public.church_admin_accounts (
  id VARCHAR(100) PRIMARY KEY,
  church_name VARCHAR(255) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  admin_phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) DEFAULT 'CEKBU@2026',
  zone VARCHAR(100) DEFAULT 'Zone 1 (Korle Bu)',
  role VARCHAR(50) DEFAULT 'Church Admin',
  status VARCHAR(50) DEFAULT 'Active',
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.church_admin_accounts ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT 'CEKBU@2026';
ALTER TABLE public.church_admin_accounts ADD COLUMN IF NOT EXISTS zone VARCHAR(100) DEFAULT 'Zone 1 (Korle Bu)';
ALTER TABLE public.church_admin_accounts ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Church Admin';
ALTER TABLE public.church_admin_accounts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE public.church_admin_accounts ADD COLUMN IF NOT EXISTS joined_date DATE DEFAULT CURRENT_DATE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_church_admin_email'
  ) THEN
    ALTER TABLE public.church_admin_accounts ADD CONSTRAINT uq_church_admin_email UNIQUE (admin_email);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 6. System Activity & Accountability Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor VARCHAR(255) NOT NULL,
  church_id UUID,
  church_name VARCHAR(255),
  action TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'System',
  icon VARCHAR(50) DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS church_name VARCHAR(255);
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'System';
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'info';

-- 7. Indexes for Rapid Search & Querying
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_service_types_name ON public.service_types(name);
CREATE INDEX IF NOT EXISTS idx_service_types_active ON public.service_types(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_church_admins_email ON public.church_admin_accounts(admin_email);

-- 8. Seed Initial Core Service Programs (Self Check-in & System Default)
INSERT INTO public.service_types (name, description, is_global, is_active)
VALUES 
  ('Sunday Service', 'Weekly Lord''s Day Divine Service', TRUE, TRUE),
  ('Midweek Service', 'Wednesday Corporate Prayer & Bible Study Service', TRUE, TRUE),
  ('Special Service', 'Special Praise, Miracle, & Communion Services', TRUE, TRUE)
ON CONFLICT (name) DO UPDATE SET 
  is_global = TRUE,
  is_active = TRUE;

-- 9. Seed Initial Global System Configuration
INSERT INTO public.admin_settings (admin_id, setting_key, setting_value, is_global)
VALUES (
  'global',
  'global_system_config',
  '{
    "hqChurchName": "GCYC Main Church (HQ)",
    "hqZone": "Zone 1 (Korle Bu)",
    "pastorName": "Pastor Group Leader",
    "pastorPhone": "+233 24 123 4567",
    "pastorEmail": "group.pastor@cekorlebu.org",
    "requireQrCheckIn": true,
    "allowGuestPreRegistration": true,
    "smsNotificationEnabled": true,
    "autoFlagPromotions": true,
    "autoAssignFoundationSchool": true,
    "serviceTypes": [
      { "id": "srv-1", "name": "Sunday Service", "active": true },
      { "id": "srv-2", "name": "Midweek Service", "active": true },
      { "id": "srv-3", "name": "Special Service", "active": true }
    ]
  }'::jsonb,
  TRUE
)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value, 
  updated_at = NOW();

-- 10. Enable Row-Level Security (RLS) and Safe Policies
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Service Types" ON public.service_types;
DROP POLICY IF EXISTS "Manage Service Types" ON public.service_types;
CREATE POLICY "Public Read Service Types" ON public.service_types FOR SELECT USING (true);
CREATE POLICY "Manage Service Types" ON public.service_types FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Admin Settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Manage Admin Settings" ON public.admin_settings;
CREATE POLICY "Public Read Admin Settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Manage Admin Settings" ON public.admin_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Audit Logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Manage Audit Logs" ON public.audit_logs;
CREATE POLICY "Public Read Audit Logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Manage Audit Logs" ON public.audit_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Church Admins" ON public.church_admin_accounts;
DROP POLICY IF EXISTS "Manage Church Admins" ON public.church_admin_accounts;
CREATE POLICY "Public Read Church Admins" ON public.church_admin_accounts FOR SELECT USING (true);
CREATE POLICY "Manage Church Admins" ON public.church_admin_accounts FOR ALL USING (true);
