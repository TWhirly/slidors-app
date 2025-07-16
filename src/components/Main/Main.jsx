import React, { useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { DataContext } from '../../DataContext.jsx';
import styles from './Main.module.css';

export default function PersistentDrawerLeft() {
  const { name, loading } = useContext(DataContext);
  const navigate = useNavigate();
  const tg = window.Telegram.WebApp;

  useEffect(() => {
    const initializeBackButton = () => {
      if (!tg) return;

      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.hide();
      tg.BackButton.onClick(() => navigate('/companies/', { replace: true }));
    };

    initializeBackButton();

    return () => {
      tg.BackButton.offClick();
      // tg.BackButton.hide(); // Optionally hide the button when unmounting
    };
  }, [navigate, tg]);

  const menu = [
    { name: 'Компании', path: '/companies', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Контакты', path: '/contacts', icon: require('../../icons/menu-items-logo.png') },
    { name: 'События', path: '/', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Задачи', path: '/', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Пользователи', path: '/', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Отчеты', path: '/', icon: require('../../icons/menu-items-logo.png') },
  ];

  return (
    <div className={styles.container}>
      {loading ? (
        <CircularProgress className={styles.loading} />
      ) : (
        <>
          <img 
            src={require('../../icons/slidors_logo.png')}
            className={styles.logo} alt="SLIDORS"></img>
          <div className={styles.nameText}>
            Здравствуйте, {name.name}
          </div>
           <div className={styles.roleText}>
            Ваша текущая роль: {name.role}
          </div>
          <div className={styles.menuItemContainer}>
            {menu.map((item) => (
              
              <div
                key={item.name}
                className={styles.menuItemPlainText}
                onClick={() => navigate(item.path, { replace: true })}
              >
               <img alt='icon' src={item.icon} className={styles.icon}></img>
                <div className={styles.iconText}>{item.name}</div>
              </div>
            ))}
          </div>
         
        </>
      )}
    </div>
  );
}