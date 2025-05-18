import React, { useEffect, useState } from 'react';
import { Admin, Resource } from 'react-admin';
import { supabaseDataProvider } from 'ra-supabase';
import { supabase } from './supabaseClient';

import { MenuList } from './admin/menu'; // Import MenuList
import { MenuEdit } from './admin/MenuEdit'; // Import MenuEdit
import { MenuCreate } from './admin/MenuCreate'; // Import MenuCreate
import { OrderList } from './admin/orders'; // Import OrderList
import { OrderEdit } from './admin/OrderEdit'; // Import OrderEdit
import LoginPage from './admin/LoginPage'; // Import LoginPage

// Initialize Supabase client for the Admin panel
// Using Anon Key for now, but proper authentication/authorization is required for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase data provider
const dataProvider = supabaseDataProvider({
  instanceUrl: supabaseUrl,
  apiKey: supabaseAnonKey,
});

// TODO: Add Edit and Create components for orders and menu

const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAdminAuth = async () => {
      setLoadingAuth(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // In a real app, you'd check for a specific role or claim.
        // For example, if you set a custom claim 'app_role' to 'admin' in Supabase:
        // const { data: { session } } = await supabase.auth.getSession();
        // const jwt = session?.access_token;
        // if (jwt) {
        //   const payload = JSON.parse(atob(jwt.split('.')[1]));
        //   setIsAdmin(payload.user_app_metadata?.app_role === 'admin');
        // } else {
        //  setIsAdmin(false);
        // }
        // For simplicity now, let's assume any authenticated user is an admin for testing.
        // Replace this with actual role checking in production.
        // This could also be based on user_metadata if you set it.
        // Example: user.user_metadata?.role === 'admin'
        setIsAdmin(true); // Placeholder: any logged-in user is admin
      } else {
        setIsAdmin(false);
      }
      setLoadingAuth(false);
    };

    checkAdminAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => { // Removed event, session
      // Re-check admin status on auth changes (login/logout)
      checkAdminAuth();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loadingAuth) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  if (!isAdmin) {
    return <LoginPage />; // Or a "Not Authorized" page / redirect to login
  }

  return (
    <Admin dataProvider={dataProvider}>
      <Resource name="menu" list={MenuList} edit={MenuEdit} create={MenuCreate} /> {/* Added edit and create for menu */}
      <Resource name="orders" list={OrderList} edit={OrderEdit} /> {/* Added edit={OrderEdit} */}
    </Admin>
  );
};

export default AdminDashboard;
