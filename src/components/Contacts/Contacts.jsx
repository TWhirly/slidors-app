import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress } from '@mui/material';
import styles from './Contacts.module.css';
import { YellowStarIcon } from '../../icons/SVG';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from '../Companies/sx.js';
import { DataContext } from '../../DataContext.jsx';
import sha256 from 'crypto-js/sha256'; // Import the hashing library
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

const Contacts = () => {
    const { regions: contextRegions } = useContext(DataContext);
    const { email } = useContext(DataContext);
    const navigate = useNavigate();
    const avatarGroupStyle = avatarGroup();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [loadingRegion, setLoadingRegion] = useState(null);
    const [regionsWithCompanies, setRegionsWithConatcts] = useState([]);
    const [loading, setLoading] = useState(true);
    const phoneIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a'
  const whatsappIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197'
  const telegramIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  const emailIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fmail.png?alt=media&token=983b34be-ca52-4b77-9577-ff4c5b26806c'
    

    const tg = window.Telegram.WebApp;
    const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const user = JSON.parse(params.get('user'));
    const chat_id = user.id;
    
    tg.BackButton.show();
    console.log(email, 'email');
    
    useEffect(() => {
        // Load regionsWithCompanies from sessionStorage on component mount
        const savedRegions = sessionStorage.getItem('regionsWithContacts');
        const savedSelectedRegion = sessionStorage.getItem('selectedRegion');

        if (savedRegions) {
            setRegionsWithConatcts(JSON.parse(savedRegions)); // Load from sessionStorage
            setLoading(false); // Stop loading if data is available
        }

        if (savedSelectedRegion) {
            setSelectedRegion(savedSelectedRegion); // Restore selected region
        }
    }, []);

    useEffect(() => {
        
    }, [selectedRegion]);

    const getContactFullNmae = (contact) => {
        const fullName = (contact.lastName ? contact.lastName + ' ' : '') + 
                    (contact.firstName ? contact.firstName + ' ' : '') + 
                    (contact.surname ? contact.surname + ' ' : '')
                    if (fullName === '') {
                        return contact.companyName}
                        return fullName
    };

    // Функция для получения регионов
    const fetchContacts = async () => {
        console.log('getContactsList')
        const params = {
            name: 'Ваше имя',
            chatID: chat_id,
            api: 'getContactsList'
        };
        const formData = JSON.stringify(params);
        const response = await axios.post(
            process.env.REACT_APP_GOOGLE_SHEETS_URL,
            formData,
        );
        return response.data;
    };

    // Функция для получения компаний по региону

    // Запрос для получения регионов с использованием нового синтаксиса v5+
    const { data: regionRows, isLoading, error } = useQuery({
        queryKey: ['regionsContacts'],
        queryFn: fetchContacts,
        staleTime: 300000, // Data is considered fresh for 5 minutes (300,000 ms)
        refetchInterval: 600000, // Refetch data every 60 seconds in the background
    });

    // Utility function to compute a hash of an object or array
    const computeHash = (data) => {
        return sha256(JSON.stringify(data)).toString(); // Compute hash and convert to string
    };

    useEffect(() => {
        if (regionRows) {
            console.log(`query result, ${JSON.stringify(regionRows)}`);

            // Compute hashes for comparison
            const savedRegionContactsHash = sessionStorage.getItem('savedRegionContactsHash') || [];
            const regionRowsContactsHash = computeHash(JSON.stringify(regionRows));

            if (savedRegionContactsHash !== regionRowsContactsHash) {
                console.log('Data has changed, updating sessionStorage');

                // Build updatedRegions only if data has changed
                const updatedRegions = regionRows.reduce((acc, contact) => {
                    const existingRegion = acc.find(r => r.region === contact.region);
                    contact.fullName = getContactFullNmae(contact);
                    if (existingRegion) {
                        existingRegion.contacts.push(
                           contact
                        );
                        existingRegion.contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
                    } else {
                        acc.push(
                            { region: contact.region, contacts: [contact],
                                contact_count: regionRows.filter(r => r.region === contact.region).length
                             }
                        );
                    }
                    return acc;
                }, []);

                sessionStorage.setItem('regionsWithContacts', JSON.stringify(updatedRegions)); // Save to sessionStorage
                sessionStorage.setItem('savedRegionContactsHash', computeHash(JSON.stringify(regionRows))); // Save to sessionStorage
                setRegionsWithConatcts(updatedRegions); // Update state
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
        console.log(regionsWithCompanies.find(r => r.region === regionId));
    };

    const getStatusColor = (status) => {
        if (status?.toLowerCase().includes('уточнить'))
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
        // navigate(`/companies/${company.id}`, {
        //     state:
        //         company
            
        // });
    };

    const collapseRegion = () => {
        setSelectedRegion(null);
    };

    const getEmptyCompany = (selectedRegion = '') => ({
        id: uuidv4(), // Generates UUID v4
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
        // navigate(`/companies/new/edit`, { state: emptyCompany });
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

    // console.log('region rows', regionsWithCompanies, 'loading region', loadingRegion, 'selected region', selectedRegion, 'isLoading', isLoading, 'error', error)

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
    console.log(regionsWithCompanies);
    return (
        <div className={styles.container}>
            
                <div
                    className={styles.naviPanel}
                    onClick={collapseRegion}
                >
                    <div className={styles.companyNamePanel}>
                        Контакты{selectedRegion ? ` — ${selectedRegion.split(" ")
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
                                    ({region.contact_count}){region.regionTurnover > 0 ? ' – ' + region.regionTurnover.toLocaleString('ru-RU', {}) : ''}
                                    <div className={styles.regionButtonArrow} />
                                </span>
                            </button>
                            {loadingRegion === region.region && <span className={styles.loadingdots}>Загрузка</span>}
                            {selectedRegion === region.region && (
                                <div className={styles.dataGridContainer}>
                                    {regionsWithCompanies.find((r) => r.region === region.region)?.contacts?.map((contact) => (
                                        <div key={contact.id} className={styles.companyItem}>
                                            <div className={styles.companyInfo}>
                                                <div className={styles.nameAndIcon}>
                                                    <div
                                                        onClick={() => handleSelectCompany(contact)}
                                                        className={styles.companyName}
                                                    >
                                                        {contact.fullName}
                                                    </div>
                                                    <div className={styles.iconContainer}>
                                                        {getCompanyTypeIcon(contact.type)}
                                                    </div>
                                                </div>
                                                <div className={styles.checksContainer}>
                                                    <div>
                                                        {contact.phone1 !== '' && <img
                                                            src={phoneIcon}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                    <div>
                                                        {contact.phone2 !== '' && <img
                                                            src={phoneIcon}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                    <div>
                                                        {contact.whatsapp !== '' && <img
                                                            src={whatsappIcon}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                     <div>
                                                        {contact.telegram !== '' && <img
                                                            src={telegramIcon}
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
                                                    color: getStatusColor(contact.companyName),
                                                    fontSize: '0.7rem'
                                                }}
                                            >
                                                {contact.companyName || 'Неизвестно'}
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

export default Contacts;