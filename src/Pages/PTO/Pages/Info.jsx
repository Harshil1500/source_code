import { Box, Button, CssBaseline, Divider, Grid, Paper, TextField, Typography } from '@mui/material'
import { Container } from '@mui/system'
import React, { useState } from 'react'

// firebase
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// tostify
import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

import { db } from '../../../firebase';
import { useEffect } from 'react';




const Info = (props) => {


  //tostify
  const notifySuccess = () => toast.success("Check your mail for reset password ...");
  const notifyUpdate = () => toast.success("Profile updated...");
  const notifyError = (errorMessage) => toast.error(errorMessage);

  const uid = sessionStorage.getItem('uid')
  // user info data
  const [data,setData] = useState({...props.user})

    // handleInput
    const handleInput = (e) =>{
      const id = e.target.id;
      const value = e.target.value
  
      setData({...data,[id]:value})
      console.log(data);
    }

    const fatchData = async () => {

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setData(userData) 
        
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  
  const handleSubmitUpdateDetails = async(e) => {
    e.preventDefault()
    
    const updateData = doc(db, "users", uid);

    // update Data
    try{
      await updateDoc(updateData, {
        ...data
      });
      fatchData()
      notifyUpdate()
    }
    catch(e){
      console.log(e);
    }

  }
  useEffect(()=>{
    fatchData()
  },[])



  const resetPassword = () =>{
    const auth = getAuth();
    sendPasswordResetEmail(auth, props.user.email)
      .then(() => {
        notifySuccess()
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        notifyError(errorMessage)
      });
  }



  return (
    <>  
    {/* {JSON.stringify(props.user)} */}
    <Grid container spacing={2}>
          <Grid item xs={11} sm={11} md={5} lg={4}>
            {/* pto section */}
            <Container >
              <CssBaseline />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px'
                }}
                component={Paper}
              >

                <Typography component="h1" variant="h5">
                  Profile
                </Typography>

                <Divider sx={{ marginY: '15px' }} />

                <Box component="form"
                  sx={{ mt: 3 }}
                  onSubmit={handleSubmitUpdateDetails}

                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant='standard'
                        name="firstName"
                        required
                        fullWidth
                        type='text'
                        id="firstName"
                        label="First Name"
                        onChange={handleInput}
                        value={data.firstName}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant='standard'
                        name="lastName"
                        required
                        type='text'
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        onChange={handleInput}
                        value={data.lastName}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant='standard'
                        name="email"
                        required
                        fullWidth
                        id="email"
                        type='email'
                        label="email"
                        disabled
                        value={data.email}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 3, mb: 2 }}
                    type='submit'
                  >
                    Update
                  </Button>
                </Box>
              </Box>
            </Container>
          </Grid>

          <Grid item xs={11} sm={11} md={5} lg={4}>
            {/* Change Password section */}
            <Container >
              <CssBaseline />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px'
                }}
                component={Paper}
              >

                <Typography component="h1" variant="h5">
                  Reset Password
                </Typography>

                <Divider sx={{ marginY: '15px' }} />

                <Typography>reset your password via mail <Button variant='text' onClick={resetPassword}>Send me mail</Button> </Typography>
                
              </Box>
            </Container>
          </Grid>

          </Grid>
          <ToastContainer />
    </>
  )
}

export default Info