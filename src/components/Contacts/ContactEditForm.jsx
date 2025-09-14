import axios from 'axios';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../Companies/CompanyEditForm.module.css';
import BasicSelect from '../Companies/Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useNotification } from '../notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions.js';
import { useEmail } from '../../hooks/useEmail';
import { v4 as uuidv4 } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useQueryClient, useIsFetching } from '@tanstack/react-query';
const ContactEditForm = () => {
    const { email } = useContext(DataContext);
    const { state: contact } = useLocation();
    const isNewContact = contact?.new === true; // Явный флаг
    console.log('isNewContact', isNewContact);
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
    const { regionsWithCompanies } = useRegions(chat_id);
    const isFetching = useIsFetching(['regions'])
    const [emailInputs, setEmailInputs] = useState([]);
    const id = contact?.id;
    tg.BackButton.isVisible = true;
    
    console.log('contact.relative', contact.prevComponent);
    // console.log('regionsWithCompanies', regionsWithCompanies);
    
    const { contactMails, isContactsMailsLoading, error } = useEmail(null, id, isNewContact);

    

    useEffect(() => {
        if(contactMails.length > 0)
        setEmailInputs(contactMails);
    else{
        setEmailInputs([{id: uuidv4(), mail: ''}]);
    }
    }, [contactMails]);
    const addEmailInput = () => {
        setEmailInputs(prev => [...prev, {id: uuidv4(), mail: ''}]);
    };

    const handleEmailChange = (index, value) => {
        setEmailInputs(prev => {
            const newEmails = [...prev];
            const id = newEmails[index].id;
            newEmails[index] = {id: id, mail: value};
            return newEmails;
        });
    };

    

    


    useEffect(() => {
        formData.manager = email;
        contact.manager = email;
    }, []);

    // useEffect(() => {
    //     formDataRef.current = formData;
    // }, [formData]);

    useEffect(() => {
        const hasChanged = Object.keys(formData).some((key) => formData[key] !== contact[key]);
        setHasChanged(hasChanged);
        console.log('hasChanged', hasChanged);
    }, [formData, contact]);

    useEffect(() => {
        const initBackButton = () => {
            if (!tg) return;
            
            tg.ready();
            tg.BackButton.isVisible = true;
            tg.BackButton.show();
             tg.BackButton.onClick(() => navigate(contact.path || '/contacts/', 
        {state: contact.prevComponent}, { replace: true }));
        };

        initBackButton();
        return () => {
      tg.BackButton.offClick();
    };
        // window.addEventListener('focus', initBackButton);

        // return () => {
        //     if (tg) {
        //         tg.BackButton.offClick();
        //         tg.BackButton.hide();
        //     }
        //     window.removeEventListener('focus', initBackButton);
        // };
    }, [contact, navigate, tg]);

    useEffect(() => {
        setRegionList(regionsWithCompanies.reduce((acc, region) => {
            acc.push(region.region)
            return acc;
        }, []));
    }, [regionsWithCompanies],);

    useEffect(() => {
        setCompaniesList(regionsWithCompanies.reduce((acc, region) => {
            if (region.region === formData.region) {
                region.companies.forEach(company => {
                    acc.push(company)
                })
            }
            return acc;

        }, []));
    }, [formData.region, regionsWithCompanies],);

    useEffect(() => {
        if (formData.companyId && (formData.firstName.length + formData.lastName.length > 0)) {
            formDataRef.current = formData;
            setAllowSave(true);
        }
        else {
            setAllowSave(false);
            tg.MainButton.setText('Для сохранения заполните поля')
        }
    }, [formData, tg.MainButton]);

    useEffect(() => {
        const nonEmptyEmails = emailInputs.reduce((acc, email) => {
            if (email.mail.trim() !== '') {
                acc.push(email);
            }
            return acc;
        }, []);
        console.log('nonEmptyEmails', nonEmptyEmails);
        setFormData(prev => ({ ...prev, emails: nonEmptyEmails }));
    },[emailInputs]);

    //    console.log('regionList', regionList);

    const handleSave = useCallback(async () => {
        // Фильтруем пустые email адреса
        
        
        if (!allowSave) return
        if (!hasChanged) {
             navigate(contact.path || '/contacts/', 
        {state: contact.prevComponent || {}}, { replace: true })
            showNotification(`Данные не изменились`, true);
            return
        }
        try {
            const currentFormData = formDataRef.current;
             navigate(contact.path || '/contacts/', 
        {state: contact.prevComponent || {}}, { replace: true })
            
            // console.log('Current form data:', currentFormData);
            
            //  navigate(`/companies/${currentFormData.id}`, { state: currentFormData });
            const params = {
                chatID: chat_id,
                api: 'updateContact',
                contact: currentFormData,
            };

            const response = await axios.post(
                process.env.REACT_APP_GOOGLE_SHEETS_URL,
                JSON.stringify(params)
            );

            if (response.status === 200) {
                await queryClient.invalidateQueries({ queryKey: ['contacts'] })
                await queryClient.invalidateQueries({ queryKey: ['emails', null, contact.id, isNewContact] }); //
            } else {
                console.error('Error saving:', response);
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            // tg.MainButton.hideProgress();
            console.log('isFetching', isFetching)
            showNotification(`Данные сохранены успешно!`, true);

        }
        
    }, [allowSave, chat_id, contact.id, contact.path, contact.prevComponent, hasChanged, isFetching, isNewContact, navigate, queryClient, showNotification]);




    useEffect(() => {
        if (!contact) {
            navigate('/companies');
            return;
        }
        tg.setBottomBarColor("#131313")
        allowSave ? tg.MainButton.setText('Сохранить')
            : tg.MainButton.setText('Для сохранения заполните поля');;

        tg.MainButton.show();
        tg.MainButton.onClick(handleSave);
        console.log(tg.MainButton)

        return () => {
            tg.MainButton.offClick(handleSave);
            tg.MainButton.hide();
        };
    }, [allowSave, contact, handleSave, navigate, tg]);

    // Update ref whenever formData changes
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);



    if (!contact) {
        return <div className={styles.container}>Контакт не найден</div>;
    }
    // console.log('formData', formData)
    // console.log('companiesList', companiesList.length)
    console.log('contact', contact)
    console.log('formData', formData)
    console.log('hasChanged', hasChanged)
    console.log('emailInputs', emailInputs)

    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <span className={styles.nameAndIcon}>
                    {contact.new === true ? "Новый контакт" : "Редактирование"}
                </span>
            </div>

            <div className={styles.formContainer}>

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