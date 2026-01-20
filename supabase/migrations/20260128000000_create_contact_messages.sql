
-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for unauthenticated users if valid, but here we likely enforce auth in dashboard
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own messages
CREATE POLICY "Users can create contact messages" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own messages (optional, if we want a "sent messages" history)
CREATE POLICY "Users can view their own messages" 
ON public.contact_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins/Support can view all messages (assuming a role based system or separate admin table policy, 
-- but for now, we'll keep it simple or rely on service role for admin dashboard)
-- NOTE: Regular users should NOT be able to see other people's messages.
