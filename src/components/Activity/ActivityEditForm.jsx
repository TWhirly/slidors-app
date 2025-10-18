import axios from 'axios';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from '../Companies/CompanyEditForm.module.css';
import BasicSelect from '../Companies/Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useNotification } from '../notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions.js';
import { useActivity } from '../../hooks/useActivity.js';
import { useQueryClient } from '@tanstack/react-query';
import { useEmail } from '../../hooks/useEmail.js';
const ActivityEditForm = () => {
    const { state: activity } = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ ...activity });
    const isNewActivity = activity?.new === true;
    const [hasChanged, setHasChanged] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const { regions: contextRegions, statuses,
        activityTypes,
        activityPurporses, chat_id } = useContext(DataContext);
        const [regions, setRegions] = useState([]);
    const { regionsWithCompanies } = useRegions(chat_id);
    const [cities, setCities] = useState([]);
    const formDataRef = useRef(formData);
    const { showNotification } = useNotification();
    const { activity: activities, optimisticUpdateActivity, updateActivity } = useActivity(chat_id);
    const tgRef = useRef(window.Telegram.WebApp);
    const tg = tgRef.current;
    const id = activity.id;

    console.log('activities', activities);
    useEffect(() => {
        const initBackButton = () => {
            if (!tg) return;

            tg.ready();
            tg.BackButton.isVisible = true;
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                // Return to list if company.new === true (new company) or to details if editing
                if (activity?.new) {
                    navigate('/activities');
                } else {
                    navigate(activity.path || `/activity/${activity.id}`, { state: { activityId: id } });
                }
            });
        };

        initBackButton();

        return () => {
            if (tg) {
                tg.BackButton.offClick();
                // tg.BackButton.hide();
            }

        };
    }, [activity, id, navigate, tg]);

    useEffect(() => {
        const hasChanged = Object.keys(formData).some((key) => formData[key] !== activity[key]);
        setHasChanged(hasChanged);
        console.log('hasChanged', hasChanged);
    }, [formData, activity]);

    useEffect(() => {
        if (formData?.type.trim() !== '' && formData?.purpose.trim() !== '') {
            formDataRef.current = formData;
            setAllowSave(true);
            tg.MainButton.setText('Сохранить');
        }
        else {
            setAllowSave(false);
            tg.MainButton.setText('Для сохранения заполните поля')
        }
    }, [formData, tg.MainButton]);

    useEffect(() => {
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);

    useEffect(() => {
        if (formData.region && regionsWithCompanies) {
            const selectedRegion = regionsWithCompanies.find(item => item.region === formData.region);
            if (selectedRegion) {
                const cities = selectedRegion.companies.reduce((acc, company) => {
                    if (!acc.includes(company.city) && company.city.length > 0) {
                        acc.push(company.city);
                    }
                    return acc;
                }, []);
                setCities(cities.sort());
            } else {
                setCities([]);
            }
        } else {
            setCities([]);
        }
    }, [formData.region, regionsWithCompanies]);


    const handleSave = useCallback(async () => {
        const currentFormData = formDataRef.current;
        console.log('Current form data:', formData);
        if (!allowSave) return
        if (!hasChanged) {
            navigate(activity.path || `/activities/${activity.id}`, { state: { activityId: activity.id } });
            showNotification(`Данные не изменились`, true);
            return
        }
        try {
            console.log('Current form data:', currentFormData);
            optimisticUpdateActivity(currentFormData, isNewActivity)
            navigate(activity.path || `/activities/${activity.id}`, { state: { activityId: id } })
            updateActivity(currentFormData, {
                onSuccess: () => {
                    // showNotification(`Данные сохранены успешно!`, true);
                    queryClient.invalidateQueries({ queryKey: ['emails', id, null] });
                },
                onError: (error) => {
                    console.error('Company update failed:', error);
                    showNotification(`Ошибка при сохранении: ${error.message}`, false);
                    // Автоматический откат через onError в мутации
                }
            });
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [activity.id, activity.path, allowSave, formData, hasChanged, id, isNewActivity, navigate, optimisticUpdateActivity, queryClient, showNotification, updateActivity]);




    useEffect(() => {
        if (!activity) {
            navigate('/activities');
            return;
        }

        tg.setBottomBarColor("#131313");
        tg.MainButton.show();
        tg.MainButton.onClick(handleSave);

        return () => {
            tg.MainButton.offClick(handleSave);
            tg.MainButton.hide();
        };
    }, [activity, handleSave, navigate, tg]);


    // Update ref whenever formData changes
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);



    if (!activity) {
        return <div className={styles.container}>Событие не найдено</div>;
    }
    console.log('activity', activity)

    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <span className={styles.nameAndIcon}>
                    {activity.new === true ? "Новаое событие" : "Редактирование"}
                </span>
            </div>

            <div className={styles.formContainer} autoComplete="off">

                <BasicSelect
                    className={styles.formGroup}
                    searchable
                    list={regions}
                    name="region"
                    value={formData.region || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                    label="Регион"
                />

                <BasicSelect
                    className={styles.formGroup}
                    searchable
                    list={cities}
                    name="city"
                    value={formData.city || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                    label="Город"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="description"
                    value={formData.description || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    label="Описание"
                    rows="3"
                />

                <BasicSelect
                    className={styles.formGroup}
                    disabled={true}
                    type="text"
                    name="manager"
                    value={formData.manager || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}
                    label="Менеджер"
                />

            </div>
        </div>
    );
};

export default ActivityEditForm;