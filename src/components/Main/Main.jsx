import React, { useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { DataContext } from '../../DataContext';
import styles from './Main.module.css';

export default function PersistentDrawerLeft() {
  const { name, loading } = useContext(DataContext);
  const navigate = useNavigate();

  const menu = [
    { name: 'Компании', path: '/companies', icon: require('../../icons/companiesIcon.png') },
    { name: 'Контакты', path: '/', icon: require('../../icons/contactsIcon.png') },
    { name: 'События', path: '/', icon: require('../../icons/eventsIcon.png') },
    { name: 'Стратегия', path: '/', icon: require('../../icons/strategyIcon.png') },
    { name: 'Задачи', path: '/', icon: ('https://disk.yandex.ru/client/disk?idApp=client&dialog=slider&idDialog=%2Fdisk%2F%D0%9C%D0%BE%D1%80%D0%B5.jpg') },
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
          <div className={styles.menuIcons}>
            {menu.map((item) => (
              <div
                key={item.name}
                className={styles.menuItem}
                onClick={() => navigate(item.path)}
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  className={styles.icon}
                />
                <div className={styles.iconText}>{item.name}</div>
              </div>
            ))}
          </div>
          <div className={styles.roleText}>
            Текущая роль: {name.role}
          </div>
        </>
      )}
    </div>
  );
}