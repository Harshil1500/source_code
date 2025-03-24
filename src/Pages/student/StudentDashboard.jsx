import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Tooltip } from "@mui/material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../../firebase";
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
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const auth = getAuth();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [component, setComponent] = useState("Drives");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  return (
    <Box sx={{ display: "flex", color: "#555555" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ backgroundColor: "#D9E4DD", color: "#555555" }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpen(!open)} edge="start">
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {user ? `Welcome, ${user.firstame || "Student"}` : "Loading..."}
          </Typography>
          <Tooltip title="Logout">
            <IconButton onClick={() => signOut(auth).then(() => navigate("/"))}>
              <PowerSettingsNewIcon sx={{ color: "#555555" }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={() => setOpen(!open)}>
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItemButton onClick={() => setComponent("Drives")}>
            <ListItemIcon><AnnouncementOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Drives" />
          </ListItemButton>
          <ListItemButton onClick={() => setComponent("Applied")}>
            <ListItemIcon><HistoryOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Applied" />
          </ListItemButton>
          <ListItemButton onClick={() => setComponent("ManageProfile")}>
            <ListItemIcon><ManageAccountsOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Manage Profile" />
          </ListItemButton>
          <ListItemButton onClick={() => setComponent("Info")}>
            <ListItemIcon><InfoOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Info" />
          </ListItemButton>
        </List>
        <Divider />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {component === "Drives" && <Drives />}
        {component === "Applied" && <Applied />}
        {component === "ManageProfile" && <ManageProfile user={user} />}
        {component === "Info" && <Info />}
      </Box>
    </Box>
  );
}
