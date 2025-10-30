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
    if(
        !data.type ||
        !data.purpose ||
        !data.companyId ||
        !data.description
    )
    return false
    if (data.type.trim() === '')
        return false
    if (data.purpose.trim() === '')
        return false
    if (data.companyId.trim() === '')
        return false
    if (data.purpose === 'Проработка') {
        if (data['haveAdv?'].trim() === '')
            return false
        if (data['haveSample?'].trim() === '')
            return false
        if (data['haveTrainig?'].trim() === '')
            return false
        if (data['subscribed?'].trim() === '')
            return false
    }
    else {
        if (data['description'].trim() === '')
            return false
    }
    return true
}

export const getCompanyNames = (company) => company.map((item) => item.name);

const statusAnswers = ['Да', 'Работали раньше', 'Нет, но хотят', 'Нет, и не хотят']
const advAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const sampleAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const eduAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const subscribeAnswers = ['Нет, не хотят', 'Подписать', 'Подписаны', 'Удалить компанию', 'Нет мобильного']

export const answers = { status: statusAnswers, 'haveAdv?': advAnswers, 'haveSample?': sampleAnswers, 'haveTrainig?': eduAnswers, 'subscribed?': subscribeAnswers }

