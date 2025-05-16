import React, { createContext, useState, useEffect } from 'react'; // Removed useContext
import type { ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextType { // Export the interface
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); // Export the context

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });


    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// The useAuth hook has been moved to src/hooks/useAuth.ts
