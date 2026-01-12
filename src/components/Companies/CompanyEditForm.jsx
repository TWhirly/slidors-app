import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './CompanyEditForm.module.css';
import BasicSelect from './Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useNotification } from '../../components/notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions';
import { useQueryClient } from '@tanstack/react-query';
import { useEmail } from '../../hooks/useEmail';
import { initBackButton, tgMainButtonSwitch } from './Companies-helpers.js';
import { useTelegram } from '../../hooks/useTelegram.js';
let cities = [];
const CompanyEditForm = () => {
    console.log('first render')
    const { state: company } = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ ...company });
    const isNewComapny = company?.new === true;
    // const [isDealer, setIsDealer] = useState(false)
    const [regions, setRegions] = useState([]);
    // const [cities, setCities] = useState([]);
    let recyclers = [];
    // const [hasChanged, setHasChanged] = useState(false);
    // const [allowSave, setAllowSave] = useState(false);
    const { regions: contextRegions, types, statuses, chat_id } = useContext(DataContext);
    const formDataRef = useRef(formData);
    const { showNotification } = useNotification();
    const { transformToRegionsWithCompanies, companies, optimisticUpdateCompany, updateCompany } = useRegions(chat_id);
    const [emailInputs, setEmailInputs] = useState([]);
    const { tg } = useTelegram();
    const id = company.id;
    
    let isDealer = false;
    let allowSave = useRef(false);
    let hasChanged = false;
    const { emails, updateEmails } = useEmail(id, null);
    const currentFormData = formDataRef.current
    const regionsWithCompanies = transformToRegionsWithCompanies(companies)

    tg.MainButton.show();
    tg.setBottomBarColor("#131313");

    // console.log('regionsWithCompanies', regionsWithCompanies);
    // console.log('currentFormData', currentFormData)
    hasChanged = Object.keys(currentFormData).some((key) => currentFormData[key] !== company[key]);
    allowSave.current = currentFormData?.name.trim() !== '' && currentFormData.region.length > 0
    console.log(typeof (allowSave))
    // setHasChanged(hasChanged);
    isDealer = currentFormData.type?.toLowerCase() === 'дилер' ? true : false;
    console.log('Outside save: allowSave', allowSave.current, 'hasChanged', hasChanged);

    initBackButton(company, navigate, id);

    const handleSave = useCallback(() => {
        const currentFormData = formDataRef.current
        console.log('inside save: allowSave', allowSave.current, 'hasChanged', hasChanged)
        // console.log('Current form data:', currentFormData);
        if (!allowSave) return
        // if (!hasChanged) {
        //     navigate(company.path || `/companies/${company.id}`, { state: { companyId: company.id } });
        //     showNotification(`Данные не изменились`);
        //     return
        // }
        try {
            // console.log('Current form data:', currentFormData);
            optimisticUpdateCompany(currentFormData, isNewComapny)
            // updateEmails(currentFormData.emails);
            // navigate(company.path || `/companies/${company.id}`, { state: { companyId: currentFormData.id } })
            navigate(`/companies/`)
            updateCompany(currentFormData, {
                onSuccess: () => {
                    // showNotification(`Данные сохранены успешно 2 !`);
                    // queryClient.invalidateQueries({ queryKey: ['regions'] });
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
    }, [])

    tgMainButtonSwitch(allowSave, handleSave)


    useEffect(() => {
        if (!emails)
            return
        // console.log('emails', emails)
        const mails = emails.filter(item => item.company === id)

        const nonEmptyEmails = mails.reduce((acc, email) => {
            if (email.mail.trim() !== '') {
                acc.push(email);
            }
            return acc;
        }, []);
        // console.log('nonEmptyEmails', nonEmptyEmails);
        nonEmptyEmails.length === 0 ? setEmailInputs([...nonEmptyEmails, '']) : setEmailInputs(nonEmptyEmails)
        setFormData(prev => ({ ...prev, emails: nonEmptyEmails }));
    }, [])

    const addEmailInput = () => {
        setEmailInputs(prev => [...prev, { id: uuidv4(), mail: '' }]);
    };

    const handleEmailChange = (index, value) => {
        setEmailInputs(prev => {
            const newEmails = [...prev];
            const id = newEmails[index].id;
            newEmails[index] = { id: id, mail: value };
            return newEmails;
        });
    };



    useEffect(() => {
        // console.log('effect 6')
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, []);





    const updateCitiesDropdownList = (region) => {
        if (region !== '') {
            const citiesSet = new Set(companies.filter(company => company.region === region && company.city !== '')
                .map(company => { return company.city }))
            cities = Array.from(citiesSet).sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'))
        } else {
           cities = [];
        }
    }



    if (formData.type === 'Дилер') {
        recyclers = companies.filter(company => company.type === 'Переработчик')
            .map(company => { return company.name })
            .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'));
    } else {
        recyclers = [];
    }

    formDataRef.current = formData
    // console.log('formData', formData)





    if (!company) {
        return <div className={styles.container}>Компания не найдена</div>;
    }
    // console.log('formData', formData)
    // console.log('company', company)

    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <span className={styles.nameAndIcon}>
                    {company.new === true ? "Новая компания" : "Редактирование"}
                </span>
            </div>

            <div className={styles.formContainer} autoComplete="off">
                <BasicSelect
                    className={styles.formGroup}
                    name="name"
                    value={formData.name || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    label="Название компании"
                />

                <BasicSelect
                    className={styles.formGroup}
                    searchable
                    allowAdds
                    list={regions}
                    name="region"
                    value={formData.region || ''}
                    onChange={(value) => {
                        setFormData(prev => ({ ...prev, region: value }))
                        updateCitiesDropdownList(value)
                    }}
                    label="Регион"
                />

                <BasicSelect
                    className={styles.formGroup}
                    searchable
                    allowAdds
                    list={cities}
                    name="city"
                    value={formData.city || []}
                    onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                    label="Город"
                />

                <BasicSelect
                    className={styles.formGroup}
                    name="address"
                    value={formData.address || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
                    label="Адрес"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="tel"
                    name="phone1"
                    value={formData.phone1 || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone1: value }))}
                    label="Телефон 1"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="tel"
                    name="phone2"
                    value={formData.phone2 || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone2: value }))}
                    label="Телефон 2"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, whatsapp: value }))}
                    label="WhatsApp"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="tel"
                    name="telegram"
                    value={formData.telegram || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, telegram: value }))}
                    label="Telegram"
                />

                {emailInputs?.map((email, index) => (
                    <BasicSelect
                        key={index}
                        className={styles.formGroup}
                        type="email"
                        name={`email-${index}`}
                        value={email.mail}
                        onChange={(value) => handleEmailChange(index, value)}
                        label={`Email ${index + 1}`}
                        // Показываем кнопку добавления только в последнем инпуте
                        showAddButton={index === emailInputs.length - 1 || emailInputs.length === 1}
                        onAdd={addEmailInput}
                    />
                ))}

                <BasicSelect
                    className={styles.formGroup}
                    type="url"
                    name="url"
                    value={formData.url || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, url: value }))}
                    label="Сайт"
                />

                <BasicSelect
                    className={styles.formGroup}
                    multiple={false}
                    list={types}
                    name="type"
                    value={formData.type || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    label="Тип компании"
                />

                {isDealer && (
                    <BasicSelect
                        className={styles.formGroup}
                        multiple={true}
                        searchable
                        list={recyclers}
                        name="recyclers"
                        value={formData.recyclers || []}
                        onChange={(value) => setFormData(prev => ({ ...prev, recyclers: value }))}
                        label="Работает с переработчиками"
                    />
                )}

                <BasicSelect
                    className={styles.formGroup}
                    multiple={false}
                    list={statuses}
                    name="status"
                    value={formData.status || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    label="Статус компании"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="number"
                    name="tt"
                    value={formData.tt || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, tt: value }))}
                    label="Торговых точек"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="number"
                    name="dealers"
                    value={formData.dealers || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, dealers: value }))}
                    label="Дилеров"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="firm"
                    value={formData.firm || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, firm: value }))}
                    label="Юрлицо"
                />

                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="description"
                    value={formData.description || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    label="Примечание"
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

export default CompanyEditForm;

