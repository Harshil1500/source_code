import React, { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// icons
import RotateLeftOutlinedIcon from '@mui/icons-material/RotateLeftOutlined';

// tostify
import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

// firebase
import { getAuth, sendPasswordResetEmail } from "firebase/auth";


const ResetPassword = () => {


  // users hook
  const [data, setData] = useState({})

  //errors
  const [error, setError] = useState(false)



  // handleInput
  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value
    setData({ ...data, [id]: value })

  }

  console.log(data)

  // handle the signup form
  const handleSubmit = (e) => {


    //tostify
    const notifySuccess = () => toast.success("Check your email for reset password...");
    const notifyError = (errorMessage) => toast.error(errorMessage);

    e.preventDefault();

    try{

      const auth = getAuth();
      sendPasswordResetEmail(auth, data.email)
      .then(() => {
        notifySuccess()
      })
      .catch((error) => {
        notifyError(errorMessage)
        const errorCode = error.code;
            console.log(errorCode);
            const errorMessage = error.message;
            if(errorCode === 'auth/user-not-found'){
              notifyError("There is no existing user record corresponding to the provided Email")
              setError(true)
            }
            else if(errorCode === 'auth/admin-restricted-operation'){
              notifyError("Please enter proper email.")
              setError(true)
            }
            else if(errorCode === 'auth/internal-error'){
              notifyError("Please enter proper email.")
              setError(true)
            }
            else if(errorCode === 'auth/missing-email'){
              notifyError("Please enter proper email.")
              setError(true)
            }
            else if(errorCode === 'auth/invalid-email'){
              notifyError("Please enter proper email.")
              setError(true)
            }
            else{
              notifyError(errorMessage)
              setError(true)
            }
      });
    }
    catch(e){
      console.log(e);
    }
  }

  return (
    <>
      <Container component="main" maxWidth="xs" sx={{ height: '100%' }}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '90vh',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'transparent', color: 'black' }}>
            <RotateLeftOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>

          <Box component="form" 
            sx={{ mt: 3 }}
            onSubmit={handleSubmit}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant='outlined'
                  name="email"
                  required
                  fullWidth
                  id="email"
                  label="email"
                  type='email'
                  autoFocus
                  error={error}
                  onChange={handleInput}
                />
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 3, mb: 2 }}
              type='submit'
            >
              Send Mail
            </Button>
          </Box>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <ToastContainer />
    </>
  )
}

export default ResetPassword