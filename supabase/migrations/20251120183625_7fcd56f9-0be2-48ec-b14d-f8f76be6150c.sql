-- Fix Critical Security Issue #1: Profiles table public exposure
-- Remove public read access and restrict to own profile only
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Fix Critical Security Issue #2: Memories table public exposure  
-- Remove public read access and restrict to own memories only
DROP POLICY IF EXISTS "Users can view all memories" ON public.memories;

CREATE POLICY "Users view own memories" 
ON public.memories 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix Issue #3: User articles author tracking
-- Note: Keeping current policy as articles may need to be public
-- If anonymity is required, this should be discussed with stakeholders

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with RLS restricting access to own profile only';
COMMENT ON TABLE public.memories IS 'User memories with RLS restricting access to own memories only';