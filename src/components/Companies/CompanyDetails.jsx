// В компоненте деталей компании
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import LoadingSpinner from '@mui/material/Skeleton';
import { useTelegram } from '../../hooks/useTelegram';

function CompanyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [company, setCompany] = useState(state?.preloadedData || null);
  const [isLoading, setIsLoading] = useState(!state?.preloadedData);
  const { tg } = useTelegram();

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
      tg.BackButton.hide(); // Optionally hide the button when unmounting
    };
  }, [navigate, tg]);

  useEffect(() => {
    if (!state?.preloadedData) {
      // Если пришли напрямую (без предзагрузки) - грузим все
      loadFullData();
    } else {
      // Если есть базовые данные - подгружаем остальное в фоне
      loadAdditionalData();
    }
  }, [state?.preloadedData, id]);

  const loadFullData = async () => {
    setIsLoading(true);
    const data = await fetch(`/api/companies/${id}`).then(r => r.json());
    setCompany(data);
    setIsLoading(false);
  };

  const loadAdditionalData = async () => {
    const additionalData = await fetch(`/api/companies/${id}/details`).then(r => r.json());
    setCompany(prev => ({ ...prev, ...additionalData }));
  };

  return (
    <div>
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          <h1>{company.name}</h1>
          {/* Основные данные из preloadedData */}
          <p>{company.description}</p>
          <div>{JSON.stringify(window.Telegram?.WebApp.BackButton)}</div>
          {/* Доп данные могут подгружаться с задержкой */}
          {!company.details && <LoadingSpinner small />}
          {company.details && (
            <div>{/* Детализированная информация */}</div>
          )}
        </>
      )}
    </div>
  );
}

export default CompanyDetails;