import { AppBar, Typography,Button,Toolbar, Grid,IconButton} from '@mui/material';
import {AccountCircle, LogoutRounded } from '@mui/icons-material';
import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = (props) => {
  return (
    <>
      <AppBar 
        position='sticky'
      >

        <Toolbar >
        <Grid 
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          >

            <Button 
            variant='text'
            sx={{color:"inherit"}}
            >
              {props.headName}
            </Button>
        
            <Grid 
              direction="column"
              justifyContent="space-between"
              alignItems="center"
              >
    
            <Link 
              to='/dash'
              sx={{color:"inherit",padding:"2em"}}
              >
                Feed
            </Link>
            <Link 
              to='/dash'
              sx={{color:"inherit",padding:"2em"}}
              >
                Applied
            </Link>
            </Grid>
            <Grid 
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              
          >

            <Button 
                variant='text'
                color="inherit"
                startIcon={<AccountCircle />}
                sx={{margin:"1em"}}
              >
                Profile
            </Button>
            
            <Link
                to="/" 
                variant='text'
                color="inherit"
                startIcon={<LogoutRounded />}
                sx={{margin:"1em"}}
              >
                Logout
            </Link>
            </Grid>
        </Grid>
        </Toolbar>
      </AppBar>

    </>
  )
}

export default Navbar