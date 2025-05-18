-- Enable Row Level Security on the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for authenticated users to insert their own orders
CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for authenticated users to update their own orders
-- (This might be restricted in a real app, but useful for testing)
CREATE POLICY "Users can update their own orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for anonymous users to read orders with null user_id (guest orders)
-- This is for guest checkout functionality
CREATE POLICY "Anonymous users can view guest orders"
ON orders FOR SELECT
TO anon
USING (user_id IS NULL);

-- Create policy for anonymous users to insert orders with null user_id (guest orders)
CREATE POLICY "Anonymous users can create guest orders"
ON orders FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Create policy for service role to access all orders (for admin functions)
CREATE POLICY "Service role has full access to orders"
ON orders
TO service_role
USING (true);

-- Optional: Create policy for admin users (if you have a custom claim or role)
-- This would require setting up custom claims in Supabase Auth
-- CREATE POLICY "Admins can access all orders"
-- ON orders
-- USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
