-- Fix Function Search Path Mutable
-- This prevents potential SQL injection by setting a fixed search path
ALTER FUNCTION public.trigger_set_timestamp
SET search_path = 'public';

-- Fix Auth RLS Initialization Plan
-- Update RLS policies to use subqueries for better performance
-- For orders table
ALTER POLICY "Users can view their own orders" ON orders
USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "Users can create their own orders" ON orders
WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER POLICY "Users can update their own orders" ON orders
USING ((SELECT auth.uid()) = user_id);

-- For menu table (if it has RLS policies)
ALTER POLICY "Public read access" ON menu
USING (true);

-- For any other tables with auth.uid() in their policies
-- Example:
-- ALTER POLICY "Policy name" ON table_name
-- USING ((SELECT auth.uid()) = user_column);
-- WITH CHECK ((SELECT auth.uid()) = user_column);

-- Note: For the Leaked Password Protection and MFA options,
-- these need to be enabled in the Supabase Dashboard under Authentication settings
-- and cannot be done via SQL.
