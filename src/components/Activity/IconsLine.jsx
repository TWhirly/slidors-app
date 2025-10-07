import styles from '../Companies/Companies.module.css'

export const IconsLine = (props) => {

    return (<div className={styles.checksContainer}>

        {(props.activity['haveAdv?'] === 'Нет, не хотят') &&
            <><img
                src={require('../../icons/ad1.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }
         {(props.activity['haveAdv?'] === 'Нет, хотят') &&
            <><img
                src={require('../../icons/ad3.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }

          {(props.activity['haveAdv?'] === 'Есть, не хотят') &&
            <><img
                src={require('../../icons/ad2.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }

          {(props.activity['haveAdv?'] === 'Да, хотят еще') &&
            <><img
                src={require('../../icons/ad4.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }
         {/* have sample */}
          {(props.activity['haveSample?'] === 'Нет, не хотят') &&
            <><img
                src={require('../../icons/sample1.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }
         {(props.activity['haveSample?'] === 'Нет, хотят') &&
            <><img
                src={require('../../icons/sample3.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }

          {(props.activity['haveSample?'] === 'Есть, не хотят') &&
            <><img
                src={require('../../icons/sample2.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }

          {(props.activity['haveSample?'] === 'Да, хотят еще') &&
            <><img
                src={require('../../icons/sample4.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }
         {/* have training */}

          {(props.activity['haveTrainig?'] === 'Нет, не хотят') &&
            <><img
                src={require('../../icons/education1.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }
         {(props.activity['haveTrainig?'] === 'Нет, хотят') &&
            <><img
                src={require('../../icons/education3.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }

          {(props.activity['haveTrainig?'] === 'Есть, не хотят') &&
            <><img
                src={require('../../icons/education2.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }

          {(props.activity['haveTrainig?'] === 'Да, хотят еще') &&
            <><img
                src={require('../../icons/education4.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }
         {/* have training */}

            {(props.activity['subscribed?'] === 'Подписать') &&
            <><img
                src={require('../../icons/checkedGreen2.png')}
                alt="переработчик"
                fill="#008ad1"
                className={styles.checkIcon} />
            </>
        }
    </div>)
}

export default IconsLine