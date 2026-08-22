import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import styles from './SnvManager.module.css';
import { IconsLine } from '../Activity/IconsLine.jsx';
import { FilterModal } from '../Activity/FilterModal.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useActivity } from '../../hooks/useActivity.js';
import { useEventFilters } from '../../hooks/useEventFilters';
import { useTelegram } from '../../hooks/useTelegram.js';

const COLORS = {
    primary: '#008ad1',      // Основной цвет (заголовки, акценты)
    secondary: '#729fcf',    // Вторичный (подзаголовки, даты)
    text: '#ffffff',         // Основной текст
    muted: 'rgba(255,255,255,0.7)', // Второстепенный текст
    hint: 'rgba(255,255,255,0.5)'    // Подсказки
};


const SnvManager = () => {
    const navigate = useNavigate();
    const [managerExpand, setManegerExpand] = useState([]);
    const [snvEvents, setSnvEvents] = useState({})
    const [managerGrouppedEvents, setManagerGrouppedEvents] = useState([])
    const { tg, chat_id } = useTelegram()
    const { activity, isLoading, error } = useActivity(chat_id);
    const filterIcon = require('../../icons/filter.png')
    const filterActiveIcon = require('../../icons/filterActive.png')
   
    useEffect(() => {
        if (!activity)
            return
        setSnvEvents({ other: activity.other.filter(a => a.purpose === 'Проработка СНВ'), planned: [] })

    }, [activity])



    const { filters,
        setFilters,
        filteredOtherEvents,
        isFilterModalOpen,
        setIsFilterModalOpen,
        avialableStatuses,
        avialablePurposes,
        avialableManagers,
        avialableRegions,
        avialableTypes
    } = useEventFilters(snvEvents || { planned: [], other: [] });

    useEffect(() => {
        const managerGrouppedEvents = filteredOtherEvents.reduce((acc, event) => {

            if (!acc[event.manager]) {
                acc[event.manager] = [event]
            } else {
                acc[event.manager].push(event)
            }
            return acc
        }, {})
        setManagerGrouppedEvents(managerGrouppedEvents)
    }, [filteredOtherEvents])

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
   

    const handleManagerExpand = (manager) => {
        console.log('set expand', managerExpand)
       setManegerExpand(prev => 
        prev.includes(manager) ?
        prev.filter(m => m !== manager)
        : [...prev, manager]
       )
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

   return (
    <div className={styles.container}>
        <div className={styles.naviPanel}>
            <div className={styles.companyNamePanel}>
                События
            </div>

            <div className={styles.filterButton}>
                <div onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}>
                    <img 
                        src={activeFiltersCount > 0 ? filterActiveIcon : filterIcon}
                        alt="Filter icon"
                        className={styles.filterIcon}
                    />
                </div>
                <div 
                    className={styles.filterCountPanel}
                    onClick={() => activeFiltersCount === 0 ? setIsFilterModalOpen(!isFilterModalOpen) : removeFilter()}
                >
                    {activeFiltersCount === 0 ? "ㅤ" : `✕`}
                </div>
            </div>
            
            <IconButton
                onClick={() => {}}
                sx={{
                    color: 'white',
                    marginRight: '1rem'
                }}
            >
                <AddIcon />
            </IconButton>
        </div>

        <div className={styles.eventsContainer}>
            {Object.entries(managerGrouppedEvents).map(([manager, events]) => {
                const eventsAmount = events.length
                const isExpanded = managerExpand.includes(manager)
                
                return (
                    <div key={manager} className={styles.managerGroup}>
                        <div
                            className={styles.plannedHeader}
                            onClick={() => handleManagerExpand(manager)}
                        >
                            <span>{manager} ({eventsAmount})</span>
                            <div className={`${styles.regionButtonArrow} ${isExpanded ? styles.arrowExpanded : ''}`} />
                        </div>

                        {isExpanded && (
                            <div className={styles.eventsList}>
                                {events.map((activity, index) => (
                                    <div
                                        key={index}
                                        className={styles.dataGridContainer}
                                    >
                                        <div className={styles.companyPlanDate}>
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
                                            </div>
                                            <div>
                                                <IconsLine activity={activity} />
                                            </div>
                                        </div>
                                        
                                        {activity.specialization && (
                                            <div className={styles.companyDescriptionRow}>
                                                <span className={styles.snvQuestion}>Специализация:</span>
                                                <span className={styles.companyDescriptionRowVal}>{activity.specialization}</span>
                                            </div>
                                        )}

                                        {activity.company_importance && (
                                            <div className={styles.companyDescriptionRow}>
                                                <span className={styles.snvQuestion}>Значимость компании:</span>
                                                <span className={styles.companyDescriptionRowVal}>{activity.company_importance}</span>
                                            </div>
                                        )}

                                        {activity.description && (
                                            <div className={styles.companyDescriptionRow}>
                                                <span className={styles.snvQuestion}>
                                                    {activity.purpose === 'Проработка СНВ' ? 'О чём договорились:' : 'Описание:'}
                                                </span>
                                                <span className={styles.companyDescriptionRowVal}>{activity.description}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>

        {isFilterModalOpen && <FilterModal
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

export default SnvManager;