import { Avatar, Button, CssBaseline, Divider, Grid, Paper, TextField, Typography } from '@mui/material';
import { Box, Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// Icons
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

// Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { collection, doc, getDocs, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';

// Toastify
import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

const PtoManage = () => {
  // Toastify notifications
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  // State
  const [passError, setPassError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [allErrors, setAllErrors] = useState(false);
  const [row, setRow] = useState([]);
  const [data, setData] = useState({});

  // Fetch data from Firestore
  const fetchData = async () => {
    let list = [];
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setRow(list);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle form input
  const handleInput = (e) => {
    const { id, value } = e.target;
    setData({ ...data, [id]: value });
  };

  // Handle user creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
      delete data.password; // Don't store passwords in Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        ...data,
        userType: 'pto',
        timeStamp: serverTimestamp(),
      });
      fetchData();
      notifySuccess('PTO user created successfully.');
    } catch (error) {
      console.log(error.code);
      switch (error.code) {
        case 'auth/email-already-in-use':
          notifyError('The provided email is already in use.');
          setEmailError(true);
          break;
        case 'auth/weak-password':
          notifyError('Password must be at least six characters.');
          setPassError(true);
          break;
        case 'auth/internal-error':
        case 'auth/admin-restricted-operation':
          notifyError('All fields are required.');
          setAllErrors(true);
          break;
        default:
          notifyError(error.message);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete user function
  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId)); // Delete from Firestore
      notifySuccess('User deleted successfully.');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      notifyError('Failed to delete user.');
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={11} sm={11} md={5} lg={4}>
          {/* PTO Creation Section */}
          <Container>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '20px' }} component={Paper}>
              <Typography component="h1" variant="h5">
                Create PTO
              </Typography>
              <Divider sx={{ marginY: '15px' }} />
              <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="standard"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      error={allErrors}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="standard"
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      error={allErrors}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      error={emailError || allErrors}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      error={passError || allErrors}
                      onChange={handleInput}
                    />
                  </Grid>
                </Grid>
                <Button fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }} type="submit">
                  Create
                </Button>
              </Box>
            </Box>
          </Container>
        </Grid>

        {/* PTO List Table Section */}
        <Grid item xs={11} sm={11} md={12} lg={8}>
          <Container>
            <CssBaseline />
            <Box sx={{ padding: '20px' }} component={Paper}>
              <Typography component="h1" variant="h5">
                PTO List
              </Typography>
              <Divider sx={{ marginY: '15px' }} />
              <TableContainer>
                <Table sx={{ minWidth: 450 }} size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Email</b></TableCell>
                      <TableCell><b>First Name</b></TableCell>
                      <TableCell><b>Last Name</b></TableCell>
                      <TableCell><b>Manage</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.map((row) => (
                      row.userType === 'pto' && (
                        <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.firstName}</TableCell>
                          <TableCell>{row.lastName}</TableCell>
                          <TableCell>
                            <Button variant="text" color="error" onClick={() => handleDelete(row.id)} startIcon={<DeleteOutlinedIcon />} />
                            <Button variant="text" startIcon={<EditOutlinedIcon />} />
                          </TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Container>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default PtoManage;
  