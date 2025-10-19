import { v4 as uuidv4 } from 'uuid';

export const getEmptyActivity = (email) => {
    return(
    {
    
              id: uuidv4(), // Generates UUID v4
              new: true,
              companyName: '',
              companyId: '',
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
              planTime: '',
              purpose: 'Проработка',
              region: '',
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

