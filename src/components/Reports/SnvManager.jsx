import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import styles from './SnvManager.module.css';
import { IconsLine } from '../Activity/IconsLine.jsx';
import { SnvFilter } from './SnvFilter.jsx';
import { useActivity } from '../../hooks/useActivity.js';
import { useEventFilters } from '../../hooks/useEventFilters';
import { useTelegram } from '../../hooks/useTelegram.js';

const SnvManager = () => {
    const navigate = useNavigate();
    const [managerExpand, setManegerExpand] = useState([]);
    const [snvEvents, setSnvEvents] = useState({})
    const [grouppedEvents, setGrouppedEvents] = useState([])
    const [groupingDependField, setGroupingDependField] = useState('')
    const { tg, chat_id } = useTelegram()
    const { activity, isLoading, error } = useActivity(chat_id);
    const filterIcon = require('../../icons/filter.png')
    const filterActiveIcon = require('../../icons/filterActive.png')
   
    useEffect(() => {
        if (!activity)
            return
        if(!Array.isArray(activity.other))
            return
        setSnvEvents({ other: activity.other.filter(a => a.purpose === 'Проработка СНВ'), planned: [] })

    }, [activity])

    // localStorage.removeItem('eventFilters')

    const { filters,
        setFilters,
        filteredOtherEvents,
        isFilterModalOpen,
        setIsFilterModalOpen,
        avialableStatuses,
        avialablePurposes,
        avialableManagers,
        avialableRegions,
        avialableTypes,
        avialableEventsGroupping
    } = useEventFilters(snvEvents || { planned: [], other: [] }, true);

    useEffect(() => {
        const groupingfield = filters.groupBy || 'manager'
        const grouppedEvents = filteredOtherEvents.reduce((acc, event) => {

            if (!acc[event[groupingfield]]) {
                acc[event[groupingfield]] = [event]
            } else {
                acc[event[groupingfield]].push(event)
            }
            return acc
        }, {})
        setGrouppedEvents(grouppedEvents)
    }, [filteredOtherEvents, filters.groupBy])

    useEffect(() => {
        if(!filters.groupBy)
            return
        const field = filters.groupBy === 'region' ? 'manager' : 'region'
        setGroupingDependField(field)
    }, [filters.groupBy])

    const activeFiltersCount = [
        filters.searchText ? 1 : 0,
        filters.specificDate ? 1 : 0,
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
        // console.log('set expand', managerExpand)
       setManegerExpand(prev => 
        prev.includes(manager) ?
        prev.filter(m => m !== manager)
        : [...prev, manager]
       )
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        const handleBackButton = () => navigate('/reports', { replace: true });
        tg.BackButton.onClick(handleBackButton);

        return () => {
            tg.BackButton.offClick(handleBackButton);
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

    // Компонент карточки с активными фильтрами
    const FilterCard = () => {
        const hasActiveFilters = activeFiltersCount > 0;
        if (!hasActiveFilters) return null;

        const formatDateDisplay = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        };

        return (
            <div className={styles.filterCard}>
                <div className={styles.filterCardTitle}>Выбранные фильтры:</div>
                
                {/* Дата/период - всегда первой строкой */}
                {filters.specificDate && (
                    <div className={styles.filterCardRow}>
                        <span className={styles.filterCardLabel}>Дата:</span>
                        <span className={styles.filterCardValue}>{formatDateDisplay(filters.specificDate)}</span>
                    </div>
                )}
                
                {(filters.dateRange.from || filters.dateRange.to) && (
                    <div className={styles.filterCardRow}>
                        <span className={styles.filterCardLabel}>Период:</span>
                        <span className={styles.filterCardValue}>
                            {filters.dateRange.from && formatDateDisplay(filters.dateRange.from)}
                            {filters.dateRange.from && filters.dateRange.to && ' — '}
                            {filters.dateRange.to && formatDateDisplay(filters.dateRange.to)}
                        </span>
                    </div>
                )}

                {/* Регионы */}
                {filters.region.length > 0 && (
                    <div className={styles.filterCardRow}>
                        <span className={styles.filterCardLabel}>Регионы:</span>
                        <span className={styles.filterCardValue}>{filters.region.join(', ')}</span>
                    </div>
                )}

                {/* Менеджеры */}
                {filters.manager.length > 0 && (
                    <div className={styles.filterCardRow}>
                        <span className={styles.filterCardLabel}>Менеджеры:</span>
                        <span className={styles.filterCardValue}>{filters.manager.join(', ')}</span>
                    </div>
                )}

                {/* Компания */}
                {filters.searchText && (
                    <div className={styles.filterCardRow}>
                        <span className={styles.filterCardLabel}>Компания:</span>
                        <span className={styles.filterCardValue}>{filters.searchText}</span>
                    </div>
                )}
            </div>
        );
    };

   return (
    <div className={styles.container}>
        <div className={styles.naviPanel}>
            <div className={styles.companyNamePanel}>
                Отчёт — Менеджер СНВ 
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
        </div>

        {/* Фиксированная карточка с фильтрами */}
        {activeFiltersCount > 0 && (
            <div className={styles.filterCardWrapper}>
                <FilterCard />
            </div>
        )}

        <div className={`${styles.eventsContainer} ${activeFiltersCount > 0 ? styles.eventsContainerWithFilters : ''}`}>
            {Object.entries(grouppedEvents).map(([groupField, events]) => {
                const eventsAmount = events.length
                const isExpanded = managerExpand.includes(groupField)
                
                return (
                    <div key={groupField} className={styles.managerGroup}>
                        <div
                            className={styles.plannedHeader}
                            onClick={() => handleManagerExpand(groupField)}
                        >
                            <span>{groupField} ({eventsAmount})</span>
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

                                        <div className={styles.companyPlanDate}>
                                            {activity[groupingDependField]}
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

        {isFilterModalOpen && <SnvFilter
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            filters={filters}
            onFiltersChange={setFilters}
            avialableStatuses={avialableStatuses}
            avialablePurposes={avialablePurposes}
            avialableRegions={avialableRegions}
            avialableManagers={avialableManagers}
            avialableTypes={avialableTypes}
            avialableEventsGroupping={avialableEventsGroupping}
            disabled={{}}
        />}
    </div>
);
};

export default SnvManager;
