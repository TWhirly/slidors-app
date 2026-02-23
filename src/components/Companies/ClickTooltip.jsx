import React, { useState, useRef } from 'react';
import { Popper, Paper, ClickAwayListener } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  // padding: theme.spacing(2),
  maxWidth: 300,
  wordWrap: 'break-word',
  zIndex: 999999, // Максимальный z-index
  color: 'white',
    // border: '1px solid rgba(255,255,255,0.1)',
}));

const ClickTooltip = ({ 
  children,
  content,
  placement = 'auto',
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const targetRef = useRef(null);

  const handleClick = (event) => {
    // Останавливаем всплытие события
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleClose = (event) => {
    // Предотвращаем закрытие при клике на содержимое
    if (event?.target?.closest('.MuiPaper-root')) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <div 
        ref={targetRef} 
        onClick={handleClick}
        style={{ display: 'inline-block', cursor: 'pointer' }}
      >
        {children}
      </div>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        disablePortal={true} // Используем портал для рендера в body
        modifiers={[
          {
            name: 'flip',
            enabled: true,
            options: {
              altBoundary: true,
              rootBoundary: 'viewport',
              padding: 8,
            },
          },
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              altBoundary: true,
              tether: true,
              rootBoundary: 'viewport',
              padding: 8,
            },
          },
          {
            name: 'offset',
            enabled: true,
            options: {
              offset: [0, 8],
            },
          },
        ]}
        popperOptions={{
          strategy: 'fixed', // Используем fixed позиционирование
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <StyledPaper elevation={8}>
            {content}
          </StyledPaper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default ClickTooltip;