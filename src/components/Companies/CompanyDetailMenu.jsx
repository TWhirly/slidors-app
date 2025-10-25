import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './CompanyDetails.module.css';



const ITEM_HEIGHT = 48;

const LongMenu = ({ onSelect, options }) => {
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
    onSelect(option); // Передача выбранного значения в родительский компонент
  };

  return (
    <div className={styles.menuButton}>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
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
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '20ch',
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
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default LongMenu;