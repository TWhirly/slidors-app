import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CircularProgress } from '@mui/material'
import styles from './Companies.module.css';
import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function CompanyDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const tg = window.Telegram.WebApp;

  const fetchCompanyData = async () => {
    console.log('fetchCompanyData', state.id);
    const params = {
      name: 'Ваше имя',
      companyId: state.id,
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

  const { data: companyData, isLoading, error } = useQuery({
    queryKey: ['company', state.id],
    queryFn: fetchCompanyData,
    enabled: !!state?.id, // Only run the query if state.id is available
    staleTime: 300000, // Data is considered fresh for 5 minutes (300,000 ms)
  });
  console.log('companyData', companyData);
  if (isLoading) {
    return (
      <div className={styles.container}>
          <CircularProgress color='008ad1' className={styles.loading} />
      </div>
  );
  }

  if (error) {
    return <div>Error loading company details</div>;
  }

  const company = companyData?.[0];
  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className={styles.container}>
      <h1>{company.name}</h1>
      <p>{company.type}</p>
      <div>{company.status}</div>
      <div>{company.region}</div>
      <div>{company.city}</div>
      <div>{company.phone1}</div>
      <div>{company.phone2}</div>
      <div>{company.whatsapp}</div>
      <div>{company.telegram}</div>
      <div>{company.address}</div>
      <div>{company.description}</div>
      <div>{company.manager}</div>
    </div>
  );
}

export default CompanyDetails;