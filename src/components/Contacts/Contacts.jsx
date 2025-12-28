import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress } from '@mui/material';
import styles from './Contacts.module.css';
import { YellowStarIcon } from '../../icons/SVG';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from '../Companies/sx.js';
import { DataContext } from '../../DataContext.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useContacts } from '../../hooks/useContacts';
import { useContactFilters } from '../../hooks/useContactFilters.jsx';
import { ContactsFilterModal } from './ContactsFilterModal.jsx'
import { replace } from 'lodash';

const Contacts = () => {
    const { regions: contextRegions } = useContext(DataContext);
    const { email, chat_id } = useContext(DataContext);
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
    const { contacts, transformToRegionsWithContacts, isLoading, error } = useContacts(chat_id);
    const filterIcon = require('../../icons/filter.png')
    const filterActiveIcon = require('../../icons/filterActive.png')
    console.log('contacts component', contacts)
    const {
        filters,
        setFilters,
        filteredContacts,
        isFilterModalOpen,
        setIsFilterModalOpen,
        avialablePositions,
        avialableRegions,
    } = useContactFilters(contacts || []);

    const regionsWithContacts = transformToRegionsWithContacts(filteredContacts) || []

    const removeFilter = () => {
        localStorage.removeItem('contactFilters');
        const emptyFilters = {
            snv: false,
            company: '',
            name: '',
            lastName: '',
            firstName: '',
            surname: '',
            region: '',
            position: []
        };

        setFilters(emptyFilters);
    };

     const activeFiltersCount = [
    filters.snv ? 1 : 0,
    filters.company ? 1 : 0,
    filters.name ? 1 : 0,
    filters.lastName ? 1 : 0,
    filters.firstName ? 1 : 0,
    filters.surname ? 1 : 0,
    filters.region ? 1 : 0,
    filters.position.length
  ].reduce((sum, count) => sum + count, 0);


    const tg = window.Telegram.WebApp;
    // const params = new URLSearchParams(window.Telegram.WebApp.initData);
    // const user = JSON.parse(params.get('user'));
    // const chat_id = user.id;

    // tg.BackButton.show();
    // console.log(email, 'email');


    useEffect(() => {
        console.log('savedSelectedRegion')
        const savedSelectedRegion = sessionStorage.getItem('selectedRegion');

        if (savedSelectedRegion) {
            setSelectedRegion(savedSelectedRegion); // Restore selected region
        }
    }, []);

    // useEffect(() => {

    // }, [selectedRegion]);

    // Функция для получения регионов

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

    const handleSelectContact = (contact) => {
        console.log('handleSelectCompany', contact);
        navigate(`/contacts/${contact.id}`, {
            state: { contactId: contact.id }
        });
    };

    const collapseRegion = () => {
        setSelectedRegion(null);
    };

    const getEmptyContact = (selectedRegion = '') => ({
        id: uuidv4(), // Generates UUID v4
        firstName: '',
        lastName: '',
        surname: '',
        companyId: '',
        title: '',
        region: selectedRegion,
        phone1: '',
        phone2: '',
        manager: email,
        whatsapp: '',
        telegram: '',
        note: '',
        emails: [{ id: uuidv4(), mail: '' }],
        new: true
    });

    const handleAddContact = () => {
        const emptyContact = getEmptyContact(selectedRegion || '');
        navigate(`/contacts/new/edit`, { state: emptyContact, path: '/contacts' }, replace = true);
    };

    const formatNumber = (number) => {
        const cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.startsWith('8')) {
            return '7' + cleanNumber.slice(1);
        }
        if (cleanNumber.startsWith('7')) {
            return cleanNumber;
        }
        return '7' + cleanNumber;
    };

    // Обработка кнопки "назад" в Telegram
    useEffect(() => {
        // const tg = window.Telegram?.WebApp;
        // if (!tg) return;

        tg.BackButton.show();
        tg.BackButton.onClick(() => navigate(('/'), { replace: true })); // Вернуться на предыдущую страницу'));

        return () => {
            tg.BackButton.offClick();
            //   tg.BackButton.hide(); // Опционально: скрыть кнопку при размонтировании
        };
    }, [navigate, tg.BackButton]);

    console.log('region rows', filteredContacts, 'loading region', loadingRegion, 'selected region', selectedRegion, 'isLoading', isLoading, 'error', error)

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
    console.log(regionsWithContacts);
    return (
        <div className={styles.container}>

            <div
                className={styles.naviPanel}
                
            >
                <div className={selectedRegion ? styles.companyNamePanelExpanded : styles.companyNamePanel}
                onClick={collapseRegion}>
                    Контакты{selectedRegion ? ` — ${selectedRegion.split(" ")
                        .filter((item) => item !== "область")
                        .join(" ")}` : ""}
                </div>
                 <div
            
            className={styles.filterButton}
          >
            <div
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            >
            <img src={activeFiltersCount > 0 ? filterActiveIcon : filterIcon} 
            alt="Filter icon" 
            className={styles.filterIcon}
            >
                
            </img>
            </div>
             <div className={styles.filterCountPanel}
             onClick={() =>activeFiltersCount === 0 ? setIsFilterModalOpen(!isFilterModalOpen) : removeFilter()}
             >
                    {activeFiltersCount === 0 ? "ㅤ" : `✕`}
                </div>
            
          </div>
              
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddContact();
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
                {regionsWithContacts?.filter(region => region.region !== 'noRegion').map((region) => (
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
                                ({region.contacts_count})
                                <div className={styles.regionButtonArrow} />
                            </span>
                        </button>
                        {loadingRegion === region.region && <span className={styles.loadingdots}>Загрузка</span>}
                        {selectedRegion === region.region && (
                            <div className={styles.dataGridContainer}>
                                {regionsWithContacts.find((r) => r.region === region.region)?.contacts?.map((contact) => (
                                    <div key={contact.id} className={styles.companyItem}>
                                        <div className={styles.companyInfo}>
                                            <div className={styles.nameAndIcon}>
                                                <div
                                                    onClick={() => handleSelectContact(contact)}
                                                    className={styles.companyName}
                                                >
                                                    {contact.fullName}
                                                </div>
                                                {contact.snv && <YellowStarIcon className={styles.factoryIcon} />}
                                            </div>
                                            <div className={styles.checksContainer}>
                                                <div>
                                                    {contact.phone1 !== '' && <img
                                                        src={phoneIcon}
                                                        alt="переработчик"
                                                        fill="#008ad1"
                                                        onClick={() => window.location.href = `tel:${contact.phone1}`}
                                                        className={styles.checkIcon}
                                                    />}
                                                </div>
                                                <div>
                                                    {contact.phone2 !== '' && <img
                                                        src={phoneIcon}
                                                        alt="переработчик"
                                                        fill="#008ad1"
                                                        onClick={() => window.location.href = `tel:${contact.phone2}`}
                                                        className={styles.checkIcon}
                                                    />}
                                                </div>
                                                <div>
                                                    {contact.whatsapp !== '' && <img
                                                        src={whatsappIcon}
                                                        alt="переработчик"
                                                        fill="#008ad1"
                                                        onClick={() => tg.openLink(`https://wa.me/${formatNumber(contact.whatsapp)}`)}
                                                        className={styles.checkIcon}
                                                    />}
                                                </div>
                                                <div>
                                                    {contact.telegram !== '' && <img
                                                        src={telegramIcon}
                                                        alt="переработчик"
                                                        fill="#008ad1"
                                                        onClick={() => window.location.href = `https://t.me/${formatNumber(contact.telegram)}`}
                                                        className={styles.checkIcon}
                                                    />}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={styles.companyStatus}
                                            style={{
                                                color: 'var(--hintColor, #888)',
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
                 {isFilterModalOpen && <ContactsFilterModal 
                            //  className={styles.allRegions}
                        isOpen={isFilterModalOpen}
                        onClose={() => setIsFilterModalOpen(false)}
                        filters={filters}
                        onFiltersChange={setFilters}
                        avialablePositions={avialablePositions}
                        avialableRegions={avialableRegions}
                        
                      />}
                     
        </div>
    );
};

export default Contacts;