-- Create trigger to auto-assign roles when new users sign up
-- First user becomes admin, subsequent users become staff

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count int;
  assigned_role app_role;
BEGIN
  -- Count existing users (excluding the new one)
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- First user gets admin, others get staff
  IF user_count = 0 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'staff';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (after the profile trigger)
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Add update policy to user_roles for admins
CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));