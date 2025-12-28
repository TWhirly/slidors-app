// components/NotificationPanel.js
import { useEffect } from 'react';
import styles from'./NotificationPanel.module.css';

const NotificationPanel = ({ message, show, onHide, style, manualClose = false }) => {
  useEffect(() => {
    if (show && !manualClose) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, manualClose]);

  if (!show) return null;

  return (
    <div 
    style={style || {}}
    className={styles.notificationРanel}>
      <div>{message}</div>
      {manualClose && <div
      onClick={onHide}
      style={{right: '15px', position: 'absolute', cursor: 'pointer'}}
      >✕</div>}
    </div>
  );
};

export default NotificationPanel;