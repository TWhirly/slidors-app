import React, { useState, useEffect, useContext, useRef, useLayoutEffect, useCallback } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import { Element } from 'react-scroll';
import styles from './Companies.module.css';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from './sx';
import { DataContext } from '../../DataContext.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useRegions } from '../../hooks/useRegions';
import { useCompanyFilters } from '../../hooks/useCompanyFilters.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import { checkIcons, getCompanyTypeIcon, getStatusColor, getEmptyCompany } from './Companies-helpers.js'
import { CompaniesFilterModal } from './CompaniesFilterModal.jsx';
import ClickTooltip from './ClickTooltip.jsx';
const filterIcon = require('../../icons/filter.png')
const filterActiveIcon = require('../../icons/filterActive.png')

const Companies = () => {

    const { email, regions: contextRegions, lastVisibleCompanyId, scrollPos, setScrollPos, from, setFrom } = useContext(DataContext);
    const navigate = useNavigate();
    const location = useLocation();
    const avatarGroupStyle = avatarGroup();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const { tg, chat_id } = useTelegram()
    const id = location.state?.companyId || null
    const firstVisibleId = useRef(null);
    const containerRef = useRef(null);
    setFrom('/')

    console.log('scroll pos in companies', scrollPos)

    useEffect(() => {
        firstVisibleId.current = lastVisibleCompanyId
    }, [lastVisibleCompanyId])

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

    // Добавляем selectedRegion в зависимости useEffect


    useEffect(() => {
        const savedSelectedRegion = sessionStorage.getItem('selectedRegion');
        if (savedSelectedRegion) {
            setSelectedRegion(savedSelectedRegion);

        }
    }, [lastVisibleCompanyId]);

    const handleRegionClick = async (regionId) => {
        if (selectedRegion === regionId) {
            setSelectedRegion(null);
            sessionStorage.removeItem('selectedRegion');
            return;
        }
        // console.log('regionId', regionId);
        setSelectedRegion(regionId);
        sessionStorage.setItem('selectedRegion', regionId);
    };

    const handleSelectCompany = (company) => {
        setScrollPos(prev => {
            const newPositions = { ...prev }
            newPositions['companies'] = window.scrollY
            return newPositions
        })
        setFrom('/companies')
        navigate(`/companies/${company.id}`, {
            state: { companyId: company.id, from: '/companies', replace: true }
        });
    };

    const collapseRegion = () => {
        setSelectedRegion(null);
        sessionStorage.removeItem('selectedRegion');
    };

    const handleAddCompany = () => {
        const emptyCompany = getEmptyCompany(selectedRegion || '', email);
        navigate(`/companies/new/edit`, { state: { company: emptyCompany, from: '/companies' } });
    };

    const backButton = useCallback(() => {
        
        setScrollPos(prev => {
            const newPositions = { ...prev }
            newPositions['companies'] = window.scrollY
            return newPositions
        })
        navigate(('/'))
    }, [navigate, setScrollPos])

    useEffect(() => {
        if (!tg) return;
        tg.BackButton.show();

        tg.BackButton.onClick(backButton);
        return () => {
            tg.BackButton.offClick(backButton);
            console.log('return')
        };
    }, [backButton, navigate, setScrollPos, tg]);

    useLayoutEffect(() => {
        if (scrollPos.companies) {
            setTimeout(() => {
                window.scrollTo(0, scrollPos.companies);
            }, 100)
        }
    }, [scrollPos.companies]);



    if (isLoading) {
        return (
            <div className={styles.container}>
                <CircularProgress color='008ad1' className={styles.loading} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}
            >
                <div className={styles.paper}>
                    Ошибка при загрузке данных: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}

        >
            <div
                className={styles.naviPanel}

            >
                <div className={selectedRegion ? styles.companyNamePanelExpanded : styles.companyNamePanel}
                    onClick={collapseRegion}>

                    Компании{selectedRegion ? ` — ${selectedRegion.split(" ")
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
                <ClickTooltip
                    content={
                        <AvatarGroup
                            max={100}
                            spacing={10}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: '#131313',
                                '& .MuiAvatar-root': {
                                    border: '2px solid white',
                                    marginLeft: 0,
                                }
                            }}
                        >
                            {selectedRegion ? contextRegions
                                .filter((item) => item.region === selectedRegion)[0]
                                ?.regionUsers?.map((user) => (
                                    <div
                                        key={user.name}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '4px'
                                        }}
                                    >
                                        <Avatar sx={avatar(user.name)} alt={user.name} src={user.avatar}>
                                            {`${user.name?.split('')[0] || ''}${user.name?.split('')[1] || ''}`}
                                        </Avatar>
                                        <div style={{ color: 'white' }}>{user.name}</div>
                                    </div>
                                )) : null}
                        </AvatarGroup>
                    }
                >
                    <AvatarGroup
                        max={5}
                        direction="row"
                        spacing={10}
                        sx={{
                            ...avatarGroupStyle,
                            '& .MuiAvatarGroup-avatar': avatar(''),
                            cursor: 'pointer' // Добавляем указатель
                        }}
                    >
                        {selectedRegion ? contextRegions
                            .filter((item) => item.region === selectedRegion)[0]
                            ?.regionUsers?.map((user) => (
                                <Avatar
                                    key={user.name}
                                    sx={avatar(user.name)}
                                    alt={user.name}
                                    src={user.avatar}
                                >
                                    {`${user.name?.split('')[0] || ''}${user.name?.split('')[1] || ''}`}
                                </Avatar>
                            )) : null}
                    </AvatarGroup>
                </ClickTooltip>

            </div>
            <div

                id='regionsWithCompanies'
                className={styles.allRegions}>
                {/* {lastVisibleCompanyId && (filteredCompanies.find(company => company.id === lastVisibleCompanyId)).name}   */}
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
                            <div className={styles.dataGridContainer}
                                ref={containerRef}
                            >
                                {region.companies?.map((company) => (
                                    <div

                                        data-item-marker
                                        // ref={el => itemRefs.current[company.id] = el}
                                        key={company.id}
                                        className={styles.companyItem}
                                        name={company.id}
                                        id={company.id}
                                    >
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
                                            <ClickTooltip
                                                content={
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            backgroundColor: '#131313',
                                                            
                                                        }}
                                                    >
                                                        <div>
                                                            {company.handled && (<div
                                                            style={{display: 'flex',
                                                                flexDirection: 'row',
                                                                gap: 5
                                                            }}
                                                            ><img
                                                                src={checkIcons.red}
                                                                alt="переработчик"
                                                                fill="#008ad1"
                                                                className={styles.checkIcon} /><div>Проработано</div></div>)}

                                                        </div>
                                                        
                                                        <div>
                                                            {company.wa && (<div
                                                            style={{display: 'flex',
                                                                flexDirection: 'row',
                                                                gap: 5
                                                            }}
                                                            ><img
                                                                src={checkIcons.green}
                                                                alt="переработчик"
                                                                fill="#008ad1"
                                                                className={styles.checkIcon}
                                                            /><div>Подписка WhatsApp</div></div>)}
                                                        </div>
                                                        <div>
                                                            {company.tg && (<div
                                                            style={{display: 'flex',
                                                                flexDirection: 'row',
                                                                gap: 5
                                                            }}
                                                            ><img
                                                                src={checkIcons.blue}
                                                                alt="переработчик"
                                                                fill="#008ad1"
                                                                className={styles.checkIcon}
                                                            /><div>Подписка Telegram</div></div>)}
                                                        </div>
                                                    </div>
                                                }
                                            >
                                                <div className={styles.checksContainer}>
                                                    <div>
                                                        {company.handled && <img
                                                            src={checkIcons.red}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                    <div>
                                                        {company.wa && <img
                                                            src={checkIcons.green}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                    <div>
                                                        {company.tg && <img
                                                            src={checkIcons.blue}
                                                            alt="переработчик"
                                                            fill="#008ad1"
                                                            className={styles.checkIcon}
                                                        />}
                                                    </div>
                                                </div>
                                            </ClickTooltip>
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
                    </Element>
                ))}
            </div>
            {isFilterModalOpen && <CompaniesFilterModal
                //  className={styles.allRegions}
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

export default Companies;