import axios from 'axios';
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CompanyEditForm.module.css';
import BasicSelect from './Select.jsx'
import { DataContext } from '../../DataContext.jsx';
import { useNotification } from '../../components/notifications/NotificationContext.jsx';
import { useRegions } from '../../hooks/useRegions';
import { useQuery, useQueryClient, useIsFetching  } from '@tanstack/react-query';
const CompanyEditForm = () => {
    const { state: company } = useLocation();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ ...company });
    const [focusedFields, setFocusedFields] = useState({});
    const [isDealer, setIsDealer] = useState(false)
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const [recyclers, setRecyclers] = useState([]);
    const tg = window.Telegram.WebApp;
    const { regions: contextRegions, types, statuses, chat_id } = useContext(DataContext);
    const formDataRef = useRef(formData);
    const { showNotification } = useNotification();
    const { regionsWithCompanies } = useRegions(chat_id);
    const isFetching = useIsFetching(['regions'])

     tg.BackButton.isVisible = true;
    console.log('regionsWithCompanies', regionsWithCompanies);
    useEffect(() => {
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
                    navigate(`/companies/${company.id}`, { state: company });
                }
            });
        };

        initBackButton();
        window.addEventListener('focus', initBackButton);

        return () => {
            if (tg) {
                tg.BackButton.offClick();
                tg.BackButton.hide();
            }
            window.removeEventListener('focus', initBackButton);
        };
    }, [company, navigate, tg]);

    useEffect(() => {
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);


    const handleSave = useCallback(async () => {
        // tg.MainButton.showProgress()
        try {
            const currentFormData = formDataRef.current;
            console.log('Current form data:', currentFormData);
             navigate(`/companies/${currentFormData.id}`, { state: currentFormData });
            const params = {
                chatID: chat_id,
                api: 'updateCompany',
                company: currentFormData,
            };
            
            const response = await axios.post(
                process.env.REACT_APP_GOOGLE_SHEETS_URL,
                JSON.stringify(params)
            );
           
            if (response.status === 200) {
                await queryClient.invalidateQueries({ queryKey: ['regions'] })
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
    }, [chat_id, isFetching, navigate, queryClient, showNotification]);

    
           
      
    useEffect(() => {
        if (!company) {
            navigate('/companies');
            return;
        }
        tg.setBottomBarColor("#131313")
        // Инициализация Telegram кнопки
        tg.MainButton.setText('Сохранить');
        tg.MainButton.show();
        tg.MainButton.onClick(handleSave);
        console.log(tg.MainButton)

        return () => {
            tg.MainButton.offClick(handleSave);
            tg.MainButton.hide();
        };
    }, [company, handleSave, navigate, tg]);

    useEffect(() => {
        formData.type?.toLowerCase() === 'дилер' ? setIsDealer(true) : setIsDealer(false)
    }, [formData])

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
        if (formData.type === 'Дилер' && regionsWithCompanies) {
            const recyclers = [];
            regionsWithCompanies.forEach(region => {
                region.companies.forEach(company => {
                    if (company.type === 'Переработчик' && company.name.length > 0 && !recyclers.includes(company.name)) {
                        recyclers.push(company.name);
                    }
                })
            });

            setRecyclers(recyclers.sort());
        } else {
            setRecyclers([]);
        }
    }, [formData.type, regionsWithCompanies]);

    // Update ref whenever formData changes
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    

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

            <div className={styles.formContainer}>
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