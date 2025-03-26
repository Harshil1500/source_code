import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Container,
  Avatar
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { motion } from "framer-motion";

// Components
import Info from "./Pages/Info";
import Drives from "./Pages/Drives";
import Applied from "./Pages/Applied";
import ManageProfile from "./ManageProfile";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: "#5c6bc0",
  color: "white",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  backgroundColor: "#5c6bc0",
  color: "white",
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: "#5c6bc0",
  color: "white",
  boxShadow: "none",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const menuItems = [
  { text: "Drives", icon: <AnnouncementOutlinedIcon />, component: "Drives" },
  { text: "Applied", icon: <HistoryOutlinedIcon />, component: "Applied" },
  { text: "Profile", icon: <ManageAccountsOutlinedIcon />, component: "ManageProfile" },
  { text: "Info", icon: <InfoOutlinedIcon />, component: "Info" },
];

export default function StudentDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const auth = getAuth();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeComponent, setActiveComponent] = useState("Drives");
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [accountDisabled, setAccountDisabled] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (window.location.pathname !== "/Login") {
          navigate("/Login", { replace: true });
        }
        return;
      }
      setUser(currentUser);
      
      // Set up real-time listener for user data
      const userRef = doc(db, "users", currentUser.uid);
      const unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setUserData(data);
          
          // Check if account is disabled
          if (data.userType === "student" && data.isEnable === false) {
            setAccountDisabled(true);
          } else {
            setAccountDisabled(false);
          }
        }
        setLoading(false);
      });

      return () => unsubscribeUser();
    });
    return () => unsubscribeAuth();
  }, [auth, navigate]);

  const handleMenuItemClick = (component) => {
    setActiveComponent(component);
  };

  const displayUserName = () => {
    if (loading) return "Loading...";
    if (!userData) return "Student";
    
    if (userData.FullName) return userData.FullName;
    if (userData.fullName) return userData.fullName;
    if (userData.name) return userData.name;
    
    const firstName = userData.firstName || "";
    const lastName = userData.lastName || "";
    
    return `${firstName} ${lastName}`.trim() || "Student";
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      window.sessionStorage.clear();
      window.location.pathname = "/Login";
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  // Show disabled account message if account is disabled
  if (accountDisabled) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'error.main', mb: 2, mx: 'auto' }}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5" gutterBottom>
            Account Disabled
          </Typography>
          <Typography paragraph>
            Your account has been disabled by the administrator.
          </Typography>
          <Typography paragraph>
            Please contact your Placement Officer or Administrator to enable your account.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PowerSettingsNewIcon />}
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Paper>
      </Container>
    );
  }

  // Show loading state while checking user status
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Main dashboard view
  return (
    <Box sx={{ 
      display: "flex", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0f7fa, #bbdefb, #d1c4e9)"
    }}>
      <CssBaseline />
      
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle1">
              Welcome, {displayUserName()}
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={logoutLoading ? <CircularProgress size={20} color="inherit" /> : <PowerSettingsNewIcon />}
              onClick={handleLogout}
              disabled={logoutLoading}
              sx={{
                textTransform: 'none',
                borderRadius: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }
              }}
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={() => setOpen(!open)} sx={{ color: "white" }}>
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        
        <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }} />
        
        <List>
          {menuItems.map((item) => (
            <motion.div
              key={item.component}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ListItemButton
                onClick={() => handleMenuItemClick(item.component)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  backgroundColor: activeComponent === item.component ? "rgba(255, 255, 255, 0.2)" : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ opacity: open ? 1 : 0 }} 
                />
              </ListItemButton>
            </motion.div>
          ))}
        </List>
      </Drawer>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: 2,
          margin: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
        }}
      >
        <DrawerHeader />
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3,
            borderRadius: 2,
            minHeight: "80vh",
            backgroundColor: "rgba(255, 255, 255, 0.9)"
          }}
        >
          <motion.div
            key={activeComponent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeComponent === "Drives" && <Drives />}
            {activeComponent === "Applied" && <Applied />}
            {activeComponent === "ManageProfile" && <ManageProfile user={user} userData={userData} />}
            {activeComponent === "Info" && <Info />}
          </motion.div>
        </Paper>
      </Box>
    </Box>
  );
}