// components/NotificationPanel.js
import { useEffect } from 'react';
import styles from'./NotificationPanel.css';

const NotificationPanel = ({ message, show, onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className={styles.notificationРanel}>
      {message}
    </div>
  );
};

export default NotificationPanel;