// context/NotificationContext.js
import { createContext, useState, useContext, useCallback } from 'react';
import NotificationPanel from '../notifications/NotificationPanel.jsx';
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    style: {}
    });

  const showNotification = (message, style, manualClose) => {
    setNotification({ show: true, message, style, manualClose });
    
  };

  

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}
    >
      {children}
      <NotificationPanel
        style={notification.style} 
        show={notification.show} 
        message={notification.message}
        onHide={hideNotification}
        manualClose={notification.manualClose} 
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};