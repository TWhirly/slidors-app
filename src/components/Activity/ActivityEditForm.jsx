import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from '../Companies/CompanyEditForm.module.css';
import BasicSelect from '../Companies/Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useRegions } from '../../hooks/useRegions.js';
import { useActivity } from '../../hooks/useActivity.js';
import { useContacts } from '../../hooks/useContacts.js';
import { useTelegram } from '../../hooks/useTelegram.js';
import { answers, checkIfInArray, checkIfRequireFieldsFilled } from './activity.js';
import CompanyContacts from '../Companies/CompanyContacts.jsx'
import LongMenu from '../Companies/CompanyDetailMenu.jsx'

const ActivityEditForm = () => {
    const { state: activity } = useLocation();
    // const { state: { companyId: id, path: returnPath = '/companies' } } = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(() => activity ? { ...activity } : null);
    const { tg, chat_id } = useTelegram()
    const { regions: contextRegions,
        activityTypes,
        activityPurposes, namesEmails } = useContext(DataContext);
    const [regions, setRegions] = useState([]);
    const { companies: allCompanies } = useRegions(chat_id);
    const [cities, setCities] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isElobaration, setIsElobaration] = useState(false);
    const [isSnvElobaration, setIsSnvElobaration] = useState(false)
    const [isPlanned, setIsPlanned] = useState(false);
    const [company, setCompany] = useState({ id: null })
    const [contacts, setContacts] = useState([])
    const formDataRef = useRef(formData);
    const { updateActivity } = useActivity(chat_id);
    const id = activity?.id || null;
    const { contacts: allContacts } = useContacts(chat_id)
    const [header, setHeader] = useState('');
    const [toSubscribe, setToSubscribe] = useState(false)
    const { city, companyId, plan, purpose, region } = formData || {};

    const isNewDraft = activity?.new === true;
    const isSavedRef = useRef(false);
    const isSavingRef = useRef(false);
    const isCancellingRef = useRef(false);
    const cancellationTimeoutRef = useRef(null);
    const activityRef = useRef(activity);

    useEffect(() => {
        formDataRef.current = formData;
        activityRef.current = activity;
    }, [activity, formData]);


    const cancelDraft = useCallback(() => {
        const currentActivity = activityRef.current;
        if (!isNewDraft || isSavedRef.current || isCancellingRef.current || !currentActivity?.id) return;

        isCancellingRef.current = true;
        updateActivity(
            { ...currentActivity, new: true, delete: true },
            { onError: () => { isCancellingRef.current = false; } }
        );
    }, [isNewDraft, updateActivity]);

    const handleSave = useCallback(() => {
        const currentFormData = formDataRef.current;
        if (!checkIfRequireFieldsFilled(currentFormData) || isSavingRef.current) return;

        const { new: ignoredNew, delete: ignoredDelete, ...savedActivity } = currentFormData;
        const payload = currentFormData.toFinish ? { ...savedActivity, new: false, plan: '' } : { ...savedActivity, new: false };

        isSavingRef.current = true;
        isSavedRef.current = true;
        updateActivity(payload);
        navigate(activityRef.current.path || `/activities/${currentFormData.id}`, {
            state: { activityId: id, companyId: currentFormData.companyId }
        });
    }, [id, navigate, updateActivity])

    useEffect(() => {
        if(!activity || !tg)
            return
        const handleBackButton = () => {
            const currentActivity = activityRef.current;
            cancelDraft();
            navigate(currentActivity.path || `/activities/`, { state: { activityId: currentActivity.finalize || id, companyId: currentActivity.companyId } });
        };
        tg.setBottomBarColor("#131313");
        tg.MainButton.show();
        tg.MainButton.onClick(handleSave);
        tg.BackButton.show();
        tg.BackButton.onClick(handleBackButton);
        return () => { tg.BackButton.offClick(handleBackButton); tg.MainButton.offClick(handleSave); tg.MainButton.hide(); };
    }, [activity, cancelDraft, handleSave, id, navigate, tg]);

    useEffect(() => {
        if (!isNewDraft) return;

        if (cancellationTimeoutRef.current) {
            clearTimeout(cancellationTimeoutRef.current);
            cancellationTimeoutRef.current = null;
        }

        const handlePageExit = () => cancelDraft();
        window.addEventListener('popstate', handlePageExit);
        window.addEventListener('pagehide', handlePageExit);

        return () => {
            window.removeEventListener('popstate', handlePageExit);
            window.removeEventListener('pagehide', handlePageExit);
            cancellationTimeoutRef.current = setTimeout(cancelDraft, 0);
        };
    }, [cancelDraft, isNewDraft]);

    useEffect(() => {
        if (!activity || !tg) return;
        if (checkIfRequireFieldsFilled(formData)) {
            formDataRef.current = formData;
            tg.MainButton.setText('Сохранить');
            tg.MainButton.enable(); // Включить кнопку
        } else {
            tg.MainButton.setText('Для сохранения заполните поля');
            tg.MainButton.disable(); // Отключить кнопку
        }
        setToSubscribe(formData['subscribed?'] === 'Подписать' ? true : false)
    }, [activity, formData, tg]);

    useEffect(() => {
        if (!activity) return;
        if (activity.new && activity.finalize)
            setHeader('Завершить событие')
        else if (activity.new)
            setHeader('Новое событие')
        else
            setHeader('Редактирование')
    }, [activity])

    useEffect(() => {
        if(!allContacts || companyId === undefined)
            return
            const companyContacts = allContacts.reduce((acc, contact) => {
                if (contact.companyId === companyId && !checkIfInArray(acc, contact)) {
                    acc.push(contact);
                }
                return acc;
            }, []);
            setContacts(companyContacts)
        
    }, [allContacts, companyId]);

    useEffect(() => {
        // console.log('effect 5')
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);

    // useEffect(() => {
    //     console.log('effect 6')
    //     const currentFormDataRegion = formData.region;
        

    // }, [allCompanies, formData.region]);

    useEffect(() => {
        if(!allCompanies || region === undefined)
            return
        const currentFormDataRegion = region;
        if (currentFormDataRegion && currentFormDataRegion.length > 0 && allCompanies) {
            let names = []
            // names = allCompanies.reduce((acc, company) => {
            //     if (!acc.includes(company.name) && company.name.length > 0 && !formData.city) {
            //         acc.push({ name: company.name, id: company.id });
            //     }
            //     if (!acc.includes(company.name) && company.name.length > 0 && formData.city?.length > 0 && company.city === formData.city) {
            //         acc.push({ name: company.name, id: company.id });
            //     }
            //     return acc;
            // }, []);
            if(city?.length > 0){
            names = allCompanies.filter(company => company.region === currentFormDataRegion && company.city === city)
            } else {
                names = allCompanies.filter(company => company.region === currentFormDataRegion)
            }
            setCompanies(names);
        }
        if (currentFormDataRegion && currentFormDataRegion.length > 0 && companyId !== '' && allCompanies) {
            const company = allCompanies.find(item => item.id === companyId)
            setCompany(company)
        }
        if (currentFormDataRegion && allCompanies) {
            const citiesSet = new Set(allCompanies.filter(company => company.region === currentFormDataRegion)
                .map(company => company.city))
            const cities = Array.from(citiesSet).sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'))
            setCities(cities)

        }
    }, [allCompanies, city, companyId, region])

    useEffect(() => {
        if (companyId === undefined || companyId === '') {
            setFormData(prev => ({
                ...prev,
                companyWhatsapp: '',
                companyTelegram: ''

            }))
            return
        }
        setFormData(prev => ({
            ...prev,
            companyWhatsapp: company.whatsapp || '',
            companyTelegram: company.telegram || ''

        }))
    }, [company, companyId])


    useEffect(() => {
        setIsElobaration(purpose === 'Проработка');
        setIsSnvElobaration(purpose === 'Проработка СНВ');
    }, [purpose]);

    useEffect(() => {
        setIsPlanned(plan?.length > 0);
    }, [plan]);

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





    const handleCheck = (id) => {
        setFormData(prev => ({ ...prev, contactId: prev.contactId === id ? '' : id }));
    };

    if (!activity) {
        return <div className={styles.container}>Событие не найдено</div>;
    }
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
                    value={formData.city || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                    label="Город"
                />

                <BasicSelect
                    useObjects
                    require
                    className={styles.formGroup}
                    searchable
                    // list={companies.map(item => item.name)}
                    list={companies}
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, companyName: value, companyId: companies?.find(item => item.name === value)?.id || '' }))}
                    label="Компания"
                />

                {contacts.length > 0 && <CompanyContacts
                    activity
                    className={styles.companyContactsActivity}
                    onChange={handleCheck}
                    id={company.id || ''}
                    chat_id={chat_id}
                    selectedContactId={formData.contactId}
                >

                </CompanyContacts>}

                <BasicSelect
                    require
                    className={styles.formGroup}
                    list={activityTypes}
                    name="type"
                    value={formData.type || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    label="Тип"
                />

                <BasicSelect
                    require
                    className={styles.formGroup}
                    list={activityPurposes}
                    name="purpose"
                    value={formData.purpose || ''}
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

                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="isOnSite?"
                        list={answers['isOnSite?']}
                        value={formData['isOnSite?'] || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, 'isOnSite?': value }))}
                        label="Есть ли карточка компании на сайте?"
                    />

                </>}
                {isSnvElobaration}
                {isSnvElobaration && <>
                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                        label="Специализация"
                        rows="3"
                    />

                    <BasicSelect
                        require
                        className={styles.formGroup}
                        type="text"
                        name="company_importance"
                        value={formData.company_importance || ''}
                        onChange={(value) => setFormData(prev => ({ ...prev, company_importance: value }))}
                        label="Значимость компании (какой вопрос был при звонке)"
                        rows="3"
                    />
                    
                </>}
                {toSubscribe && !isSnvElobaration && <>
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



                {!isSnvElobaration && <BasicSelect
                    className={styles.formGroup}
                    type="date"
                    noPlaceholder
                    name="date"
                    value={formData.plan || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, plan: value }))}
                    label="Запланировать"
                />}

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
                    label={isSnvElobaration ? "О чем договорились" : "Описание"}
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
