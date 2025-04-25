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
  const [loading, setLoading] = useState(true);
  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const chat_id = JSON.parse(params.get('user')).id;

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
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Тип</div><div className={styles.companyRowVal}>{company.type}</div> <div className={styles.buttonArrow} >▼</div></div>
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Статус</div><div className={styles.companyRowVal}>{company.status}</div> <div className={styles.buttonArrow} >▼</div></div>
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Регион</div><div className={styles.companyRowVal}>{company.region}</div></div>
      <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Город</div><div className={styles.companyRowVal}>{company.city}</div></div>
      <div>{company.phone1}</div>
      <div>{company.phone2}</div>
      <div>{company.whatsapp}</div>
      <div>{company.telegram}</div>
      <div className={styles.companyRowHeader}>Контакты {contacts.length > 0 ? `(${contacts.length})` : ''}</div>
      {
  !loading ? (
    <div className={styles.contactsContainer}>
      {contacts.map((contact, index) => (
        <div key={index} className={styles.contactItem}>
          <div className={styles.contactName}>{`${contact.firstName} ${contact.lastName} ${contact.surname}`}</div>
          <div className={styles.contactPhone}>{contact.surname}</div>
          <div className={styles.contactEmail}>{contact.email}</div>
        </div>
      ))}
    </div>
  ) : (
    // <Card sx={{ width: '100%', marginRight: 5, height: '2.5rem', my: 2, display: 'flex', backgroundColor: 'transparent', boxShadow: 'none' }}>
    
    <>
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem'}} />
                <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem'}} />
                 
                  {/* <div style={{ display: 'flex', alignItems: 'center', width: '1.5rem', marginTop: '5rem', bgcolor: 'grey.900'}}>
                    gg
                  </div> */}
                {/* </Skeleton>
                <Skeleton variant="rectangular" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', marginBottom: '0.5rem',
                  marginTop: '0', borderRadius: '0.3rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', width: '1.5rem',  }}>
                    gg
                  </span>
                </Skeleton> */}
                </>
    
   
  )
}
      <div>{company.address}</div>
      <div>{company.description}</div>
      <div>{company.manager}</div>
      </div>
     
    </div>
  );
}

export default CompanyDetails;