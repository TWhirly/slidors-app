import * as React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
// import MailIcon from '@mui/icons-material/Mail';
import BusinessIcon from '@mui/icons-material/Business';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import EventNoteIcon from '@mui/icons-material/EventNote';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import TaskIcon from '@mui/icons-material/Task';
import PeopleIcon from '@mui/icons-material/People';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { Main, AppBar, DrawerHeader, drawerWidthValue , listItemTextStyles } from './MainStyles';

export default function PersistentDrawerLeft() {
 
  const navigate = useNavigate();
    const location = useLocation();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const tg = window.Telegram.WebApp;
    console.log('platform', tg.platform)
    if (tg.platform === 'tdesktop') {
      console.log(tg)
      if (typeof tg.requestFullscreen === 'function') {
        // tg.requestFullscreen();
      }
    }
      tg.BackButton.hide();
    }, [navigate])
  const menuNavigate = {
    'Компании': '/companies',
    'Контакты': '/contacts',
    'События': '/events',
    'Стратегия': '/strategy',
    'Задачи': '/tasks',
    'Экспорт E-mail': '/export-email',
    'Пользователи': '/users',
    'Ежедневный отчёт': '/daily-report',
  }

  

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleClick = (name) => {
    console.log(name);
    const tg = window.Telegram.WebApp;
    tg.BackButton.show();
    navigate(menuNavigate[name]);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                mr: 2,
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Persistent drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidthValue,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidthValue,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {Object.keys(menuNavigate).filter((el, index) => index < 5).map((text, index) => (
            <ListItem key={text} disablePadding fontSize="small">
                <ListItemButton onClick={() => handleClick(text)} sx={{ alignSelf: 'left' }}>
                    <ListItemIcon sx={{ minWidth: 10,  padding: 0, alignSelf: 'left'}}> {/* Reduced icon size */}
                        {index === 0 ? <BusinessIcon fontSize="small" /> : ''}
                        {index === 1 ? <RecentActorsIcon fontSize="small" /> : ''}
                        {index === 2 ? <EventNoteIcon fontSize="small" /> : ''}
                        {index === 3 ? <FollowTheSignsIcon fontSize="small" /> : ''}
                        {index === 4 ? <TaskIcon fontSize="small" /> : ''}

                        
                    </ListItemIcon>
                    <ListItemText primary={text} slotProps={listItemTextStyles} /> {/* Reduced font size */}
                </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List >
          {Object.keys(menuNavigate).filter((el, index) => index > 4).map((text, index) => (
            <ListItem key={text} disablePadding fontSize="small">
              <ListItemButton onClick={() => handleClick(text)} sx={{ alignSelf: 'left' }}>
                <ListItemIcon sx={{ minWidth: 10,  padding: 0}}> {/* Reduced icon size */}
                  {index === 0 ? <InboxIcon fontSize="small" /> : ''}
                  {index === 1 ? <PeopleIcon fontSize="small" /> : ''}
                  {index === 2 ? <SummarizeIcon fontSize="small" /> : ''}
                </ListItemIcon>
                {/* <ListItemText primary={text} slotProps={{ primary: { fontSize: '0.4rem' } }} /> Reduced font size */}
                <ListItemText primary={text} slotProps={listItemTextStyles} /> {/* Reduced font size */}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Typography sx={{ marginBottom: 2 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
          enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
          imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
          Convallis convallis tellus id interdum velit laoreet id donec ultrices.
          Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
          adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
          nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
          leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
          feugiat vivamus at augue. At augue eget arcu dictum varius duis at
          consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
          sapien faucibus et molestie ac.
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
          Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
          eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
          neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
          tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
          sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
          tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
          gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
          et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
          tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
          eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
          posuere sollicitudin aliquam ultrices sagittis orci a.
        </Typography>
      </Main>
    </Box>
  );
}