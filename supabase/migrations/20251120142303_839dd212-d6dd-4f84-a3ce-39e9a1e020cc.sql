-- Add mobile_number, birthday, and about fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN mobile_number text,
ADD COLUMN birthday date,
ADD COLUMN about text;

-- Update the handle_new_user function to include mobile_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, mobile_number)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'mobile_number', '')
  );
  RETURN new;
END;
$$;