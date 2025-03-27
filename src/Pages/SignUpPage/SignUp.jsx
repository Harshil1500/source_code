  import React, { useState } from "react";
  import { useNavigate } from "react-router-dom";
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
    Paper,
    Stack
  } from "@mui/material";
  import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
  import EmailIcon from "@mui/icons-material/Email";
  import BadgeIcon from "@mui/icons-material/Badge";
  import PersonIcon from "@mui/icons-material/Person";
  import VisibilityIcon from "@mui/icons-material/Visibility";
  import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
  import { Link } from "react-router-dom";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { doc, serverTimestamp, setDoc } from "firebase/firestore";
  import { auth, db } from "../../firebase";
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { collection, query, where, getDocs } from "firebase/firestore";
  import { motion } from "framer-motion";
import { PhotoSizeSelectLarge } from "@mui/icons-material";


  const SignUp = () => {
    const [data, setData] = useState({});
    const [passError, setPassError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInput = (e) => {
      setData({ ...data, [e.target.id]: e.target.value });
      // Reset errors when user types
      if (e.target.id === "email") setEmailError(false);
      if (e.target.id === "password") setPassError(false);
    };

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    const notifySuccess = () => toast.success("Account created successfully!");
    const notifyError = (errorMessage) => toast.error(errorMessage);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      
      if (!data.lastName?.trim()) {
        notifyError("Full name is required");
        setLoading(false);
        return;
      }
      
      if (!data.erNo || data.erNo.length !== 10) {
        notifyError("Enrollment number must be exactly 10 characters long");
        setLoading(false);
        return;
      }
      
      if (!data.email?.trim()) {
        notifyError("Email is required");
        setEmailError(true);
        setLoading(false);
        return;
      }
      
      if (!data.password || data.password.length < 6) {
        notifyError("Password must be at least 6 characters long");
        setPassError(true);
        setLoading(false);
        return;
      }
    
      try {
        // Check if the email already exists
        const emailQuery = query(collection(db, "users"), where("email", "==", data.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          notifyError("Email is already in use");
          setEmailError(true);
          setLoading(false);
          return;
        }
    
        // Check if the enrollment number already exists
        const enrollQuery = query(collection(db, "users"), where("erNo", "==", data.erNo));
        const enrollSnapshot = await getDocs(enrollQuery);
        if (!enrollSnapshot.empty) {
          notifyError("Enrollment number is already in use");
          setLoading(false);
          return;
        }
    
        // Create user in Firebase Authentication
        const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        // Create a copy of data to avoid mutating the state directly
        const userDataToSave = { ...data };
        delete userDataToSave.password; // Don't store password in Firestore
    
        const userData = {
          ...userDataToSave,
          userType: "student",
          isEnable: false,
          timeStamp: serverTimestamp(),
          profileCompleted: false,
        };
    
        await setDoc(doc(db, "users", res.user.uid), userData);
    
        await setDoc(doc(db, "students", res.user.uid), {
          isFirstTime: true,
        });
    
        // Store Data in sessionStorage for Profile Completion
        sessionStorage.setItem("uid", res.user.uid);
        sessionStorage.setItem("firstName", data.firstName);
        sessionStorage.setItem("lastName", data.lastName);
        sessionStorage.setItem("erNo", data.erNo);
        sessionStorage.setItem("email", data.email);
    
        notifySuccess();
        setTimeout(() => {
          navigate("/complete-profile");
        }, 1500);
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          notifyError("The provided email is already in use");
          setEmailError(true);
        } else if (error.code === "auth/weak-password") {
          notifyError("Password must be at least six characters");
          setPassError(true);
        } else {
          notifyError(error.message);
        }
        setLoading(false);
      }
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

    const imageVariants = {
      hidden: { opacity: 0, x: 50 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6, delay: 0.3 }
      }
    };
    
    return (
      <Box xl={{
        height: '100vh',
        width: '100vw',

        display: 'flexx',
         background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
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
                      { <Avatar 
                        sx={{ 
                          m: "auto", 
                          bgcolor: '#fff',
                          width: 70,
                          height: 70,
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          border: '4px solid #fff'
                        }}
                      >
                        <PersonAddOutlinedIcon sx={{ color: "#5c6bc0", fontSize: 35 }} />
                      </Avatar> }
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Typography component="h4" variant="h4" align="center" sx={{ mt: 2, fontWeight: 400, color: '#fff' }}>
                        
                          Student Registration
                      </Typography>
                    </motion.div>
                  </Box>
                  <CardContent sx={{ padding: 4, bgcolor: "#fff" }}>
                    <Box component="form" onSubmit={handleSubmit}>
                     { <motion.div variants={itemVariants}>
                        <TextField
                          variant="outlined"
                          margin="normal"
                        
                           fullWidth
                          id="firstName"
                          label="First Name"
                          name="firstName"
                          autoFocus
                          onChange={handleInput}
                          InputProps={{ 
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: "#5c6bc0" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "rgba(92, 107, 192, 0.3)" },
                              "&:hover fieldset": { borderColor: "#5c6bc0" },
                              "&.Mui-focused fieldset": { borderColor: "#5c6bc0" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#5c6bc0" },
                          }}
                        />
                      </motion.div> }
                      
                      <motion.div variants={itemVariants}>
                        <TextField
                          variant="outlined"
                          margin="normal"
                          
                          fullWidth
                          id="lastName"
                          label="LastName"
                          name="lastName"
                          onChange={handleInput}
                          InputProps={{ 
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: "#5c6bc0" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "rgba(92, 107, 192, 0.3)" },
                              "&:hover fieldset": { borderColor: "#5c6bc0" },
                              "&.Mui-focused fieldset": { borderColor: "#5c6bc0" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#5c6bc0" },
                          }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <TextField
                          variant="outlined"
                          margin="normal"
                        
                          fullWidth
                          id="erNo"
                          label="Enrollment Number"
                          name="erNo"
                          onChange={handleInput}
                          InputProps={{ 
                            startAdornment: (
                              <InputAdornment position="start">
                                <BadgeIcon sx={{ color: "#5c6bc0" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: "rgba(92, 107, 192, 0.3)" },
                              "&:hover fieldset": { borderColor: "#5c6bc0" },
                              "&.Mui-focused fieldset": { borderColor: "#5c6bc0" },
                            },
                            "& .MuiInputLabel-root.Mui-focused": { color: "#5c6bc0" },
                          }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <TextField
                          variant="outlined"
                          margin="normal"
                        
                          fullWidth
                          id="email"
                          label="Email Address"
                          name="email"
                          error={emailError}
                          onChange={handleInput}
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
                          onChange={handleInput}
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
                          disabled={loading}
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
                          {loading ? "Creating Account..." : "Sign Up"}
                        </Button>
                      </motion.div>
                    </Box>
                    
                    <motion.div variants={itemVariants}>
                      <Grid container justifyContent="center" sx={{ mt: 2 }}>
                        <Link to="/login" style={{ 
                          textDecoration: "none", 
                          color: "#5c6bc0",
                          fontWeight: 500,
                          transition: "all 0.2s ease-in-out",
                        }}>
                          Already have an account? Sign In
                        </Link>
                      </Grid>
                    </motion.div>
                  </CardContent>
                </Paper>
              </motion.div>
            </Grid>

            {/* Right Side Image Section */}
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
                initial="hidden"
                animate="visible"
                variants={imageVariants}
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
                   component="img"
                   src="/images/pic1.png"
                                               
                  alt="Student registration"
                  sx={{
                    maxWidth: '100%', // Image stretch na thay
                    height: 'auto', // Aspect ratio maintain
                    borderRadius: '15px',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
                    display: { xs: 'none', md: 'block' }
                  }}
                />
                
                <Stack spacing={2} sx={{ mt: 4, textAlign: 'center', maxWidth: '80%' }}>
                  <Typography variant="h4" fontWeight="bold" color="#3f51b5">
                    Welcome to Campus Connect
                  </Typography>
                  <Typography variant="body1" color="#555">
                    Join our platform to access course materials, connect with professors, 
                    and collaborate with fellow students. Your academic journey starts here!
                  </Typography>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
        <ToastContainer position="top-right" autoClose={3000} limit={3} theme="colored" />
      </Box>
    );
  };

  export default SignUp;