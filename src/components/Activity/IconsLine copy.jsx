import styles from '../Companies/Companies.module.css'

export const IconsLine = (props) => {
   
    // if (activity.id === '381e10b2')
        console.log('haveAdv', props)
    return (<div >                                
         
        {(props.activity['haveAdv?'] === 'Нет, не хотят') && 
        <div className={styles.checksContainer}>
            <div>
        <img
            src={require('../../icons/advetNo.png')}
            alt="переработчик"
            fill="#008ad1"
            className={styles.checkIcon}
        />
        </div>
        <div>
        <img
            src={require('../../icons/notPartner.png')}
            alt="переработчик"
            fill="#008ad1"
            className={styles.checkIcon}
        />
        </div>
        </div>
        
        }
    
      {/* {(activity['haveAdv?'] !== '' && activity['haveAdv?'] === 'Нет, хотят') 
      && 
        <div>
        <img
            src={require('../../icons/advetNo.png')}
            alt="переработчик"
            fill="#008ad1"
            className={styles.checkIcon}
        />
        <img
            src={require('../../icons/checkPartner.png')}
            alt="переработчик"
            fill="#008ad1"
            className={styles.checkIcon}
        />
        </div>
        
        } */}

    </div>)
}

export default IconsLine