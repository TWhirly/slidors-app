import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress } from '@mui/material';
import styles from './Companies.module.css';
import { YellowStarIcon } from '../../icons/SVG';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from './sx';
import { DataContext } from '../../DataContext.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useRegions } from '../../hooks/useRegions';
import { useQuery, useQueryClient, QueriesObserver } from '@tanstack/react-query';

const Companies = () => {
    const queryClient = useQueryClient();
    const { regions: contextRegions } = useContext(DataContext);
    const { email } = useContext(DataContext);
    const navigate = useNavigate();
    const avatarGroupStyle = avatarGroup();
    const [selectedRegion, setSelectedRegion] = useState(null);

    const tg = window.Telegram.WebApp;
    const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const user = JSON.parse(params.get('user'));
    const chat_id = user.id;
    
    tg.BackButton.show();
    console.log(email, 'email');
    
    // Используем хук useRegions
    const { regionsWithCompanies, isLoading, error } = useRegions(chat_id);

    useEffect(() => {
        // Load selectedRegion from sessionStorage on component mount
        const savedSelectedRegion = sessionStorage.getItem('selectedRegion');
        if (savedSelectedRegion) {
            setSelectedRegion(savedSelectedRegion);
        }
    }, []);

    const handleRegionClick = async (regionId) => {
        if (selectedRegion === regionId) {
            setSelectedRegion(null);
            sessionStorage.removeItem('selectedRegion');
            return;
        }
      
        setSelectedRegion(regionId);
        sessionStorage.setItem('selectedRegion', regionId);
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
        navigate(`/companies/${company.id}`, {
            state: company
        });
    };

    const collapseRegion = () => {
        setSelectedRegion(null);
        sessionStorage.removeItem('selectedRegion');
    };

    const getEmptyCompany = (selectedRegion = '') => ({
        id: uuidv4(),
        name: '',
        type: '',
        status: '',
        city: '',
        address: '',
        region: selectedRegion,
        description: '',
        phone1: '',
        phone2: '',
        manager: email,
        whatsapp: '',
        telegram: '',
        recyclers: [],
        tt: '',
        dealers: '',
        url: '',
        logo: '',
        firm: '',
        new: true
    });

    const handleAddCompany = () => {
        const emptyCompany = getEmptyCompany(selectedRegion || '');
        navigate(`/companies/new/edit`, { state: emptyCompany });
    };

    // Обработка кнопки "назад" в Telegram
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.BackButton.show();
        tg.BackButton.onClick(() => navigate(('/'), { replace: true }));

        return () => {
            tg.BackButton.offClick();
        };
    }, [navigate]);
    
    console.log('regionsWithCompanies', regionsWithCompanies);
    // queryClient.invalidateQueries({ queryKey: ['regions'] })

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

    return (
        <div className={styles.container}>
            <div
                className={styles.naviPanel}
                onClick={collapseRegion}
            >
                <div className={styles.companyNamePanel}>
                    Компании{selectedRegion ? ` — ${selectedRegion.split(" ")
                        .filter((item) => item !== "область")
                        .join(" ")}` : ""}
                </div>
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddCompany();
                    }}
                    sx={{
                        color: 'white',
                        marginRight: '1rem'
                    }}
                >
                    <AddIcon />
                </IconButton>
                <AvatarGroup 
                    max={5} 
                    direction="row" 
                    spacing={10} 
                    sx={{ ...avatarGroupStyle, '& .MuiAvatarGroup-avatar': avatar('') }}
                >
                    {selectedRegion ? contextRegions.filter((item) => item.region === selectedRegion)[0]?.regionUsers?.map((user) => (
                        <Avatar sx={avatar(user.name)} alt={user.name} src={user.avatar}>
                            {`${user.name.split('')[0]}${user.name.split('')[1]}`}
                        </Avatar>
                    )) : ''}
                </AvatarGroup>
            </div>
            <div className={styles.allRegions}>
                {regionsWithCompanies?.map((region) => (
                    <div key={region.region} className={styles.regionContainer}>
                        <button
                            onClick={() => handleRegionClick(region.region)}
                            className={styles.regionButton}
                        >
                            <span>
                                {region?.region
                                    .split(" ")
                                    .filter((item) => item !== "область")
                                    .join(" ")}{" "}
                                ({region.company_count}){region.regionTurnover > 0 ? ' – ' + region.regionTurnover.toLocaleString('ru-RU', {}) : ''}
                                <div className={styles.regionButtonArrow} />
                            </span>
                        </button>
                        {selectedRegion === region.region && (
                            <div className={styles.dataGridContainer}>
                                {region.companies?.map((company) => (
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
    );
};

export default Companies;