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
    
      // Form validation
      if (!data.firstName?.trim()) {
        notifyError("First name is required");
        setLoading(false);
        return;
      }
      
      if (!data.lastName?.trim()) {
        notifyError("Last name is required");
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
                      {/* <Avatar 
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
                      </Avatar> */}
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Typography component="h4" variant="h4" align="center" sx={{ mt: 2, fontWeight: 400, color: '#fff' }}>
                        
                          Student Registration
                      </Typography>
                    </motion.div>
                  </Box>
                  <CardContent sx={{ padding: 4, bgcolor: "#fff" }}>
                    <Box component="form" onSubmit={handleSubmit}>
                      <motion.div variants={itemVariants}>
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
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <TextField
                          variant="outlined"
                          margin="normal"
                          
                          fullWidth
                          id="lastName"
                          label="Last Name"
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
                  padding: '2rem',
                }}
              >
                <Box
                  component="img"
                  src="data:image/jpeg;base64,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"
                  alt="Student registration"
                  x={{
                    maxWidth: '100vh',
                    maxHeight: '100vh',
                    objectFit: 'contain',
                    borderRadius: 4,
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
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