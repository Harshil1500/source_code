import { AppBar, Avatar, Button, CssBaseline, Dialog, Divider, Fab, Grid, IconButton, InputAdornment, MenuItem, OutlinedInput, Paper, Select, Slide, Switch, TextField, Toolbar, Typography } from '@mui/material'
import { Box, Container } from '@mui/system'
import React, { useEffect, useState } from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// imports for icons 
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import CloseIcon from '@mui/icons-material/Close';

//firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';


// tostify
import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

// for drawer
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ManageDrives = () => {

  //tostify
  const notifyDriveCreated = () => toast.success("Drive Created ...");
  const notifyDriveDeleted = () => toast.success("Drive Deleted ...");
  const notifyError = (errorMessage) => toast.error(errorMessage);

  // Drive table
  const [row, setRow] = useState([]);

  const fatchData = async () => {
    let list = [];
    try {
      const querySnapshot = await getDocs(collection(db, "drives"));
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() })
      });
      setRow(list)
    }
    catch (error) {
      console.log(error);
    }
  }

  // form data
  const [data, setData] = useState({
    driveTitle: '',
    driveCompanyName: '',
    driveLastDate: '',
    driveSalary: '',
    driveSscPerc: '',
    driveHscPerc: '',
    driveBachelorPerc: '',
    driveNoOpenings: '',
    driveBond: '',
    driveBondTime: '',
    driveDesc: '',
    driveInterviewMode: '',
    driveWebsiteLink: '',
    driveContactNo: '',
    driveRegards: '',
    driveUploadImage: null,
  });

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    setData({ ...data, [id]: value });
  }

  const resetInput = () => {
    setData({
      driveTitle: '',
      driveCompanyName: '',
      driveLastDate: '',
      driveSalary: '',
      driveSscPerc: '',
      driveHscPerc: '',
      driveBachelorPerc: '',
      driveNoOpenings: '',
      driveBond: '',
      driveBondTime: '',
      driveDesc: '',
      driveInterviewMode: '',
      driveWebsiteLink: '',
      driveContactNo: '',
      driveRegards: '',
      driveUploadImage: null,
    });
  }
const [drives, setDrives] = useState([]);
  useEffect(() => {
    fatchData()
    const fetchAndFilterDrives = async () => {
      const querySnapshot = await getDocs(collection(db, "drives")); // 🔹 Fetch all drives
      const today = new Date().toISOString().split("T")[0]; // 🔹 Get today’s date in YYYY-MM-DD format
  
      const validDrives = [];
  
      querySnapshot.forEach(async (driveDoc) => {
        const driveData = driveDoc.data();
        if (driveData.driveLastDate >= today) {
          validDrives.push({ id: driveDoc.id, ...driveData }); // ✅ Keep valid (future) drives
        } else {
          await deleteDoc(doc(db, "drives", driveDoc.id)); // ❌ Delete expired drives
        }
      });
  
      setDrives(validDrives); // 🔹 Update state with valid drives only
    };
  
    fetchAndFilterDrives();
  }, []);
  

  // drawer
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // handle submit drive
 /* const handleSubmitDrive = async (e) => {
    e.preventDefault();

    // Validate the form fields
    if (!data.driveTitle || !data.driveCompanyName || !data.driveLastDate || !data.driveSalary || !data.driveInterviewMode || !data.driveWebsiteLink) {
      notifyError('Please fill all required fields');
      return;
    }

    if (new Date(data.driveLastDate) < new Date()) {
      notifyError('Last date cannot be in the past');
      return;
    }

    if (isNaN(data.driveSalary)) {
      notifyError('Salary must be a numeric value');
      return;
    }

    if (data.driveBond === 'yes' && !data.driveBondTime) {
      notifyError('Bond time is required if bond/agreement is yes');
      return;
    }

    if (data.driveBond === 'yes' && isNaN(data.driveBondTime)) {
      notifyError('Bond time must be a numeric value');
      return;
    }

    if (!/^\d{10}$/.test(data.driveContactNo)) {
      notifyError('Contact number must be a valid 10-digit mobile number');
      return;
    }

    let currentDate = new Date().toJSON().slice(0, 10);
    try {
      // Add a new document with a generated id.
      const docRef = await addDoc(collection(db, "drives"), {
        ...data,
        createDate: currentDate
      });

      await setDoc(doc(db, "applications", docRef.id), {
        appliedList: [],
        selectedList: []
      });

      fatchData()
      notifyDriveCreated()
    }
    catch (e) {
      console.log(e);
      notifyError(e)
    }
  }*/
    const handleSubmitDrive = async (e) => {
      e.preventDefault();
  
      // Validate the form fields
      if (!data.driveTitle || !data.driveCompanyName || !data.driveLastDate || !data.driveSalary || !data.driveInterviewMode || !data.driveWebsiteLink) {
        notifyError('Please fill all required fields');
        return;
      }
  
      if (new Date(data.driveLastDate) < new Date()) {
        notifyError('Last date cannot be in the past');
        return;
      }
  
      if (isNaN(data.driveSalary)) {
        notifyError('Salary must be a numeric value');
        return;
      }
  
      if (data.driveBond === 'yes' && !data.driveBondTime) {
        notifyError('Bond time is required if bond/agreement is yes');
        return;
      }
  
      if (data.driveBond === 'yes' && isNaN(data.driveBondTime)) {
        notifyError('Bond time must be a numeric value');
        return;
      }
  
      if (!/^\d{10}$/.test(data.driveContactNo)) {
        notifyError('Contact number must be a valid 10-digit mobile number');
        return;
      }
  
      let currentDate = new Date().toJSON().slice(0, 10);
  
      try {
          // *Check if the drive already exists*
          const querySnapshot = await getDocs(collection(db, "drives"));
          let isDuplicate = false;
  
          querySnapshot.forEach((doc) => {
              const existingDrive = doc.data();
              if (
                  existingDrive.driveTitle.toLowerCase() === data.driveTitle.toLowerCase() &&
                  existingDrive.driveCompanyName.toLowerCase() === data.driveCompanyName.toLowerCase()
              ) {
                  isDuplicate = true;
              }
          });
  
          if (isDuplicate) {
              notifyError("A drive with the same title and company name already exists!");
              return;
          }
  
          // *If no duplicate, proceed with adding the drive*
          const docRef = await addDoc(collection(db, "drives"), {
              ...data,
              createDate: currentDate
          });
  
          await setDoc(doc(db, "applications", docRef.id), {
              appliedList: [],
              selectedList: []
          });
  
          fatchData();
          notifyDriveCreated();
      } catch (e) {
          console.log(e);
          notifyError(e.message);
      }
  };
  
  

  // handle delete drive
  const handleDelete = async (driveId) => {
    try {
      await deleteDoc(doc(db, "drives", driveId));
      fatchData();
      notifyDriveDeleted();
    }
    catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <Grid container spacing={1}>

        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Grid item xs={12} sm={12} md={12} lg={12}>
            {/* Drive section */}

            <CssBaseline />
            <Box
              sx={{ padding: '20px' }}
            >
              <Typography variant="h6" >
                Create Drive
              </Typography>

              <Divider sx={{ marginY: '10px' }} />

              <Box
                component="form"
                noValidate
                onSubmit={handleSubmitDrive}
              >
                {/* General Grid */}
                <Typography variant="body2" sx={{ marginY: '10px' }}>
                  General
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} md={6} lg={3}>
                    <TextField
                      required
                      id="driveTitle"
                      name="driveTitle"
                      label="Title"
                      fullWidth
                      type='text'
                      variant="outlined"
                      value={data.driveTitle}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3}>
                    <TextField
                      required
                      id="driveCompanyName"
                      name="driveCompanyName"
                      label="Company Name"
                      fullWidth
                      type='text'
                      variant="outlined"
                      value={data.driveCompanyName}
                      onChange={handleInput}
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={12} md={6} lg={3}>
                    <TextField
                      required
                      id="driveLastDate"
                      name="driveLastDate"
                      fullWidth
                      variant="outlined"
                      type='date'
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Last Date</InputAdornment>,
                      }}
                      value={data.driveLastDate}
                      onChange={handleInput}
                    />
                  </Grid> */}
                  <Grid item xs={12} sm={12} md={6} lg={3}>
                    <TextField
                      required
                      id="driveLastDate"
                      name="driveLastDate"
                      fullWidth
                      variant="outlined"
                      type="date"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Last Date</InputAdornment>,
                      }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0], // ✅ Disable past dates
                      }}
                      value={data.driveLastDate}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={3}>
                    <TextField
                      required
                      id="driveSalary"
                      name="driveSalary"
                      fullWidth
                      variant="outlined"
                      type='number'
                      label="Salary"
                      value={data.driveSalary}
                      onChange={handleInput}
                    />
                  </Grid>
                </Grid>

                {/* Bond Grid */}
                <Typography variant="body2" sx={{ marginY: '10px' }}>
                  Bond/Agreement
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} md={6} lg={6}>
                    <TextField
                      required
                      id="driveBond"
                      name="driveBond"
                      label="Bond/Agreement"
                      fullWidth
                      type='text'
                      variant="outlined"
                      value={data.driveBond}
                      onChange={handleInput}
                      helperText="if not, mention nill"
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={6}>
                    <TextField
                      required={data.driveBond === 'yes'}
                      id="driveBondTime"
                      name="driveBondTime"
                      label="Bond Time (in months)"
                      fullWidth
                      type='number'
                      variant="outlined"
                      value={data.driveBondTime}
                      onChange={handleInput}
                      disabled={data.driveBond !== 'yes'}
                    />
                  </Grid>
                </Grid>

                {/* Description Grid */}
                <Typography variant="body2" sx={{ marginY: '10px' }}>
                  Description
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      id="driveDesc"
                      name='driveDesc'
                      label="Description"
                      multiline
                      fullWidth
                      rows={4}
                      value={data.driveDesc}
                      onChange={handleInput}
                    />
                  </Grid>
                </Grid>

                {/* Other Grid */}
                <Typography variant="body2" sx={{ marginY: '10px' }}>
                  Other Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <TextField
                      required
                      id="driveInterviewMode"
                      name="driveInterviewMode"
                      label="Interview Mode"
                      fullWidth
                      type='text'
                      variant="outlined"
                      value={data.driveInterviewMode}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <TextField
                      required
                      id="driveWebsiteLink"
                      name="driveWebsiteLink"
                      label="Website Link"
                      fullWidth
                      type='text'
                      variant="outlined"
                      value={data.driveWebsiteLink}
                      onChange={handleInput}
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={12} md={6} lg={4}>
                    <TextField
                      required
                      id="driveContactNo"
                      name="driveContactNo"
                      label="Contact No"
                      fullWidth
                      type='number'
                      variant="outlined"
                      value={data.driveContactNo}
                      onChange={handleInput}
                    />
                  </Grid> */}
                  <Grid item xs={12} sm={12} md={6} lg={4}>
       <TextField
             required
             id="driveContactNo"
         name="driveContactNo"
    label="Contact No"
    fullWidth
    type="text" // Change to text to allow regex validation
    variant="outlined"
    value={data.driveContactNo}
    onChange={(e) => {
      const regex = /^[0-9]{0,10}$/; // Allows up to 10 digits only
      if (regex.test(e.target.value)) {
        handleInput(e); // Only update if the input matches the regex
      }
    }}
    inputProps={{
      maxLength: 10, // Ensures a maximum of 10 digits
    }}
    helperText="Enter a valid 10-digit contact number"
  />
</Grid>

                </Grid>

                <Grid container spacing={3} sx={{ marginY: '10px' }}>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <TextField
                      id="driveRegards"
                      name='driveRegards'
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Regards</InputAdornment>,
                      }}
                      value={data.driveRegards}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6} lg={4}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setData({ ...data, driveUploadImage: e.target.files[0] })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} md={6} lg={2}>
                    <Button variant='contained' type='reset' color='error' fullWidth size='large' sx={{ margin: '3px' }} onClick={resetInput}>Reset</Button>
                  </Grid>
                  <Grid item xs={6} sm={6} md={6} lg={2}>
                    <Button variant='contained' type='submit' color='success' fullWidth size='large' sx={{ margin: '3px' }}>Create</Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>

          </Grid>
        </Dialog>

        {/* Drive table section */}
        <Grid item xs={12} sm={11} md={12} lg={12}>

          <CssBaseline />
          <Box
            sx={{
              padding: '20px'
            }}
            component={Paper}
          >

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'

              }}>
              <Box>

                <Typography component="h1" variant="h5" >
                  Drive List
                </Typography>
              </Box>
              <Box>
                <Button variant='text' onClick={handleClickOpen}>+ Add Drive</Button>
              </Box>

            </Box>

            <Divider sx={{ marginY: '15px' }} />

            <TableContainer>
              <Table sx={{ minWidth: 450 }} size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Title</b></TableCell>
                    <TableCell align='left'><b>Company Name</b></TableCell>
                    <TableCell align='left'><b>Last Date</b></TableCell>
                    <TableCell><b>Manage</b></TableCell>
                    <TableCell><b>Created At</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {row.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.driveTitle}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        {row.driveCompanyName}
                      </TableCell >

                      <TableCell component="th" scope="row">
                        {row.driveLastDate}
                      </TableCell >

                      <TableCell component="th" scope="row">
                        {row.createDate || row.date}
                      </TableCell >

                      <TableCell component="th" scope="row">
                        <IconButton color="error" onClick={() => handleDelete(row.id)}>
                          <DeleteOutlinedIcon />
                        </IconButton>
                        <Button variant='text' ><EditOutlinedIcon /></Button>
                      </TableCell >

                    </TableRow>
                  ))}

                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>

      </Grid>
      <ToastContainer />
    </>
  )
}

export default ManageDrives;