import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './CompanyEditForm.module.css';
import BasicSelect from './Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useRegions } from '../../hooks/useRegions';
import { useEmail } from '../../hooks/useEmail';
import { initBackButton } from './Companies-helpers.js';
import { useTelegram } from '../../hooks/useTelegram.js';
let cities = []
const CompanyEditForm = () => {
    console.log('first render')
    const { state: {company , from} } = useLocation();
    const navigate = useNavigate();
    
   
    const [regions, setRegions] = useState([]);
    const [recyclers, setRecyclers] = useState([]);
    const { regions: contextRegions, types, statuses, chat_id } = useContext(DataContext);
    const { companies, updateCompany } = useRegions(chat_id);
    const [formData, setFormData] = useState({ ...company });
    const [emailInputs, setEmailInputs] = useState([]);
    const { tg , showButton} = useTelegram();
    console.log('company', company)
    const id = company.id;
    const { emails, updateEmails } = useEmail(id, null);
     const formDataRef = useRef(formData);

    useEffect(() => {
    tg.setBottomBarColor("#131313");
    },[tg])

    const isEmailsUpdated = useCallback(() => {
        return (emailInputs.map((email) => email.email).join() !== formData.emails.map((email) => email.email).join())
    }, [emailInputs, formData.emails])

    // initBackButton(company, navigate, id);
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;
        tg.BackButton.onClick(() => navigate(from || (-1), {state: {companyId: id}}));
        return () => {
            tg.BackButton.offClick();
        };
    }, [from, id, navigate]);

    const handleSave = useCallback(async () => {
          const currentFormData = {...formDataRef.current, emails: emailInputs}
        try {
            console.log('current form data', currentFormData)
            navigate(`/companies/`)
            updateCompany(currentFormData, {
                onSuccess: () => {
                },
                onError: (error) => {
                    console.error('Company update failed:', error);
                }
            });
            if (isEmailsUpdated())
                updateEmails(currentFormData.emails)
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [emailInputs, isEmailsUpdated, navigate, updateCompany, updateEmails])

    const updateCities = (region) => {
        if (region !== '') {
            const citiesSet = new Set(companies.filter(company => company.region === region && company.city !== '')
                .map(company => { return company.city }))
            cities = Array.from(citiesSet).sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'))
        } else {
            cities = [];
        }
    }

    useEffect(() => {
        formDataRef.current = formData;
        if (formData.type === 'Дилер') {
            setRecyclers(companies.filter(company => company.type === 'Переработчик')
                .map(company => { return company.name })
                .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru')));
        } else {
            setRecyclers([]);
        }
    }, [companies, formData]);

    useEffect(() => {
        const validateForm = () => {
            if (!emailInputs || !formData.emails)
                return false
            const hasChanged = Object.keys(formData)
                .filter(key => key !== 'recyclers' && key !== 'emails')
                .some((key) => formData[key] !== company[key]) ||
                isEmailsUpdated()
            const isRequiredFilled = formData?.name.trim() !== '' && formData.region.length > 0;
            return (hasChanged && isRequiredFilled)
        }
        const isValid = validateForm();
        showButton({
            text: isValid ? 'Сохранить' : 'Для сохранения заполните поля',
            show: true,
            shineEffect: true,
            isActive: isValid,
            isVisible: true,
            onClick:  handleSave
        });

        return () => {
           tg.MainButton.offClick(handleSave)
        };

    }, [company, emailInputs, formData, handleSave, isEmailsUpdated, showButton, tg.MainButton])

    useEffect(() => {
        if (!emails || emails.length === 0)
            return
        const mails = emails.filter(item => item.company === id)

        const nonEmptyEmails = mails.reduce((acc, email) => {
            if (email.mail?.trim() !== '') {
                acc.push(email);
            }
            return acc;
        }, []);
        nonEmptyEmails.length === 0 ? setEmailInputs(['']) : setEmailInputs(nonEmptyEmails)
        setFormData(prev => ({ ...prev, emails: nonEmptyEmails }));
    }, [emails, id])

    const addEmailInput = () => {
        setEmailInputs(prev => [...prev, { id: uuidv4(), mail: '' }]);
    };

    const handleEmailChange = (index, value) => {
        setEmailInputs(prev => {
            const newEmails = [...prev];
            const id = newEmails[index].id;
            newEmails[index] = { id: id, email: value };
            
            return newEmails;
        });
    };

    useEffect(() => {
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);

    updateCities(formData.region)

    if (!company) {
        return <div className={styles.container}>Компания не найдена</div>;
    }

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
                        updateCities(value)
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
                        value={email.email}
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

                {recyclers.length > 0 && (
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

