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

      return (
            <div style={ props.activity ? {marginTop: '-10px'} : {} } >
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
              <div key={index} className={styles.contactPerson} onClick={ props.activity ? () => {return} : () => props.onClick(contact)}>
                <div className={styles.contactName}>{`${contact.firstName} ${contact.lastName} ${contact.surname}`}</div>
                <div className={styles.contactIcons}>{getContactIcons(contact)}</div>
                <div className={styles.contactEmail}>{contact.email}</div>
              </div>
            ))) : 'нет'}
          </div>
        )
        }
    </div>
      )

}

export default CompanyСontacts;