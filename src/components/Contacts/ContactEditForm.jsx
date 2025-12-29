import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../Companies/CompanyEditForm.module.css';
import BasicSelect from '../Companies/Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useNotification } from '../notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions.js';
import { useEmail } from '../../hooks/useEmail';
import { useContacts } from '../../hooks/useContacts';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';
const ContactEditForm = () => {
    const { email } = useContext(DataContext);
    const { state: contact } = useLocation();
    const isNewContact = contact?.new === true; // Явный флаг
    // console.log('isNewContact', isNewContact);
    const navigate = useNavigate();


    const queryClient = useQueryClient();
    const [companiesList, setCompaniesList] = useState([]);
    const [regionList, setRegionList] = useState([]);
    const [formData, setFormData] = useState({ ...contact });
    const [allowSave, setAllowSave] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const tg = window.Telegram.WebApp;
    const { titles, chat_id } = useContext(DataContext);
    const formDataRef = useRef(formData);
    const { showNotification } = useNotification();
    const { companies } = useRegions(chat_id);
    const id = contact?.id;
    const [localEmailInputs, setLocalEmailInputs] = useState([]);
    tg.BackButton.isVisible = true;


    const { emails, isContactsMailsLoading, updateEmails } = useEmail(id, null);
    const { updateContact, optimisticUpdateContact } = useContacts(chat_id);

    

    useEffect(() => {
    if(!emails)
      return
    console.log('emails', emails)
    const mails = emails.filter(item => item.company === id)
    setLocalEmailInputs(mails)
  }, [emails, id])

    const addEmailInput = () => {
        setLocalEmailInputs(prev => [...prev, { id: uuidv4(), mail: '' }]);
    };

    const handleEmailChange = (index, value) => {
        setLocalEmailInputs(prev => {
            const newEmails = [...prev];
            const id = newEmails[index].id;
            newEmails[index] = { id: id, mail: value };
            return newEmails;
        });
        setHasChanged(true);
    };






    useEffect(() => {
        formData.manager = email;
        contact.manager = email;
    }, [contact, email, formData]);

    useEffect(() => {
         formDataRef.current = formData;
        const hasChanged = Object.keys(formData).some((key) => formData[key] !== contact[key]);
        setHasChanged(hasChanged);
        if (formData.companyId && (formData.firstName.length + formData.lastName.length > 0)) {
            formDataRef.current = formData;
            setAllowSave(true);
            tg.MainButton.enable();
            tg.MainButton.setText('Сохранить')
        }
        else {
            setAllowSave(false);
            tg.MainButton.disable();
            tg.MainButton.setText('Для сохранения заполните поля')
        }
    }, [formData, contact, tg.MainButton]);

    useEffect(() => {
        const initBackButton = () => {
            if (!tg) return;

            tg.ready();
            tg.BackButton.isVisible = true;
            tg.BackButton.show();
            tg.BackButton.onClick(() => navigate(contact.path || '/contacts/',
                { state: contact.prevActivityData ? contact.prevActivityData : { contactId: contact.id, companyId: contact.companyId } }));
        };

        initBackButton();
        return () => {
            tg.BackButton.offClick();
        };
       
    }, [contact, navigate, tg]);

    useEffect(() => {
         const regionSet = new Set(companies.map(company => {
            return company.region
         }))
         const regions = Array.from(regionSet)
       setRegionList(regions)
        setCompaniesList(companies.reduce((acc, company) => {
            if(company.region === formData.region)
                acc.push(company)
            return acc;
        }, [])
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name, 'ru')));
    }, [companies, formData.region]);

    useEffect(() => {
        
    }, [formData, tg.MainButton]);

    useEffect(() => {
        const nonEmptyEmails = localEmailInputs.filter(email => email.mail.trim() !== '');
        setFormData(prev => ({ ...prev, emails: nonEmptyEmails }));
    }, [localEmailInputs]);

    //    console.log('regionList', regionList);

    const handleSave = useCallback(async () => {
        if (!allowSave) return;
        if (!hasChanged) {
            navigate(contact.path || '/contacts/',
                { state: { id: id } }, { replace: true });
            showNotification(`Данные не изменились`, true);
            return;
        }

        try {
            const currentFormData = formDataRef.current;

            // 1. Сначала оптимистичное обновление
            optimisticUpdateContact(currentFormData, isNewContact);
            updateEmails(currentFormData.emails);

            // 2. Затем навигация (немедленно)
            navigate(contact.path || '/contacts/',
                { state: contact.prevActivityData ? contact.prevActivityData : { contactId: contact.id, companyId: contact.companyId } }, { replace: true })

            // 3. Фоновая отправка на сервер
            updateContact(currentFormData, {
                onSuccess: () => {
                    showNotification(`Данные сохранены успешно!`, true);
                    queryClient.invalidateQueries({ queryKey: ['emails', null, contact.id] });
                },
                onError: (error) => {
                    console.error('Contact update failed:', error);
                    showNotification(`Ошибка при сохранении контакта: ${error.message}`, false);
                    // Автоматический откат через onError в мутации
                }
            });

        } catch (error) {
            console.error('Save failed:', error);
            showNotification(`Ошибка при сохранении: ${error.message}`, false);
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
    }, [allowSave, contact.companyId, contact.id, contact.path, contact.prevActivityData, hasChanged, id, isNewContact, navigate, optimisticUpdateContact, queryClient, showNotification, updateContact, updateEmails]);


    useEffect(() => {
        console.log('effect 4 - Telegram init')
        tg.setBottomBarColor("#131313");
        tg.MainButton.show();
        tg.MainButton.onClick(handleSave);

        return () => {
            tg.MainButton.offClick(handleSave);
            tg.MainButton.hide();
        };
    }, [handleSave, tg]);

    // Update ref whenever formData changes
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);



    if (!contact) {
        return <div className={styles.container}>Контакт не найден</div>;
    }
    
    // console.log('contact formData', formData)
   
    // console.log('allowSave', allowSave)

    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <span className={styles.nameAndIcon}>
                    {contact.new === true ? "Новый контакт" : "Редактирование"}
                </span>
            </div>

            <div className={styles.formContainer}>

                <div>
                    Сфера нашего внимания
                    <input
                        id={contact.id}
                        type="checkbox"
                        checked={formData.snv !== ''}
                        value={formData.snv !== ''}
                        className={styles.contactCheckbox}
                        onChange={(value) => setFormData(prev => ({ ...prev, snv: formData.snv === '' ? '1' : '' }))}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                <BasicSelect
                    className={styles.formGroup}
                    searchable
                    list={regionList}
                    name="region"
                    value={formData.region || ''}
                    onChange={(value) => setFormData(prev => ({
                        ...prev,
                        region: value, company: '', companyName: '', companyId: null
                    }))}
                    label="Регион"
                />

                <BasicSelect
                    className={styles.formGroup}
                    disabled={companiesList.length === 0}
                    searchable
                    useObjects
                    list={companiesList}
                    name="region"
                    value={formData.companyName || ''}
                    onChange={(value, companyId) => setFormData(prev => ({ ...prev, companyName: value, companyId: companyId }))}
                    label="Компания"

                />

                <BasicSelect
                    className={styles.formGroup}
                    name="firstName"
                    value={formData.lastName || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                    label="Фамилия"
                />

                <BasicSelect
                    className={styles.formGroup}
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                    label="Имя"
                />

                <BasicSelect
                    className={styles.formGroup}
                    name="firstName"
                    value={formData.surname || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, surname: value }))}
                    label="Отчество"
                />

                <BasicSelect
                    className={styles.formGroup}
                    name="title"
                    list={titles}
                    value={formData.title || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    label="Должность"
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



                {localEmailInputs?.map((email, index) => (
                    <BasicSelect
                        key={index}
                        className={styles.formGroup}
                        type="email"
                        name={`email-${index}`}
                        value={email.mail}
                        onChange={(value) => handleEmailChange(index, value)}
                        label={`Email ${index + 1}`}
                        // Показываем кнопку добавления только в последнем инпуте
                        showAddButton={index === localEmailInputs.length - 1 || localEmailInputs.length === 1}
                        onAdd={addEmailInput}
                    />
                ))}


                <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="description"
                    value={formData.note || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, note: value }))}
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

export default ContactEditForm;