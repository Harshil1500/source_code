import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Avatar, 
  Button, 
  CssBaseline, 
  TextField, 
  Grid, 
  Box, 
  Typography, 
  Container, 
  CardContent,
  InputAdornment,
  IconButton,
  Paper
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { motion } from "framer-motion";
//import {photos} from "./pic1.jpg";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const uidGet = sessionStorage.getItem('uid');
    if (uidGet) navigate('/dash');
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sessionStorage.setItem('uid', userCredential.user.uid);
        navigate('/dash');
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          toast.error("User Not Found");
          setEmailError(true);
        } else if (error.code === 'auth/wrong-password') {
          toast.error("Invalid Password.");
          setPassError(true);
        } else if (error.code === 'auth/too-many-requests') {
          toast.error("Too many failed attempts. Try again later.");
          setDisabled(true);
        } else {
          toast.error(error.message);
        }
      });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 5 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <Box sx={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      background: 'linear-gradient(135deg, #e0f7fa, #bbdefb, #d1c4e9)',
    }}>
      <CssBaseline />
      <Container 
        maxWidth="xl" 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 0.1, md: 1 },
          height: '100%',
        }}
      >
        <Grid container spacing={0} sx={{ height: '100%', maxHeight: '700px' }}>
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              style={{ width: '100%', maxWidth: '500px' }}
            >
              <Paper
                elevation={12}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: '#5c6bc0',
                    padding: 3,
                    textAlign: 'center',
                  }}
                >
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar 
                      sx={{ 
                        m: "auto", 
                        bgcolor: '#fff',
                        width: 70,
                        height: 70,
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        border: '4px solid #fff'
                      }}
                    >
                      <LockOutlinedIcon sx={{ color: "#5c6bc0", fontSize: 35 }} />
                    </Avatar>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Typography component="h4" variant="h4" align="center" sx={{ mt: 3, fontWeight: 600, color: '#ffff' }}>
                       Login 
                    </Typography>
                  </motion.div>
                </Box>
                <CardContent sx={{ padding: 4, bgcolor: "#fff" }}>
                  <Box component="form" onSubmit={handleLogin}>
                    <motion.div variants={itemVariants}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        error={emailError}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(false);
                        }}
                        InputProps={{ 
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: emailError ? "error.main" : "#5c6bc0" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: emailError ? "error.main" : "rgba(92, 107, 192, 0.3)" },
                            "&:hover fieldset": { borderColor: emailError ? "error.main" : "#5c6bc0" },
                            "&.Mui-focused fieldset": { borderColor: emailError ? "error.main" : "#5c6bc0" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: emailError ? "error.main" : "#5c6bc0" },
                        }}
                      />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        error={passError}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPassError(false);
                        }}
                        InputProps={{ 
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleTogglePassword}
                                edge="end"
                                sx={{ color: passError ? "error.main" : "#5c6bc0" }}
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: passError ? "error.main" : "rgba(92, 107, 192, 0.3)" },
                            "&:hover fieldset": { borderColor: passError ? "error.main" : "#5c6bc0" },
                            "&.Mui-focused fieldset": { borderColor: passError ? "error.main" : "#5c6bc0" },
                          },
                          "& .MuiInputLabel-root.Mui-focused": { color: passError ? "error.main" : "#5c6bc0" },
                        }}
                      />
                    </motion.div>
                    
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={disabled}
                        sx={{ 
                          mt: 3, 
                          mb: 3, 
                          py: 1.5,
                          bgcolor: '#5c6bc0', 
                          color: 'white', 
                          fontWeight: 600, 
                          borderRadius: 2,
                          boxShadow: '0 4px 10px rgba(92, 107, 192, 0.3)',
                          '&:hover': { 
                            bgcolor: '#3f51b5',
                            boxShadow: '0 6px 15px rgba(92, 107, 192, 0.4)',
                          } 
                        }} 
                      >
                        Sign In
                      </Button>
                    </motion.div>
                  </Box>
                  
                  <motion.div variants={itemVariants}>
                    <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
                      <Link to="/signup" style={{ 
                        textDecoration: "none", 
                        color: "#5c6bc0",
                        fontWeight: 500,
                        transition: "all 0.2s ease-in-out",
                      }}>
                        Don't have an account? Sign Up
                      </Link>
                      <Link to="/reset" style={{ 
                        textDecoration: "none", 
                        color: "#5c6bc0",
                        fontWeight: 500,
                        transition: "all 0.2s ease-in-out",
                      }}>
                        Forgot password?
                      </Link>
                    </Grid>
                  </motion.div>
                </CardContent>
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Side Welcome Section */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ 
                height: '100%', 
                width: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: '4rem',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '300px',
                 backgroundColor: '',
                  borderRadius: 4,
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                //  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)'
                }}
              >
              <Box
              component="img"
              src="/images/pic1.png"
              alt="Campus Connect"
              sx={{
                maxWidth: '100%', // Image stretch na thay
                height: 'auto', // Aspect ratio maintain
                borderRadius: '15px',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
                display: { xs: 'none', md: 'block' }
              }}
            />


              </Box>
              
              <Typography variant="h4"  fontWeight="bold" color="#3f51b5" gutterBottom >
                Welcome to Campus Connect
              </Typography>
              <Typography variant="body1" color="#555" textAlign="center">
                Join our platform to access course materials, connect with professors, 
                and collaborate with fellow students. Your academic journey starts here!
              </Typography>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} limit={3} theme="colored"  />
    </Box>
  );
};

export default Login;