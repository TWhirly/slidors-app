import axios from 'axios';
import { TextField } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import React, { useState, useEffect, useContext, useRef, useCallback , useMemo} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from '../Companies/CompanyEditForm.module.css';
import BasicSelect from '../Companies/Select.jsx'
import Skeleton from '@mui/material/Skeleton';
import { DataContext } from '../../DataContext.jsx';
import { useNotification } from '../notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions.js';
import { useActivity } from '../../hooks/useActivity.js';
import { useContacts } from '../../hooks/useContacts.js';
import { useQueryClient } from '@tanstack/react-query';
import { useEmail } from '../../hooks/useEmail.js';
import { set } from 'lodash';
import { answers, checkIfInArray, checkIfRequireFieldsFilled } from './activity.js';
import { getContactIcons } from '../Companies/Companies-helpers.js'
import CompanyContacts from '../Companies/CompanyContacts.jsx'
import CompanyMainContacts from '../Companies/CompanyMainContacts.jsx';
import LongMenu from '../Companies/CompanyDetailMenu.jsx'

const ActivityEditForm = () => {
    const { state: activity, path } = useLocation();
    // const { state: { companyId: id, path: returnPath = '/companies' } } = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ ...activity, companyWhatsapp: '', companyTelegram: '' });
    
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
    const [company, setCompany] = useState({ id: null })
    const [contacts, setContacts] = useState([])
    const formDataRef = useRef(formData);
    const { showNotification } = useNotification();
    const { activity: activities, optimisticUpdateActivity, updateActivity } = useActivity(chat_id);
    const tgRef = useRef(window.Telegram.WebApp);
    const tg = tgRef.current;
    const id = activity.id;
    const { regionsWithContacts, isLoading: isContactsLoading, contactsLoadingError: contactsError } = useContacts(chat_id)
    const [selectedContactId, setSelectedContactId] = useState(activity.contactId || '');
    const [header, setHeader] = useState('');
    const [toSubscribe, setToSubscribe] = useState(false)

    console.log('regionsWithContacts', regionsWithContacts);
     console.log('activityEdit', activity);
    useEffect(() => {
        console.log('effect 1')
       const handleBackButton = () => {
        updateActivity({...activity, delete: activity.new}, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['activity', id, null] });
            },
            onError: (error) => {
                console.error('Company update failed:', error);
                showNotification(`Ошибка при сохранении: ${error.message}`, false);
            }
        });
        navigate(activity.path || `/activities/`, { state: { activityId: id, companyId: activity.companyId } });
    };

     const initBackButton = () => {
        if (!tg) return;
        tg.ready();
        tg.BackButton.isVisible = true;
        tg.BackButton.show();
        tg.BackButton.onClick(handleBackButton); // ✅ Используем именованную функцию
    };
    
    initBackButton();
    
    return () => {
        if (tg) {
            tg.BackButton.offClick(handleBackButton); // ✅ Очищаем конкретный обработчик
        }
    };


    }, [activity, id, navigate, queryClient, showNotification, tg, updateActivity]);

    useEffect(() => {
    setFormData(prev => ({ ...prev, contactId: selectedContactId }));
}, [selectedContactId]);

    useEffect(() => {
        if (activity.new)
            setHeader('Новое событие')
        if(!activity.new && activity.finalize)
            setHeader('Завершить событие')
        if(!activity.new && !activity.finalize)
            setHeader('Редактирование')
    },[activity.finalize, activity.new] )

    useEffect(() => {
        console.log('effect 2')
        if (regionsWithContacts.length > 0) {
            const contacts = regionsWithContacts.reduce((acc, region) => {
                region.contacts.forEach((contact) => {
                    if (contact.companyId === formData.companyId && !checkIfInArray(acc, contact)) {

                        acc.push(contact);
                    }
                });
                return acc;
            }, [])
            setContacts(contacts)
        }
    }, [formData.companyId, regionsWithContacts]);

    useEffect(() => {
        // console.log('effect 3')
        const hasChanged = Object.keys(formData).some((key) => formData[key] !== activity[key]);
        setHasChanged(hasChanged);
    }, [formData, activity]);

    

    useEffect(() => {
        // console.log('effect 5')
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);

    useEffect(() => {
        console.log('effect 6')
        const currentFormDataRegion = formData.region;
        if (currentFormDataRegion && regionsWithCompanies.length > 0) {
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
        } 
        // else {
        //     setCities([]);
        // }

    }, [formData.region, regionsWithCompanies]);

    useEffect(() => {
        console.log('effect 7')
        const currentFormDataRegion = formData.region;
        if (currentFormDataRegion && currentFormDataRegion.length > 0 && regionsWithCompanies.length > 0) {
            const regionNames = regionsWithCompanies?.find(item => item.region === formData.region)
            let names = []
            if(regionNames)
            {names = regionNames.companies?.reduce((acc, company) => {
                if (!acc.includes(company.name) && company.name.length > 0 && !formData.city) {
                    acc.push({ name: company.name, id: company.id });
                }
                if (!acc.includes(company.name) && company.name.length > 0 && formData.city?.length > 0 && company.city === formData.city) {
                    acc.push({ name: company.name, id: company.id });
                }

                return acc;
            }, [])};
           

            setCompanies(names);
        }
        // else {
        //     setCompanies([]);
        // }
        // experimental merge with effect 8
         if (currentFormDataRegion && currentFormDataRegion.length > 0 && formData.companyId !== '' && regionsWithCompanies.length > 0) {
            const company = regionsWithCompanies.find(item => item.region === formData.region)
                .companies?.find(item => item.id === formData.companyId)
            setCompany(company)
          
        }
        // else {
        //     setCompany({ id: null })
        // }
        // exp

    }, [formData.city, formData.companyId, formData.region, regionsWithCompanies])

    useEffect(() => {
        if (formData.companyId === ''){
            setFormData(prev => ({...prev,
                companyWhatsapp : '',
                companyTelegram: ''
                
            }))
            return
        } 
         setFormData(prev => ({...prev,
                companyWhatsapp : company.whatsapp || '',
                companyTelegram: company.telegram || ''
                
            }))
    },[company, formData.companyId])
    

    useEffect(() => {
        setIsElobaration(formData.purpose === 'Проработка');
    }, [formData.purpose]);

    useEffect(() => {
            setToSubscribe(formData['subscribed?'] === 'Подписать' ? true : false)
    }, [formData])

    useEffect(() => {
        setIsPlanned(formData.plan?.length > 0);
    }, [formData.plan]);

    const handleMenuSelection = (selectedOption) => {

        if (selectedOption === 'Добавить контакт') {
            const getEmptyContact = (selectedRegion = '') => ({
                id: uuidv4(), // Generates UUID v4
                firstName: '',
                lastName: '',
                surname: '',
                companyId: formData.companyId,
                companyName: formData.companyName,
                title: '',
                region: selectedRegion,
                phone1: '',
                phone2: '',
                manager: formData.manager || '',
                whatsapp: '',
                telegram: '',
                note: '',
                emails: [{ id: uuidv4(), mail: '' }],
                new: true

            });
            const emptyContact = getEmptyContact(formData.region);

            navigate(`/contacts/new/edit`, { state: { ...emptyContact, path: `/activities/${activity.id}/edit`, prevActivityData: formData } });

        }

    };


    const handleSave = useCallback(async () => {
        const currentFormData = formDataRef.current;
        const isNewActivity = activity?.new === true;
        delete currentFormData.new;
        delete activity.new
        if(currentFormData.toFinish)
            currentFormData.plan = ''
        console.log('Current form data:', activity.path);
        if (!allowSave) {
            console.log('allowSave', allowSave)
            return}
        // if (!hasChanged) {
        //     navigate(activity.path || `/activities/${activity.id}`, { state: { activityId: activity.id } });
        //     showNotification(`Данные не изменились`, true);
        //     return
        // }
        try {
            console.log('Current form data:', currentFormData);
            optimisticUpdateActivity(currentFormData, isNewActivity, true)
            if (tg) {
                tg.BackButton.offClick();
            }
            navigate(activity.path || `/activities/${activity.id}`, { state: { activityId: id, companyId: formData.companyId } })
            updateActivity(currentFormData, {
                onSuccess: () => {
                    // showNotification(`Данные сохранены успешно!`, true);
                    queryClient.invalidateQueries({ queryKey: ['activity', id, null] });
                },
                onError: (error) => {
                    console.log('Company update failed:', error);
                    showNotification(`Ошибка при сохранении: ${error.message}`, false);
                    // Автоматический откат через onError в мутации
                }
            });
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [activity.id, activity.new, activity.path, allowSave, formData.companyId, id, navigate, optimisticUpdateActivity, queryClient, showNotification, tg, updateActivity]);

    useEffect(() => {
    console.log('effect 4 - Telegram init')
    tg.setBottomBarColor("#131313");
    tg.MainButton.show();
    tg.MainButton.onClick(handleSave);

    return () => {
        tg.MainButton.offClick(handleSave);
        tg.MainButton.hide();
    };
}, [tg, handleSave]); // Только tg и handleSave

// Отдельный эффект для обновления текста кнопки
useEffect(() => {
    console.log('effect 4b - Button text update')
    if (checkIfRequireFieldsFilled(formData)) {
        formDataRef.current = formData;
        setAllowSave(true);
        tg.MainButton.setText('Сохранить');
        tg.MainButton.enable(); // Включить кнопку
    } else {
        setAllowSave(false);
        tg.MainButton.setText('Для сохранения заполните поля');
        tg.MainButton.disable(); // Отключить кнопку
    }
}, [formData, tg.MainButton]); // formData и tg.MainButton

const handleCheck = (id) => {
    console.log('Selected contact ID:', id);
    
    // Если кликаем на уже выбранный контакт - снимаем выбор
    if (selectedContactId === id) {
        setSelectedContactId('');
        setFormData(prev => ({ ...prev, contactId: '' }));
    } else {
        // Иначе выбираем новый контакт (автоматически снимается с предыдущего)
        setSelectedContactId(id);
        setFormData(prev => ({ ...prev, contactId: id }));
    }
};


    // Update ref whenever formData changes
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);



    if (!activity) {
        return <div className={styles.container}>Событие не найдено</div>;
    }
    console.log('toSubscribe', toSubscribe);
    console.log('formData', formData);
    console.log('company', company)

    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <span className={styles.nameAndIcon}>
                    {header}
                </span>
                {formData.companyId && <LongMenu
                    onSelect={handleMenuSelection}
                    options={[
                        'Добавить контакт',
                    ]}
                />}
            </div>

            <div className={styles.formContainer} autoComplete="off">

                <BasicSelect
                    require
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
                    require
                    className={styles.formGroup}
                    searchable
                    list={companies.map(item => item.name)}
                    name="companyName"
                    value={formData.companyName || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, companyName: value, companyId: companies?.find(item => item.name === value)?.id || '' }))}
                    label="Компания"
                />

                {/* {contacts.map((contact) => {
                    return(
                <CompanyMainContacts
                company={contact}
                activity
                >

                </CompanyMainContacts>)})
                } */}

                {contacts.length > 0 && <CompanyContacts
                    activity
                    className={styles.companyContactsActivity}
                    onChange={handleCheck}
                    // onChange={console.log('check')}
                    id={company.id || ''}
                    chat_id={chat_id}
                    selectedContactId={selectedContactId} 
                    // checked={selectedContactId === formData.contactId}
                >

                </CompanyContacts>}

                <BasicSelect
                    require
                    className={styles.formGroup}
                    list={activityTypes}
                    name="type"
                    value={formData.type || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    label="Тип"
                />

                <BasicSelect
                    require
                    className={styles.formGroup}
                    list={activityPurposes}
                    name="purpose"
                    value={formData.purpose || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
                    label="Цель"
                />

                {isElobaration && <>
                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="status"
                        list={answers.status}
                        value={formData.status || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                        label="Работают ли с системой Слайдорс?"
                    />

                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="haveAdv?"
                        list={answers['haveAdv?']}
                        value={formData['haveAdv?'] || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, 'haveAdv?': value }))}
                        label="Есть ли реклама?"
                    />

                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="haveSample?"
                        list={answers['haveSample?']}
                        value={formData['haveSample?'] || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, 'haveSample?': value }))}
                        label="Есть ли образец?"
                    />

                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="haveTrainig?"
                        list={answers['haveTrainig?']}
                        value={formData['haveTrainig?'] || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, 'haveTrainig?': value }))}
                        label="Проведено ли обучение?"
                    />

                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="subscribed?"
                        list={answers['subscribed?']}
                        value={formData['subscribed?'] || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, 'subscribed?': value }))}
                        label="Подписаны ли на группу?"
                    />
              
                </>}
                        {toSubscribe && <> 
                   <BasicSelect
                    require={formData['subscribed?'].trim() === 'Подписать' && formData.companyWhatsapp === '' && formData.companyTelegram === ''}
                    className={styles.formGroup}
                    type="tel"
                    name="whatsapp"
                    value={formData.companyWhatsapp || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, companyWhatsapp: value }))}
                    label="WhatsApp"
                />

                <BasicSelect
                    require={formData['subscribed?'].trim() === 'Подписать' && formData.companyWhatsapp === '' && formData.companyTelegram === ''}
                    className={styles.formGroup}
                    type="tel"
                    name="telegram"
                    value={formData.companyTelegram || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, companyTelegram: value }))}
                    label="Telegram"
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

                {isPlanned && <BasicSelect
                    require
                    className={styles.formGroup}
                    type="text"
                    name="responsible?"
                    list={namesEmails}
                    value={formData.responsible || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, responsible: value }))}
                    label="Назначить ответственного"
                />}




                <BasicSelect
                    require={formData.purpose === 'Проработка' ? false : true}
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