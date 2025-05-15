import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CompanyEditForm.module.css';
import BasicSelect from './Select.jsx'
import { DataContext } from '../../DataContext';

const CompanyEditForm = () => {
    const { state: company } = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ ...company });
    const [focusedFields, setFocusedFields] = useState({});
    const [isDealer, setIsDealer] = useState(false)
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const tg = window.Telegram.WebApp;
    const { regions: contextRegions } = useContext(DataContext);
    


    useEffect(() => {
        if (!contextRegions) return;
        const regions = contextRegions.map(item => (item.region));
        setRegions(regions);
    }, [contextRegions]);


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

        return () => {
            tg.MainButton.offClick(handleSave);
            tg.MainButton.hide();
        };
    }, [company, navigate, tg]);

    useEffect(() => {
        formData.type?.toLowerCase() === 'дилер' ? setIsDealer(true) : setIsDealer(false)
    }, [formData])

    useEffect(() => {
        if (formData.region && sessionStorage.getItem('regionsWithCompanies')) {
            const savedRegions = JSON.parse(sessionStorage.getItem('regionsWithCompanies'));
            const selectedRegion = savedRegions.find(item => item.region === formData.region);
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
    }, [formData.region]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFocus = (fieldName) => {
        setFocusedFields(prev => ({ ...prev, [fieldName]: true }));
    };

    const handleBlur = (fieldName) => {
        if (!formData[fieldName]) {
            setFocusedFields(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleSave = () => {
        // Здесь должна быть логика сохранения данных
        console.log('Saving data:', formData);

        // После сохранения возвращаемся назад
        navigate(`/companies/${company.id}`, { state: formData });
    };

    if (!company) {
        return <div className={styles.container}>Компания не найдена</div>;
    }

    const loadedRecyclers = [
        'Oliver Hansen',
        'Van Henry',
        'April Tucker',
        'Ralph Hubbard',
        'Omar Alexander',
        'Carlos Abbott',
        'Miriam Wagner',
        'Bradley Wilkerson',
        'Virginia Andrews',
        'Kelly Snyder',
    ];

    const companyTypes = [
        { value: "переработчик", label: "Переработчик" },
        { value: "дистрибьютор", label: "Дистрибьютор" },
        { value: "дилер", label: "Дилер" },
        { value: "смешанный", label: "Смешанный" },
        { value: "избранный", label: "Избранный" },
    ];

    const companyStatuses = [
        { value: "работает", label: "Работает" },
        { value: "не работает", label: "Не работает" },
        { value: "уточнить тел.", label: "Уточнить тел." },
    ];
    console.log('cities', cities)
    // console.log('regions', regions)
    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <span className={styles.nameAndIcon}>
                    Редактирование
                </span>
            </div>

            <div className={styles.formContainer}>
                <BasicSelect
                    className={styles.formGroup}
                    multiple={false}
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
                    value={formData.city || ''}
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
                    list={companyTypes.map(option => option.label)}
                    name="type"
                    value={formData.type || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    label="Тип компании"
                />

                {isDealer && (
                    <BasicSelect
                        className={styles.formGroup}
                        multiple={true}
                        list={loadedRecyclers}
                        name="recyclers"
                        value={formData.recyclers || []}
                        onChange={(value) => setFormData(prev => ({ ...prev, recyclers: value }))}
                        label="Работает с переработчиками"
                    />
                )}

                <BasicSelect
                    className={styles.formGroup}
                    multiple={false}
                    list={companyStatuses.map(option => option.label)}
                    name="status"
                    value={formData.status || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    label="Статус компании"
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

                 <BasicSelect
                    className={styles.formGroup}
                    type="text"
                    name="description"
                    value={formData.description || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    label="Примечание"
                    rows="3"
                />
            </div>
        </div>
    );
};

export default CompanyEditForm;