import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import styles from './CompaniesDB.module.css';
import { YellowStarIcon } from '../../icons/SVG';
const Companies = () => {
  const [regionRows, setRegionRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loadingRegion, setLoadingRegion] = useState(null); // Для отслеживания загрузки конкретного региона

  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const chat_id = JSON.parse(params.get('user')).id;
  console.log('chat_id', chat_id);
  tg.BackButton.show();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'работает':
        return 'lightgreen'; // Активный статус
      case 'не работает':
        return 'var(--hintColor, #888)'; // Неактивный статус
      case 'уточнить номер':
        return 'orange'; // Ожидающий статус
      default:
        return 'var(--hintColor, #888)'; // Цвет по умолчанию
    }
  };

  const getCompanyTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'переработчик':
        return (
          <img
            src={require('../../icons/factory-svgrepo-com.png')}
            alt="переработчик"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
      case 'дистрибьютор':
        return (
          <img
            src={require('../../icons/boxes-svgrepo-com.png')}
            alt="дистрибьютор"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
      case 'дилер':
        return (
          <img
            src={require('../../icons/construction-worker-svgrepo-com.png')}
            alt="Дилер"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
      case 'избранный':
        return <YellowStarIcon className={styles.factoryIcon} />;
      default:
        return (
          <img
            src={require('../../icons/rectangles-mixed-svgrepo-com.png')}
            alt="Неизвестно"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          region: 'Москва и МО',
        };

        const response = await axios.post(
          "https://24gsr.ru:8000/slidors/",
          params
        );

        const regions = response.data;
        setRegionRows(regions);
        setLoading(false);
        console.log('data is', regions);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();

    tg.BackButton.onClick(() => {
      window.history.back();
    });

    return () => {
      tg.BackButton.offClick();
    };
  }, [chat_id, tg.BackButton]);



  const handleRegionClick = async (regionId) => {
    setLoadingRegion(regionId); // Устанавливаем регион, который загружается
    if (selectedRegion === regionId) {
      setSelectedRegion(null);
      setLoadingRegion(null);
      return;
    }

    

    try {
      const response = await axios.post(
        "https://24gsr.ru:8000/slidors-getregion/",
        { region: regionId }
      );
      console.log('response', response.data);
      const updatedRegions = regionRows.map((region) =>
        region.region === regionId
          ? { ...region, companies: response.data }
          : region
      );

      setRegionRows(updatedRegions);
      setSelectedRegion(regionId); // Устанавливаем выбранный регион
    } catch (error) {
      console.error('Error fetching region data:', error);
    } finally {
      setLoadingRegion(null); // Сбрасываем состояние загрузки региона
    }
  };
  
  console.log('regionRows', regionRows);
  return (
    <div className={styles.container}>
      {loading ? (
        <CircularProgress color="primary" className={styles.loading} />
      ) : (
        <div className={styles.paper}>
          {regionRows.map((region) => (
            <div key={region.region} className={styles.regionContainer}>
              <button
                onClick={() => handleRegionClick(region.region)}
                className={styles.regionButton}
              >
                <span>
                  {region.region
                    .split(' ')
                    .filter((item) => item !== 'область')
                    .join(' ')}{' '}
                  ({region.company_count})
                  <div className={styles.regionButtonArrow} />
                </span>
              </button>
              {loadingRegion === region.region ? (<span className={styles.loadingdots}>Загрузка</span>) : ''}
              {selectedRegion === region.region && (
                <div className={styles.dataGridContainer}>
                  {loadingRegion === region.region ? (
                    <span>Loading...</span>
                  ) : (
                    region.companies.map((company) => (
                      <div key={company.id} className={styles.companyItem}>
                        <div className={styles.companyInfo}>
                        <div className={styles.companyName}>
                          {company.name}
                        </div>
                        {getCompanyTypeIcon(company.type)}
                        <div className={styles.checksContainer}>
                          <div>
                            {company.handled ? (
                              <img
                                src={require('../../icons/checkedRed.png')}
                                alt="переработчик"
                                fill="#008ad1"
                                className={styles.checkIcon}
                              />
                            ) : (
                              ''
                            )}
                          </div>
                          <div>
                            {company.wa ? (
                              <img
                                src={require('../../icons/checkedGreen.png')}
                                alt="переработчик"
                                fill="#008ad1"
                                className={styles.checkIcon}
                              />
                            ) : (
                              ''
                            )}
                          </div>
                          <div>
                            {company.tg ? (
                              <img
                                src={require('../../icons/checkedBlue.png')}
                                alt="переработчик"
                                fill="#008ad1"
                                className={styles.checkIcon}
                              />
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                        </div>
                        <div
                          className={styles.companyStatus}
                          style={{
                            color: getStatusColor(company.status),
                            fontSize: '0.8rem',
                          }}
                        >
                          {company.status ? company.status : 'Неизвестно'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
