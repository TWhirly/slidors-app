import { Avatar } from "@mui/material"
import AvatarGroup from '@mui/material/AvatarGroup';
import ClickTooltip from "./ClickTooltip"
import { avatar, avatarGroup} from './sx'

const AvatarGroupWithTooltip = ({selectedRegion, contextRegions}) => {
    const avatarGroupStyle = avatarGroup();
    
    console.log('r users', contextRegions)
    return(
      <ClickTooltip
                    content={
                        <AvatarGroup
                            max={100}
                            spacing={10}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                backgroundColor: '#131313',
                                '& .MuiAvatar-root': {
                                    border: '2px solid white',
                                    marginLeft: 0,
                                }
                            }}
                        >
                            {selectedRegion ? contextRegions
                                .filter((item) => item.region === selectedRegion)[0]
                                ?.regionUsers?.map((user, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '4px'
                                        }}
                                    >
                                        <Avatar sx={avatar(user.name)} alt={user.name} src={user.avatar}>
                                            {`${user.name?.split('')[0] || ''}${user.name?.split('')[1] || ''}`}
                                        </Avatar>
                                        <div style={{ color: 'white' }}>{user.name}</div>
                                    </div>
                                )) : null}
                        </AvatarGroup>
                    }
                >
                    <AvatarGroup
                        max={5}
                        direction="row"
                        spacing={10}
                        sx={{
                            ...avatarGroupStyle,
                            '& .MuiAvatarGroup-avatar': avatar(''),
                            cursor: 'pointer' // Добавляем указатель
                        }}
                    >
                        {selectedRegion ? contextRegions
                            .filter((item) => item.region === selectedRegion)[0]
                            ?.regionUsers?.map((user, i) => (
                                <Avatar
                                    key={i}
                                    sx={avatar(user.name)}
                                    alt={user.name}
                                    src={user.avatar}
                                >
                                    {`${user.name?.split('')[0] || ''}${user.name?.split('')[1] || ''}`}
                                </Avatar>
                            )) : null}
                    </AvatarGroup>
                </ClickTooltip>
    )
}

export default AvatarGroupWithTooltip