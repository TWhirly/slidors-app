import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import styles from '../Companies/Companies.module.css';
import { YellowStarIcon } from '../../icons/SVG';
const Companies = () => {

  const [regionRows, setRegionRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const chat_id = JSON.parse(params.get('user')).id;
  console.log('chat_id', chat_id)
  tg.BackButton.show();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case ('работает'):
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
        );; // переработчик
      case 'дистрибьютор':
        return (
          <img
            src={require('../../icons/boxes-svgrepo-com.png')}
            alt="дистрибьютор"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        );;  // Дистрибьютор
      case 'дилер':
        return (
          <img
            src={require('../../icons/construction-worker-svgrepo-com.png')}
            alt="Дилер"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        ); // Дилер
      case 'избранный':
        return <YellowStarIcon className={styles.factoryIcon} />; // Избранный
      default:
        return (
          <img
            src={require('../../icons/rectangles-mixed-svgrepo-com.png')}
            alt="Неизвестно"
            fill="#008ad1"
            className={styles.factoryIcon}
          />
        ); // Неизвестно
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          name: 'Ваше имя',
          chatID: chat_id,
          api: 'getCompanies'
        };

        // Сериализуем параметры в формате x-www-form-urlencoded
        const formData = JSON.stringify(params);

        const response = await axios.post(
            "https://24gsr.ru:8000/slidors/"
        );

        const data = response.data; // Обработка ответа
        data.sort((a, b) => a.name.localeCompare(b.name)); // Sort data by company name
        const regions = data.reduce((acc, item) => {
          const existingRegion = acc.find(({ id }) => id === item.region);
          if (existingRegion) {
            existingRegion.count += 1;
            existingRegion.companies.push(item);
          } else {
            acc.push({ id: item.region, count: 1, companies: [item] });
          }
          return acc;
        }, []);
        regions.sort((a, b) => a.id.localeCompare(b.id));
        setRegionRows(regions);
        setLoading(false);
        console.log('data is', data)
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Add event listener for back button
    tg.BackButton.onClick(() => {
      window.history.back();
    });

    return () => {
      // Clean up the event listener
      tg.BackButton.offClick();
    };
  }, [chat_id, tg.BackButton]);

  const handleRegionClick = (regionId) => {
    if (selectedRegion === regionId) {
      setSelectedRegion(null);
    } else {
      setSelectedRegion(regionId);
    }
  };


  

  return (
    <div className={styles.container}>
      {loading ? (
        <CircularProgress 
        color='008ad1' className={styles.loading} />
      ) : (
        <div className={styles.paper}>
          <div className={styles.paper}>
            {regionRows.map((region) => (
              <div key={region.id}
              className={styles.regionContainer}>
                <button
                  onClick={() => handleRegionClick(region.id)}
                  className={styles.regionButton}
                >
                  <span>
                    {region.id
                      .split(" ")
                      .filter((item) => {
                        return item !== "область";
                      })
                      .join(" ")}{" "}
                    ({region.count})
                    <div className={styles.regionButtonArrow} />
                  </span>
                </button>
                {selectedRegion === region.id && (
                  <div className={styles.dataGridContainer}>
                    {region.companies.map((company) => (
                      <><div key={company.id} className={styles.companyItem}>
                        <div className={styles.companyName}>
                          {company.name}
                        </div>
                        {/* <Factory className={styles.factoryIcon} /> */}
                        {getCompanyTypeIcon(company.type)}
                        <div className={styles.checksContainer}>
                          <div>
                            {company.handled ? (<img
                              src={require('../../icons/checkedRed.png')}
                              alt="переработчик"
                              fill="#008ad1"
                              className={styles.checkIcon}
                            />) : ''}
                          </div>
                          <div>
                            {company.wa ? (<img
                              src={require('../../icons/checkedGreen.png')}
                              alt="переработчик"
                              fill="#008ad1"
                              className={styles.checkIcon}
                            />) : ''}
                          </div>
                          <div>
                            {company.tg ? (<img
                              src={require('../../icons/checkedBlue.png')}
                              alt="переработчик"
                              fill="#008ad1"
                              className={styles.checkIcon}
                            />) : ''}
                          </div>
                        </div>
                      </div>

                        <div
                          className={styles.companyStatus}
                          style={{
                            color: getStatusColor(company.status),
                            fontSize: '0.8rem'
                          }}
                        >
                          {company.status ? company.status : 'Неизвестно'}
                        </div></>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
