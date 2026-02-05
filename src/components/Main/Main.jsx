import React, { useEffect, useContext } from 'react';
import { useQuery , useQueryClient } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { DataContext } from '../../DataContext.jsx';
import { useRegions } from '../../hooks/useRegions';
import { useContacts } from '../../hooks/useContacts.js';
import { useActivity } from '../../hooks/useActivity.js';
import { useTelegram } from '../../hooks/useTelegram.js';
import styles from './Main.module.css';

export default function PersistentDrawerLeft() {
  const { chat_id , tg , dataunsafe, initData} = useTelegram()
  const { name, loading } = useContext(DataContext);
  const navigate = useNavigate();
  // const { isLoading : isCompaniesLoading} = useRegions(chat_id);
  // const queryClient = useQueryClient();
  const { 
      
      isLoading: isCompaniesLoading
       
    } = useRegions(chat_id);

  const { isLoading : isContactsLoading} = useContacts(chat_id);
  const { isLoading : isActivityLoading , activity} = useActivity(chat_id);
  console.log('initdata', initData)

 
    const initializeBackButton = () => {
      if (!tg) return;

      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.hide();
    };

    initializeBackButton();

   
  const checkIfLoaded = (name) => {
    switch (name) {
      case 'Компании':
        return !isCompaniesLoading;
        case 'Контакты':
        return !isContactsLoading;
        case 'События':
        return !isActivityLoading;
      default:
        return true;
    }
  };

  const menu = [
    { name: 'Компании', path: '/companies', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Контакты', path: '/contacts', icon: require('../../icons/menu-items-logo.png') },
    { name: 'События', path: '/activities', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Задачи', path: '/', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Пользователи', path: '/', icon: require('../../icons/menu-items-logo.png') },
    { name: 'Отчеты', path: '/', icon: require('../../icons/menu-items-logo.png') },
  ];

  // if(!isActivityLoading)
    console.log('name', name);

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
                {checkIfLoaded(item.name) ?
               <img alt='icon' src={item.icon} className={styles.icon}></img> :
                <CircularProgress size={'1rem'} className={styles.itemLoading } />
                }
                <div className={styles.iconText}>{item.name}</div>
              </div>
            ))}
          </div>
         
        </>
      )}
    </div>
  );
}