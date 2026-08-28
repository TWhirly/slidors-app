import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import styles from './SnvManager.module.css';
import { IconsLine } from '../Activity/IconsLine.jsx';
import { SnvFilter } from './SnvFilter.jsx';
import { useActivity } from '../../hooks/useActivity.js';
import { useEventFilters } from '../../hooks/useEventFilters.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import filterIcon from '../../icons/filter.png'
import filterActiveIcon from '../../icons/filter.png'

const SubscribesReport = () => {
    const navigate = useNavigate();
    const [managerExpand, setManegerExpand] = useState([]);
    const [snvEvents, setSnvEvents] = useState({})
    const [grouppedEvents, setgGrouppedEvents] = useState([])
    const [grouppingDependField, setGroupingDependField] = useState('')
    const [uniqueGroupCompanies, setuniqueGroupCompanies] = useState({})
    const [groupChannelsSummary, setGroupChannelsSummary] = useState({})
    const { tg, chat_id } = useTelegram()
    const { activity, isLoading, error } = useActivity(chat_id);
    // const filterIcon = require('../../icons/filter.png')
    // const filterActiveIcon = require('../../icons/filterActive.png')
   
    useEffect(() => {
        if (!activity)
            return
        if(!Array.isArray(activity.other))
            return
        setSnvEvents({ other: activity.other.filter(a => a.purpose === 'Подписка'), planned: [] })

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
    } = useEventFilters(snvEvents || { planned: [], other: [] });
    const names = {'wa': 'WhatsApp', 'tg': 'Telegram', 'max': 'Max'}
    const SubscribeChanges = (props) => {
        // console.log('c', changes)
        return(
        Object.entries(props.children).map(([messenger, change]) => {
            return(
                <div>
                    {names[messenger]}: {change[0]} ➡️ {change[1]}
                </div>
            )
        })
    )
    }

     useEffect(() => {
            if(!filters.groupBy)
                return
            const field = filters.groupBy === 'region' ? 'manager' : 'region'
            setGroupingDependField(field)
        }, [filters.groupBy])

    useEffect(() => {
        if(!Array.isArray(filteredOtherEvents))
            return
        const groupingfield = filters.groupBy || 'manager'
        const grouppedEvents = filteredOtherEvents.reduce((acc, event) => {
            // console.log(event)
            if (!acc[event[groupingfield]]) {
                acc[event[groupingfield]] = [{...event, subscribeChanges: JSON.parse(event.subsribe_changes)}]
            } else {
                acc[event[groupingfield]].push({...event, subscribeChanges: JSON.parse(event.subsribe_changes)})
            }
            return acc
        }, {})
        const uniqueGroupCompanies = filteredOtherEvents.reduce((acc, event) => {
            if(!acc[event[groupingfield]]) {
                acc[event[groupingfield]] = [event.companyId]
            } else if (!acc[event[groupingfield]].includes(event.companyId)) {
                acc[event[groupingfield]] = [...acc[event[groupingfield]], event.companyId]
            }
            return acc
        }, {})
        const groupChannelsSummary = filteredOtherEvents.reduce((acc, event) => {
            if(!acc[event[groupingfield]]) {
                acc[event[groupingfield]] = {'wa': 0, 'tg': 0, 'max': 0, total: 0}
            }
            const subscribeChanges = JSON.parse(event.subsribe_changes)
            Object.entries(subscribeChanges).forEach(([msngr, status]) => {
                if(status[1] === 'Подписан' || status[1] === 'Отправлено приглашение'){
                acc[event[groupingfield]][msngr] +=1
                acc[event[groupingfield]]['total'] +=1
                }
            })
            return acc
        }, [])
        setgGrouppedEvents(grouppedEvents)
        setuniqueGroupCompanies(uniqueGroupCompanies)
        setGroupChannelsSummary(groupChannelsSummary)
    }, [filteredOtherEvents, filters.groupBy])

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
    // console.log(uniqueGroupCompanies, filters)
    

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
                Отчёт — Подписки
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
            {Object.entries(grouppedEvents).map(([groupingField, events]) => {
                const eventsAmount = events.length
                const isExpanded = managerExpand.includes(groupingField)
                
                return (
                    <div key={groupingField} className={styles.managerGroup}>
                        <div
                            className={styles.plannedHeader}
                            onClick={() => handleManagerExpand(groupingField)}
                        >
                            <span>{groupingField} ({eventsAmount}/{groupChannelsSummary[groupingField]['total']})</span>
                            <div className={`${styles.regionButtonArrow} ${isExpanded ? styles.arrowExpanded : ''}`} />
                        </div>

                        {isExpanded && (
                            <div className={styles.eventsList}>
                                <div
                                className={styles.dataGridContainer}
                                >
                                <div className={styles.companyDescriptionRow}>
                                                <span className={styles.snvQuestion}>Статистика {avialableEventsGroupping.find(a => a.key === filters.groupBy).name || ''}:</span>
                                                <span className={styles.companyDescriptionRowVal}>Обработано компаний: {uniqueGroupCompanies[groupingField].length}</span>
                                                <span className={styles.companyDescriptionRowVal}>Всего подписок: {groupChannelsSummary[groupingField]['total']}</span>
                                                {Object.entries(groupChannelsSummary[groupingField]).filter(s => s[0] !== 'total').map(([ch, count]) => {
                                                    return (
                                                       <span className={styles.companyDescriptionRowVal}>Подписок на канал {names[ch]}: {count}</span> 
                                                    )
                                                })}
                                            </div>
                                            </div>
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
                                            {activity[grouppingDependField]}
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
                                        
                                        {activity.subscribeChanges && (
                                            <div className={styles.companyDescriptionRow}>
                                                <span className={styles.snvQuestion}>Изменение статусов подписок:</span>
                                                <SubscribeChanges className={styles.companyDescriptionRowVal}>{activity.subscribeChanges}</SubscribeChanges>
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

export default SubscribesReport;
