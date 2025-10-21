import axios from 'axios';
import { TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
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
import { set } from 'lodash';
import { answers } from './activity.js';
const ActivityEditForm = () => {
    const { state: activity, path } = useLocation();
    // const { state: { companyId: id, path: returnPath = '/companies' } } = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ ...activity });
    const isNewActivity = activity?.new === true;
    const [hasChanged, setHasChanged] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const { regions: contextRegions, statuses,
        activityTypes,
        activityPurposes, chat_id, namesEmails } = useContext(DataContext);
        const [regions, setRegions] = useState([]);
    const { regionsWithCompanies } = useRegions(chat_id);
    const [cities, setCities] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isElobaration, setIsElobaration] = useState(false);
    const [isPlanned, setIsPlanned] = useState(false);
    const formDataRef = useRef(formData);
    const { showNotification } = useNotification();
    const { activity: activities, optimisticUpdateActivity, updateActivity } = useActivity(chat_id);
    const tgRef = useRef(window.Telegram.WebApp);
    const tg = tgRef.current;
    const id = activity.id;

    console.log('path', activity.path);
    console.log('activity', activity);
    useEffect(() => {
        const initBackButton = () => {
            if (!tg) return;

            tg.ready();
            tg.BackButton.isVisible = true;
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                // Return to list if company.new === true (new company) or to details if editing
               
                    navigate(activity.path || `/activities/`, { state: { activityId: id, companyId: activity.companyId } });
                
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
        if (formData?.type.trim() !== '' && formData?.purpose.trim() !== '' && formData?.companyId.trim() !== '') {
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

    useEffect(() => {
         if(formData.region && formData.region.length > 0) {
            const names = regionsWithCompanies.find(item => item.region === formData.region).companies.reduce((acc, company) => {
                if (!acc.includes(company.name) && company.name.length > 0 && !formData.city) {
                    acc.push({name: company.name, id: company.id});
                }
                if (!acc.includes(company.name) && company.name.length > 0 && formData.city?.length > 0 && company.city === formData.city) {
                    acc.push({name: company.name, id: company.id});
                }

                return acc;
            }, []);
           
            setCompanies(names);
        }
        else {
            setCompanies([]);
        }
        
    },[cities, formData.city, formData.region, regionsWithCompanies])

    useEffect(() => {
        setIsElobaration(formData.purpose === 'Проработка');
    }, [formData.purpose]);

    useEffect(() => {
        setIsPlanned(formData.plan.length > 0);
    }, [formData.plan]);


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
                    queryClient.invalidateQueries({ queryKey: ['activity', id, null] });
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
    console.log('companies', companies);
    console.log('formData', formData);

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
                    onChange={(value) => setFormData(prev => ({ ...prev, region: value, companyName: '', companyId: '' }))}
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
                    searchable
                    list={companies.map(item => item.name)}
                    name="companyName"
                    value={formData.companyName || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, companyName: value, companyId: companies?.find(item => item.name === value)?.id || ''}))}
                    label="Компания"
                />

                <BasicSelect
                    className={styles.formGroup}
                    list={activityTypes}
                    name="type"
                    value={formData.type || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    label="Тип"
                />

                <BasicSelect
                    className={styles.formGroup}
                    list={activityPurposes}
                    name="purpose"
                    value={formData.purpose || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
                    label="Цель"
                />

                 {isElobaration && <>
                  <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="status"
                    list={answers.status}
                    value={formData.status || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    label="Работают ли с системой Слайдорс?"
                /> 

                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="haveAdv?"
                    list={answers['haveAdv?']}
                    value={formData['haveAdv?'] || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, 'haveAdv?': value }))}
                    label="Есть ли реклама?"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="haveSample?"
                    list={answers['haveSample?']}
                    value={formData['haveSample?'] || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, 'haveSample?': value }))}
                    label="Есть ли образец?"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="haveTrainig?"
                    list={answers['haveTrainig?']}
                    value={formData['haveTrainig?'] || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, 'haveTrainig?': value }))}
                    label="Проведено ли обучение?"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="subscribed?"
                    list={answers['subscribed?']}
                    value={formData['subscribed?'] || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, 'subscribed?': value }))}
                    label="Подписаны ли на группу?"
                />
                </>
                }

                <BasicSelect
                    className={styles.formGroup}
                    type="date"
                    noPlaceholder
                    name="date"
                    value={formData.plan || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, plan: value }))}
                    label="Запланировать"
                />

                {isPlanned && <BasicSelect
                    className={styles.formGroup}
                    type="time"
                    noPlaceholder
                    name="planTime"
                    value={formData.planTime || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, planTime: value }))}
                    label="Московское время"
                />}

                {isPlanned &&<BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="responsible?"
                    list={namesEmails}
                    value={formData.responsible || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, responsible: value }))}
                    label="Назначить ответственного"
                />}

              


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