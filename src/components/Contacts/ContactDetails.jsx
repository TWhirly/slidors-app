import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { DataContext } from '../../DataContext.jsx';
import styles from './CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import { useEmail } from '../../hooks/useEmail';
import { YellowStarIcon } from '../../icons/SVG.js'; // Import necessary icons
import LongMenu from './CompanyDetailMenu';
import { useContacts } from '../../hooks/useContacts';
import { useActivity } from '../../hooks/useActivity.js';
import { mainContactsIcons } from '../Companies/Companies-helpers.js';

function ContactDetails() {


  const navigate = useNavigate();
  const { state: { contactId: id, path = '/contacts', activityId } } = useLocation();
  const [contact, setContact] = useState({});
  const [contactActivity, setContactActivity] = useState([])
  const [expanded, setExpanded] = useState(false);
  const [contactMails, setcontactMails] = useState([])
  const tg = window.Telegram.WebApp;
  // const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const { chat_id } = useContext(DataContext);
  const phoneIcon = mainContactsIcons.phoneIcon
  const whatsappIcon = mainContactsIcons.whatsappIcon
  const telegramIcon = mainContactsIcons.telegramIcon
  const emailIcon = mainContactsIcons.emailIcon

  const { emails, isContactsMailsLoading } = useEmail(null, id);
  const { activity, isLoading: isActivityLoading } = useActivity(chat_id)
  tg.BackButton.isVisible = true
  console.log('id', id);
  const { contacts } = useContacts(chat_id)
  console.log('ActivityID', activity);

  useEffect(() => {
    if (!emails)
      return
    console.log('emails', emails)
    const mails = emails.filter(item => item.contact === id)
    setcontactMails(mails)
  }, [emails, id])

  useEffect(() => {
    if (contacts) {
      const contact = contacts.find((contact) => contact.id === id);
      if (contact) {
        setContact(contact);
      }
    }
  }, [contacts, id]);

  useEffect(() => {
    if (activity && !isActivityLoading) {
      console.log('contact activity', activity)
      const contactActivity = activity.other.filter(a => a.contactId === id);
      setContactActivity(contactActivity)
    }
  }, [activity, id, isActivityLoading])

  useEffect(() => {
    const initializeBackButton = () => {
      if (!tg) return;

      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.isVisible = true;
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate(path || '/contacts/',
        { state: { companyId: contact.companyId, contactId: contact.id, activityId } }));
    };

    initializeBackButton();

    return () => {
      tg.BackButton.offClick();
    };
  }, [activityId, contact.companyId, contact.id, navigate, path, tg]);

  const handleMenuSelection = (selectedOption) => {
    if (selectedOption === 'Редактировать') {
      navigate(`/contacts/${contact.id}/edit`, {
        state: {
          ...contact,
          path: `/contacts/${id}`, prevComponent: contact, new: false, contactId: contact.id
        },

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


  const getContactFullNmae = (contact) => {
    const fullName = (contact.lastName ? contact.lastName + ' ' : '') +
      (contact.firstName ? contact.firstName + ' ' : '') +
      (contact.surname ? contact.surname + ' ' : '')
    if (fullName === '') {
      return contact.companyName
    }
    return fullName
  };


  console.log('contactActivity', contactActivity)

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
                    <div className={styles.companyRowVal}>{mail.email}</div>
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
                        {activity.startDatetime ? new Date(activity.startDatetime).toLocaleDateString() + ' ' : ''}
                        {activity.purpose}
                      </div>
                      <div>
                        {activity.description}
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