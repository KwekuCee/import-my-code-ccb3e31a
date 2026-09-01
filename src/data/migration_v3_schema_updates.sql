-- ============================================================================
-- GCYC GROUP CHURCH MANAGEMENT SYSTEM - SCHEMA MIGRATION V3
-- Date: 2026-08-29
-- Adds: Service Types Management, Alert/Notification System
-- ============================================================================

-- 1. CREATE SERVICE TYPES TABLE (Global & Per-Church Service Management)
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_global BOOLEAN DEFAULT TRUE, -- TRUE = available to all churches, FALSE = church-specific
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL, -- Which admin/superadmin created it
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE, -- If church-specific, which church
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, church_id) -- Ensure no duplicate service names per church
);

-- 2. ALTER USER PROFILES TO TRACK WHICH CHURCH ADMIN MANAGES WHICH CHURCH
-- (This establishes the relationship between church_admins and churches)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_church_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS admin_verified_date TIMESTAMPTZ;

-- 3. CREATE AUDIT LOG ALERTS TABLE (For tracking read/unread notification status)
CREATE TABLE IF NOT EXISTS public.audit_log_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id UUID REFERENCES public.audit_logs(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_by_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  alert_category VARCHAR(100), -- 'Check-in', 'Leader', 'Member', 'System', 'Announcement', 'Security'
  alert_severity VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'critical'
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE, -- Which church this alert is for
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADD SERVICE TYPE TRACKING TO ATTENDANCE RECORDS (Optional - for analytics)
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES public.service_types(id) ON DELETE SET NULL;

-- 5. CREATE SETTINGS TABLE FOR SUPERADMIN & CHURCH ADMIN CONFIGURATION PERSISTENCE
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'boolean', 'json', 'number'
  is_global BOOLEAN DEFAULT FALSE, -- TRUE = superadmin global setting, FALSE = per-admin
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(admin_id, setting_key)
);

-- 6. ADD INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_service_types_is_global ON public.service_types(is_global);
CREATE INDEX IF NOT EXISTS idx_service_types_church_id ON public.service_types(church_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_alerts_church_id ON public.audit_log_alerts(church_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_alerts_is_read ON public.audit_log_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_settings_admin_id ON public.admin_settings(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_settings_is_global ON public.admin_settings(is_global);

-- 7. INSERT DEFAULT GLOBAL SERVICE TYPES
INSERT INTO public.service_types (name, description, is_global, is_active, created_at)
VALUES 
  ('Sunday Service', 'Weekly Sunday service', TRUE, TRUE, NOW()),
  ('Midweek Service', 'Mid-week prayer and worship service', TRUE, TRUE, NOW()),
  ('Special Service', 'Special events and crusades', TRUE, TRUE, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ENABLE ROW-LEVEL SECURITY (RLS) POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on service_types (Global services visible to all, church-specific only to that church)
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service types are viewable by all authenticated users" ON public.service_types
  FOR SELECT USING (true);
CREATE POLICY "Superadmin can manage global service types" ON public.service_types
  FOR ALL USING (
    (SELECT role FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'Superadmin'
  );
CREATE POLICY "Church admins can manage their church service types" ON public.service_types
  FOR ALL USING (
    church_id IS NULL OR 
    church_id = (SELECT church_id FROM public.user_profiles WHERE auth_user_id = auth.uid())
  );

-- Enable RLS on audit_log_alerts
ALTER TABLE public.audit_log_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view alerts for their church" ON public.audit_log_alerts
  FOR SELECT USING (
    (SELECT role FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'Superadmin' OR
    church_id = (SELECT church_id FROM public.user_profiles WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Users can update their own alert read status" ON public.audit_log_alerts
  FOR UPDATE USING (
    read_by_user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
  );

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage their own settings" ON public.admin_settings
  FOR ALL USING (
    admin_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Superadmin can manage global settings" ON public.admin_settings
  FOR ALL USING (
    (SELECT role FROM public.user_profiles WHERE auth_user_id = auth.uid()) = 'Superadmin' AND is_global = TRUE
  );

-- ============================================================================
-- HELPER FUNCTION: Mark all alerts as read for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION mark_user_alerts_as_read(user_id UUID)
RETURNS TABLE(updated_count INTEGER) AS $$
BEGIN
  UPDATE public.audit_log_alerts
  SET is_read = TRUE, read_by_user_id = user_id, read_at = NOW()
  WHERE is_read = FALSE AND read_by_user_id IS NULL;
  
  RETURN QUERY SELECT COUNT(*)::INTEGER FROM public.audit_log_alerts 
    WHERE read_by_user_id = user_id AND read_at >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES FOR IMPLEMENTATION
-- ============================================================================
-- 1. Update App.tsx to fetch service_types from Supabase
-- 2. Pass service_types to NewRegistration component
-- 3. Update SettingsView to persist settings to admin_settings table
-- 4. Update TopHeader to fetch alerts from audit_log_alerts
-- 5. Implement "Mark all as read" button using mark_user_alerts_as_read function
-- 6. Export CSV should call a Supabase RPC or frontend function to generate multi-sheet export
-- 7. Dashboard branches should be derived from church_admins table
