// context/NotificationContext.js
import { createContext, useState, useContext } from 'react';
import NotificationPanel from '../notifications/NotificationPanel.jsx';
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  console.log('children', children)
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    style: {}
    });

  const showNotification = (message, style) => {
    setNotification({ show: true, message, style });
  };

  

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  console.log('notification', notification)

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}
    >
      {children}
      <NotificationPanel
        style={notification.style} 
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