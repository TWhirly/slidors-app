import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNotification } from '../components/notifications/NotificationContext.jsx';

export const useActivity = (chat_id) => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();

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
    );
    const sortedActivity = transformActivitySort(response.data);
    // console.log('sortedActivity', sortedActivity);
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

  const { data: activity, isLoading, error } = useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 50,
    refetchIntervalInBackground: true
  });

  // Функция для оптимистичного обновления события
  const optimisticUpdateActivity = (activityData, isNewActivity = false) => {
    const finalize = !!activityData.finalize
    queryClient.setQueryData(['activity'], (oldActivitites = {}) => {
      const unitedActivities = [...oldActivitites.planned, ...oldActivitites.other]
      if (isNewActivity) {
          unitedActivities.push(activityData)
      } else {
        if (finalize){
        const prevActivityIndex = unitedActivities.findIndex(activity => activity.id === activityData.finalize)
        unitedActivities[prevActivityIndex] = {...unitedActivities[prevActivityIndex], plan: ''}
        }
        const activtyIndex = unitedActivities.findIndex(activity => activity.id === activityData.id)
          unitedActivities[activtyIndex] = activityData
      }
      return(transformActivitySort(unitedActivities)) 
    });
  };

  const updateActivityMutation = useMutation({
    mutationFn: async (activityData) => {
      // console.log('mutationFn, contact', activityData);
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
      );
      return response.data;
    },
onMutate: async (activityData) => {
      
      const previousActivity = queryClient.getQueryData(['activity']) || [];
      
      // Оптимистичное обновление через функцию
      optimisticUpdateActivity(activityData, activityData.isNew);
      
      return { previousActivity };
    },
    onError: (error, activityData, context) => {
      // Откатываем изменения при ошибке
      queryClient.setQueryData(['activity'], context.previousActivity);
      console.error('Failed to update contact:', error);
    },
    onSuccess: (data, activityData) => {
      // Дополнительные действия при успехе
       !activityData.new && showNotification(`Данные сохранены успешно!`, true);
      console.log('Contact updated successfully:', data);
    },
    onSettled: () => {
      // Перезапрашиваем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    }
  });

  const test = [1, 2]

  return {
    activity: activity || [],
    isLoading,
    updateActivity: updateActivityMutation.mutate,
    updateActivityAsync: updateActivityMutation.mutateAsync,
    isUpdating: updateActivityMutation.isLoading,
    optimisticUpdateActivity, // Экспортируем для ручного использования
    test,
    error
  };
};