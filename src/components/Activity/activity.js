import { v4 as uuidv4 } from 'uuid';
import { formatNumber } from '../Companies/Companies-helpers';

export const getEmptyActivity = (email, companyId = '', companyName = '', region = '', city = '') => {
    const newActivity = {

            id: uuidv4(), // Generates UUID v4
            companyName: companyName,
            companyId: companyId,
            contactId: '',
            contactEmail: '',
            dateOfSale: '',
            endDatetime: '',
            firstName: '',
            'haveAdv?': '',
            'haveSample?': '',
            'haveTrainig?': '',
            'isOnSite?': '',
            manager: email || '',
            plan: '',
            city: city,
            planTime: '',
            purpose: 'Проработка',
            region: region,
            responsible: '',
            sale: 0,
            saleDescription: '',
            startDatetime: '',
            status: '',
            'subscribed?': '',
            type: 'Звонок',
            description: ''
        }
    return (newActivity
        )
};

export const checkIfInArray = (array, value = {}) => {
    const formattedNumbersArray = array.reduce((acc, item) => {
        acc.push(`${formatNumber(item.phone1)}-${formatNumber(item.phone2)}-${formatNumber(item.whatsapp)}-${formatNumber(item.telegram)}`)
        return acc
    }, []
    )
    const formmatedValue = `${formatNumber(value.phone1)}-${formatNumber(value.phone2)}-${formatNumber(value.whatsapp)}-${formatNumber(value.telegram)}`
    // console.log('formattedNumbersArray', formattedNumbersArray)
    // console.log('formmatedValue', formmatedValue)
    return (formattedNumbersArray.includes(formmatedValue))
}

export const checkIfRequireFieldsFilled = (data) => {
    if (!data) return false
    // if(
    //     !data.type ||
    //     !data.purpose ||
    //     !data.companyId ||
    //     !data.description
    // )
    // return false
    if (data.type.trim() === '')
        return false
    if (data.purpose.trim() === '')
        return false
    if (data.companyId.trim() === '')
        return false
    if (data.purpose === 'Проработка') {
        if (data.status.trim() === '')
            return false
        if (data['haveAdv?'].trim() === '')
            return false
        if (data['haveSample?'].trim() === '')
            return false
        if (data['haveTrainig?'].trim() === '')
            return false
        if (data['subscribed?'].trim() === '')
            return false
        if (data['isOnSite?'].trim() === '')
            return false
    }
        if (data['description'].trim() === '' && data.purpose !== 'Проработка'){
            return false}
        if (data['subscribed?'].trim() === 'Подписать' && data.companyWhatsapp === '' && data.companyTelegram === '')
            return false
        if(data.plan !== '' && data.responsible === '')
            return false
    
    return true
}

export const getCompanyNames = (company) => company.map((item) => item.name);

const statusAnswers = ['Да', 'Работали раньше', 'Нет, но хотят', 'Нет, и не хотят']
const advAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const sampleAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const eduAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const subscribeAnswers = ['Нет, не хотят', 'Подписать', 'Подписаны', 'Удалить компанию', 'Нет мобильного']
const isOnSiteAnswers = ['Да', 'Нет']

export const answers = { status: statusAnswers, 'haveAdv?': advAnswers, 
    'haveSample?': sampleAnswers, 'haveTrainig?': eduAnswers,
     'subscribed?': subscribeAnswers, 'isOnSite?': isOnSiteAnswers }

export const calculateDuration = (startMs, endMs) => {
  // Функция для склонения единиц времени
  function declineTime(value, unit) {
    const lastDigit = value % 10;
    const lastTwoDigits = value % 100;

    if (unit === 'hour') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'часов';
      if (lastDigit === 1) return 'час';
      if (lastDigit >= 2 && lastDigit <= 4) return 'часа';
      return 'часов';
    }

    if (unit === 'minute') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'минут';
      if (lastDigit === 1) return 'минута';
      if (lastDigit >= 2 && lastDigit <= 4) return 'минуты';
      return 'минут';
    }

    if (unit === 'second') {
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'секунд';
      if (lastDigit === 1) return 'секунда';
      if (lastDigit >= 2 && lastDigit <= 4) return 'секунды';
      return 'секунд';
    }

    return unit;
  }

  // Вычисляем разницу в миллисекундах
  const diffMs = endMs - startMs;

  // Проверяем, что конечная дата больше начальной
  if (diffMs < 0) {
    return "Ошибка: конечная дата должна быть больше начальной";
  }

  // Вычисляем составляющие времени
  const seconds = Math.floor(diffMs / 1000) % 60;
  const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  // Формируем массив ненулевых компонентов
  const parts = [];

  if (hours > 0) {
    const hoursText = declineTime(hours, 'hour');
    parts.push(`${hours} ${hoursText}`);
  }

  if (minutes > 0) {
    const minutesText = declineTime(minutes, 'minute');
    parts.push(`${minutes} ${minutesText}`);
  }

  if (seconds > 0 || parts.length === 0) {
    // Включаем секунды если они > 0 или если это единственный компонент (0 секунд)
    const secondsText = declineTime(seconds, 'second');
    parts.push(`${seconds} ${secondsText}`);
  }

  // Объединяем все части
  return `продолжительность ${parts.join(' ')}`;
}
