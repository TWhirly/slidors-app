import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import axios from 'axios';
import { YellowStarIcon } from '../../icons/SVG'; // Import necessary icons
import LongMenu from './CompanyDetailMenu';
import { useNotification } from '../../components/notifications/NotificationContext.jsx';

function CompanyDetails() {

  
  const navigate = useNavigate();
  const { state: company } = useLocation();
  const [loadingMail, setLoadingMail] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [menuSelection, setMenuSelection] = useState(null);
  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const chat_id = JSON.parse(params.get('user')).id;
  const phoneIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a'
  const whatsappIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197'
  const telegramIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  const emailIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fmail.png?alt=media&token=983b34be-ca52-4b77-9577-ff4c5b26806c'
  const phoneHandledIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone-handle.png?alt=media&token=e754ec6a-8384-4e5b-9a62-e3c20a37bd27'
  const educatedIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Feducated.png?alt=media&token=7144be3f-148b-4ab3-8f31-cd876467bf61'

  tg.BackButton.isVisible = true

  
  

  useEffect(() => {
    tg.BackButton.isVisible = true;
    tg.BackButton.show();
    tg.BackButton.onClick(() => navigate('/companies/', { replace: true }));

  }, [navigate, tg.BackButton, tg.BackButton.isVisible]);
  const id = company.id;


  const fetchContacts = async () => {
    console.log('fecthcontacts')
    const params = {
      name: 'Ваше имя',
      companyId: id,
      api: 'getContacts'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    let fetchedContacts = response.data;
    console.log('fetchedContacts', fetchedContacts)
    if (fetchedContacts) {
      console.log('contacts', fetchedContacts);
    }
    return fetchedContacts;
  };

  const fetchActivity = async () => {
    console.log('fecthActivity')
    const params = {
      name: 'Ваше имя',
      companyId: id,
      api: 'getActivities'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
    );
    let fetchedActivity = response.data;
    if (fetchedActivity) {
      console.log('Activity', fetchedActivity);
    }
    return fetchedActivity;
  };

  const fetchMail = async () => {
      console.log('fecthcMail')
      const params = {
        name: 'Ваше имя',
        companyId: id,
        api: 'getEmails'
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
      );
      let fetchedMails = response.data;
      if (fetchedMails) {
        setLoadingMail(false);
        console.log('mails', fetchedMails);
      }
      return fetchedMails;
    };

  const { data: contacts, isContactsLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
    staleTime: 600000, // Data is considered fresh for 5 minutes (300,000 ms)
    refetchInterval: 600000, // Refetch data every 600 seconds in the background
  });

  const { data: activity, isActivityLoading, activityFetchError } = useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    staleTime: 600000, // Data is considered fresh for 5 minutes (300,000 ms)
    refetchInterval: 600000, // Refetch data every 600 seconds in the background
  });

  const { data: mails, isMailsLoading, mailsFetchError } = useQuery({
    queryKey: ['mails'],
    queryFn: fetchMail,
    staleTime: 300000, // Data is considered fresh for 5 minutes (300,000 ms)
    refetchInterval: 600000, // Refetch data every 600 seconds in the background
  });

  useEffect(() => {
    const initializeBackButton = () => {
      if (!tg) return;

      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.isVisible = true;
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/companies/', { replace: true }));
    };

    initializeBackButton();

    return () => {
      tg.BackButton.offClick();
    };
  }, [navigate, tg]);

  // console.log('company', company);

  const handleMenuSelection = (selectedOption) => {
    if (selectedOption === 'Редактировать') {
      navigate(`/companies/${company.id}/edit`, { state: { ...company, new: false } });
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

  const getContactIcons = (contact) => {
    const icons = [];
    if (contact.phone1) {
      icons.push(
        <img
          key="phone1"
          src={phoneIcon}
          className={styles.contactPhone}
          alt="Phone icon"
          onClick={() => window.location.href = `tel:${contact.phone1}`}
          style={{ cursor: 'pointer' }}
        />
      );
    }

    if (contact.phone2) {
      icons.push(
        <img
          key="phone2"
          src={phoneIcon}
          className={styles.contactPhone}
          alt="Phone icon"
          onClick={() => window.location.href = `tel:${contact.phone2}`}
          style={{ cursor: 'pointer' }}
        />
      );
    }

    if (contact.whatsapp) {
      icons.push(
        <img
          key="whatsapp"
          src={whatsappIcon}
          className={styles.contactPhone}
          alt="WhatsApp icon"
          onClick={() => tg.openLink(`https://wa.me/${formatNumber(company.whatsapp)}`)}
          style={{ cursor: 'pointer' }}
        />
      );
    }

    if (contact.telegram) {
      icons.push(
        <img
          key="telegram"
          src={telegramIcon}
          className={styles.contactPhone}
          alt="Telegram icon"
          onClick={() => window.location.href = `https://t.me/${contact.telegram}`}
          style={{ cursor: 'pointer' }}
        />
      );
    }
    return icons;
  }


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

  console.log('company', company)

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.naviPanel}>
        <span className={styles.nameAndIcon}>
          {company.name}
          <div className={styles.iconContainer}>
            {getCompanyTypeIcon(company.type)}
          </div>
        </span>
        <LongMenu
          onSelect={handleMenuSelection}
        />
      </div>
      <div className={styles.CompanyDetails}>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Тип:</div><div className={styles.companyRowVal}>{company.type}</div></div>
        {company.recyclers.length > 0 && <div className={styles.companyDescriptionRowInfo}><div className={styles.companyRowHeader}>Работает с:</div><div className={styles.companyDescriptionRowVal}>{company.recyclers.map(item => item.trim()).join(', ')}</div></div>}
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Статус:</div><div className={styles.companyRowVal}>{company.status}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Регион:</div><div className={styles.companyRowVal}>{company.region}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Город:</div><div className={styles.companyRowVal}>{company.city}</div></div>
        {company.phone1 && (
          <div
            className={styles.companyMainContacts}
            onClick={() => window.location.href = `tel:${company.phone1}`}
            style={{ cursor: 'pointer' }}
          >
            <img src={phoneIcon} className={styles.contactPhone} alt="Phone icon" />
            <div className={styles.companyRowVal}>{company.phone1}</div>
          </div>
        )}
        {company.phone2 && (<div className={styles.companyMainContacts}
          onClick={() => window.location.href = `tel:${company.phone2}`}
          style={{ cursor: 'pointer' }}
        > <img src={phoneIcon} className={styles.contactPhone} alt="Phone icon" />
          <div className={styles.companyRowVal}>{company.phone2}</div></div>)}
        {company.whatsapp && (

          <div
            className={styles.companyMainContacts}
            // onClick={() => window.location.href = `https://wa.me/+79216146100`}
            // onClick={() => window.location.href = `whatsapp://send?phone=+79216146100`}
            onClick={() => tg.openLink(`https://wa.me/${formatNumber(company.whatsapp)}`)}
            style={{ cursor: 'pointer' }}
          >
            <img src={whatsappIcon} className={styles.contactPhone} alt="WhatsApp icon" />
            <div className={styles.companyRowVal}>{company.whatsapp}</div>
            <div>
              {company.wa !== 0 && (
                <img
                  src={require('../../icons/checkedRed.png')}
                  alt="переработчик"
                  fill="#008ad1"
                  className={styles.checkIcon}
                />
              )}
            </div>
          </div>


        )}
        {company.telegram && (
          <div className={styles.companyMainContacts}
            onClick={() => window.location.href = `https://t.me/${formatNumber(company.telegram)}`}
            style={{ cursor: 'pointer' }}
          >
            <img src={telegramIcon} className={styles.contactPhone} alt="Phone icon" />
            <div className={styles.companyRowVal}>{company.telegram}</div>
            <div>
              {company.tg !== 0 && (
                <img
                  src={require('../../icons/checkedRed.png')}
                  alt="переработчик"
                  fill="#008ad1"
                  className={styles.checkIcon}
                />
              )}
            </div>
          </div>)}
        {contacts && contacts.length > 0 && <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Контакты {contacts.length > 0 ? `(${contacts.length}):` : ''}</div></div>}
        {isContactsLoading ? (
          <>
            <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />
            <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />
          </>
        ) : (
          <div className={styles.contactsContainer}>
            {contacts?.map((contact, index) => (
              <div key={index} className={styles.contactPerson}>
                <div className={styles.contactName}>{`${contact.firstName} ${contact.lastName} ${contact.surname}`}</div>
                <div className={styles.contactIcons}>{getContactIcons(contact)}</div>
                <div className={styles.contactEmail}>{contact.email}</div>
              </div>
            ))}
          </div>
        )
        }

        {mails?.length > 0 && (<div className={styles.companyRowInfo}><img src={emailIcon} className={styles.contactPhone} alt="Phone icon" />
          {

            !isMailsLoading ? (
              <div className={styles.companyRowVal}>
                {mails?.map(item => item.email).join(', ')}
              </div>
            ) : (
              <>
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />
              </>
            )
          }
        </div>)}
        {activity?.length > 0 && <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>События {activity.length > 0 ? `(${activity.length}):` : ''}
          {activity?.length > 3 && <div className={styles.buttonArrow} onClick={() => setExpanded(!expanded)}>{expanded ? '▲' : '▼'}</div>}
        </div></div>}
        {
          !isActivityLoading ? (
            <div className={styles.contactItem}>
              {activity?.filter((item, index) => (expanded ? index : index < 3)).map((activity, index) => (
                <div key={index} className={styles.contactItem}>
                  <div className={styles.activityRowVal}>{activity.startDateTime ? new Date(activity.startDateTime).toLocaleDateString() + ' ' : ''}
                    {activity.purpose}</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />
              <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />
            </>
          )
        }


        {company.address && <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Адрес:</div><div className={styles.companyRowVal}>{company.address ? company.address : '(не указан)'}</div></div>}
        {+company.tt > 0 && <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Торговых точек:</div><div className={styles.companyRowVal}>{company.tt}</div></div>}
        {+company.dealers > 0 && <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Дилеров:</div><div className={styles.companyRowVal}>{company.dealers}</div></div>}
        {company.url && <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Сайт:</div><div
          onClick={() => tg.openLink(`${formatUrl(company.url)}`)}
          className={styles.companyRowUrl}>{company.url}</div></div>}
        {company.description && (<div className={styles.companyDescriptionRowInfo}><div className={styles.companyDescriptionRowInfo}><div className={styles.companyRowHeader}>Примечание:</div></div><div className={styles.companyDescriptionRowVal}>{company.description}</div></div>)}
        {company.manager && (<div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Менеджер:</div><div className={styles.companyRowVal}>{company.manager}</div></div>)}
      </div>

    </div>
  );
}

export default CompanyDetails;