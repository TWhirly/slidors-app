import styles from './CompanyContacts.module.css';
import Skeleton from '@mui/material/Skeleton';
import { useContacts } from '../../hooks/useContacts.js';
import { useEffect, useState } from 'react';
import { getContactIcons } from './Companies-helpers.js'


const CompanyСontacts = (props) => {
    const [companyContacts, setCompanyContacts] = useState([]);
    const { contacts: allContacts, isLoading: isContactsLoading } = useContacts(props.chat_id)
    console.log('propsActivity', props.id)

    const contactNameStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: 'calc(100% - 30px)', // оставляем место для чекбокса
        maxWidth: 'calc(100% - 30px)',
        display: 'inline-block',
        marginLeft: '0',
        marginRight: '0.3rem',
        padding: '3px 0',
        verticalAlign: 'middle' // выравнивание по вертикали
    }

    const contactContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    }


    useEffect(() => {
        if (allContacts) {
            const contacts = allContacts
            .filter(contact => contact.companyId === props.id)
            setCompanyContacts(contacts)
        }
    }, [props.id, allContacts]);
    // console.log('main contacts', contacts)

    return (
        <div style={props.activity ? { marginTop: '-10px', marginLeft: '20px' } : {width: '100%'}} >
            <div className={styles.companyRowInfo}>
                <div className={styles.companyRowHeader}>
                    Контакты</div>{companyContacts && companyContacts?.length > 0 && <div className={styles.companyRowHeader}>{companyContacts?.length > 0 ? `\u00A0(${companyContacts?.length}):` : ':'}</div>}
            </div>
            {isContactsLoading ? (
                <>
                    <Skeleton variant="text" animation="pulse" width={'10rem'} height={'0.8rem'} sx={{ bgcolor: 'grey.500', fontSize: '1rem' }} />

                </>
            ) : (
                <div className={styles.contactsContainer}>

                    {companyContacts?.length > 0 ? (companyContacts?.map((contact, index) => (
                        <div key={index} className={!props.activity ? styles.contactPerson : styles.activityContactPerson} onClick={props.activity ? () => { return } : () => props.onClick(contact)}>
                            <div style={contactContainerStyle}>
                                <div style={contactNameStyle}>{`${contact.fullName || getContactFullNmae(contact)}`}</div>
                                {props.activity && <input
                                id={contact.id}
                                    type="checkbox"
                                    checked={props.selectedContactId === contact.id}
            className={styles.contactCheckbox}
            onChange={() => props.onChange(contact.id)}
            onClick={(e) => e.stopPropagation()}
                                />}
                            </div>
                            <div className={!props.activity ? styles.contactIcons : styles.contactActivityIcons}
                            >{getContactIcons(contact, props.activity)}

                            </div>
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