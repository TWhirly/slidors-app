import axios from 'axios';
import React, { useState, useEffect, useContext, useRef, useCallback, useMemo} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './CompanyEditForm.module.css';
import BasicSelect from './Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useNotification } from '../../components/notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions';
import { useQueryClient } from '@tanstack/react-query';
import { useEmail } from '../../hooks/useEmail';
const CompanyEditForm = () => {
    const { state: company } = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ ...company });
    const isNewComapny = company?.new === true;
    const [isDealer, setIsDealer] = useState(false)
    const [regions, setRegions] = useState([]);
    const [companiesNames, setCompaniesNames] = useState([]);
    const [cities, setCities] = useState([]);
    const [recyclers, setRecyclers] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);
    const [allowSave, setAllowSave] = useState(false);
    const { regions: contextRegions, types, statuses, chat_id } = useContext(DataContext);
    const formDataRef = useRef(formData);
    const { showNotification } = useNotification();
    const { transformToRegionsWithCompanies , companies , optimisticUpdateCompany, updateCompany} = useRegions(chat_id);
    const [emailInputs, setEmailInputs] = useState([]);
    const tgRef = useRef(window.Telegram.WebApp);
    const tg = tgRef.current;
    const id = company.id;
    const { contactMails , updateEmails } = useEmail(id, null, isNewComapny)

    // const regionsWithCompanies = useMemo(() => {
    //     return transformToRegionsWithCompanies(companies)
    // }, [companies, transformToRegionsWithCompanies])

    const regionsWithCompanies = transformToRegionsWithCompanies(companies)

    console.log('regionsWithCompanies', regionsWithCompanies);
    useEffect(() => {
        console.log('effect 1')
        const initBackButton = () => {
            if (!tg) return;

            tg.ready();
            tg.BackButton.isVisible = true;
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                // Return to list if company.new === true (new company) or to details if editing
                if (company?.new) {
                    navigate('/companies');
                } else {
                    navigate(company.path || `/companies/${company.id}`, { state: {companyId: id} });
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
    }, [company, id, navigate, tg]);

     useEffect(() => {
        
        console.log('effect 2')
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
            console.log('effect 3')
                const nonEmptyEmails = emailInputs.reduce((acc, email) => {
                    if (email.mail.trim() !== '') {
                        acc.push(email);
                    }
                    return acc;
                }, []);
                console.log('nonEmptyEmails', nonEmptyEmails);
                setFormData(prev => ({ ...prev, emails: nonEmptyEmails }));
            },[emailInputs]);

    useEffect(() => {
        console.log('effect 4')
        formDataRef.current = formData;
        const hasChanged = Object.keys(formData).some((key) => formData[key] !== company[key]);
        setHasChanged(hasChanged);
        formData.type?.toLowerCase() === 'дилер' ? setIsDealer(true) : setIsDealer(false)
        console.log('hasChanged', hasChanged);
        if (formData?.name.trim() !== '' && formData.region.length > 0) {
            formDataRef.current = formData;
            setAllowSave(true);
            tg.MainButton.setText('Сохранить');
        }
        else {
            setAllowSave(false);
            tg.MainButton.setText('Для сохранения заполните поля')
        }
    }, [formData, company, tg.MainButton]);

    useEffect(() => {
        console.log('effect 6')
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);


    const handleSave = useCallback(async () => {
        console.log('effect 7')
        const currentFormData = formDataRef.current;
        console.log('Current form data:', formData);
        if (!allowSave) return
        if (!hasChanged) {
            navigate(company.path || `/companies/${company.id}`, { state: {companyId: company.id} });
            showNotification(`Данные не изменились`, true);
            return
        }
        try {
            console.log('Current form data:', currentFormData);
            optimisticUpdateCompany(currentFormData, isNewComapny)
            updateEmails(currentFormData.emails);
            navigate(company.path || `/companies/${company.id}`, { state: {companyId: id} })
           updateCompany(currentFormData, {
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
    }, [allowSave, company.id, company.path, formData, hasChanged, id, isNewComapny, navigate, optimisticUpdateCompany, queryClient, showNotification, updateCompany, updateEmails]);




    useEffect(() => {
        console.log('effect 8')
    if (!company) {
        navigate('/companies');
        return;
    }
    
    tg.setBottomBarColor("#131313");
    tg.MainButton.show();
    tg.MainButton.onClick(handleSave);

    return () => {
        tg.MainButton.offClick(handleSave);
        tg.MainButton.hide();
    };
}, [company, handleSave, navigate, tg]);

    useEffect(() => {
        console.log('effect 9')
        
    }, [formData])

    useEffect(() => {
        console.log('effect 10')
        if (formData.region) {
            const citiesSet =  new Set(companies.filter(company => company.region === formData.region && company.city !== '')
            .map(company => {return company.city}))
            const cities = Array.from(citiesSet)
            setCities(cities.sort((a, b) => a.toLowerCase().localeCompare(b, 'ru')))
        } else {
            setCities([]);
        }
    }, [companies, formData.region]);

    useEffect(() => {
        console.log('effect 11')
        if (formData.type === 'Дилер') {
            const recyclers = companies.filter(company => company.type === 'Переработчик')
            .map(company => {return company.name})
            setRecyclers(recyclers.sort((a, b) => a.toLowerCase().localeCompare(b, 'ru')));
        } else {
            setRecyclers([]);
        }
    }, [companies, formData.type]);

  
  



    if (!company) {
        return <div className={styles.container}>Компания не найдена</div>;
    }
    console.log('regions', regions)
    console.log('company', company)

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
                    onChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
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