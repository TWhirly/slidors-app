// context/NotificationContext.js
import { createContext, useState, useContext } from 'react';
import NotificationPanel from '../notifications/NotificationPanel.jsx';
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: ''
  });

  const showNotification = (message) => {
    setNotification({ show: true, message });
  };

  

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <NotificationPanel 
        show={notification.show} 
        message={notification.message} 
        onHide={hideNotification} 
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};