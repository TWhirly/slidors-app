import React, { useState, useEffect, useContext } from 'react';
import { useRegions } from '../../hooks/useRegions';
import { useActivity } from '../../hooks/useActivity';
import { useEventFilters } from '../../hooks/useEventFilters';
import { useTelegram } from '../../hooks/useTelegram';

const DailyReport = () => {
    const [reportEvents, setReportEvents] = useState([])
    const [reports, setReports] = useState({})
    const { tg, chat_id, showButton } = useTelegram()
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
    console.log('filteredOther', filteredOtherEvents)
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
           console.log('subscribes', subscribes)         
                
                report.push(activityHeader, activityQ1, subscribes.join('\n'))
                    
            }
            else {
                report.push(activityHeader, activityQ1, activity.description)
            }
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
    console.log(reports)

    return (
        <div>
            {JSON.stringify(reports, null, 2)}
        </div>
    )
}

export default DailyReport