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
      // Check if the browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications.');
        return null;
      }

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.log('This browser does not support service workers.');
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.error('VITE_FIREBASE_VAPID_KEY is not set in environment variables. FCM token generation will likely fail.');
          // Continue anyway, but log the error
        }

        try {
          // Register the service worker manually if needed
          const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/firebase-cloud-messaging-push-scope'
          });
          console.log('Service Worker registered with scope:', swRegistration.scope);

          // Get the FCM token
          try {
            // Check if we're in development mode
            const isDevelopment = import.meta.env.MODE === 'development';

            // In development, we'll use a mock token to avoid authentication errors
            if (isDevelopment) {
              console.log('Development mode detected. Using mock FCM token.');
              const mockToken = 'mock-fcm-token-' + Math.random().toString(36).substring(2, 15);
              setFcmToken(mockToken);
              return mockToken;
            }

            // In production, try to get a real token
            const currentToken = await getToken(messaging, {
              vapidKey: vapidKey || undefined,
              serviceWorkerRegistration: swRegistration
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
          } catch (tokenError) {
            console.error('Error getting FCM token:', tokenError);

            // If we're in development, use a mock token
            if (import.meta.env.MODE === 'development') {
              console.log('Using mock FCM token due to error in development mode.');
              const mockToken = 'mock-fcm-token-' + Math.random().toString(36).substring(2, 15);
              setFcmToken(mockToken);
              return mockToken;
            }

            return null;
          }
        } catch (swError) {
          console.error('Error registering service worker or getting FCM token:', swError);
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
    // Only try to request notification permission if we're in a secure context
    // and the browser supports service workers and notifications
    const isSecureContext = window.isSecureContext;
    const supportsServiceWorker = 'serviceWorker' in navigator;
    const supportsNotifications = 'Notification' in window;

    // Check if we already have a token in localStorage
    const storedToken = localStorage.getItem('fcm_token');
    const tokenTimestamp = localStorage.getItem('fcm_token_timestamp');
    const now = Date.now();
    const tokenAge = tokenTimestamp ? now - parseInt(tokenTimestamp) : Infinity;
    const tokenIsValid = storedToken && tokenAge < 24 * 60 * 60 * 1000; // 24 hours

    // If we have a valid token, use it
    if (tokenIsValid) {
      console.log('Using stored FCM token');
      setFcmToken(storedToken);
      return;
    }

    // Otherwise, request a new token if conditions are met
    if (user && isSecureContext && supportsServiceWorker && supportsNotifications) {
      // Add a delay to avoid too many requests
      const requestDelay = setTimeout(() => {
        // Wrap in try-catch to prevent any errors from breaking the app
        try {
          requestNotificationPermission()
            .then(token => {
              if (token) {
                // Store the token and timestamp in localStorage
                localStorage.setItem('fcm_token', token);
                localStorage.setItem('fcm_token_timestamp', now.toString());
              }
            })
            .catch(err => {
              console.error('Failed to request notification permission:', err);
              // Don't rethrow - we want to silently fail if notifications aren't working
            });
        } catch (error) {
          console.error('Error in notification permission effect:', error);
        }
      }, 2000); // 2 second delay

      // Clean up the timeout if the component unmounts
      return () => clearTimeout(requestDelay);
    } else if (user) {
      // Log why we're not requesting permissions
      if (!isSecureContext) console.log('Notifications not requested: Not in a secure context');
      if (!supportsServiceWorker) console.log('Notifications not requested: Service workers not supported');
      if (!supportsNotifications) console.log('Notifications not requested: Notifications not supported');
    }
  }, [user, requestNotificationPermission]); // Added requestNotificationPermission to dependencies

  return (
    <NotificationContext.Provider value={{ fcmToken, requestNotificationPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};

// The useNotification hook has been moved to src/hooks/useNotification.ts
