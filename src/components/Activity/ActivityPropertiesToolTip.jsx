import ClickTooltip from "../Companies/ClickTooltip";
import IconsLine from "./IconsLine";
import styles from '../Companies/Companies.module.css'

const ActivityPropertiesToolTip = ( {activity} ) => {
    const blockStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'center',
                    backgroundColor: '#131313',
                    zIndex: 10000
                    
                }
    const imgStyle = {
                    width: '16px',
                    height: '16px',
                    display: 'block'
                    
                }
    
    return (
        <ClickTooltip
        content={
            <div 
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                backgroundColor: '#131313',
                zIndex: 1000
            }}
    >

        {(activity['haveAdv?'] === 'Нет, не хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/ad1.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle}
                /><span>Реклама: Нет, не хотят</span>
            </div>
        }
         {(activity['haveAdv?'] === 'Нет, хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/ad3.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Реклама: Нет, хотят</span>
            </div>
        }

          {(activity['haveAdv?'] === 'Есть, не хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/ad2.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Реклама: Есть, не хотят</span>
            </div>
        }

          {(activity['haveAdv?'] === 'Да, хотят еще') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/ad4.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Реклама: Да, хотят еще</span>
            </div>
        }
         {/* have sample */}
          {(activity['haveSample?'] === 'Нет, не хотят') &&
            <div
              style={blockStyle}  
            ><img
                src={require('../../icons/sample1.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Образец: Нет, не хотят</span>
            </div>
        }
         {(activity['haveSample?'] === 'Нет, хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/sample3.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Образец: Нет, хотят</span>
            </div>
        }

          {(activity['haveSample?'] === 'Есть, не хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/sample2.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Образец: Есть, не хотят</span>
            </div>
        }

          {(activity['haveSample?'] === 'Да, хотят еще') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/sample4.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Образец: Да, хотят еще</span>
            </div>
        }
         {/* have training */}

          {(activity['haveTrainig?'] === 'Нет, не хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/education1.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Обучение: Нет, не хотят</span>
            </div>
        }
         {(activity['haveTrainig?'] === 'Нет, хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/education3.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Обучение: Нет, хотят</span>
            </div>
        }

          {(activity['haveTrainig?'] === 'Есть, не хотят') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/education2.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Обучение: Есть, не хотят</span>
            </div>
        }

          {(activity['haveTrainig?'] === 'Да, хотят еще') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/education4.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Обучение: Да, хотят еще</span>
            </div>
        }
         {/* have training */}

            {(activity['subscribed?'] === 'Подписать') &&
            <div
                style={blockStyle}
            ><img
                src={require('../../icons/checkedGreen2.png')}
                alt="переработчик"
                fill="#008ad1"
                style={imgStyle} /><span>Подписать на группы</span>
            </div>
        }
    </div>
        }
        >
            <IconsLine
                className={styles.checksContainer}
                activity={activity}
            ></IconsLine>
        </ClickTooltip>
    )
}

export default ActivityPropertiesToolTip