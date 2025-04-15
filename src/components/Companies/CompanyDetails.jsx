// В компоненте деталей компании
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import LoadingSpinner from '@mui/material/Skeleton';

function CompanyDetails() {
  window.Telegram?.WebApp.BackButton.show();
    const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [company, setCompany] = useState(state?.preloadedData || null);
  const [isLoading, setIsLoading] = useState(!state?.preloadedData);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    
    tg.BackButton.show();
    tg.BackButton.onClick(() => navigate((-1), { replace: true })); // Вернуться на предыдущую страницу'));

    return () => {
      tg.BackButton.offClick();
    //   tg.BackButton.hide(); // Опционально: скрыть кнопку при размонтировании
    };
  }, [navigate]);


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