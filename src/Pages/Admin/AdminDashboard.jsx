import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
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
import { Paper, Tooltip, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
// icons 
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PermContactCalendarOutlinedIcon from '@mui/icons-material/PermContactCalendarOutlined';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Components
import PtoManage from './Pages/PtoManage';
import ManageDrives from '../CommonPages/ManageDrives';
import Info from './Pages/Info';
import StudentsNew from '../CommonPages/StudentsNew';
//import StudentList from '../CommonPages/Students';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: '#5c6bc0',
  color: 'white',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  backgroundColor: '#5c6bc0',
  color: 'white',
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: '#5c6bc0',
  color: 'white',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function AdminDashboard() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [component, setComponent] = useState('ManageDrives');
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const signOut = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const fetchData = async () => {
    const userUID = sessionStorage.getItem("uid");
    if (userUID) {
      const docRef = doc(db, "users", userUID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUser(docSnap.data());
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #e0f7fa, #bbdefb, #d1c4e9)' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%' 
          }}>
            <Typography variant="h6" noWrap component="div">
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">
                {user.FullName || 'Admin'}
              </Typography>
              <Tooltip title="Logout">
                <IconButton onClick={signOut} color="inherit">
                  <PowerSettingsNewIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />

        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={() => setComponent('ManageDrives')}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <AnnouncementOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Drives" sx={{ opacity: open ? 1 : 0, color: 'white' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={() => setComponent('PtoManage')}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <BadgeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="PTOs" sx={{ opacity: open ? 1 : 0, color: 'white' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={() => setComponent('Students')}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <PermContactCalendarOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Students" sx={{ opacity: open ? 1 : 0, color: 'white' }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onClick={() => setComponent('Info')}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <ManageAccountsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" sx={{ opacity: open ? 1 : 0, color: 'white' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 2,
          margin: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <DrawerHeader />
        <Paper 
          sx={{ 
            p: 3,
            borderRadius: 2,
            minHeight: '80vh',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          {component === 'ManageDrives' && <ManageDrives />}
          {component === 'PtoManage' && <PtoManage />}
          {component === 'Students' && <StudentsNew />}
          {component === 'Info' && <Info user={user} />}
        </Paper>
      </Box>
    </Box>
  );
}