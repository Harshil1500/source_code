import React, { useEffect } from 'react';
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
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Paper, Tooltip } from '@mui/material';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
// icons 
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PermContactCalendarOutlinedIcon from '@mui/icons-material/PermContactCalendarOutlined';
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

import PtoManage from './Pages/PtoManage';
import ManageDrives from '../CommonPages/ManageDrives';
import Info from './Pages/Info';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import StudentsNew from '../CommonPages/StudentsNew';



const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
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
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
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
  const [open, setOpen] = React.useState(false);

  // for navigation 
  const navigate = useNavigate();

  const singOut = () =>{
    sessionStorage.clear()
    navigate('/')
  }


    // fatch data
    const [user,setUser] = useState({})
    console.log(user)
    const userUID = sessionStorage.getItem("uid")
    console.log(userUID);
  
    const fatchData = async () => {
      const docRef = doc(db, "users", userUID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser(userData) 
        
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  
    useEffect(()=>{
      fatchData()
    },[])


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };



  const [component, setComponent] = useState('ManageDrives')


  return (
    <Box sx={{ display: 'flex' ,color:'#555555',fontSize:'20px'}}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{backgroundColor:'#D9E4DD',color:'#555555'}}>
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

          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between' , alignItems: 'center' , width:'100%'}}> 


          <Typography variant="h6" noWrap component="div">
            Admin 
          </Typography>
          <Tooltip title="Logout">
            <IconButton onClick={singOut}>
               <PowerSettingsNewIcon  sx={{color:'#555555'}}/>
            </IconButton>
          </Tooltip>
          </Box>


        </Toolbar>
      </AppBar>


      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />

        <List>


          {/* drive info */}
          <ListItem>
          <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                 onClick={() => setComponent('ManageDrives')}
              >
                
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {/* drive icon */}
                  <AnnouncementOutlinedIcon/>
                </ListItemIcon>
                <ListItemText primary='Drives' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
          </ListItem>

          {/* PTO manage info */}
          <ListItem>
          <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                 onClick={() => setComponent('PtoManage')}
              >
                
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {/* PTOS icon */}
                  <BadgeOutlinedIcon/>
                </ListItemIcon>
                <ListItemText primary='PTOs' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
          </ListItem>

          {/* students  info */}
          <ListItem>
          <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                 onClick={() => setComponent('Students')}
              >
                
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {/* student icon */}
                  <PermContactCalendarOutlinedIcon/>
                </ListItemIcon>
                <ListItemText primary='Students' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
          </ListItem>

          <Divider />
          {/* info list  info */}
          <ListItem>
          <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                 onClick={() => setComponent('Info')}
              >
                
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {/* drive icon */}
                  <ManageAccountsOutlinedIcon/>
                </ListItemIcon>
                <ListItemText primary='Profile' sx={{ opacity: open ? 1 : 0 }} />
          </ListItemButton>
          </ListItem>

        </List>
        <Divider />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />

        {
          component === 'ManageDrives' ? <ManageDrives />  : component === 'PtoManage' ? <PtoManage />  : component === 'Students' ? <StudentsNew />  : component === 'Info' ? <Info user={{...user}}/>  : ""
        }
      </Box>
    </Box>
  );
}