CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(user_id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can read all settings
CREATE POLICY "Admins can view platform settings"
    ON public.platform_settings FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- Admins can update settings
CREATE POLICY "Admins can update platform settings"
    ON public.platform_settings FOR UPDATE
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('general', '{"platformName": "ouyaboung Gabon", "supportEmail": "support@ouyaboung.ga"}', 'General platform information'),
    ('registration', '{"isOpen": true, "autoApprove": false}', 'Merchant registration settings'),
    ('maintenance', '{"isEnabled": false, "message": "Plateforme en maintenance"}', 'Maintenance mode configuration')
ON CONFLICT (key) DO NOTHING;
