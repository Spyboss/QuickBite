import React, { createContext, useEffect, useState, useCallback } from 'react'; // Removed useContext, Added useCallback
import type { ReactNode } from 'react';
import { messaging } from '../firebase';
import { getToken } from 'firebase/messaging';
// import { supabase } from '../supabaseClient'; // Unused import
import { useAuth } from '../hooks/useAuth'; // Updated import path

export interface NotificationContextType { // Export interface
  fcmToken: string | null;
  requestNotificationPermission: () => Promise<string | null>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined); // Export context

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { user } = useAuth();

  const requestNotificationPermission = useCallback(async () => { // Wrapped with useCallback
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('VITE_FIREBASE_VAPID_KEY is not set in environment variables. FCM token generation will likely fail.');
          // Optionally, don't even attempt to getToken if vapidKey is missing,
          // or let it fail and be caught by the try/catch.
        }
        const currentToken = await getToken(messaging, {
          vapidKey: vapidKey,
        });
        if (currentToken) {
          console.log('FCM registration token:', currentToken);
          setFcmToken(currentToken);
          // Send token to backend to associate with user
          if (user) {
            // TODO: Implement backend API to save FCM token for user
            console.log('Sending FCM token to backend for user:', user.id);
            // Example:
            // await fetch('/api/save-fcm-token', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`
            //   },
            //   body: JSON.stringify({ userId: user.id, token: currentToken }),
            // });
          }
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
          return null;
        }
      } else {
        console.log('Notification permission denied.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }, [user]); // Added user to useCallback dependency array

  // Request permission and get token on component mount if user is logged in
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user, requestNotificationPermission]); // Added requestNotificationPermission to dependencies

  return (
    <NotificationContext.Provider value={{ fcmToken, requestNotificationPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};

// The useNotification hook has been moved to src/hooks/useNotification.ts
