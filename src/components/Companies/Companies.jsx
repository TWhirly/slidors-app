import React, { useState, useEffect, useContext } from 'react';
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
import { useTelegram  } from '../../hooks/useTelegram.js';
import { checkIcons, getCompanyTypeIcon, getStatusColor, getEmptyCompany } from './Companies-helpers.js'
import { CompaniesFilterModal } from './CompaniesFilterModal.jsx';
const filterIcon = require('../../icons/filter.png')
const filterActiveIcon = require('../../icons/filterActive.png')

const Companies = () => {

    const { email, regions: contextRegions } = useContext(DataContext);
    const navigate = useNavigate();
    const location = useLocation();
    const avatarGroupStyle = avatarGroup();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const {tg , chat_id, showButton} = useTelegram()

    const id = location.state?.companyId || null

    tg.BackButton.show();

    useEffect(() => {
        showButton({
            text: '1',
            // color: '#31b545',
            isActive: false,
            isVisible: false,
            onClick: () => {},
        });
    }, [showButton])

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
            // behavior: 'smooth'
        });
    };

 const { 
    companies,      
    isLoading, 
    error 
  } = useRegions(chat_id);

console.log('companiez', companies)

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

    const handleSelectCompany = (company) => {
        navigate(`/companies/${company.id}`, {
            state: { companyId: company.id, path: '/companies' }
            //, replace: true
        });
    };

    const collapseRegion = () => {
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
        tg.BackButton.onClick(() => navigate(('/'), { replace: true }));
        return () => {
            tg.BackButton.offClick();
        };
    }, [navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToSection(id, 35);
        }, 300);
        return () => clearTimeout(timer);
    }, [id, filteredCompanies]);
    console.log('filteredCompanies', filteredCompanies)

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
                                    </Element>
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