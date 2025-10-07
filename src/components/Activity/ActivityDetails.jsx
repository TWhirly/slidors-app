import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, act } from 'react';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import styles from '../Companies/CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import axios from 'axios';
import { YellowStarIcon } from '../../icons/SVG.js'; // Import necessary icons
import LongMenu from '../Companies/CompanyDetailMenu';
import { DataContext } from '../../DataContext.jsx';
import { useEmail } from '../../hooks/useEmail.js';
import { useNotification } from '../notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions.js';
import { useContacts } from '../../hooks/useContacts.js';
import { replace } from 'lodash';
import { useActivity } from '../../hooks/useActivity.js';

function ActivityDetails() {

  
  const navigate = useNavigate();
  const { state: { activityID: id , path} } = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [menuSelection, setMenuSelection] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activity, setActivity] = useState({});
  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const chat_id = JSON.parse(params.get('user')).id;
  const phoneIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a'
  const whatsappIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197'
  const telegramIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  const emailIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fmail.png?alt=media&token=983b34be-ca52-4b77-9577-ff4c5b26806c'
  const { activity: activities, isLoading } = useActivity(chat_id)
  const { email } = useContext(DataContext)
  tg.BackButton.isVisible = true
    useEffect(() => {
    if (activities) {
      let activity = []
      activity = activities.planned.filter((activity) => activity.id === id);
      console.log('activity in useEffect', activity, id, activities) // Find the activity with the matching ID and set it as the state variable)
      if (activity.length === 0) {
        activity = activities.other.filter((activity) => activity.id === id);
      }
     setActivity(activity[0])
     
    }
  }, [id, activities]);

  // useEffect(() => {
  //   if (regionsWithContacts) {
  //     const contacts = regionsWithContacts.reduce((acc, region) => {
  //       region.contacts.forEach((contact) => {
  //         if (contact.companyId === id) {
  //           acc.push(contact);
  //         }
  //       });
  //       return acc;
  //     }, [])
  //     setContacts(contacts)
  //   }
  // }, [id, regionsWithContacts]);

  useEffect(() => {
    const initializeBackButton = () => {
      if (!tg) return;
      console.log('back button init', path)
      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.isVisible = true;
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate(path || '/companies/', 
         { replace: true }));
    };

    initializeBackButton();

    return () => {
      tg.BackButton.offClick();
    };
  }, [navigate, path, tg]);

  // console.log('company', company);

  const handleMenuSelection = (selectedOption) => {
    if (selectedOption === 'Редактировать') {
      navigate(`/companies/${activity.id}/edit`, { state: { ...activity, new: false } });
    }
    if (selectedOption === 'Добавить контакт') {
      const getEmptyActivity = () => ({
              id: uuidv4(), // Generates UUID v4
              new: true
          });
          const emptyActivity = getEmptyActivity();
      
      navigate(`/activities/new/edit`, { state: {...emptyActivity, path: `/activities/${id}`, prevComponent : activity, activityId: id} });
             
    }
  };

  //  const handleSelectContact = (contact) => {
  //       console.log('handleSelectCompany', contact);
  //        navigate(`/contacts/${contact.id}`, {
  //           state: {contactId: contact.id, companyId: id,
  //           path: `/companies/${id}`, prevComponent : company}
  //       },  { replace:  true});
  //           };

  const formatNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.startsWith('8')) {
      return '7' + cleanNumber.slice(1);
    }
    if (cleanNumber.startsWith('7')) {
      return cleanNumber;
    }
    return '7' + cleanNumber;
  };


  const formatUrl = (url) => {
    if (!url) return '';

    // Убираем пробелы
    let formattedUrl = url.trim();

    // Проверяем наличие протокола
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    return formattedUrl;
  };

  const getCompanyTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'переработчик':
        return (
          <img
            src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%9F%D0%B5%D1%80%D0%B5%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%87%D0%B8%D0%BA.png?alt=media&token=f4eb6919-adf9-40aa-9b72-a81212be7fba'}
            alt="переработчик"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
      case 'дистрибьютор':
        return (
          <img
            src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%94%D0%B8%D1%81%D1%82%D1%80%D0%B8%D0%B1%D1%8C%D1%8E%D1%82%D0%BE%D1%80.png?alt=media&token=89daba2b-628b-4abe-ad43-b6e49ebc2e65'}
            alt="дистрибьютор"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
      case 'дилер':
        return (
          <img
            src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%94%D0%B8%D0%BB%D0%B5%D1%80.png?alt=media&token=6b1f83ff-da70-4d7f-a191-eb391e8eeb35'}
            alt="Дилер"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
      case 'смешанный':
        return (
          <img
            src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%A1%D0%BC%D0%B5%D1%88%D0%B0%D0%BD%D1%8B%D0%B9.png?alt=media&token=d41d243e-8ca4-474a-9b00-61bc25ce46af'}
            alt="Смешанный"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
      case 'избранный':
        return <YellowStarIcon className={styles.factoryIcon} />;
      default:
        return <></>;
    }
  };

  console.log('activity', activity)
  console.log('contacts', contacts)

  if (!activity) {
    return <div>Activity not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.naviPanel}>
        <span className={styles.nameAndIcon}>
          {activity.companyName}
          <div className={styles.iconContainer}>
            {/* {getCompanyTypeIcon(company.type)} */}
          </div>
        </span>
        <LongMenu
          onSelect={handleMenuSelection}
        />
      </div>
      <div className={styles.CompanyDetails}>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Тип:</div><div className={styles.companyRowVal}>{activity.type}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Цель:</div><div className={styles.companyRowVal}>{activity.purpose}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Регион:</div><div className={styles.companyRowVal}>{activity.region}</div></div>
            </div>
          </div>
       

        )}

       

   
  

export default ActivityDetails;