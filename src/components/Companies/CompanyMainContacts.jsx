import styles from './CompanyDetails.module.css';
import { mainContactsIcons , formatNumber } from './Companies-helpers.js'

const CompanyMainContacts = (props) => {

    const tg = window.Telegram.WebApp;
    const company = props.company;

    console.log('company main contacts', company)

    return (
        <div> {company.phone1 && (
                  <div
                    className={styles.companyMainContacts}
                    onClick={() => window.location.href = `tel:${company.phone1}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={mainContactsIcons.phoneIcon} className={styles.contactPhone} alt="Phone icon" />
                    <div className={styles.companyRowVal}>{company.phone1}
                    {props.activity && (<div className={styles.companyRowVal}>{company.fullName}</div>)}
                    </div>
                  </div>
                )}
                {company.phone2 && (<div className={styles.companyMainContacts}
                  onClick={() => window.location.href = `tel:${company.phone2}`}
                  style={{ cursor: 'pointer' }}
                > <img src={mainContactsIcons.phoneIcon} className={styles.contactPhone} alt="Phone icon" />
                  <div className={styles.companyRowVal}>{company.phone2}
                       {props.activity && (<div className={styles.companyRowVal}>{company.fullName}</div>)}
                    </div></div>)}
                {company.whatsapp && (
        
                  <div
                    className={styles.companyMainContacts}
                    onClick={() => tg.openLink(`https://wa.me/${formatNumber(company.whatsapp)}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={mainContactsIcons.whatsappIcon} className={styles.contactPhone} alt="WhatsApp icon" />
                    <div className={styles.companyRowVal}>{company.whatsapp}
                           {props.activity && (<div className={styles.companyRowVal}>{company.fullName}</div>)}
                    </div>
                    <div>
                      {company.wa !== 0 && (
                        <img
                          src={require('../../icons/checkedRed.png')}
                          alt="переработчик"
                          fill="#008ad1"
                          className={styles.checkIcon}
                        />
                      )}
                    </div>
                  </div>
        
        
                )}
                {company.telegram && (
                  <div className={styles.companyMainContacts}
                    onClick={() => tg.openLink(`https://t.me/${formatNumber(company.telegram)}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={mainContactsIcons.telegramIcon} className={styles.contactPhone} alt="Phone icon" />
                    <div className={styles.companyRowVal}>{company.telegram}
                        {props.activity && (<div className={styles.companyRowVal}>{company.fullName}</div>)}
                    </div>
                    <div>
                      {company.tg !== 0 && (
                        <img
                          src={require('../../icons/checkedRed.png')}
                          alt="переработчик"
                          fill="#008ad1"
                          className={styles.checkIcon}
                        />
                      )}
                    </div>
                  </div>)}
                  </div>
    )
}

export default CompanyMainContacts