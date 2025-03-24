import { Box, Button, CssBaseline, Divider, Grid, Paper, TextField, Typography } from '@mui/material'
import { Container } from '@mui/system'
import React, { useState, useEffect } from 'react'

// Firebase
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Toastify
import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

import { db } from '../../../firebase';

const Info = ({ user, setUser }) => {  
  const uid = sessionStorage.getItem('uid');

  // User data state
  const [data, setData] = useState({ ...user });

  // Toast notifications
  const notifySuccess = () => toast.success("Check your mail for reset password ...");
  const notifyUpdate = () => toast.success("Profile updated...");
  const notifyError = (errorMessage) => toast.error(errorMessage);

  // Handle input change
  const handleInput = (e) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));
  };

  // Fetch user data from Firestore
  const fetchData = async () => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Update user details
  const handleSubmitUpdateDetails = async (e) => {
    e.preventDefault();
  
    try {
      const updateData = doc(db, "users", uid);
      await updateDoc(updateData, { ...data });
  
      setUser(data); // ✅ Update the user in parent state (Header will change)
      notifyUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      notifyError("Failed to update profile");
    }
  
  };

  // Reset password via email
  const resetPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, user.email)
      .then(() => notifySuccess())
      .catch((error) => notifyError(error.message));
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchData();
  }, [uid]); // ✅ Add dependency

  return (
    <>  
      <Grid container spacing={2}>
        {/* Profile Section */}
        <Grid item xs={11} sm={11} md={5} lg={4}>
          <Container>
            <CssBaseline />
            <Box
              sx={{ display: 'flex', flexDirection: 'column', padding: '20px' }}
              component={Paper}
            >
              <Typography component="h1" variant="h5">
                Profile
              </Typography>

              <Divider sx={{ marginY: '15px' }} />

              <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmitUpdateDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="standard"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      onChange={handleInput}
                      value={data.firstName || ''}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="standard"
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      onChange={handleInput}
                      value={data.lastName || ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      required
                      fullWidth
                      id="email"
                      type="email"
                      label="Email Address"
                      disabled
                      value={data.email || ""}
                      InputProps={{
                        style: { color: "#000", opacity: 1 },
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>
                <Button fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }} type="submit">
                  Update
                </Button>
              </Box>
            </Box>
          </Container>
        </Grid>

        {/* Change Password Section */}
        <Grid item xs={11} sm={11} md={5} lg={4}>
          <Container>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '20px' }} component={Paper}>
              <Typography component="h1" variant="h5">
                Reset Password
              </Typography>

              <Divider sx={{ marginY: '15px' }} />

              <Typography>
                Reset your password via mail
                <Button variant="text" onClick={resetPassword} sx={{ ml: 1 }}>
                  Send me mail
                </Button>
              </Typography>
            </Box>
          </Container>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default Info;
