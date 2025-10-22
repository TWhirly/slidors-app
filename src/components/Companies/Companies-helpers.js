import styles from './Companies.module.css'
import { YellowStarIcon } from '../../icons/SVG';
import { v4 as uuidv4 } from 'uuid';

const tg = window.Telegram.WebApp;
const phoneIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a'
  const whatsappIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197'
  const telegramIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  const emailIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fmail.png?alt=media&token=983b34be-ca52-4b77-9577-ff4c5b26806c'

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

export  const getContactIcons = (contact) => {
    const icons = [];
    if (contact.phone1) {
      icons.push(
        <img
          key="phone1"
          src={phoneIcon}
          className={styles.contactPhone}
          alt="Phone icon"
          onClick={() => window.location.href = `tel:${contact.phone1}`}
          style={{ cursor: 'pointer' }}
        />
      );
    }

    if (contact.phone2) {
      icons.push(
        <img
          key="phone2"
          src={phoneIcon}
          className={styles.contactPhone}
          alt="Phone icon"
          onClick={() => window.location.href = `tel:${contact.phone2}`}
          style={{ cursor: 'pointer' }}
        />
      );
    }

    if (contact.whatsapp) {
      icons.push(
        <img
          key="whatsapp"
          src={whatsappIcon}
          className={styles.contactPhone}
          alt="WhatsApp icon"
          onClick={() => tg.openLink(`https://wa.me/${formatNumber(contact.whatsapp)}`)}
          style={{ cursor: 'pointer' }}
        />
      );
    }

    if (contact.telegram) {
      icons.push(
        <img
          key="telegram"
          src={telegramIcon}
          className={styles.contactPhone}
          alt="Telegram icon"
          onClick={() => window.location.href = `https://t.me/${contact.telegram}`}
          style={{ cursor: 'pointer' }}
        />
      );
    }
    return icons;
  }

  export const formatNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.startsWith('8')) {
      return '7' + cleanNumber.slice(1);
    }
    if (cleanNumber.startsWith('7')) {
      return cleanNumber;
    }
    return '7' + cleanNumber;
  };

  export const mainContactsIcons = {
    phoneIcon: 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a',
  whatsappIcon: 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197',
  telegramIcon: 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  }