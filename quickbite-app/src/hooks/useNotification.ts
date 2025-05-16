import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext'; // Assuming NotificationContext is exported
import type { NotificationContextType } from '../context/NotificationContext'; // Assuming NotificationContextType is exported

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};