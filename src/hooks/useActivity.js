import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import { DataContext } from '../DataContext.jsx'



export const useActivity = (chat_id) => {

  const notificated = useRef(false)
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const { name, email, dev } = useContext(DataContext);
  const [nameMail, setNameMail] = useState('');
  const notificationInterval = 1000 * 60 * 30 // за полчаса

  useEffect(() => {
    if (name && email)
      setNameMail(`${name.name} (${email})`)
  }, [email, name])

  const fetchActivity = async () => {
    console.log('getActivitiesList chat_id', chat_id)
    const params = {
      name: 'Ваше имя',
      chatID: chat_id,
      api: 'getActivitiesList'
    };
    const formData = JSON.stringify(params);
    const response = await axios.post(
      process.env.REACT_APP_GOOGLE_SHEETS_URL,
      formData,
      {
        headers: { 'Content-Type': dev ? 'application/json' : 'text/plain' }
      }
    );
    const sortedActivity = transformActivitySort(response.data);
    console.log('notificated', notificated);
    // checkScheduled()
    return (sortedActivity);
  };


  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const transformActivitySort = (activities) => {
    // console.log('Activity select function executed - TRANSFORMATION', activities, activities.length);
    if (!Array.isArray(activities)) {
      return { planned: [], other: [] };
    }

    // Разделяем массив на две группы
    const planned = [];
    const other = [];

    activities.forEach(lead => {
      if (lead.plan && lead.plan.trim() !== '') {
        planned.push(lead);
      } else {
        other.push(lead);
      }
    });

    // Сортируем массив с plan по дате и времени
    planned.sort((a, b) => {
      const aDateTime = createDateTime(a.plan, a.planTime);
      const bDateTime = createDateTime(b.plan, b.planTime);

      return aDateTime - bDateTime;
    });

    // Сортируем массив без plan по endDatetime по убыванию
    other.sort((a, b) => {
      const aEnd = a.endDatetime && a.endDatetime.trim() !== '' ? formatDate(a.endDatetime) : formatDate(a.startDatetime);
      const bEnd = b.endDatetime && b.endDatetime.trim() !== '' ? formatDate(b.endDatetime) : formatDate(b.startDatetime);
      return bEnd - aEnd;
    });

    return {
      planned,
      other
    };
  }

  // Вспомогательная функция для создания полной даты-времени
  function createDateTime(dateStr, timeStr) {
    const date = new Date(dateStr);

    if (timeStr && timeStr.trim() !== '') {
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      date.setHours(hours, minutes, seconds || 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date.getTime();
  };

  const { data: activity, isLoading, error, isSuccess, isFetching } = useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 15,
    refetchIntervalInBackground: true
  });

  // Функция для оптимистичного обновления события
  const optimisticUpdateActivity = (activityData, isNewActivity = false) => {
    const finalize = !!activityData.finalize
    // console.log('isNewActivity', isNewActivity)
    queryClient.setQueryData(['activity'], (oldActivitites = {}) => {
      const unitedActivities = [...oldActivitites.planned, ...oldActivitites.other]
      if (isNewActivity) {
        unitedActivities.push(activityData)
      }
      if (finalize) {
        // console.log('finalize')
        const prevActivityIndex = unitedActivities.findIndex(activity => activity.id === activityData.finalize)
        unitedActivities[prevActivityIndex] = { ...unitedActivities[prevActivityIndex], plan: '' }
      }
      const activtyIndex = unitedActivities.findIndex(activity => activity.id === activityData.id)
      unitedActivities[activtyIndex] = activityData

      return (transformActivitySort(unitedActivities))
    });
  };

  const updateActivityMutation = useMutation({
    mutationFn: async (activityData) => {
      // // console.log('mutationFn, contact', activityData);
      // console.log('updateActivity')
      const params = {
        name: 'Ваше имя',
        chatID: chat_id,
        api: 'updateActivity',
        activity: activityData
      };
      const formData = JSON.stringify(params);
      const response = await axios.post(
        process.env.REACT_APP_GOOGLE_SHEETS_URL,
        formData,
        {
          headers: { 'Content-Type': dev ? 'application/json' : 'text/plain' }
        }
      );
      return response.data;
    },
    onMutate: async (activityData) => {

      const previousActivity = queryClient.getQueryData(['activity']) || [];

      // Оптимистичное обновление через функцию
      // optimisticUpdateActivity(activityData, activityData.isNew);

      return { previousActivity };
    },
    onError: (error, activityData, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['activity'], context.previousActivity);
      console.error('Failed to update contact:', error);
    },
    onSuccess: (data, activityData) => {
      // Дополнительные действия при успехе
      !activityData.new && showNotification(`Событие успешно сохранено! ${data}`, { fontSize: '0.8rem' });
      // console.log('Activity updated successfully:', data);
      // checkScheduled()
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    }
  });

 



  const checkScheduled = useCallback(() => {
    console.log(isSuccess)
    if (isFetching) return
    if(notificated.current) return
    if(!isSuccess) return
      console.log('schedule func')
      const nearTimePlanned = activity?.planned
        .filter(a => a.responsible === nameMail)
        .filter(a => {
          let timeMs
          if (a.planTime !== '') {
            const tA = a.planTime.split(':');
            timeMs = tA[0] * 60 * 60 * 1000 + tA[1] * 60 * 1000 + tA[2] * 1000
          } else {
            timeMs = 1000 * 60 * 60 * 11
          }
          
          const dateMs = +(new Date(a.plan))
          const nowMs = getMoscowTimeMs()
          console.log(`check interval: ${nowMs + notificationInterval}, ${timeMs + dateMs}`)
          return (nowMs + notificationInterval > timeMs + dateMs && nowMs < timeMs + dateMs)
        })
      if (nearTimePlanned.length > 0)
        {
          const scheduleTime = nearTimePlanned[0].planTime === '' ? 'сегодня' : `в ${nearTimePlanned[0].planTime.slice(0, 5)}`
        showNotification(`${nearTimePlanned[0]?.purpose ?? ""} "${nearTimePlanned[0]?.companyName?? ""}" ${scheduleTime}`, {}, true);
        notificated.current = true
      }
  }, [activity?.planned, isFetching, isSuccess, nameMail, notificationInterval, showNotification])

  useEffect(() => {
    if (isFetching) return
    if(notificated.current) return
    if(!isSuccess) return
    checkScheduled()
  }, [checkScheduled, isFetching, isSuccess])

  const getMoscowTimeMs = () => {
  const now = new Date();
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const moscowMs = utcMs + (3 * 60 * 60 * 1000);
  return moscowMs;
}

  return {
    activity: activity || [],
    isLoading,
    updateActivity: updateActivityMutation.mutate,
    updateActivityAsync: updateActivityMutation.mutateAsync,
    isUpdating: updateActivityMutation.isLoading,
    optimisticUpdateActivity, // Экспортируем для ручного использования
    error
  };
};