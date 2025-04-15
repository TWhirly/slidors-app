import React, { useState , useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import styles from './Companies.module.css';
import { YellowStarIcon } from '../../icons/SVG';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from './sx';

const Companies = () => {
    const navigate = useNavigate();
    const avatarGroupStyle = avatarGroup();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [loadingRegion, setLoadingRegion] = useState(null);
    const [regionsWithCompanies, setRegionsWithCompanies] = useState([]);

    const tg = window.Telegram.WebApp;
    const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const chat_id = JSON.parse(params.get('user')).id;
    tg.BackButton.show();

    // Функция для получения регионов
    const fetchRegions = async () => {
        const params = {
            name: 'Ваше имя',
            chatID: chat_id,
            api: 'getRegions'
        };
        const formData = JSON.stringify(params);
        const response = await axios.post(
            process.env.REACT_APP_GOOGLE_SHEETS_URL,
            formData,
        );
        return response.data;
    };

    // Функция для получения компаний по региону
    const fetchCompanies = async (regionId) => {
        const params = {
            name: regionId,
            chatID: chat_id,
            api: 'getCompanies'
        };
        const formData = JSON.stringify(params);
        const response = await axios.post(
            process.env.REACT_APP_GOOGLE_SHEETS_URL,
            formData,
        );
        return response.data;
    };

    // Запрос для получения регионов с использованием нового синтаксиса v5+
    const { data: regionRows, isLoading, error } = useQuery({
        queryKey: ['regions'],
        queryFn: fetchRegions
    });

    useEffect(() => {
        if (regionRows) {
            setRegionsWithCompanies(regionRows.map(region => ({
                ...region,
                companies: null // Показываем, что компании ещё не загружены
            })));
        }
    }, [regionRows]);

   

    // Обработчик клика по региону
    const handleRegionClick = async (regionId) => {
        setLoadingRegion(regionId);
        if (selectedRegion === regionId) {
            setSelectedRegion(null);
            setLoadingRegion(null);
            return;
        }

        try {
            const companies = await fetchCompanies(regionId);
            
            setRegionsWithCompanies(prevRegions => 
                prevRegions.map(region =>
                    region.region === regionId
                        ? { ...region, companies }
                        : region
                )
            );
            
            setSelectedRegion(regionId);
        } catch (error) {
            console.error('Error fetching region data:', error);
        } finally {
            setLoadingRegion(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'работает':
                return 'lightgreen';
            case 'не работает':
                return 'var(--hintColor, #888)';
            case 'уточнить номер':
                return 'orange';
            default:
                return 'var(--hintColor, #888)';
        }
    };

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

    const handleSelectCompany = (company) => {
        navigate(`/companies/${company.id}`, {
            state: {
                preloadedData: company
            }
        });
    };

    const collapseRegion = () => {
        setSelectedRegion(null);
    };

    // Обработка кнопки "назад" в Telegram
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;
        
        tg.BackButton.show();
        tg.BackButton.onClick(() => navigate(('/'), { replace: true })); // Вернуться на предыдущую страницу'));
    
        return () => {
          tg.BackButton.offClick();
        //   tg.BackButton.hide(); // Опционально: скрыть кнопку при размонтировании
        };
      }, [navigate]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <CircularProgress color='008ad1' className={styles.loading} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.paper}>
                    Ошибка при загрузке данных: {error.message}
                </div>
            </div>
        );
    }
    console.log('region rows', regionsWithCompanies, 'loading region', loadingRegion, 'selected region', selectedRegion)
    return (
        <div className={styles.container}>
            <div className={styles.paper}>
                <div
                    className={styles.naviPanel}
                    onClick={collapseRegion}
                >
                    <div className={styles.companyNamePanel} onClick={collapseRegion}>
                        Компании{selectedRegion ? ` — ${selectedRegion.split(" ")
                            .filter((item) => item !== "область")
                            .join(" ")}` : ""}
                    </div>
                    <AvatarGroup direction="row" spacing={10} sx={avatarGroupStyle}>
                        {selectedRegion ? regionsWithCompanies.filter((item) => item.region === selectedRegion)[0]?.regionUsers?.map((user) => (
                            <Avatar sx={avatar(user.name)} alt={user.name} src={user.avatar}>
                                {`${user.name.split('')[0]}${user.name.split('')[1]}`}
                            </Avatar>
                        )) : ''}
                    </AvatarGroup>
                </div>
                <div className={styles.allRegions}>
                    {regionsWithCompanies?.map((region) => (
                        <div key={region.id} className={styles.regionContainer}>
                            <button
                                onClick={() => handleRegionClick(region.region)}
                                className={styles.regionButton}
                            >
                                <span>
                                    {region.region
                                        .split(" ")
                                        .filter((item) => item !== "область")
                                        .join(" ")}{" "}
                                    ({region.company_count})
                                    <div className={styles.regionButtonArrow} />
                                </span>
                            </button>
                            {loadingRegion === region.region && <span className={styles.loadingdots}>Загрузка</span>}
                            {selectedRegion === region.region && (
                                <div className={styles.dataGridContainer}>
                                    {regionsWithCompanies.find((r) => r.region === region.region)?.companies?.map((company) => (
                                        <div key={company.id} className={styles.companyItem}>
                                            <div className={styles.companyInfo}>
                                                <div className={styles.nameAndIcon}>
                                                    <div
                                                        onClick={() => handleSelectCompany(company)}
                                                        className={styles.companyName}
                                                    >
                                                        {company.name}
                                                    </div>
                                                    <div className={styles.iconContainer}>
                                                        {getCompanyTypeIcon(company.type)}
                                                    </div>
                                                </div>
                                                <div className={styles.checksContainer}>
                                                    <div>
                                                        {company.handled !== 0 && <img
                                                            src={require('../../icons/checkedRed.png')}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                    <div>
                                                        {company.wa !== 0 && <img
                                                            src={require('../../icons/checkedGreen.png')}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                    <div>
                                                        {company.tg !== 0 && <img
                                                            src={require('../../icons/checkedBlue.png')}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
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
                                                {company.status || 'Неизвестно'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Companies;