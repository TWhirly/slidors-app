import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, act } from 'react';
import styles from '../Companies/CompanyDetails.module.css';
import LongMenu from '../Companies/CompanyDetailMenu';
import { DataContext } from '../../DataContext.jsx';
import { useContacts } from '../../hooks/useContacts.js';
import { useActivity } from '../../hooks/useActivity.js';
import { getEmptyActivity } from './activity.js';



const ActivityDetails = () => {

  
  const navigate = useNavigate();
  const { state: { activityId: id , path} } = useLocation();
  const [menuSelection, setMenuSelection] = useState(null);
  const [contact, setContact] = useState({});
  const [activity, setActivity] = useState({});
  const [hasAtLeastOneField, setHasAtLeastOneField] = useState(false);
  const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(window.Telegram.WebApp.initData);
  const chat_id = JSON.parse(params.get('user')).id;
  const phoneIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fphone.png?alt=media&token=67cd5388-7950-4ee2-b840-0d492f0fc03a'
  const whatsappIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Fwhatsapp.png?alt=media&token=b682eae2-d563-45e7-96ef-d68c272d6197'
  const telegramIcon = 'https://firebasestorage.googleapis.com/v0/b/gsr-v1.appspot.com/o/icons%2Ftelegram.png?alt=media&token=ab7b246a-3b04-41d7-bc8c-f34a31042b45'
  const { activity: activities, isLoading, updateActivity, optimisticUpdateActivity } = useActivity(chat_id)
  const { regionsWithContacts: contacts } = useContacts(chat_id)
  const [options, setOptions] = useState([])
  const {name, email} = useContext(DataContext)
  // const getEmptyActivity = require('./ActivityDetails.jsx')
  console.log(name)
  tg.BackButton.isVisible = true
    useEffect(() => {
    if (activities) {
      let activity = []
      activity = activities.planned?.filter((activity) => activity.id === id);
      console.log('activity in useEffect', activity, id, activities) // Find the activity with the matching ID and set it as the state variable)
      if (activity.length === 0) {
        activity = activities.other?.filter((activity) => activity.id === id);
      }
     setActivity(activity[0])
     
    }
  }, [id, activities]);

  useEffect(() => {
    if (contacts && activity) {
      const contact = contacts.reduce((acc, region) => {
        region.contacts.forEach((contact) => {
          if (contact.id === activity.contactId) {
            acc = {...contact}
          }
        });
        return acc;
      }, {})
      setContact(contact)
    }
  }, [contacts, activity]);

  useEffect(() => {
    const initializeBackButton = () => {
      if (!tg) return;
      console.log('back button init', path)
      tg.ready(); // Ensure Telegram WebApp is fully initialized
      tg.BackButton.isVisible = true;
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate(path || '/activities/', 
         { replace: true }));
    };

    initializeBackButton();

    return () => {
      tg.BackButton.offClick();
    };
  }, [navigate, path, tg]);

  // console.log('company', company);
   
  const handleMenuSelection = (selectedOption) => {
    if (selectedOption === 'Редактировать') {
      navigate(`/activities/${activity.id}/edit`, { state: { ...activity, path: `/activities/${activity.id}`,new: false } });
    }
    if (selectedOption === 'Завершить') {
      const emptyActivity = getEmptyActivity(email, activity.companyId, activity.companyName,
        activity.region, activity.city)
        updateActivity({...emptyActivity, new: true, toFinish: true})
      navigate(`/activities/${activity.id}/edit`, { state: {...emptyActivity, path: `/activities/${activity.id}`, finalize: activity.id, new: true  } });
    }
    // if (selectedOption === 'Добавить контакт') {
      
    //       const emptyActivity = getEmptyActivity();
      
    //   navigate(`/activities/new/edit`, { state: {...emptyActivity, path: `/activities/${id}`, prevComponent : activity, activityId: id} });
             
    // }
  };

  //  const handleSelectContact = (contact) => {
  //       console.log('handleSelectCompany', contact);
  //        navigate(`/contacts/${contact.id}`, {
  //           state: {contactId: contact.id, companyId: id,
  //           path: `/companies/${id}`, prevComponent : company}
  //       },  { replace:  true});
  //           };

  const formatNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.startsWith('8')) {
      return '7' + cleanNumber.slice(1);
    }
    if (cleanNumber.startsWith('7')) {
      return cleanNumber;
    }
    return '7' + cleanNumber;
  };

 useEffect(() => {
  if (!activity)
    return
    let options = [];
    console.log('options check', activity.responsible, `${name.name} (${email})`)
    if(activity.plan && activity.responsible === `${name.name} (${email})`)
      options.push('Завершить')
    if(name.role === 'Админ')
      options.push('Редактировать')
    setOptions(options)
  },[activity, email, name.name, name.role])

  const getContactIcons = (contact) => {
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

  useEffect(() => {
    if (activity){
    setHasAtLeastOneField(['haveAdv?', 'haveSample?', 'haveTraining?', 'subscribed?', 'status']
  .some(field => {
    const value = activity[field];
    return value && value.toString().trim() !== '';
  }))
}
  },[activity])
  

  const handleSelectContact = (contact) => {
          console.log('handleSelectCompany', contact);
           navigate(`/contacts/${contact.id}`, {
              state: {contactId: contact.id, companyId: activity.companyId, activityId: id,
              path: `/activities/${id}`, prevComponent : activity}
          });
              };

  console.log('activity', activity)
  console.log('tg.BackButton.onClick', tg.BackButton.onClick())

  if (!activity) {
    return <div>Activity not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.naviPanel}>
        <span className={styles.nameAndIcon}>
          {activity.companyName}
          <div className={styles.iconContainer}>
            {/* {getCompanyTypeIcon(company.type)} */}
          </div>
        </span>
        <LongMenu
          options={options}
          onSelect={handleMenuSelection}
        />
      </div>
      <div className={styles.CompanyDetails}>
         <div className={styles.contactsContainer}>
                   
                    {contact.id && (
                      <div key={contact.id} className={styles.contactPerson} onClick={() => handleSelectContact(contact)}>
                        <div className={styles.contactName}>{`${contact.firstName} ${contact.lastName} ${contact.surname}`}</div>
                        <div className={styles.contactIcons}>{getContactIcons(contact)}</div>
                        <div className={styles.contactEmail}>{contact.email}</div>
                      </div>
                    ) }
                  </div>
        {activity.plan &&(<div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Запланировано на:</div><div className={styles.companyRowVal}>{Intl.DateTimeFormat('ru-RU', {
                                        day: 'numeric',
                                        month: 'numeric',
                                        year: 'numeric'
                                    }).format(new Date(activity.plan)) + ` ${activity.planTime}`}</div></div>)}
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Тип:</div><div className={styles.companyRowVal}>{activity.type}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Цель:</div><div className={styles.companyRowVal}>{activity.purpose}</div></div>
        <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Регион:</div><div className={styles.companyRowVal}>{activity.region}</div></div>
        {hasAtLeastOneField && (
          <div>
            <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Работают ли с системой Слайдорс?</div><div className={styles.companyRowVal}>{activity['status']}</div></div>
            <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Есть ли реклама?</div><div className={styles.companyRowVal}>{activity['haveAdv?']}</div></div>
            <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Есть ли образец?</div><div className={styles.companyRowVal}>{activity['haveSample?']}</div></div>
            <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Проведено ли обучение?</div><div className={styles.companyRowVal}>{activity['haveTraining?']}</div></div>
            <div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Подписан ли на группу?</div><div className={styles.companyRowVal}>{activity['subscribed?']}</div></div>
            </div>
        )}

        {activity.description && (<div className={styles.companyDescriptionRowInfo}><div className={styles.companyDescriptionRowInfo}><div className={styles.companyRowHeader}>Описание:</div></div><div className={styles.companyDescriptionRowVal}>{activity.description}</div></div>)}
        {activity.responsible && (<div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Ответственный:</div><div className={styles.companyRowVal}>{activity.responsible}</div></div>)}
        {activity.manager && (<div className={styles.companyRowInfo}><div className={styles.companyRowHeader}>Менеджер:</div><div className={styles.companyRowVal}>{activity.manager}</div></div>)}
            </div>
          </div>
       

        )}



export default ActivityDetails;