import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useRegions } from '../../hooks/useRegions';
import { useActivity } from '../../hooks/useActivity';
import { useEventFilters } from '../../hooks/useEventFilters';
import { useTelegram } from '../../hooks/useTelegram';
import { calculateDuration } from '../Activity/activity';
import { SnvFilter } from './SnvFilter';
import styles from './SnvManager.module.css';
import filterIcon from '../../icons/filter.png';

const elaborationReportLines = {
    status: {
        'Да': 'Работают с системой Слайдорс.',
        'Работали раньше': 'Ранее работали с системой Слайдорс.',
        'Нет, но хотят': 'С системой Слайдорс пока не работают, но хотят начать работу.',
        'Нет, и не хотят': 'С системой Слайдорс не работают и не планируют начинать работу.'
    },
    'haveAdv?': {
        'Нет, не хотят': 'Реклама отсутствует и не требуется.',
        'Нет, хотят': 'Реклама отсутствует, требуется размещение.',
        'Есть, не хотят': 'Реклама размещена, дополнительное размещение не требуется.',
        'Да, хотят еще': 'Реклама размещена, хотят разместить дополнительную рекламу.'
    },
    'haveSample?': {
        'Нет, не хотят': 'Образец отсутствует и не требуется.',
        'Нет, хотят': 'Образец отсутствует, требуется предоставить.',
        'Есть, не хотят': 'Образец есть, дополнительный не требуется.',
        'Да, хотят еще': 'Образец есть, требуется дополнительный.'
    },
    'haveTrainig?': {
        'Нет, не хотят': 'Обучение не проходили и не требуется.',
        'Нет, хотят': 'Обучение не проходили, требуется провести.',
        'Есть, не хотят': 'Обучение проводилось, повторное не требуется.',
        'Да, хотят еще': 'Обучение проводилось, требуется повторное.'
    },
    'subscribed?': {
        'Нет, не хотят': 'На группы не подписаны и подписка не требуется.',
        'Подписать': 'Подписать на группы.',
        'Подписаны': 'Подписаны на группы.',
        'Удалить компанию': 'Удалить компанию из групп.',
        'Нет мобильного': 'Подписка на группы невозможна: нет мобильного телефона.'
    },
    'isOnSite?': {
        'Да': 'Карточка компании на сайте есть.',
        'Нет': 'Карточки компании на сайте нет.'
    }
};

const DailyReport = () => {
    const [reports, setReports] = useState({})
    const navigate = useNavigate();
    const { chat_id } = useTelegram()
    const { companies, isLoading: isCompaniesLoading, error: companiesLoadingError } = useRegions(chat_id)
    const { activity, isLoading, error } = useActivity(chat_id);
   

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
    } = useEventFilters(activity || { planned: [], other: [] }, true);
    useEffect(() => {
        if (!filteredOtherEvents || !companies)
            return
        const getManagersDayReport = (activity) => {
            const report = []
            const activityTime = activity.startDatetime.split(' ')[1].slice(0, 5)
            const activityType = activity.type || ''
            const activityPurpose = activity.purpose || ''
            const activityCompanyName = activity.companyName || ''
            const activityCompanyCity = companies.find(c => c.id === activity.companyId)?.city || ''
            const activityHeader = `${activityTime} — ${activityCompanyName}${activityCompanyCity ? '(' + activityCompanyCity + ')' : ''}`
            const activityQ1 = `${activityType}, ${activityPurpose}`
            const startMs = Date.parse(activity.startDatetime)
            const endMs = Date.parse(activity.endDatetime)
            const activityQ5 = endMs - startMs > 0 ? calculateDuration(startMs, endMs) : null
            if (activity.purpose === 'Проработка СНВ') {

                const activityQ2 = activity.specialization
                const activityQ3 = activity.company_importance
                const activityQ4 = activity.description

                report.push(activityHeader, activityQ1, activityQ2, activityQ3,
                    activityQ4)
            }
            else if (activity.purpose === 'Подписка') {
                const names = { 'wa': 'WhatsApp', 'tg': 'Telegram', 'max': 'Max' }
                const changes = JSON.parse(activity.subsribe_changes)
                const subscribes =  Object.entries(changes).map(([messenger, change]) => {
                            return (`${names[messenger]}: ${change[0]} ➡️ ${change[1]}`)
                        })
                report.push(activityHeader, activityQ1, subscribes.join('\n'))
                    
            }
            else if(activity.purpose === 'Проработка') {
                const checklistLines = Object.entries(elaborationReportLines)
                    .map(([field, answers]) => answers[activity[field]])
                    .filter(Boolean);

                report.push(activityHeader, activityQ1, ...checklistLines);
            }
            else {
                report.push(activityHeader, activityQ1, activity.description)
            }
            activityQ5 && report.push(activityQ5)
            return report.join('\n')
        }
        const reports = filteredOtherEvents.reduce((acc, activity) => {
            if (!activity.startDatetime && !activity.endDatetime) {
                return acc
            }
            const dateId = Date.parse((new Date(activity.startDatetime)).toISOString().split('T')[0])
            if (!acc[dateId]) {
                acc[dateId] = {}
                acc[dateId][activity.manager] = [getManagersDayReport(activity)]
            } else if (!acc[dateId][activity.manager]) {
                acc[dateId][activity.manager] = [getManagersDayReport(activity)]
            } else {
                acc[dateId][activity.manager].push(getManagersDayReport(activity))
            }
            return acc
        }, {})
        Object.values(reports).forEach(dateEntries => {
            Object.values(dateEntries).forEach(report => report.sort((a, b) => (a.split(' —')[0]).replace(':', '') - (b.split(' —')[0]).replace(':', '')))
        })
        setReports(reports)
    }, [companies, filteredOtherEvents])

    useEffect(() => {
        const telegram = window.Telegram?.WebApp;
        if (!telegram) return;

        const handleBackButton = () => navigate('/reports', { replace: true });
        telegram.BackButton.show();
        telegram.BackButton.onClick(handleBackButton);

        return () => {
            telegram.BackButton.offClick(handleBackButton);
        };
    }, [navigate]);

    const formatReportDate = (dateId) => Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(Number(dateId)));

    const formatFilterDate = (date) => Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date));

    const hasDateFilter = filters.specificDate || filters.dateRange.from || filters.dateRange.to;

    if (isLoading || isCompaniesLoading) {
        return (
            <div className={styles.container}>
                <CircularProgress className={styles.loading} />
            </div>
        );
    }

    if (error || companiesLoadingError) {
        return (
            <div className={styles.container}>
                <div className={styles.dataGridContainer}>
                    Ошибка при загрузке данных: {(error || companiesLoadingError).message}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <div className={styles.companyNamePanel}>Ежедневный отчёт</div>
                <button
                    type="button"
                    className={styles.filterButton}
                    onClick={() => setIsFilterModalOpen(true)}
                    aria-label="Открыть фильтры"
                >
                    <img src={filterIcon} alt="" className={styles.filterIcon} />
                </button>
            </div>

            {hasDateFilter && (
                <div className={styles.filterCardWrapper}>
                    <div className={styles.filterCard}>
                        <div className={styles.filterCardTitle}>Выбранные фильтры:</div>
                        {filters.specificDate && (
                            <div className={styles.filterCardRow}>
                                <span className={styles.filterCardLabel}>Дата:</span>
                                <span className={styles.filterCardValue}>{formatFilterDate(filters.specificDate)}</span>
                            </div>
                        )}
                        {(filters.dateRange.from || filters.dateRange.to) && (
                            <div className={styles.filterCardRow}>
                                <span className={styles.filterCardLabel}>Период:</span>
                                <span className={styles.filterCardValue}>
                                    {filters.dateRange.from && formatFilterDate(filters.dateRange.from)}
                                    {filters.dateRange.from && filters.dateRange.to && ' — '}
                                    {filters.dateRange.to && formatFilterDate(filters.dateRange.to)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`${styles.eventsContainer} ${hasDateFilter ? styles.eventsContainerWithFilters : ''}`}>
                {Object.entries(reports).map(([dateId, managers]) =>
                    Object.entries(managers).map(([manager, managerReports]) => (
                        <div key={`${dateId}-${manager}`} className={styles.dataGridContainer}>
                            <div className={styles.companyPlanDate}>Отчёт за {formatReportDate(dateId)}</div>
                            <div className={styles.companyName}>{manager || 'Менеджер не указан'}</div>
                            {managerReports.map((report, index) => (
                                <div key={index} className={styles.companyDescriptionRow}>
                                    <span className={`${styles.companyDescriptionRowVal} ${styles.reportContent}`}>{report}</span>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            <SnvFilter
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
                disabled={{ groupping: true }}
                storageKey="dailyReportFilters"
            />
        </div>
    )
}

export default DailyReport
