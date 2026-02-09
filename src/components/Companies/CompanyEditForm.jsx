import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './CompanyEditForm.module.css';
import BasicSelect from './Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useCompanyUpdate } from '../../hooks/useCompanyUpdate';
import { useRegions } from '../../hooks/useRegions';
import { useEmail } from '../../hooks/useEmail';
import { initBackButton } from './Companies-helpers.js';
import { useTelegram } from '../../hooks/useTelegram.js';
import { replace } from 'lodash';
let cities = []
const CompanyEditForm = () => {
    console.log('first render')
    const { state: company } = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ ...company });
    const formDataRef = useRef(formData);
    const [regions, setRegions] = useState([]);
    const [recyclers, setRecyclers] = useState([]);
    const { regions: contextRegions, types, statuses, chat_id, provided } = useContext(DataContext);
    const {optimisticUpdateCompany, upload, saving} = useCompanyUpdate(chat_id);
    const { companies } = useRegions(chat_id);
    const [emailInputs, setEmailInputs] = useState([]);
    const { tg, showButton } = useTelegram();
    const id = company.id;
    const { emails } = useEmail(id, null);
    const initEmails = emails
    const [isValid, setIsValid] = useState(false)
    const uploadRef = useRef(upload)
    
    console.log('isValid', isValid)

   
    useEffect(() => {
        console.log('effect 1')
        // if (!emailInputs || !initEmails)
        //         return
            const hasChanged = Object.keys(formData)
                .filter(key => key !== 'recyclers' && key !== 'emails')
                .some((key) => formData[key] !== company[key]) ||
                emailInputs.map((email) => email.email).join() !== initEmails.map((email) => email.email).join()
            const isRequiredFilled = formData?.name.trim() !== '' && formData.region.length > 0;
            setIsValid(hasChanged && isRequiredFilled)
    },[company, emailInputs, formData, initEmails])

    useEffect(() => {
        console.log('effect 2')
        formDataRef.current = formData;
    }, [formData]);
    tg.setBottomBarColor("#131313");
    
    initBackButton(company, navigate, id);

    const handleSave = useCallback(() => {
        console.log('Saving')
        const currentFormData = formDataRef.current
        try {
            uploadRef.current(currentFormData)
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [])

    const handleSaveRef = useRef(handleSave)

    useEffect(() => {
        console.log('useEffect wo dep array')
        handleSaveRef.current = handleSave
        uploadRef.current = upload
    },[])

    const updateCities = (region) => { 
        console.log('effect 4')
        if (region !== '') {
                const citiesSet = new Set(companies.filter(company => company.region === region && company.city !== '')
                    .map(company => { return company.city }))
                cities = Array.from(citiesSet).sort((a, b) => a.toLowerCase().localeCompare(b, 'ru'))
            } else {
                cities = [];
            }
        }
    
        

    useEffect(() => {
        console.log('effect 5')
        if (formData.type === 'Дилер') {
            setRecyclers(companies.filter(company => company.type === 'Переработчик')
                .map(company => { return company.name })
                .sort((a, b) => a.toLowerCase().localeCompare(b, 'ru')));
        } else {
            setRecyclers([]);
        }
    }, [companies, formData.type]);

    useEffect(() => {

         const validateForm = () => {
            if (!emailInputs || !formData.emails)
                return false
            const hasChanged = Object.keys(formData)
                .filter(key => key !== 'recyclers' && key !== 'emails')
                .some((key) => formData[key] !== company[key]) ||
                emailInputs.map((email) => email.email).join() !== formData.emails.map((email) => email.email).join()
            const isRequiredFilled = formData?.name.trim() !== '' && formData.region.length > 0;
            return (hasChanged && isRequiredFilled)
        }
        const isValid = validateForm();
        showButton({
            text: isValid ? 'Сохранить' : 'Для сохранения заполните поля',
            // color: '#31b545',
            isActive: isValid,
            isVisible: true,
            onClick: isValid ? handleSaveRef.current : {},
        });
    },[company, emailInputs, formData, handleSave, isValid, showButton])

    useEffect(() => {
        console.log('effect 6')
        if (!emails || emails.length === 0)
            return
        const mails = emails.filter(item => item.company === id)

        const nonEmptyEmails = mails.reduce((acc, email) => {
            if (email.mail?.trim() !== '') {
                acc.push(email);
            }
            return acc;
        }, []);
        nonEmptyEmails.length === 0 ? setEmailInputs([...nonEmptyEmails, '']) : setEmailInputs(nonEmptyEmails)
        setFormData(prev => ({ ...prev, emails: nonEmptyEmails }));
       
    }, [emails, id])

    const addEmailInput = () => {
        setEmailInputs(prev => [...prev, { id: uuidv4(), email: '', company: id, region: formData.region }]);
    };

    const handleEmailChange = (index, value) => {
        setEmailInputs(prev => {
            const newEmails = [...prev];
            const mailId = newEmails[index].id;
            newEmails[index] = { id: mailId, email: value, company: id, region: formData.region };
            setFormData(prev => ({ ...prev, emails: newEmails }));
            return newEmails;
        });
    };

    useEffect(() => {
        console.log('effect 7')
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);

    updateCities(formData.region)

    if (!company) {
        return <div className={styles.container}>Компания не найдена</div>;
    }

    return (
        <div className={styles.container}
        >
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

