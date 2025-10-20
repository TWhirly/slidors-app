import { v4 as uuidv4 } from 'uuid';

export const getEmptyActivity = (email, companyId = '', companyName = '', region = '', city = '') => {
    return(
    {
    
              id: uuidv4(), // Generates UUID v4
              new: true,
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
              type: ''
          })};

export const getCompanyNames = (company) => company.map((item) => item.name);

const statusAnswers = ['Да', 'Работали раньше', 'Нет, но хотят', 'Нет, и не хотят']
const advAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const sampleAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const eduAnswers = ['Нет, не хотят', 'Нет, хотят', 'Есть, не хотят', 'Да, хотят еще']
const subscribeAnswers = ['Нет, не хотят', 'Подписать', 'Подписаны', 'Удалить компанию', 'Нет мобильного']

export const answers = {status: statusAnswers, 'haveAdv?': advAnswers, 'haveSample?': sampleAnswers, 'haveTrainig?': eduAnswers, 'subscribed?': subscribeAnswers}

