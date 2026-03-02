import ClickTooltip from "../Companies/ClickTooltip"
import styles from './CompanyDetails.module.css'

const CompanyDetailsActivityDescriptionToolTip = ({ activity, index }) => {
    return (<ClickTooltip
        content={
            <div
                style={{
                    disply: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    padding: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    backgroundColor: '#131313'
                }}
            >
                {activity.description}
            </div>
        }
    >
        <div
            style={{
                display: 'flex',
                flexDirection: 'column'

            }}
            key={index}
        >
            <div
                className={styles.activityRowVal}
            >{activity.endDatetime ? new Date(activity.endDatetime).toLocaleDateString() + ' ' : ''}
                {activity.purpose}</div>
            <div
                style={{
                    color: '#888',
                    fontSize: '0.7rem'
                }}
            >{activity.description}</div>
        </div>
    </ClickTooltip>
    )
}
export default CompanyDetailsActivityDescriptionToolTip
