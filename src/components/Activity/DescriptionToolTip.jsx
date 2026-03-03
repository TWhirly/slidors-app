import ClickTooltip from "../Companies/ClickTooltip"

const DescriptionToolTip = ({ description }) => {
    return (<ClickTooltip
        content={
            <div
                style={{
                    disply: 'flexBox',
                    zIndex: 100,
                    padding: '10px',
                    color: 'white',
                    fontSize: '1rem',
                    backgroundColor: '#131313'
                }}
            >
                {description}
            </div>
        }
    >
        <div
            style={{
                color: '#888',
                fontSize: '0.7rem'
            }}
        >
            {description}
        </div>
    </ClickTooltip>
    )
}
export default DescriptionToolTip
