import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import styles from '../Companies/Companies.module.css';
import { IconsLine } from './IconsLine.jsx';
import { FilterModal } from './FilterModal';
import { DataContext } from '../../DataContext.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useActivity } from '../../hooks/useActivity.js';
import { useEventFilters } from '../../hooks/useEventFilters';
import { getEmptyActivity } from './activity.js';
import { useTelegram } from '../../hooks/useTelegram.js';


const Activities = () => {
    const { email } = useContext(DataContext);
    const navigate = useNavigate();
    const [plannedExpand, setPlannedExpand] = useState(false);
    const [otherExpand, setOtherExpand] = useState(false);
    const [otherPage, setOtherPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const lastItemRef = useRef(null);
    const isCreatingDraftRef = useRef(false);
    const [other] = useState([]);
    // const [displayedOtherActivities, setDisplayedOtherActivities] = useState([]);
    // const tg = window.Telegram.WebApp;
    // const params = new URLSearchParams(window.Telegram.WebApp.initData);
    // const user = JSON.parse(params.get('user'));
    // const chat_id = user.id;
    const {tg , chat_id} = useTelegram()
    const { activity, isLoading, error, updateActivity } = useActivity(chat_id);
    const filterIcon = require('../../icons/filter.png')
    const filterActiveIcon = require('../../icons/filterActive.png')

    // console.log('activity', activity)
   
    const {filters,
        setFilters,
        filteredEvents : filteredPlannedEvents,
        filteredOtherEvents,
        isFilterModalOpen,
        setIsFilterModalOpen,
        avialableStatuses,
        avialablePurposes,
        avialableManagers,
        avialableRegions,
        avialableTypes
    } = useEventFilters(activity || {planned: [], other: []});

    const activeFiltersCount = [
    filters.searchText ? 1 : 0,
    filters.purpose.length,
    filters.status.length,
    filters.manager.length,
    filters.region.length,
    filters.type.length,
    filters.dateRange.from ? 1 : 0,
    filters.dateRange.to ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  const removeFilter = () => {
    localStorage.removeItem('eventFilters');
    const emptyFilters = {
                searchText: '',
                purpose: [],
                status: [],
                tags: [],
                region: [],
                manager: [],
                type: [],
                dateRange: { from: '', to: '' }
              };

    setFilters(emptyFilters);
  };
    
    
    tg.BackButton.show();
    // console.log(email, 'email');
    
    

    useEffect(() => {
        const storedPlannedExpand = sessionStorage.getItem('plannedExpand');
        if (storedPlannedExpand !== null) {
            setPlannedExpand(storedPlannedExpand === 'true');
        }
        const storedOtherExpand = sessionStorage.getItem('otherExpand');
        if (storedOtherExpand !== null) {
            setOtherExpand(storedOtherExpand === 'true');
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

        const lastItem = lastItemRef.current;
        if (lastItem) {
            observer.observe(lastItem);
        }

        return () => {
            if (lastItem) {
                observer.unobserve(lastItem);
            }
            observer.disconnect();
        };
    }, [otherExpand, hasMore, isLoadingMore, loadMore]);

    

    const handleScroll = useCallback((e) => {
        
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoadingMore) {
            loadMore();
        }
    }, [hasMore, isLoadingMore, loadMore]);

    const getPurporseColor = (status) => {
        
        switch (status.toLowerCase()) {
            case 'да':
                return 'lightgreen';
                       default:
                return 'var(--hintColor, #888)';
        }
    };
    const handleSelectActivity = (activity) => {
        // console.log('click', activity)
        navigate(`/activities/${activity.id}`, {
            state: {activityId: activity.id, path: '/activities'}
        });
    };

    

    const handleAddActivity = () => {
        if (isCreatingDraftRef.current) return;

        isCreatingDraftRef.current = true;
        const emptyActivity = getEmptyActivity(email);
        const draftActivity = { ...emptyActivity, new: true };
        updateActivity(draftActivity);
        navigate(`/activities/new/edit`, { state: draftActivity });
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        const handleBackButton = () => navigate('/', { replace: true });
        tg.BackButton.onClick(handleBackButton);

        return () => {
            tg.BackButton.offClick(handleBackButton);
        };
    }, [navigate]);

//    console.log('filteredPlannedEvents', filteredPlannedEvents)

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
    //  console.log('eventFilters', localStorage.getItem('eventFilters'))

    return (
       
            <div className={styles.container}>
            <div className={styles.naviPanel}>
                <div className={styles.companyNamePanel}>
                    События
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
                        handleAddActivity();
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
                    Запланированные ({filteredPlannedEvents?.length})<div className={styles.regionButtonArrow}></div>
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
                                <div
                                    className={styles.companyStatus}
                                    style={{
                                        color: '#888',
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {activity.description}
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
                    Завершенные ({filteredOtherEvents?.length})<div className={styles.regionButtonArrow}></div>
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
                                <div
                                    className={styles.companyStatus}
                                    style={{
                                        color: '#888',
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    {activity.description}
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
            
            {isFilterModalOpen && <FilterModal 
            //  className={styles.allRegions}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        avialableStatuses={avialableStatuses}
        avialablePurposes={avialablePurposes}
        avialableRegions={avialableRegions}
        avialableManagers={avialableManagers}
        avialableTypes={avialableTypes}
      />}
        </div>
    );
};

export default Activities;
