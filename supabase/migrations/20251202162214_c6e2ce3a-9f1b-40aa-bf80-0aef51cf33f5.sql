-- Allow authenticated users to view basic profile info (full_name, email) for statistics
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);