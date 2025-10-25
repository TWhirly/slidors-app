import styles from './CompanyDetails.module.css';
import Skeleton from '@mui/material/Skeleton';
import { useContacts } from '../../hooks/useContacts.js';
import { useEffect, useState, useContext } from 'react';
import { getContactIcons } from './Companies-helpers.js'


const CompanyСontacts = (props) =>  {
     const [contacts, setContacts] = useState([]);
      const { regionsWithContacts, isLoading: isContactsLoading, contactsLoadingError: contactsError } = useContacts(props.chat_id)
    console.log('propsActivity', props.activity)
      useEffect(() => {
          if (regionsWithContacts) {
            const contacts = regionsWithContacts.reduce((acc, region) => {
              region.contacts.forEach((contact) => {
                if (contact.companyId === props.id) {
                  acc.push(contact);
                }
              });
              return acc;
            }, [])
            setContacts(contacts)
          }
        }, [props.id, regionsWithContacts]);
        console.log('main contacts', contacts)

      return (
            <div style={ props.activity ? {marginTop: '-10px', marginLeft: '20px'} : {} } >
          <div className={styles.companyRowInfo}>
            <div className={styles.companyRowHeader}>
              Контакты</div>{contacts && contacts?.length > 0 && <div className={styles.companyRowHeader}>{contacts?.length > 0 ? `\u00A0(${contacts?.length}):` : ':'}</div>}
            </div>
        {isContactsLoading ? (
          <>
            <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />
            
          </>
        ) : (
          <div className={styles.contactsContainer}>
           
            {contacts?.length > 0 ? (contacts?.map((contact, index) => (
              <div key={index} className={!props.activity ? styles.contactPerson : styles.activityContactPerson} onClick={ props.activity ? () => {return} : () => props.onClick(contact)}>
                <div className={styles.contactName}>{`${contact.fullName || getContactFullNmae(contact)}`}</div>
                <div className={!props.activity ? styles.contactIcons : styles.contactActivityIcons}>{getContactIcons(contact, props.activity)}</div>
                <div className={styles.contactEmail}>{contact.email}</div>
              </div>
            ))) : 'нет'}
          </div>
        )
        }
    </div>
      )

}

 const getContactFullNmae = (contact) => {
    const fullName = (contact.lastName ? contact.lastName + ' ' : '') + 
                (contact.firstName ? contact.firstName + ' ' : '') + 
                (contact.surname ? contact.surname + ' ' : '')
    if (fullName === '') {
      return contact.companyName
    }
    return fullName
  };

export default CompanyСontacts;