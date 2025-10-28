import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import styles from './CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import axios from 'axios';
import { YellowStarIcon } from '../../icons/SVG'; // Import necessary icons
import LongMenu from './CompanyDetailMenu';
import { DataContext } from '../../DataContext.jsx';
import { useEmail } from '../../hooks/useEmail';
import { useNotification } from '../../components/notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions.js';
import { useContacts } from '../../hooks/useContacts.js';
import { useActivity } from '../../hooks/useActivity.js';
import { replace } from 'lodash';
import { getEmptyActivity } from '../Activity/activity.js';
import CompanyСontacts from './CompanyContacts.jsx'
import CompanyMainContacts from './CompanyMainContacts.jsx'
import { getContactIcons, formatNumber } from './Companies-helpers.js'

const CompanyDetails = () => {


  const navigate = useNavigate();
  const { state: { companyId: id, path: returnPath = '/companies' } } = useLocation();
  const [loadingMail, setLoadingMail] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [plannedExpanded, setPlannedExpanded] = useState(false);
  const [menuSelection, setMenuSelection] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [company, setCompany] = useState({});
  const [companyActivity, setCompanyActivity] = useState([])
  const [companyPlannedActivity, setCompanyPlannedActivity] = useState([])
  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const chat_id = JSON.parse(params.get('user')).id;

  const emailIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fmail.png?alt=media&token=983b34be-ca52-4b77-9577-ff4c5b26806c'
  const phoneHandledIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone-handle.png?alt=media&token=e754ec6a-8384-4e5b-9a62-e3c20a37bd27'
  const educatedIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Feducated.png?alt=media&token=7144be3f-148b-4ab3-8f31-cd876467bf61'
  // const id = company.id;
  const { contactMails, isContactsMailsLoading, error } = useEmail(id, null);
  const { regionsWithCompanies, contactsLoadingError } = useRegions(chat_id)
  const { regionsWithContacts, isLoading: isContactsLoading, contactsLoadingError: contactsError } = useContacts(chat_id)
  const { activity, isLoading: isActivityLoading, updateActivity, test} = useActivity(chat_id)
  const { email } = useContext(DataContext)
  // tg.BackButton.isVisible = true
  // console.log('regionsWithComapnies', regionsWithCompanies, 'id', id, 'path', path)
  console.log('activity', activity, test)
  useEffect(() => {
    if (regionsWithCompanies) {
      const company = regionsWithCompanies.map((region) => region.companies).flat().find((company) => company.id === id); // Find the company with the matching ID and set it as the state variable)
      setCompany(company)

    }
  }, [regionsWithCompanies, id]);

  useEffect(() => {
    const initBackButton = () => {
      if (!tg) return;

      tg.ready();
      tg.BackButton.isVisible = true;
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        // ✅ Используем returnPath из location.state
        navigate('/companies', { state: { companyId: id } });
      });
    };

    initBackButton();

    return () => {
      if (tg) {
        tg.BackButton.offClick();
      }
    };
  }, [id, navigate, returnPath, tg]);

  useEffect(() => {
    if (activity.planned && activity.planned.length > 0){
      setCompanyPlannedActivity(activity.planned.reduce((acc, activity) => {
        if (activity.plan !== '' && activity.companyId === id)
          acc.push(activity)
        return acc
      }, []))
    }
  }, [activity.planned, id])

  useEffect(() => {
    if (activity.other && activity.other.length > 0){
      setCompanyActivity(activity.other.reduce((acc, activity) => {
        if (activity.plan === '' && activity.companyId === id)
          acc.push(activity)
        return acc
      }, []))
    }
  }, [activity.other, id])

  // console.log('company', company);

  const handleMenuSelection = (selectedOption) => {
    if (selectedOption === 'Редактировать') {
      navigate(`/companies/${company.id}/edit`, { state: { ...company, new: false } });
    }
    if (selectedOption === 'Добавить контакт') {
      const getEmptyContact = (selectedRegion = '') => ({
        id: uuidv4(), // Generates UUID v4
        firstName: '',
        lastName: '',
        surname: '',
        companyId: id,
        companyName: company.name,
        title: '',
        region: selectedRegion,
        phone1: '',
        phone2: '',
        manager: email.mail || '',
        whatsapp: '',
        telegram: '',
        note: '',
        emails: [{ id: uuidv4(), mail: '' }],
        new: true

      });
      const emptyContact = getEmptyContact(company.region);

      navigate(`/contacts/new/edit`, { state: { ...emptyContact, path: `/companies/${id}`, prevComponent: company, companyId: id } });

    }

    if (selectedOption === 'Добавить событие') {
      const emptyActivity = getEmptyActivity(email, id, company.name, company.region, company.city)
      updateActivity({...emptyActivity, new: true})
      navigate(`/activities/new/edit`, { state: { ...emptyActivity, path: `/companies/${id}`, prevComponent: company, new: true } });
    }
  };

  const handleSelectContact = (contact) => {
    console.log('handleSelectCompany', contact);
    navigate(`/contacts/${contact.id}`, {
      state: {
        contactId: contact.id, companyId: id,
        path: `/companies/${id}`, prevComponent: company
      }
    });
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

  console.log('company', company)
  console.log('contacts', contacts)

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
          options={[
            'Редактировать',
            'Добавить контакт',
            'Добавить событие',
          ]}
        />
      </div>
      <div className={styles.CompanyDetails}>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Тип:</div><div className={styles.companyRowVal}>{company.type}</div></div>
        {company.recyclers?.length > 0 && <div className={styles.companyDescriptionRowInfo}><div className={styles.companyRowHeader}>Работает с:</div><div className={styles.companyDescriptionRowVal}>{company.recyclers.map(item => item.trim()).join(', ')}</div></div>}
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Статус:</div><div className={styles.companyRowVal}>{company.status}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Регион:</div><div className={styles.companyRowVal}>{company.region}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Город:</div><div className={styles.companyRowVal}>{company.city}</div></div>

        <CompanyMainContacts
          company={company}
        >
        </CompanyMainContacts>

        <CompanyСontacts
          chat_id={chat_id}
          id={id}
          onClick={(contact) => { handleSelectContact(contact) }}
        >

        </CompanyСontacts>


        <div className={styles.contactsMails}><div className={styles.companyRowHeader}><div className={styles.companyRowInfo}>
          Адреса электронной почты
        </div>
        </div>
          {

            !isContactsMailsLoading ? (


              <div >
                {contactMails?.length > 0 ? (contactMails?.map((mail, index) => (
                  <div key={index} className={styles.companyMainContacts}>
                    <img src={emailIcon} className={styles.contactPhone} alt="Phone icon" />
                    <div className={styles.companyRowVal}>{mail.mail}</div>

                  </div>
                ))) : 'нет'}
              </div>

            ) : (
              <>
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />
              </>
            )
          }
        </div>
        <div className={styles.companyRowInfo}> <div className={styles.companyRowHeader}>Запланированные события </div>
          {companyPlannedActivity?.length > 0 && !isActivityLoading ?
            (<div><div className={styles.companyRowHeader}>{activity.length > 0 ? `\u00A0(${activity.length}):` : ':'}
              {companyPlannedActivity?.length > 3 && <div className={styles.buttonArrow} onClick={() => setPlannedExpanded(!plannedExpanded)}>{expanded ? '▲' : '▼'}</div>}
            </div></div>) :
            ''}
        </div>
        {
          !isActivityLoading ? (
            companyPlannedActivity?.length > 0 ? (
              <div className={styles.contactItem}>
                {companyPlannedActivity?.filter((item, index) => (expanded ? index + 1 : index < 3)).map((activity, index) => (
                  <div key={index} className={styles.contactItem}>
                    <div className={styles.activityRowVal}>{activity.plan ? new Date(activity.plan).toLocaleDateString() + ' ' : ''}
                      {activity.purpose} </div>
                  </div>
                ))}
              </div>) : 'нет'
          ) : (
            <>
              <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />

            </>
          )
        }

        <div className={styles.companyRowInfo}> <div className={styles.companyRowHeader}>Завершенные события </div>
          {companyActivity?.length > 0 && !isActivityLoading ?
            (<div><div className={styles.companyRowHeader}>{activity.length > 0 ? `\u00A0(${activity.length}):` : ':'}
              {activity?.length > 3 && <div className={styles.buttonArrow} onClick={() => setExpanded(!expanded)}>{expanded ? '▲' : '▼'}</div>}
            </div></div>) :
            ''}
        </div>
        {
          !isActivityLoading ? (
            companyActivity?.length > 0 ? (
              <div className={styles.contactItem}>
                {companyActivity?.filter((item, index) => (expanded ? index + 1 : index < 3)).map((activity, index) => (
                  <div key={index} className={styles.contactItem}>
                    <div className={styles.activityRowVal}>{activity.endDatetime ? new Date(activity.endDatetime).toLocaleDateString() + ' ' : ''}
                      {activity.purpose}</div>
                  </div>
                ))}
              </div>) : 'нет'
          ) : (
            <>
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