import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './CompanyDetails.module.css';

const ITEM_HEIGHT = 48;

const SubsctibesDetailMenu = ({ onSelect, options, currentValue }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMenuItemClick = (option) => {
    handleClose();
    onSelect(option);
  };

  // Эмодзи для отображения в меню
  const getEmojiForStatus = (status) => {
    const emojis = {
      'Не подписан': '🟨',
      'Подписан': '✅',
      'Вышел': '🙅',
      'Нет в мессенджере': '❌',
      'Отправлено приглашение': '📨'
    };
    return emojis[status] || '⬜';
  };

  return (
    <div className={styles.statusSelectButton} style={{ marginRight: 0 }}>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
        sx={{ padding: 0,  }}
      >
        <div className={styles.statusDisplay}>
          {getEmojiForStatus(currentValue) || ''}
        </div>
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'long-button',
          },
          paper: {
            style: {
              padding: 0,
              gap: 1,
              maxHeight: ITEM_HEIGHT * 5.5,
              width: '30ch',
              backgroundColor: 'var(--bgColor)',
              color: 'var(--textColor)',
              fontFamily: 'var(--fontFamily)',
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem 
            key={option} 
            onClick={() => handleMenuItemClick(option)}
            selected={option === currentValue}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              paddingTop: '1px'
            }}
          >
            <span
            
            >{getEmojiForStatus(option)}</span>
            <span
            style={{gap: '1px', paddingTop: '1px'}}
            >{option}</span>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default SubsctibesDetailMenu;