import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CompanyEditForm.module.css';
import BasicSelect from './Select.jsx'

const CompanyEditForm = () => {
    const { state: company } = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ ...company });
    const [focusedFields, setFocusedFields] = useState({});
    const [isDealer, setIsDealer] = useState(false)
    const tg = window.Telegram.WebApp;

    useEffect(() => {
        if (!company) {
            navigate('/companies');
            return;
        }

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

    const companyTypes = [
        { value: "", label: "Выберите тип" },
        { value: "переработчик", label: "Переработчик" },
        { value: "дистрибьютор", label: "Дистрибьютор" },
        { value: "дилер", label: "Дилер" },
        { value: "смешанный", label: "Смешанный" },
        { value: "избранный", label: "Избранный" },
    ];

    const companyStatuses = [
        { value: "", label: "Выберите статус" },
        { value: "работает", label: "Работает" },
        { value: "не работает", label: "Не работает" },
        { value: "уточнить тел.", label: "Уточнить тел." },
    ];
    console.log('formData', formData)
    return (
        <div className={styles.container}>
            <div className={styles.naviPanel}>
                <span className={styles.nameAndIcon}>
                    Редактирование
                </span>
            </div>

            <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.name || formData.name ? styles.labelFocused : ''}`}>
                        Название компании
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={() => handleBlur('name')}
                        className={styles.input}
                        placeholder={!focusedFields.name && !formData.name ? 'Название компании' : ''}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.region || formData.region ? styles.labelFocused : ''}`}>
                        Регион
                    </label>
                    <input
                        type="text"
                        name="region"
                        value={formData.region || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('region')}
                        onBlur={() => handleBlur('region')}
                        className={styles.input}
                    />
                </div>

                 <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.city || formData.city ? styles.labelFocused : ''}`}>
                        Город
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('city')}
                        onBlur={() => handleBlur('city')}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.address || formData.address ? styles.labelFocused : ''}`}>
                        Адрес
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('address')}
                        onBlur={() => handleBlur('address')}
                        className={styles.input}
                    />
                </div>

                
                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.phone1 || formData.phone1 ? styles.labelFocused : ''}`}>
                        Телефон 1
                    </label>
                    <input
                        type="tel"
                        name="phone1"
                        value={formData.phone1 || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('phone1')}
                        onBlur={() => handleBlur('phone1')}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.phone2 || formData.phone2 ? styles.labelFocused : ''}`}>
                        Телефон 2
                    </label>
                    <input
                        type="tel"
                        name="phone2"
                        value={formData.phone2 || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('phone2')}
                        onBlur={() => handleBlur('phone2')}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.whatsapp || formData.whatsapp ? styles.labelFocused : ''}`}>
                        WhatsApp
                    </label>
                    <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('whatsapp')}
                        onBlur={() => handleBlur('whatsapp')}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.telegram || formData.telegram ? styles.labelFocused : ''}`}>
                        Telegram
                    </label>
                    <input
                        type="tel"
                        name="telegram"
                        value={formData.telegram || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('telegram')}
                        onBlur={() => handleBlur('telegram')}
                        className={styles.input}
                    />
                </div>

                 <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.url || formData.url ? styles.labelFocused : ''}`}>
                        Сайт
                    </label>
                    <input
                        type="url"
                        name="url"
                        value={formData.url || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('url')}
                        onBlur={() => handleBlur('url')}
                        className={styles.input}
                    />
                </div>

                 <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.logo || formData.logo ? styles.labelFocused : ''}`}>
                        Логотип
                    </label>
                    <input
                        type="text"
                        name="logo"
                        value={formData.logo || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('logo')}
                        onBlur={() => handleBlur('logo')}
                        className={styles.input}
                    />
                </div>

                

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.type || formData.type ? styles.labelFocused : ''}`}>
                        Тип компании
                    </label>
                    <select
                        name="type"
                        value={formData.type || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('type')}
                        onBlur={() => handleBlur('type')}
                        className={styles.inputSelect}
                    >
                        {companyTypes.map(option => (
                            <option key={option.value} value={option.value}
                            className={styles.option}
                            >
                                {option.label} 
                            </option>
                        ))}
                    </select>
                </div>

                {isDealer && (<BasicSelect
                label="Работает с переработчиками"
                ></BasicSelect>)}

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.status || formData.status ? styles.labelFocused : ''}`}>
                        Статус
                    </label>
                    <select
                        name="status"
                        value={formData.status || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('status')}
                        onBlur={() => handleBlur('status')}
                        className={styles.inputSelect}
                    >
                        {companyStatuses.map(option => (
                            <option key={option.value} value={option.value}
                            className={styles.option}
                            >
                                {option.label} 
                            </option>
                        ))}
                    </select>
                </div>

                

               


                

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.manager || formData.manager ? styles.labelFocused : ''}`}>
                        Менеджер
                    </label>
                    <input
                        type="text"
                        name="manager"
                        value={formData.manager || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('manager')}
                        onBlur={() => handleBlur('manager')}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={`${styles.label} ${focusedFields.description || formData.description ? styles.labelFocused : ''}`}>
                        Примечание
                    </label>
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        onFocus={() => handleFocus('description')}
                        onBlur={() => handleBlur('description')}
                        className={`${styles.input} ${styles.textarea}`}
                        rows="3"
                    />
                </div>
            </div>
        </div>
    );
};

export default CompanyEditForm;