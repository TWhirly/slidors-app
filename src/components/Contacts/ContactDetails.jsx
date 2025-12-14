import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { useQuery , useQueryClient} from '@tanstack/react-query';
import { DataContext } from '../../DataContext.jsx';
import styles from './CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import axios from 'axios';
import { useEmail } from '../../hooks/useEmail';
import { YellowStarIcon } from '../../icons/SVG.js'; // Import necessary icons
import LongMenu from './CompanyDetailMenu';
import { useNotification } from '../notifications/NotificationContext.jsx';
import { replace } from 'lodash';
import { useContacts } from '../../hooks/useContacts';

function ContactDetails() {

  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { state: {contactId: id ,  path = '/contacts' , activityId } } = useLocation();
  const [contact, setContact] = useState({});
  const [loadingMail, setLoadingMail] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [menuSelection, setMenuSelection] = useState(null);
  const tg = window.Telegram.WebApp;
  // const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const {  chat_id } = useContext(DataContext);
  const phoneIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a'
  const whatsappIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197'
  const telegramIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  const emailIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fmail.png?alt=media&token=983b34be-ca52-4b77-9577-ff4c5b26806c'
  const phoneHandledIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone-handle.png?alt=media&token=e754ec6a-8384-4e5b-9a62-e3c20a37bd27'
  const educatedIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Feducated.png?alt=media&token=7144be3f-148b-4ab3-8f31-cd876467bf61'
  
  const { contactMails, isContactsMailsLoading, error } = useEmail(null, id);
  tg.BackButton.isVisible = true
  console.log('id', id);
  const { contacts } = useContacts(chat_id)
  console.log('ActivityID', activityId, path);

  useEffect(() => {
    if(contacts){
      const contact = contacts.find((contact) => contact.id === id);
      console.log('contact', contact);
      if (contact) {
        setContact(contact);
      }
    }
  }, [contacts, id]);
  

  // console.log('contactMails from queryData',  queryClient.getQueryData(['emails', null, id, false]))
  // console.log('contactMails', contactMails);

  const fetchContactActivity = async () => {
    // console.log('fecthActivity')
    const params = {
      name: 'Ваше имя',
      contactId: id,
      api: 'getContactActivities'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    let fetchedActivity = response.data;
    // console.log('fetchedActivity', fetchedActivity)
    if (fetchedActivity) {
      // console.log('Activity', fetchedActivity);
      return fetchedActivity
    }
    return [];
  };

  const { data: contactActivity, isLoading: isActivityLoading, activityFetchError } = useQuery({
    queryKey: ['contactActivity' + contact.id],
    queryFn: fetchContactActivity,
    staleTime: 600000, // Data is considered fresh for 5 minutes (300,000 ms)
    refetchInterval: 600000, // Refetch data every 600 seconds in the background
  });

  

  useEffect(() => {
    const initializeBackButton = () => {
      if (!tg) return;

      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.isVisible = true;
      tg.BackButton.show();
     tg.BackButton.onClick(() => navigate(path || '/contacts/', 
        {state: {companyId : contact.companyId, contactId: contact.id, activityId}}));
    };

    initializeBackButton();

    return () => {
      tg.BackButton.offClick();
    };
  }, [activityId, contact.companyId, contact.id, navigate, path, tg]);

  // console.log('company', company);

  const handleMenuSelection = (selectedOption) => {
    if (selectedOption === 'Редактировать') {
      navigate(`/contacts/${contact.id}/edit`, {
            state: {...contact,
            path: `/contacts/${id}`, prevComponent : contact, new: false, contactId: contact.id},
            
        });
    }
  };

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

 

  const getContactFullNmae = (contact) => {
        const fullName = (contact.lastName ? contact.lastName + ' ' : '') + 
                    (contact.firstName ? contact.firstName + ' ' : '') + 
                    (contact.surname ? contact.surname + ' ' : '')
                    if (fullName === '') {
                        return contact.companyName}
                        return fullName
    };



 

  console.log('contact', contact)

  if (!contact) {
    return <div>contact not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.naviPanel}>
        <span className={styles.nameAndIcon}>
          {getContactFullNmae(contact)}{contact.snv !== '' && <YellowStarIcon className={styles.factoryIcon} />}
         
        </span>
        <LongMenu
          onSelect={handleMenuSelection}
        />
      </div>
      <div className={styles.CompanyDetails}>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Компания:</div>{contact.companyName}</div>
        {contact.lastName &&
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Фамилия:</div>{contact.lastName}</div>
        }
        {contact.firstName &&
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Имя:</div>{contact.firstName}</div>
        }
        {contact.surname &&
          <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Отчество:</div>{contact.surname}</div>
        }
        {contact.title &&
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Должность:</div>{contact.title}</div>
        }
        
        {contact.phone1 && (
          <div
            className={styles.companyMainContacts}
            onClick={() => window.location.href = `tel:${formatNumber(contact.phone1)}`}
            style={{ cursor: 'pointer' }}
          >
            <img src={phoneIcon} className={styles.contactPhone} alt="Phone icon" />
            <div className={styles.companyRowVal}>{formatNumber(contact.phone1)}</div>
          </div>
        )}
        {contact.phone2 && (<div className={styles.companyMainContacts}
          onClick={() => window.location.href = `tel:${formatNumber(contact.phone2)}`}
          style={{ cursor: 'pointer' }}
        > <img src={phoneIcon} className={styles.contactPhone} alt="Phone icon" />
          <div className={styles.companyRowVal}>{formatNumber(contact.phone2)}</div></div>)}
        {contact.whatsapp && (

          <div
            className={styles.companyMainContacts}
            onClick={() => tg.openLink(`https://wa.me/${formatNumber(contact.whatsapp)}`)}
            style={{ cursor: 'pointer' }}
          >
            <img src={whatsappIcon} className={styles.contactPhone} alt="WhatsApp icon" />
            <div className={styles.companyRowVal}>{contact.whatsapp}</div>
           
          </div>


        )}
        {contact.telegram && (
          <div className={styles.companyMainContacts}
            onClick={() => window.location.href = `https://t.me/${formatNumber(contact.telegram)}`}
            style={{ cursor: 'pointer' }}
          >
            <img src={telegramIcon} className={styles.contactPhone} alt="Phone icon" />
            <div className={styles.companyRowVal}>{contact.telegram}</div>
           
          </div>)}
        
        
        <div className={styles.contactsMails}>
          <div className={styles.companyRowInfo} id='mail'>
          <div className={styles.companyRowHeader}>
            
            Адреса электронной почты
          </div>
          </div>
          {
            !isContactsMailsLoading ? (
              <div className={styles.contactsContainer}>
                {contactMails?.length > 0 ? (contactMails?.map((mail, index) => (
                  <div key={index} className={styles.companyMainContacts}>
                    <img src={emailIcon} className={styles.contactPhone} alt="Phone icon" />
                    <div className={styles.companyRowVal}>{mail.mail}</div>
                  </div>
                ))) : (
                  <div className={styles.noDataText}>
                    нет
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.companyMainContacts}>
                <Skeleton variant="rectangular" animation="pulse" width={'10rem'} height={'1.3rem'} sx={{ fontSize: '1rem' }}>
                  Проверяю почту
                </Skeleton>
              </div>
            )
          }
        </div>
        
        <div className={styles.contactsMails}>
          <div className={styles.companyRowInfo}>
          <div className={styles.companyRowHeader}>
            События {contactActivity?.length > 0 ? `(${contactActivity?.length}):` : ''}
            {contactActivity?.length > 3 && <div className={styles.buttonArrow} onClick={() => setExpanded(!expanded)}>{expanded ? '▲' : '▼'}</div>}
          </div>
          </div>
          {
            !isActivityLoading ? (
              <div className={styles.contactsContainer}>
                {contactActivity?.length > 0 ? (
                  contactActivity?.filter((item, index) => (expanded ? index + 1 : index < 3)).map((activity, index) => (
                    <div key={index} className={styles.contactItem}>
                      <div className={styles.activityRowVal}>
                        {activity.startDateTime ? new Date(activity.startDateTime).toLocaleDateString() + ' ' : ''}
                        {activity.purpose}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noDataText}>
                    нет
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.companyMainContacts}>
                <Skeleton variant="rectangular" animation="pulse" width={'10rem'} height={'1.3rem'} sx={{ fontSize: '1rem' }}>
                  Проверяю события
                </Skeleton>
              </div>
            )
          }
        </div>
        
        {contact.note && (
          <div className={styles.companyDescriptionRowInfo}>
            <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Примечание:</div></div>
            <div className={styles.companyDescriptionRowVal}>{contact.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactDetails;