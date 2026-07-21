import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import { Element } from 'react-scroll';
import styles from './Companies.module.css';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from './sx.js';
import { DataContext } from '../../DataContext.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useRegions } from '../../hooks/useRegions.js';
import { useCompanyFilters } from '../../hooks/useCompanyFilters.jsx';
import { useCompanyUpdate } from '../../hooks/useCompanyUpdate.js';
import { useTelegram } from '../../hooks/useTelegram.js';
import { checkIcons, getCompanyTypeIcon, mainContactsIcons, getEmptyCompany } from './Companies-helpers.js'
import { CompaniesFilterModal } from './CompaniesFilterModal.jsx';

import CompanyMainСontacts from './CompanyMainContacts.jsx';
const filterIcon = require('../../icons/filter.png')
const filterActiveIcon = require('../../icons/filterActive.png')

// Заглушки для иконок мессенджеров (замените на свои пути)
const whatsappIcon = '../../icons/whatsapp.png';
const telegramIcon = '../../icons/telegram.png';
const maxIcon = '../../icons/max.png';

const Subscribes = () => {

    const { email, regions: contextRegions } = useContext(DataContext);
    const navigate = useNavigate();
    const location = useLocation();
    const avatarGroupStyle = avatarGroup();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyHasContacts, setCompanyHasContacts] = useState(false);
    const [companySubscribes, setCompanySubscribes] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const { tg, chat_id, showButton } = useTelegram();
    const { optimisticUpdateCompany, upload, saving } = useCompanyUpdate(chat_id);
    const uploadRef = useRef(upload);
    const formDataRef = useRef(null);
    const maxIcon = mainContactsIcons.maxIcon
    const whatsappIcon = mainContactsIcons.whatsappIcon
    const telegramIcon = mainContactsIcons.telegramIcon

    const id = location.state?.companyId || null;

    const ifcompanyHasContacts = (company) => {
        console.log(' if has', company.phone1?.length + company.phone2?.length + company.whatsapp?.length + company.telegram?.length > 0);
        return setCompanyHasContacts(company.phone1?.length + company.phone2?.length + company.whatsapp?.length + company.telegram?.length > 0);
    };

    tg.BackButton.show();

    useEffect(() => {
        showButton({
            text: '1',
            isActive: false,
            isVisible: false,
            onClick: () => {},
        });
    }, [showButton]);

    const handleSave = useCallback(() => {
        console.log('Saving');
        const currentFormData = formDataRef.current;
        
        // Добавляем данные о подписках в данные компании
        if (currentFormData && companySubscribes[currentFormData.id]) {
            const subscribes = companySubscribes[currentFormData.id];
            currentFormData.wa_subscribe = subscribes.wa_subscribe || false;
            currentFormData.tg_subscribe = subscribes.tg_subscribe || false;
            currentFormData.max_subscribe = subscribes.max_subscribe || false;
        }
        
        try {
            uploadRef.current(currentFormData);
            setHasChanges(false);
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [companySubscribes]);

    const scrollToSection = (sectionId, offset) => {
        const element = document.getElementById(sectionId);
        if (!element) {
            console.error(`Элемент с id=${sectionId} не найден`);
            return;
        }

        const elementPosition = element.getBoundingClientRect().top;
        const scrollTop = window.pageYOffset || window.scrollY;
        const offsetPosition = elementPosition + scrollTop - offset;

        window.scrollTo({
            top: offsetPosition,
        });
    };

    const { 
        companies,      
        isLoading, 
        error 
    } = useRegions(chat_id);

    const {
        filters,
        setFilters,
        filteredCompanies,
        isFilterModalOpen,
        setIsFilterModalOpen,
        avialableTypes,
        avialableRegions,
        avialableStatuses,
        avialableManagers,
        avialableHandle,
        regionCities
    } = useCompanyFilters(companies || []);

    const removeFilter = () => {
        localStorage.removeItem('companyFilters');
        const emptyFilters = {
            name: '',
            type: [],
            status: [],
            manager: [],
            city: [],
            region: [],
            handled: []
        };
        setFilters(emptyFilters);
    };

    const activeFiltersCount = [
        filters.handled.length,
        filters.name ? 1 : 0,
        filters.region.length,
        filters.city.length,
        filters.manager.length,
        filters.status.length,
        filters.type.length
    ].reduce((sum, count) => sum + count, 0);

    useEffect(() => {
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
        console.log('regionId', regionId);
        setSelectedRegion(regionId);
        sessionStorage.setItem('selectedRegion', regionId);
    };

    const handleCompanyClick = (company) => {
        formDataRef.current = {...company};
        
        setCompanyHasContacts(company.phone1?.length + company.phone2?.length + company.whatsapp?.length + company.telegram?.length > 0);
        
        if (selectedCompany === company.id) {
            // Если компания сворачивается и есть изменения - сохраняем
            if (hasChanges) {
                handleSave();
            }
            setSelectedCompany(null);
            return;
        }
        
        // Инициализируем состояние подписок для компании
        setCompanySubscribes(prev => ({
            ...prev,
            [company.id]: {
                wa_subscribe: company.wa_subscribe || false,
                tg_subscribe: company.tg_subscribe || false,
                max_subscribe: company.max_subscribe || false
            }
        }));
        
        setSelectedCompany(company.id);
        setHasChanges(false);
    };

    const handleSubscribeChange = (companyId, subscribeType, value) => {
        setCompanySubscribes(prev => ({
            ...prev,
            [companyId]: {
                ...prev[companyId],
                [subscribeType]: value
            }
        }));
        setHasChanges(true);
    };

    const handleSelectCompany = (company) => {
        navigate(`/companies/${company.id}`, {
            state: { companyId: company.id, path: '/companies' }
        });
    };

    const collapseRegion = () => {
        // Если есть изменения при сворачивании региона - сохраняем
        if (hasChanges && selectedCompany) {
            handleSave();
        }
        setSelectedRegion(null);
        sessionStorage.removeItem('selectedRegion');
    };

    const handleAddCompany = () => {
        const emptyCompany = getEmptyCompany(selectedRegion || '', email);
        navigate(`/companies/new/edit`, { state: emptyCompany });
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;
        tg.BackButton.onClick(() => {
            // Сохраняем изменения перед уходом
            if (hasChanges) {
                handleSave();
            }
            navigate(('/'), { replace: true });
        });
        return () => {
            tg.BackButton.offClick();
        };
    }, [navigate, hasChanges, handleSave]);

    // Сохраняем при сворачивании приложения или уходе со страницы
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && hasChanges) {
                handleSave();
            }
        };

        const handleBeforeUnload = () => {
            if (hasChanges) {
                handleSave();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasChanges, handleSave]);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToSection(id, 35);
        }, 300);
        return () => clearTimeout(timer);
    }, [id, filteredCompanies]);
    
    console.log('filteredCompanies', filteredCompanies);

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
            <div className={styles.naviPanel}>
                <div className={selectedRegion ? styles.companyNamePanelExpanded : styles.companyNamePanel}
                    onClick={collapseRegion}>
                    Подписки{selectedRegion ? ` — ${selectedRegion.split(" ")
                        .filter((item) => item !== "область")
                        .join(" ")}` : ""}
                </div>

                <div className={styles.filterButton}>
                    <div
                        onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                    >
                        <img src={activeFiltersCount > 0 ? filterActiveIcon : filterIcon}
                            alt="Filter icon"
                            className={styles.filterIcon}
                        />
                    </div>
                    <div className={styles.filterCountPanel}
                        onClick={() => activeFiltersCount === 0 ? setIsFilterModalOpen(!isFilterModalOpen) : removeFilter()}
                    >
                        {activeFiltersCount === 0 ? "ㅤ" : `✕`}
                    </div>
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
            <div
                id='regionsWithCompanies'
                className={styles.allRegions}>
                {filteredCompanies?.map((region) => (
                    <Element
                        key={region.region}
                        className={styles.regionContainer}
                        name={region.region}
                        id={`region-${encodeURIComponent(region.region)}`}
                    >
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
                                    <Element
                                        style={{
                                            paddingBottom: '0.5rem'
                                        }}
                                        key={company.id}
                                        className={styles.companyItem}
                                        name={company.id}
                                        id={company.id}
                                    >
                                        <div className={styles.companyInfo}>
                                            <div className={styles.nameAndIcon}>
                                                <div
                                                    onClick={() => handleCompanyClick(company)}
                                                    className={styles.companyName}
                                                >
                                                    {company.name}
                                                </div>
                                                <div className={styles.iconContainer}>
                                                    {getCompanyTypeIcon(company.type)}
                                                </div>
                                            </div>
                                            
                                            {/* Секция с чекбоксами подписок */}
                                            <div className={styles.subscribesContainer}>
                                                {/* WhatsApp */}
                                                <div className={styles.subscribeItem}>
                                                    <img 
                                                        src={whatsappIcon} 
                                                        alt="WhatsApp" 
                                                        className={styles.subscribeIcon}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        className={styles.subscribeCheckbox}
                                                        checked={companySubscribes[company.id]?.wa_subscribe || false}
                                                        onChange={(e) => handleSubscribeChange(
                                                            company.id, 
                                                            'wa_subscribe', 
                                                            e.target.checked
                                                        )}
                                                        disabled={selectedCompany !== company.id}
                                                    />
                                                </div>

                                                {/* Telegram */}
                                                <div className={styles.subscribeItem}>
                                                    <img 
                                                        src={telegramIcon} 
                                                        alt="Telegram" 
                                                        className={styles.subscribeIcon}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        className={styles.subscribeCheckbox}
                                                        checked={companySubscribes[company.id]?.tg_subscribe || false}
                                                        onChange={(e) => handleSubscribeChange(
                                                            company.id, 
                                                            'tg_subscribe', 
                                                            e.target.checked
                                                        )}
                                                        disabled={selectedCompany !== company.id}
                                                    />
                                                </div>

                                                {/* Max */}
                                                <div className={styles.subscribeItem}>
                                                    <img 
                                                        src={maxIcon} 
                                                        alt="Max" 
                                                        className={styles.subscribeIcon}
                                                    />
                                                    <input
                                                        type="checkbox"
                                                        className={styles.subscribeCheckbox}
                                                        checked={companySubscribes[company.id]?.max_subscribe || false}
                                                        onChange={(e) => handleSubscribeChange(
                                                            company.id, 
                                                            'max_subscribe', 
                                                            e.target.checked
                                                        )}
                                                        disabled={selectedCompany !== company.id}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {selectedCompany === company.id && companyHasContacts &&
                                            <CompanyMainСontacts
                                                company={company}
                                                showChecks={false}
                                            />
                                        }
                                        {selectedCompany === company.id && !companyHasContacts &&
                                            <div>
                                                нет контактов
                                            </div>
                                        }
                                    </Element>
                                ))}
                            </div>
                        )}
                    </Element>
                ))}
            </div>
            {isFilterModalOpen && <CompaniesFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filters={filters}
                onFiltersChange={setFilters}
                avialableTypes={avialableTypes}
                avialableRegions={avialableRegions}
                avialableHandle={avialableHandle}
                avialableManagers={avialableManagers}
                avialableStatuses={avialableStatuses}
                regionCities={regionCities}
            />}
        </div>
    );
};

export default Subscribes;