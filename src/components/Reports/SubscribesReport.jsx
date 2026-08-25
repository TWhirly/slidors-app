import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CircularProgress } from '@mui/material';
import styles from './SnvManager.module.css';
import { IconsLine } from '../Activity/IconsLine.jsx';
import { SnvFilter } from './SnvFilter.jsx';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useActivity } from '../../hooks/useActivity.js';
import { useEventFilters } from '../../hooks/useEventFilters.jsx';
import { useTelegram } from '../../hooks/useTelegram.js';
import filterIcon from '../../icons/filter.png'
import filterActiveIcon from '../../icons/filter.png'

const COLORS = {
    primary: '#008ad1',      // Основной цвет (заголовки, акценты)
    secondary: '#729fcf',    // Вторичный (подзаголовки, даты)
    text: '#ffffff',         // Основной текст
    muted: 'rgba(255,255,255,0.7)', // Второстепенный текст
    hint: 'rgba(255,255,255,0.5)'    // Подсказки
};


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

        tg.BackButton.onClick(() => navigate(('/reports'), { replace: true }));

        return () => {
            tg.BackButton.offClick();
        };
    }, [navigate]);
    console.log(uniqueGroupCompanies, filters.groupBy)
    

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

        <div className={styles.eventsContainer}>
            {Object.entries(grouppedEvents).map(([groupingField, events]) => {
                const eventsAmount = events.length
                const subscribeChannelsAmount = events.reduce((acc, event) => {
                        acc+=Object.keys(event.subscribeChanges).length
                        return acc
                }, 0
                )
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
        />}
    </div>
);
};

export default SubscribesReport;