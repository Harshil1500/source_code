import React, { useEffect, useState } from 'react';
import { 
  Avatar, 
  Button, 
  CssBaseline, 
  Divider, 
  Grid, 
  Paper, 
  TextField, 
  Typography,
  Box, 
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  DeleteOutlined as DeleteOutlinedIcon,
  EditOutlined as EditOutlinedIcon 
} from '@mui/icons-material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { collection, doc, getDocs, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PtoManage = () => {
  // Toast notifications
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  // State management
  const [errors, setErrors] = useState({
    password: false,
    email: false,
    allFields: false
  });
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
      notifyError("Failed to load users");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Reset errors when typing
    if (id === 'email') setErrors(prev => ({ ...prev, email: false }));
    if (id === 'password') setErrors(prev => ({ ...prev, password: false }));
    setErrors(prev => ({ ...prev, allFields: false }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setErrors(prev => ({ ...prev, allFields: true }));
      notifyError("All fields are required");
      return;
    }

    try {
      // Create user in Firebase Auth
      const res = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', res.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        userType: 'pto',
        timeStamp: serverTimestamp()
      });

      // Reset form and fetch updated list
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      await fetchUsers();
      notifySuccess("PTO user created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors(prev => ({ ...prev, email: true }));
          notifyError("Email already in use");
          break;
        case 'auth/weak-password':
          setErrors(prev => ({ ...prev, password: true }));
          notifyError("Password must be at least 6 characters");
          break;
        default:
          notifyError(error.message);
      }
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        await fetchUsers();
        notifySuccess("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        notifyError("Failed to delete user");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Create PTO Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create PTO User
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    variant="outlined"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.allFields && !formData.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    variant="outlined"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.allFields && !formData.lastName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email || (errors.allFields && !formData.email)}
                    helperText={errors.email && "Email already in use"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password || (errors.allFields && !formData.password)}
                    helperText={errors.password && "Password must be at least 6 characters"}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Create User
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* PTO Users Table */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              PTO Users
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>First Name</b></TableCell>
                    <TableCell><b>Last Name</b></TableCell>
                    <TableCell align="right"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(user => user.userType === 'pto').map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell align="right">
                        <Button 
                          color="primary"
                          startIcon={<EditOutlinedIcon />}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button 
                          color="error"
                          startIcon={<DeleteOutlinedIcon />}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Container>
  );
};

export default PtoManage;