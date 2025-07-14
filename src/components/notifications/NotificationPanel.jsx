// components/NotificationPanel.js
import { useEffect } from 'react';
import styles from'./NotificationPanel.module.css';

const NotificationPanel = ({ message, show, onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
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