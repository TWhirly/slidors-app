import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CircularProgress } from '@mui/material'
import styles from './CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { YellowStarIcon } from '../../icons/SVG'; // Import necessary icons

function CompanyDetails() {
  const navigate = useNavigate();
  const { state : company} = useLocation();
  const tg = window.Telegram.WebApp;

  const fetchCompanyData = async () => {
    console.log('fetchCompanyData', company.id);
    const params = {
      name: 'Ваше имя',
      companyId: company.id,
      api: 'getCompany',
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData
    );
    return response.data;
  };

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

 useEffect(() => {
 },[company]);

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
      <div>{company.address}</div>
      <div>{company.description}</div>
      <div>{company.manager}</div>
      </div>
     
    </div>
  );
}

export default CompanyDetails;