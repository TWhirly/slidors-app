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
import SubsctibesDetailMenu from './SubsctibesDetailMenu.jsx';

import CompanyMainСontacts from './CompanyMainContacts.jsx';
const filterIcon = require('../../icons/filter.png');
const filterActiveIcon = require('../../icons/filterActive.png');

// Статусы подписки
const SUBSCRIPTION_STATUSES = {
    NOT_SUBSCRIBED: 'Не подписан',
    SUBSCRIBED: 'Подписан',
    LEAVE_GROUP: 'Вышел',
    NOT_IN_MESSENGER: 'Нет в мессенджере',
    INVITATION_SENT: 'Отправлено приглашение',
     
};

// Эмодзи для статусов
const STATUS_EMOJIS = {
    [SUBSCRIPTION_STATUSES.NOT_SUBSCRIBED]: '🟨',
    [SUBSCRIPTION_STATUSES.LEAVE_GROUP]: '🙅',
    [SUBSCRIPTION_STATUSES.SUBSCRIBED]: '✅',
    [SUBSCRIPTION_STATUSES.NOT_IN_MESSENGER]: '❌',
    [SUBSCRIPTION_STATUSES.INVITATION_SENT]: '📨'
};

// Описания для подсказки
const STATUS_TOOLTIP = [
    { emoji: '🟨', label: 'Не подписан' },
    { emoji: '✅', label: 'Подписан' },
    { emoji: '🙅', label: 'Вышел' },
    { emoji: '❌', label: 'Нет в мессенджере' },
    { emoji: '📨', label: 'Отправлено приглашение' }
];

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
    const [showTooltip, setShowTooltip] = useState(false);
    const { tg, chat_id, showButton } = useTelegram();
    const { optimisticUpdateCompany, upload, saving } = useCompanyUpdate(chat_id);
    const uploadRef = useRef(upload);
    const formDataRef = useRef(null);
    const maxIcon = mainContactsIcons.maxIcon;
    const whatsappIcon = mainContactsIcons.whatsappIcon;
    const telegramIcon = mainContactsIcons.telegramIcon;

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
        
        if (currentFormData && companySubscribes[currentFormData.id]) {
            const subscribes = companySubscribes[currentFormData.id];
            currentFormData.wa_subscribe = subscribes.wa_subscribe || '';
            currentFormData.tg_subscribe = subscribes.tg_subscribe || '';
            currentFormData.max_subscribe = subscribes.max_subscribe || '';
        }
        
        try {
            uploadRef.current(currentFormData);
            setHasChanges(false);
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [companySubscribes]);
    console.log('comp subscr', companySubscribes)

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
            if (hasChanges) {
                handleSave();
            }
            setSelectedCompany(null);
            return;
        }
        
        setCompanySubscribes(prev => ({
            ...prev,
            [company.id]: {
                wa_subscribe: company.wa_subscribe || '',
                tg_subscribe: company.tg_subscribe || '',
                max_subscribe: company.max_subscribe || ''
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

    const handleTooltipToggle = () => {
        setShowTooltip(!showTooltip);
    };

    const handleTooltipClose = () => {
        setShowTooltip(false);
    };

    // Получение эмодзи для статуса
    const getStatusEmoji = (status) => {
        return STATUS_EMOJIS[status] || '⬜';
    };

    // useEffect(() => {
    //     const tg = window.Telegram?.WebApp;
    //     if (!tg) return;
    //     tg.BackButton.onClick(() => {
    //         if (hasChanges) {
    //             handleSave();
    //         }
    //         navigate(('/'), { replace: true });
    //     });
    //     return () => {
    //         tg.BackButton.offClick();
    //     };
    // }, [navigate, hasChanges, handleSave]);

    // useEffect(() => {
    //     const handleVisibilityChange = () => {
    //         if (document.hidden && hasChanges) {
    //             handleSave();
    //         }
    //     };

    //     const handleBeforeUnload = () => {
    //         if (hasChanges) {
    //             handleSave();
    //         }
    //     };

    //     const handleClickOutside = (e) => {
    //         if (showTooltip) {
    //             const tooltipElement = document.getElementById('tooltip-container');
    //             if (tooltipElement && !tooltipElement.contains(e.target)) {
    //                 setShowTooltip(false);
    //             }
    //         }
    //     };

    //     document.addEventListener('visibilitychange', handleVisibilityChange);
    //     window.addEventListener('beforeunload', handleBeforeUnload);
    //     document.addEventListener('click', handleClickOutside);

    //     return () => {
    //         document.removeEventListener('visibilitychange', handleVisibilityChange);
    //         window.removeEventListener('beforeunload', handleBeforeUnload);
    //         document.removeEventListener('click', handleClickOutside);
    //     };
    // }, [hasChanges, handleSave, showTooltip]);

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
        <div className={styles.container} onClick={handleTooltipClose}>
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

                {/* Кнопка подсказки вместо AddIcon */}
                <div className={styles.tooltipWrapper} id="tooltip-container">
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTooltipToggle();
                        }}
                        sx={{
                            color: 'white',
                            marginRight: '1rem',
                            fontSize: '1.5rem',
                            padding: '0.3rem'
                        }}
                    >
                        ?
                    </IconButton>
                    {showTooltip && (
                        <div className={styles.tooltipContent}>
                            {STATUS_TOOLTIP.map((item, index) => (
                                <div key={index} className={styles.tooltipItem}>
                                    <span className={styles.tooltipEmoji}>{item.emoji}</span>
                                    <span className={styles.tooltipLabel}>— {item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                                            <div className={styles.nameAndIcon}
                                            onClick={() => handleCompanyClick(company)}>
                                                <div
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
                                                    {selectedCompany === company.id ? (
                                                        <SubsctibesDetailMenu
                                                            onSelect={(value) => handleSubscribeChange(
                                                                company.id,
                                                                'wa_subscribe',
                                                                value
                                                            )}
                                                            
                                                            options={Object.values(SUBSCRIPTION_STATUSES)}
                                                            currentValue={companySubscribes[company.id]?.wa_subscribe || ''}
                                                        />
                                                    ) : (
                                                        <div className={styles.statusDisplay}>
                                                            {getStatusEmoji(company?.wa_subscribe || '')}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Telegram */}
                                                <div className={styles.subscribeItem}>
                                                    <img 
                                                        src={telegramIcon} 
                                                        alt="Telegram" 
                                                        className={styles.subscribeIcon}
                                                    />
                                                    {selectedCompany === company.id ? (
                                                        <SubsctibesDetailMenu
                                                            onSelect={(value) => handleSubscribeChange(
                                                                company.id,
                                                                'tg_subscribe',
                                                                value
                                                            )}
                                                            options={Object.values(SUBSCRIPTION_STATUSES)}
                                                            currentValue={companySubscribes[company.id]?.tg_subscribe || ''}
                                                        />
                                                    ) : (
                                                        <div className={styles.statusDisplay}>
                                                            {getStatusEmoji(company?.tg_subscribe || '')}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Max */}
                                                <div className={styles.subscribeItem}>
                                                    <img 
                                                        src={maxIcon} 
                                                        alt="Max" 
                                                        className={styles.subscribeIcon}
                                                    />
                                                    {selectedCompany === company.id ? (
                                                        <SubsctibesDetailMenu
                                                            onSelect={(value) => handleSubscribeChange(
                                                                company.id,
                                                                'max_subscribe',
                                                                value
                                                            )}
                                                            options={Object.values(SUBSCRIPTION_STATUSES)}
                                                            currentValue={companySubscribes[company.id]?.max_subscribe || ''}
                                                        />
                                                    ) : (
                                                        <div className={styles.statusDisplay}>
                                                            {getStatusEmoji(company?.max_subscribe || '')}
                                                        </div>
                                                    )}
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