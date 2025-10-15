import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress } from '@mui/material';
import Switch from '@mui/material/Switch';
import styles from '../Companies/Companies.module.css';
import { YellowStarIcon } from '../../icons/SVG.js';
import { IconsLine } from './IconsLine.jsx';
import { LearningIcon } from './LearningIcon.jsx';
import { FilterModal } from './FilterModal';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { avatar, avatarGroup } from '../Companies/sx.js';
import { DataContext } from '../../DataContext.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useRegions } from '../../hooks/useRegions.js';
import { useQuery, useQueryClient, QueriesObserver } from '@tanstack/react-query';
import { useActivity } from '../../hooks/useActivity.js';
import { get } from 'lodash';
import { useEventFilters } from '../../hooks/useEventFilters';

const Activities = () => {
    const queryClient = useQueryClient();
    const { regions: contextRegions } = useContext(DataContext);
    const { email } = useContext(DataContext);
    const navigate = useNavigate();
    const avatarGroupStyle = avatarGroup();
    const [plannedExpand, setPlannedExpand] = useState(false);
    const [otherExpand, setOtherExpand] = useState(false);
    const [otherPage, setOtherPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerRef = useRef(null);
    const lastItemRef = useRef(null);
    const [checked, setChecked] = useState(sessionStorage.getItem('checked') || true);
    const [planned, setPlanned] = useState([]);
    const [other, setOther] = useState([]);
    // const [displayedOtherActivities, setDisplayedOtherActivities] = useState([]);
    const tg = window.Telegram.WebApp;
    const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const user = JSON.parse(params.get('user'));
    const chat_id = user.id;
    const { activity, isLoading, error } = useActivity(chat_id);
   
    const {filters,
        setFilters,
        filteredEvents : filteredPlannedEvents,
        filteredOtherEvents,
        isFilterModalOpen,
        setIsFilterModalOpen,
        availableStatuses,
        availablePurposes } = useEventFilters(activity || {planned: [], other: []});

        
    
        const activeFiltersCount = 0;
    
    tg.BackButton.show();
    console.log(email, 'email');
    
    

    useEffect(() => {
        const storedPlannedExpand = sessionStorage.getItem('plannedExpand');
        if (storedPlannedExpand !== null) {
            setPlannedExpand(storedPlannedExpand === 'true');
        }
        const storedOtherExpand = sessionStorage.getItem('otherExpand');
        if (storedOtherExpand !== null) {
            setOtherExpand(storedOtherExpand === 'true');
        }
        const storedChecked = sessionStorage.getItem('checked');
        if (storedChecked !== null) {
            setChecked(storedChecked === 'true');
        }
    }, []);

    const handlePlannedExpand = () => {
        setPlannedExpand(!plannedExpand);
        sessionStorage.setItem('plannedExpand', !plannedExpand);
    };

    const handleOtherExpand = () => {
        setOtherExpand(!otherExpand);
        setOtherPage(1);
        sessionStorage.setItem('otherExpand', !otherExpand);
    };

    const getPaginatedOtherActivities = () => {
        if (!filteredOtherEvents) return [];
        
        const endIndex = otherPage * itemsPerPage;
        return filteredOtherEvents.slice(0, endIndex);
    };    

    const totalOtherPages = other 
        ? Math.ceil(filteredOtherEvents.length / itemsPerPage)
        : 0;

    const hasMore = otherPage < totalOtherPages;

    const loadMore = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setOtherPage(prev => prev + 1);
                setIsLoadingMore(false);
            }, 300);
        }
    }, [hasMore, isLoadingMore]);

    useEffect(() => {
        if (!otherExpand || !hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            {
                root: null,
                rootMargin: '100px',
                threshold: 0.1
            }
        );

        if (lastItemRef.current) {
            observer.observe(lastItemRef.current);
        }

        return () => {
            if (lastItemRef.current) {
                observer.unobserve(lastItemRef.current);
            }
        };
    }, [otherExpand, hasMore, isLoadingMore, loadMore]);

    

    const handleScroll = useCallback((e) => {
        
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoadingMore) {
            loadMore();
        }
    }, [hasMore, isLoadingMore, loadMore]);

    const handleChange = (e) => {
        // const { checked } = e.target;
        setChecked(!checked);
        sessionStorage.setItem('checked', !checked);
    }

    const getPurporseColor = (status) => {
        
        switch (status.toLowerCase()) {
            case 'да':
                return 'lightgreen';
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

    const handleSelectActivity = (activity) => {
        console.log('click')
        navigate(`/activities/${activity.id}`, {
            state: {activityId: activity.id, path: '/activities'}, replace: true
        });
    };

    const getEmptyActivity = (selectedRegion = '') => ({
        id: uuidv4(),
        new: true
    });

    const handleAddCompany = () => {
        // const emptyCompany = getEmptyCompany(selectedRegion || '');
        // navigate(`/companies/new/edit`, { state: emptyCompany });
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        tg.BackButton.onClick(() => navigate(('/'), { replace: true }));

        return () => {
            tg.BackButton.offClick();
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

    const displayedOtherActivities = getPaginatedOtherActivities();
     console.log('displayedOtherActivities', displayedOtherActivities)

    return (
       
            <div className={styles.container}>
            <div className={styles.naviPanel}>
                <div className={styles.companyNamePanel}>
                    События
                </div>

                <button
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            className="relative px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 bg-white hover:bg-gray-50"
          >
            <span>Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
                <div className={styles.checkBoxOnPanel}>
                    <div>{checked? "Все" : "Мои"}</div>
                </div>
               
                {/* <Switch
      checked={checked}
      onChange={handleChange}
      slotProps={{ input: { 'aria-label': 'controlled' } }}
    /> */}
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
            </div>
            
            {/* Блок для запланированных активностей с фиксированным заголовком */}
            {!isFilterModalOpen ? <>
            <div className={styles.allRegions}>
                <div 
                    className={styles.plannedHeader} 
                    onClick={handlePlannedExpand}
                    style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'transparent', // или нужный вам цвет фона
                        zIndex: 10,
                    }}
                >
                    Запланированные <div className={styles.regionButtonArrow}></div>
                </div>
                
                {plannedExpand && (
                    <div 
                        className={styles.scrollContainer}
                        style={{ 
                            overflow: 'auto',
                            marginTop: '0' // убираем отступ, так как заголовок фиксированный
                        }}
                    >
                        {filteredPlannedEvents.map((activity, index) => (
                            <div key={index}
                             className={styles.dataGridContainer}
                             onClick={() => handleSelectActivity(activity)}
                             >
                                <div
                                    className={styles.companyPlanDate}
                                    // style={{
                                    //     color: "white",
                                    //     fontSize: '0.7rem'
                                    // }}
                                >
                                    {Intl.DateTimeFormat('ru-RU', {
                                        day: 'numeric',
                                        month: 'numeric',
                                        year: 'numeric'
                                    }).format(new Date(activity.plan)) + ` ${activity.planTime}`}
                                </div>
                                <div className={styles.companyInfo}>
                                    <div className={styles.nameAndIcon}>
                                        <div
                                            className={styles.companyName}
                                        >
                                            {activity.companyName}
                                        </div>
                                        <div className={styles.iconContainer}>
                                            {/* {getCompanyTypeIcon(company.type)} */}
                                        </div>
                                    </div>
                                    <div>
                                        <IconsLine activity={activity} />
                                    </div>
                                </div>
                                <div
                                    className={styles.companyStatus}
                                    style={{
                                        color: getPurporseColor(activity.status),
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {activity.purpose}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Блок для других активностей с фиксированным заголовком */}
            <div className={styles.allRegions2}>
                <div 
                    className={styles.plannedHeader} 
                    onClick={handleOtherExpand}
                    style={{
                        position: 'sticky',
                        // width: '100%',
                        overflowX: 'hidden',
                        backgroundColor: 'transparent', // или нужный вам цвет фона
                        zIndex: 10,
                    }}
                >
                    Завершенные <div className={styles.regionButtonArrow}></div>
                </div>
                
                {otherExpand && (
                    <div 
                        className={styles.scrollContainer}
                        onScroll={handleScroll}
                        style={{ 
                            
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            marginTop: '0'
                        }}
                    >
                        {displayedOtherActivities.map((activity, index) => (
                            
                            <div 
                                key={index} 
                                className={styles.dataGridContainer}
                                ref={index === displayedOtherActivities.length - 1 ? lastItemRef : null}
                                onClick={() => handleSelectActivity(activity)}
                            >
                                 <div
                                    className={styles.companyPlanDate}
                                    style={{
                                        width: '100%',
                                        color: "white",
                                        fontSize: '0.7rem'
                                    }}
                                >
                                 {activity.endDatetime && Intl.DateTimeFormat('ru-RU', {
                                        day: 'numeric',
                                        month: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric'
                                    }).format(new Date(activity.endDatetime))}
                                </div>
                                {/* <div
                                    className={styles.companyPlanDate}
                                    style={{
                                        color: "white",
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {activity.plan && 
                                        Intl.DateTimeFormat('ru-RU', {
                                            day: 'numeric',
                                            month: 'numeric',
                                            year: 'numeric'
                                        }).format(new Date(activity.plan)) + (activity.planTime ? ` ${activity.planTime}` : '')
                                    }
                                </div> */}
                                <div className={styles.companyInfo}>
                                    <div className={styles.nameAndIcon}>
                                        <div className={styles.companyName}>
                                            {activity.companyName}
                                        </div>
                                        <div className={styles.iconContainer}>
                                            {/* {getCompanyTypeIcon(company.type)} */}
                                        </div>
                                    </div>
                                    <div>
                                        <IconsLine activity={activity} />
                                    </div>
                                </div>
                                <div
                                    className={styles.companyStatus}
                                    style={{
                                        color: getPurporseColor(activity.status),
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {activity.purpose}
                                </div>
                            </div>
                        ))}
                        
                        {isLoadingMore && (
                            <div className={styles.loadingMore}>
                                <CircularProgress size={20} />
                                <span>Загрузка...</span>
                            </div>
                        )}
                        
                        {!hasMore && displayedOtherActivities.length > 0 && (
                            <div className={styles.endOfList}>
                                Все события загружены
                            </div>
                        )}
                    </div>
                )}
            </div>
            </>
             : <FilterModal className={styles.FilterModal}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        availableStatuses={availableStatuses}
        availablePurposes={availablePurposes}
      />}
        </div>
    );
};

export default Activities;