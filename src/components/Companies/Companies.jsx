import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import styles from './Companies.module.css';
import { YellowStarIcon } from '../../icons/SVG';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from './sx';
import { DataContext } from '../../DataContext';
import sha256 from 'crypto-js/sha256'; // Import the hashing library

const Companies = () => {
    
    const { regions: contextRegions } = useContext(DataContext);
    console.log('regions', JSON.parse(sessionStorage.getItem('regionsWithCompanies')))
    const navigate = useNavigate();
    const avatarGroupStyle = avatarGroup();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [loadingRegion, setLoadingRegion] = useState(null);
    const [regionsWithCompanies, setRegionsWithCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    

    const tg = window.Telegram.WebApp;
    const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const chat_id = JSON.parse(params.get('user')).id;
    tg.BackButton.show();

    useEffect(() => {
        // Load regionsWithCompanies from sessionStorage on component mount
        const savedRegions = sessionStorage.getItem('regionsWithCompanies');
        const savedSelectedRegion = sessionStorage.getItem('selectedRegion');

        if (savedRegions) {
            setRegionsWithCompanies(JSON.parse(savedRegions)); // Load from sessionStorage
            setLoading(false); // Stop loading if data is available
        }

        if (savedSelectedRegion) {
            setSelectedRegion(savedSelectedRegion); // Restore selected region
        }
    }, []);

    useEffect(() => {
        
    }, [selectedRegion]);

    // Функция для получения регионов
    const fetchRegions = async () => {
        console.log('fetchRegions')
        const params = {
            name: 'Ваше имя',
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

    // Функция для получения компаний по региону
    const fetchCompanies = async (regionId) => {
        console.log('fetchCompanies')
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
        queryFn: fetchRegions,
        staleTime: 300000, // Data is considered fresh for 5 minutes (300,000 ms)
        refetchInterval: 600000, // Refetch data every 60 seconds in the background
    });

    // Utility function to compute a hash of an object or array
    const computeHash = (data) => {
        return sha256(JSON.stringify(data)).toString(); // Compute hash and convert to string
    };

    useEffect(() => {
        if (regionRows) {
            // console.log(`query result, got at ${currentTime.toLocaleTimeString()} ${JSON.stringify(regionRows)}`);

            // Compute hashes for comparison
            const savedRegionsHash = sessionStorage.getItem('savedRegionHash') || [];
            const regionRowsHash = computeHash(JSON.stringify(regionRows));

            if (savedRegionsHash !== regionRowsHash) {
                console.log('Data has changed, updating sessionStorage');

                // Build updatedRegions only if data has changed
                const updatedRegions = regionRows.reduce((acc, company) => {
                    const existingRegion = acc.find(r => r.region === company.region);
                    if (existingRegion) {
                        existingRegion.companies.push({
                            id: company.id, // Store only essential fields
                            name: company.name,
                            type: company.type,
                            status: company.status,
                            handled: company.handled,
                            wa: company.wa,
                            tg: company.tg,
                            city: company.city,
                            address: company.address,
                            region: company.region,
                            description: company.description,
                            phone1: company.phone1,
                            phone2: company.phone2,
                            manager: company.manager,
                            whatsapp: company.whatsapp,
                            telegram: company.telegram,
                        });
                        existingRegion.companies.sort((a, b) => a.name.localeCompare(b.name));
                    } else {
                        acc.push({
                            region: company.region,
                            companies: [{
                                id: company.id, // Store only essential fields
                            name: company.name,
                            type: company.type,
                            status: company.status,
                            handled: company.handled,
                            wa: company.wa,
                            tg: company.tg,
                            city: company.city,
                            address: company.address,
                            region: company.region,
                            description: company.description,
                            phone1: company.phone1,
                            phone2: company.phone2,
                            manager: company.manager,
                            whatsapp: company.whatsapp,
                            telegram: company.telegram,
                            }],
                            company_count: regionRows.filter(r => r.region === company.region).length,
                        });
                    }
                    return acc;
                }, []);

                sessionStorage.setItem('regionsWithCompanies', JSON.stringify(updatedRegions)); // Save to sessionStorage
                sessionStorage.setItem('savedRegionHash', computeHash(JSON.stringify(regionRows))); // Save to sessionStorage
                setRegionsWithCompanies(updatedRegions); // Update state
            } else {
                console.log('No changes in data, rendering from sessionStorage');
            }

            setLoading(false); // Stop loading
        }
    }, [regionRows]);

    const handleRegionClick = async (regionId) => {
        // setLoadingRegion(regionId);
        if (selectedRegion === regionId) {
            setSelectedRegion(null);
            sessionStorage.removeItem('selectedRegion'); // Clear expanded region state
            setLoadingRegion(null);
            return;
        }

      
        setSelectedRegion(regionId);
        sessionStorage.setItem('selectedRegion', regionId); // Save expanded region state

    };

    const getStatusColor = (status) => {
        if (status.toLowerCase().includes('уточнить'))
            return 'orange';
        switch (status?.toLowerCase()) {
            case 'работает':
                return 'lightgreen';
            case 'не работает':
                return 'var(--hintColor, #888)';
            case 'уточнить тел.':
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
        console.log('handleSelectCompany', company);
        navigate(`/companies/${company.id}`, {
            state:
                company
            
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

    console.log('region rows', regionsWithCompanies, 'loading region', loadingRegion, 'selected region', selectedRegion, 'isLoading', isLoading, 'error', error)

    if (isLoading || loading) {
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
                    <AvatarGroup direction="row" spacing={10} sx={{ ...avatarGroupStyle, '& .MuiAvatarGroup-avatar': avatar('') }}>
                        {selectedRegion ? contextRegions.filter((item) => item.region === selectedRegion)[0]?.regionUsers?.map((user) => (
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
                                    {region?.region
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