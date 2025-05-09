import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect , useState} from 'react';
import { CircularProgress } from '@mui/material'
import styles from './CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { YellowStarIcon } from '../../icons/SVG'; // Import necessary icons
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { Pix } from '@mui/icons-material';
import Typography from '@mui/material/Typography';

function CompanyDetails() {

  
  const navigate = useNavigate();
  const { state : company} = useLocation();
  const [contacts, setContacts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMail, setLoadingMail] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const chat_id = JSON.parse(params.get('user')).id;
    const phoneIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a'
  const whatsappIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197'
  const telegramIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  const emailIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fmail.png?alt=media&token=983b34be-ca52-4b77-9577-ff4c5b26806c'
  const phoneHandledIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone-handle.png?alt=media&token=e754ec6a-8384-4e5b-9a62-e3c20a37bd27'
  const educatedIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Feducated.png?alt=media&token=7144be3f-148b-4ab3-8f31-cd876467bf61'

   const id = company.id;

      //  const { data: contacts, isContactsLoading, error } = useQuery({
      //         queryKey: ['contacts'],
      //         queryFn: fetchContacts,
      //         staleTime: 300000, // Data is considered fresh for 5 minutes (300,000 ms)
      //         refetchInterval: 60000, // Refetch data every 60 seconds in the background
      //     });

          useEffect(() => {
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
                setLoading(false);
                console.log('contacts', fetchedContacts);
              }
              setContacts(fetchedContacts);
          };
          fetchContacts();

          }, [id]);

          useEffect(() => {
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
                setLoadingActivity(false);
                console.log('Activity', fetchedActivity);
              }
              setActivity(fetchedActivity);
          };
          fetchActivity();

          }, [id]);

          useEffect(() => {
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
              setMails(fetchedMails);
          };
          fetchMail();

          }, [id]);


  useEffect(() => {
    const initializeBackButton = () => {
      if (!tg) return;

      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/companies/', { replace: true }));
    };

    initializeBackButton();

    return () => {
      tg.BackButton.offClick();
    };
  }, [navigate, tg]);

 console.log('company', company);

 const getContactIcons = (contact) => {
  const icons = [];
  if (contact.phone1) {
      icons.push(
          <img
              key="phone1"
              src={phoneIcon}
              className={styles.contactPhone}
              alt="Phone icon"
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

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.naviPanel}>
        <span className={styles.nameAndIcon}>{company.name} <div className={styles.iconContainer}>
                                                        {getCompanyTypeIcon(company.type)}
                                                    </div></span>
      </div>
      <div className={styles.CompanyDetails}>
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Тип:</div><div className={styles.companyRowVal}>{company.type}</div> <div className={styles.buttonArrow} >▼</div></div>
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Статус:</div><div className={styles.companyRowVal}>{company.status}</div> <div className={styles.buttonArrow} >▼</div></div>
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Регион:</div><div className={styles.companyRowVal}>{company.region}</div></div>
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Город:</div><div className={styles.companyRowVal}>{company.city}</div></div>
      {company.phone1 && (
        <div
          className={styles.companyRowInfo}
          onClick={() => window.location.href = `tel:${company.phone1}`}
          style={{ cursor: 'pointer' }}
        >
          <img src={phoneIcon} className={styles.contactPhone} alt="Phone icon" />
          <div className={styles.companyRowVal}>{company.phone1}</div>
        </div>
      )}
      {company.phone2 && (<div className={styles.companyRowInfo}> <img src={phoneIcon} className={styles.contactPhone} alt="Phone icon" /><div className={styles.companyRowVal}>{company.phone1}</div></div>)}
      {company.whatsapp && (<div className={styles.companyRowInfo}> <img src={whatsappIcon} className={styles.contactPhone} alt="Phone icon" /><div className={styles.companyRowVal}>{company.whatsapp}</div></div>)}
      {company.telegram && (<div className={styles.companyRowInfo}> <img src={telegramIcon} className={styles.contactPhone} alt="Phone icon" /><div className={styles.companyRowVal}>{company.telegram}</div></div>)}
      <div className={styles.companyRowHeader}>Контакты {contacts.length > 0 ? `(${contacts.length}):` : ''}</div>
      {
  !loading ? (
    <div className={styles.contactsContainer}>
      {contacts.map((contact, index) => (
        <div key={index} className={styles.contactPerson}>
          <div className={styles.contactName}>{`${contact.firstName} ${contact.lastName} ${contact.surname}`}</div>
         <div className={styles.contactIcons}>{getContactIcons(contact)}</div>
          <div className={styles.contactEmail}>{contact.email}</div>
        </div>
      ))}
    </div>
  ) : (
    <>
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem'}} />
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem'}} />
                </>
  )
}

{mails.length > 0 && (<div className={styles.companyRowInfo}><img src={emailIcon} className={styles.contactPhone} alt="Phone icon" />
{
  
  !loadingMail ? (
    <div className={styles.companyRowVal}>
      {mails.map(item => item.email).join(', ')}
    </div>
  ) : (
    <>
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem'}} />
                </>
  )
}
</div>)}
<div className={styles.companyRowHeader}>События {activity.length > 0 ? `(${activity.length}):` : ''}</div>
{
  !loadingActivity ? (
    <div className={styles.contactItem}>
      {activity.map((activity, index) => (
        <div key={index} className={styles.contactItem}>
          <div className={styles.activityRowVal}>{activity.startDateTime ? new Date(activity.startDateTime).toLocaleDateString() + ' ' : ''}
             {activity.purpose}</div>
        </div>
      ))}
    </div>
  ) : (
    <>
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem'}} />
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem'}} />
                </>
  )
}


<div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Адрес:</div><div className={styles.companyRowVal}>{company.address ? company.address : '(не указан)'}</div></div>
{company.description && (<div className={styles.companyDescriptionRowInfo}><div className={styles.companyRowHeader}>Примечание:</div><div className={styles.companyDescriptionRowVal}>{company.description}</div></div>)}
{company.manager && (<div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Менеджер:</div><div className={styles.companyRowVal}>{company.manager}</div></div>)}
      </div>
     
    </div>
  );
}

export default CompanyDetails;