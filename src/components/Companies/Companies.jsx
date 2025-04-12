import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import styles from './Companies.module.css';
import { YellowStarIcon } from '../../icons/SVG';
import Avatar from '@mui/material/Avatar';
import AvatarGroup  from '@mui/material/AvatarGroup';
import { avatar , avatarGroup } from './sx'

const Companies = () => {
    const avatarStyle = avatar();
    const avatarGroupStyle = avatarGroup();
    const [regionRows, setRegionRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [loadingRegion, setLoadingRegion] = useState(null);

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
              api: 'getRegions'
          };
    
          // Сериализуем параметры в формате x-www-form-urlencoded
          const formData = JSON.stringify(params);
    
          const response = await axios.post(
              process.env.REACT_APP_GOOGLE_SHEETS_URL,
              formData,
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

    // useEffect(() => {
    //     selectedRegion ? setSelectedRegion(selectedRegion) : setSelectedRegion(null)
    // }, [selectedRegion])

    const collapseRegion = () => {
        setSelectedRegion(null)
    }

    const handleRegionClick = async (regionId) => {
        setLoadingRegion(regionId); // Устанавливаем регион, который загружается
        if (selectedRegion === regionId) {
          setSelectedRegion(null);
          setLoadingRegion(null);
          return;
        }
    
        
    
        try {
          const params = {
            name: regionId,
            chatID: chat_id,
            api: 'getCompanies'
        };
    
        // Сериализуем параметры в формате x-www-form-urlencoded
        const formData = JSON.stringify(params);
    
        const response = await axios.post(
            process.env.REACT_APP_GOOGLE_SHEETS_URL,
            formData,
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




    return (
        <div className={styles.container}>
            
            {loading ? (
                <CircularProgress
                    color='008ad1' className={styles.loading} />
            ) : (

                <div className={styles.paper}>
                         <div 
                        className={styles.naviPanel}
                        onClick={() => collapseRegion()}
                        >
                            <div className={styles.companyNamePanel} onClick={() => collapseRegion()}>
                            Компании{selectedRegion ? ` — ${selectedRegion.split(" ")
                                            .filter((item) => {
                                                return item !== "область";
                                            })
                                            .join(" ")}` : ""}
                            </div>
                  <AvatarGroup  direction="row" spacing={10} sx={avatarGroupStyle} >
                        <Avatar sx={avatarStyle} alt="Remy Sharp" src="https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/avatars%2F112290193.jpg?alt=media" />
                        <Avatar sx={avatarStyle} alt="Travis Howard" src="https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/avatars%2F388749388.jpg?alt=media" />
                        <Avatar sx={avatarStyle} alt="Cindy Baker" src="https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/avatars%2F1621781004.jpg?alt=media" />
                    </AvatarGroup>
                    </div>
                    <div className={styles.allRegions}>
                     
                        {regionRows.map((region) => (
                            <div key={region.id}
                                className={styles.regionContainer}>
                                <button
                                    onClick={() => handleRegionClick(region.region)}
                                    className={styles.regionButton}
                                >
                                    <span>
                                        {region.region
                                            .split(" ")
                                            .filter((item) => {
                                                return item !== "область";
                                            })
                                            .join(" ")}{" "}
                                        ({region.company_count})
                                        <div className={styles.regionButtonArrow} />
                                    </span>
                                </button>
                                {loadingRegion === region.region ? (<span className={styles.loadingdots}>Загрузка</span>) : ''}
                                {selectedRegion === region.region && (
                                    <div className={styles.dataGridContainer}>
                                        {region.companies.map((company) => (
                                            <div key={company.id} className={styles.companyItem}>
                                                <div className={styles.companyInfo}>
                                                    <div className={styles.nameAndIcon}>
                                                        <div className={styles.companyName}>
                                                            {company.name}
                                                        </div>
                                                        <div className={styles.iconContainer}>
                                                            {getCompanyTypeIcon(company.type)}
                                                        </div>
                                                    </div>
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
                                                        fontSize: '0.7rem'
                                                    }}
                                                >
                                                    {company.status ? company.status : 'Неизвестно'}
                                                </div>
                                            </div>

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