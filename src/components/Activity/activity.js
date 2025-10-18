import { v4 as uuidv4 } from 'uuid';

export const getEmptyActivity = (email) => {
    return(
    {
    
              id: uuidv4(), // Generates UUID v4
              new: true,
              companyName: '',
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
              purpose: '',
              region: '',
              responsible: '',
              sale: 0,
              saleDescription: '',
              startDatetime: '',
              status: '',
              'subscribed?': '',
              type: ''
          })};