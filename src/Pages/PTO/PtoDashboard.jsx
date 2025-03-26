import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import { 
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  QueueOutlined as QueueOutlinedIcon,
  ManageAccountsOutlined as ManageAccountsOutlinedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Components
import ManageDrives from '../CommonPages/ManageDrives';
import StudentList from '../CommonPages/Students';
import Info from './Pages/Info';

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
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: '#5c6bc0',
  color: 'white',
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

const Drawer = styled(MuiDrawer, { 
  shouldForwardProp: (prop) => prop !== 'open' 
})(({ theme, open }) => ({
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
}));

export default function PtoDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState('ManageDrives');
  const [user, setUser] = useState({});
  const userUID = sessionStorage.getItem("uid");

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const signOut = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, "users", userUID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        console.log("No user document found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const menuItems = [
    { 
      name: 'Manage Drives', 
      icon: <QueueOutlinedIcon />,
      component: 'ManageDrives'
    },
    { 
      name: 'Students', 
      icon: <PeopleAltOutlinedIcon />,
      component: 'StudentList'
    },
    { 
      name: 'Profile', 
      icon: <ManageAccountsOutlinedIcon />,
      component: 'Info'
    }
  ];

  const renderComponent = () => {
    switch(activeComponent) {
      case 'ManageDrives': return <ManageDrives />;
      case 'StudentList': return <StudentList />;
      case 'Info': return <Info user={user} />;
      default: return <ManageDrives />;
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
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
              Placement Training Office
            </Typography>
            <Tooltip title="Logout">
              <IconButton onClick={signOut} color="inherit">
                <PowerSettingsNewIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onClick={() => setActiveComponent(item.component)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: 'white'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <DrawerHeader />
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3,
            borderRadius: 2,
            minHeight: '80vh',
            bgcolor: 'background.paper'
          }}
        >
          {renderComponent()}
        </Paper>
      </Box>
    </Box>
  );
}