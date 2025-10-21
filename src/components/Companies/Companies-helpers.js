import styles from './Companies.module.css'
import { YellowStarIcon } from '../../icons/SVG';
import { v4 as uuidv4 } from 'uuid';

export const checkIcons = {
    red: require('../../icons/checkedRed.png'),
    green: require('../../icons/checkedGreen.png'),
    blue: require('../../icons/checkedBlue.png'),
}

export  const getCompanyTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'переработчик':
                return (
                    <img
                        src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%9F%D0%B5%D1%80%D0%B5%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D1%87%D0%B8%D0%BA.png?alt=media&token=f4eb6919-adf9-40aa-9b72-a81212be7fba'}
                        alt="переработчик"
                        fill="#008ad1"
                        className={styles.factoryIcon}
                    />
                );
            case 'дистрибьютор':
                return (
                    <img
                        src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%94%D0%B8%D1%81%D1%82%D1%80%D0%B8%D0%B1%D1%8C%D1%8E%D1%82%D0%BE%D1%80.png?alt=media&token=89daba2b-628b-4abe-ad43-b6e49ebc2e65'}
                        alt="дистрибьютор"
                        fill="#008ad1"
                        className={styles.factoryIcon}
                    />
                );
            case 'дилер':
                return (
                    <img
                        src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%94%D0%B8%D0%BB%D0%B5%D1%80.png?alt=media&token=6b1f83ff-da70-4d7f-a191-eb391e8eeb35'}
                        alt="Дилер"
                        fill="#008ad1"
                        className={styles.factoryIcon}
                    />
                );
            case 'смешанный':
                return (
                    <img
                        src={'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2F%D0%A1%D0%BC%D0%B5%D1%88%D0%B0%D0%BD%D1%8B%D0%B9.png?alt=media&token=d41d243e-8ca4-474a-9b00-61bc25ce46af'}
                        alt="Смешанный"
                        fill="#008ad1"
                        className={styles.factoryIcon}
                    />
                );
            case 'избранный':
                return <YellowStarIcon className={styles.factoryIcon} />;
            default:
                return <></>;
        }
    };

export const getStatusColor = (status) => {
        if (status.toLowerCase().includes('уточнить'))
            return 'orange';
        switch (status?.toLowerCase()) {
            case 'работает':
                return 'lightgreen';
            case 'не работает':
                return 'var(--hintColor, #888)';
            case 'уточнить тел.':
                return 'orange';
            default:
                return 'var(--hintColor, #888)';
        }
    };

export const getEmptyCompany = (selectedRegion = '', email) => ({
        id: uuidv4(),
        name: '',
        type: '',
        status: '',
        city: '',
        address: '',
        region: selectedRegion,
        description: '',
        phone1: '',
        phone2: '',
        manager: email,
        whatsapp: '',
        telegram: '',
        recyclers: [],
        tt: '',
        dealers: '',
        url: '',
        logo: '',
        firm: '',
        emails: [{id: uuidv4(), mail: ''}],
        new: true
    });