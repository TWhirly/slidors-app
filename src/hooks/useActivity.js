import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNotification } from '../components/notifications/NotificationContext.jsx';
import { DataContext } from '../DataContext.jsx';

const emptyActivities = { planned: [], other: [] };

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const createDateTime = (dateStr, timeStr) => {
  const date = new Date(dateStr);

  if (timeStr && timeStr.trim() !== '') {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, seconds || 0, 0);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date.getTime();
};

const transformActivitySort = (activities) => {
  if (!Array.isArray(activities)) return emptyActivities;

  const planned = [];
  const other = [];

  activities.forEach((activity) => {
    if (activity.plan && activity.plan.trim() !== '') {
      planned.push(activity);
    } else {
      other.push(activity);
    }
  });

  planned.sort((a, b) => createDateTime(a.plan, a.planTime) - createDateTime(b.plan, b.planTime));
  other.sort((a, b) => {
    const aEnd = a.endDatetime && a.endDatetime.trim() !== '' ? formatDate(a.endDatetime) : formatDate(a.startDatetime);
    const bEnd = b.endDatetime && b.endDatetime.trim() !== '' ? formatDate(b.endDatetime) : formatDate(b.startDatetime);
    return bEnd - aEnd;
  });

  return { planned, other };
};

const getAllActivities = (activities = emptyActivities) => [
  ...(activities.planned || []),
  ...(activities.other || [])
];

export const useActivity = (chat_id) => {
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const { name, email } = useContext(DataContext);
  const [nameMail, setNameMail] = useState('');
  const queryKey = ['activity', chat_id];
  const notificationInterval = 1000 * 60 * 30;

  useEffect(() => {
    if (name && email) {
      setNameMail(`${name.name} (${email})`);
    }
  }, [email, name]);

  const fetchActivity = async () => {
    const apiUrl = process.env.REACT_APP_DEV === '1' ? process.env.REACT_APP_LOCAL_URL : process.env.REACT_APP_GOOGLE_SHEETS_URL;
    const config = {
      headers: {
        'Content-Type': process.env.REACT_APP_DEV === '1' ? 'application/json' : 'text/plain'
      }
    };
    let params = { name: 'Ваше имя', chatID: chat_id, api: 'getActivitiesList' };
    params = process.env.REACT_APP_DEV === '1' ? params : JSON.stringify(params);

    const response = await axios.post(apiUrl, params, config);
    return transformActivitySort(response.data);
  };

  const updateCache = (activityData) => {
    queryClient.setQueryData(queryKey, (currentActivities = emptyActivities) => {
      const activities = getAllActivities(currentActivities);

      if (activityData.delete) {
        return transformActivitySort(activities.filter((activity) => activity.id !== activityData.id));
      }

      const nextActivities = activities.filter((activity) => activity.id !== activityData.id);
      nextActivities.push(activityData);

      if (activityData.finalize) {
        return transformActivitySort(nextActivities.map((activity) => (
          activity.id === activityData.finalize ? { ...activity, plan: '' } : activity
        )));
      }

      return transformActivitySort(nextActivities);
    });
  };

  const optimisticUpdateActivity = (activityData) => updateCache(activityData);

  const { data: activity, isLoading, error, isFetching } = useQuery({
    queryKey,
    queryFn: fetchActivity,
    enabled: Boolean(chat_id),
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 25,
    refetchIntervalInBackground: true
  });

  const updateActivityMutation = useMutation({
    mutationFn: async (activityData) => {
      const apiUrl = process.env.REACT_APP_DEV === '1' ? process.env.REACT_APP_LOCAL_URL : process.env.REACT_APP_GOOGLE_SHEETS_URL;
      const config = {
        headers: {
          'Content-Type': process.env.REACT_APP_DEV === '1' ? 'application/json' : 'text/plain'
        }
      };
      let params = { name: 'Ваше имя', chatID: chat_id, api: 'updateActivity', activity: activityData };
      params = process.env.REACT_APP_DEV === '1' ? params : JSON.stringify(params);

      const response = await axios.post(apiUrl, params, config);
      return response.data;
    },
    onMutate: async (activityData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousActivity = queryClient.getQueryData(queryKey);
      updateCache(activityData);
      return { previousActivity };
    },
    onError: (mutationError, activityData, context) => {
      if (context?.previousActivity) {
        queryClient.setQueryData(queryKey, context.previousActivity);
      }
      console.error('Не удалось сохранить событие:', mutationError);
    },
    onSuccess: (data, activityData) => {
      if (!activityData.new && !activityData.delete) {
        showNotification(`Событие успешно сохранено! ${data || ''}`, { fontSize: '0.8rem' });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  useEffect(() => {
    const plannedActivities = activity?.planned || [];
    const hasNearPlannedActivity = plannedActivities
      .filter((item) => item.responsible === nameMail)
      .some((item) => {
        const [hours = 0, minutes = 0, seconds = 0] = (item.planTime || '00:00:00').split(':').map(Number);
        const plannedTime = new Date(item.plan).getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
        return Date.now() + notificationInterval > plannedTime;
      });

    if (hasNearPlannedActivity) {
      showNotification('Есть запланированные события', {}, true);
    }
  }, [activity, isFetching, nameMail, notificationInterval, showNotification]);

  return {
    activity: activity || emptyActivities,
    isLoading,
    updateActivity: updateActivityMutation.mutate,
    updateActivityAsync: updateActivityMutation.mutateAsync,
    isUpdating: updateActivityMutation.isPending,
    optimisticUpdateActivity,
    error
  };
};
