import {
  AppBar,
  Button,
  CssBaseline,
  Dialog,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Slide,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { Box, Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';

// Icons
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

// Firebase
import { auth, db } from '../../firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

// Toastify
import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';

// Drawer Transition
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#5c6bc0',
    color: theme.palette.common.white,
    fontWeight: 'bold',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const ManageDrives = () => {
  // Toast notifications
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  // State management
  const [row, setRow] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);

  // Form data
  const [data, setData] = useState({
    driveTitle: '',
    driveCompanyName: '',
    driveLastDate: '',
    driveSalary: '',
    driveSscPerc: '',
    driveHscPerc: '',
    driveBachelorPerc: '',
    driveNoOpenings: '',
    driveBond: 'no',
    driveBondTime: '',
    driveDesc: '',
    driveInterviewMode: '',
    driveWebsiteLink: '',
    driveContactNo: '',
    driveRegards: '',
  });

  // Fetch drives data
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "drives"));
      const today = new Date().toISOString().split("T")[0];
      const drivesList = [];

      querySnapshot.forEach((doc) => {
        const driveData = doc.data();
        if (driveData.driveLastDate >= today) {
          drivesList.push({ 
            id: doc.id, 
            ...driveData,
            createDate: formatDate(driveData.createDate || driveData.date),
            driveLastDate: formatDate(driveData.driveLastDate)
          });
        } else {
          deleteDoc(doc.ref); // Remove expired drives
        }
      });

      setRow(drivesList);
    } catch (error) {
      console.error("Error fetching drives:", error);
      notifyError("Failed to load drives");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Handle input changes
  const handleInput = (e) => {
    const { id, value } = e.target;
    setData(prev => ({ ...prev, [id]: value }));
  };

  // Reset form fields
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
      driveBond: 'no',
      driveBondTime: '',
      driveDesc: '',
      driveInterviewMode: '',
      driveWebsiteLink: '',
      driveContactNo: '',
      driveRegards: '',
    });
  };

  // Handle edit drive
  const handleEdit = (drive) => {
    setEditingDrive(drive);
    setData({
      driveTitle: drive.driveTitle,
      driveCompanyName: drive.driveCompanyName,
      driveLastDate: drive.driveLastDate,
      driveSalary: drive.driveSalary,
      driveSscPerc: drive.driveSscPerc || '',
      driveHscPerc: drive.driveHscPerc || '',
      driveBachelorPerc: drive.driveBachelorPerc || '',
      driveNoOpenings: drive.driveNoOpenings || '',
      driveBond: drive.driveBond || 'no',
      driveBondTime: drive.driveBondTime || '',
      driveDesc: drive.driveDesc || '',
      driveInterviewMode: drive.driveInterviewMode || '',
      driveWebsiteLink: drive.driveWebsiteLink || '',
      driveContactNo: drive.driveContactNo || '',
      driveRegards: drive.driveRegards || '',
    });
    setOpen(true);
  };

  // Submit drive form
  const handleSubmitDrive = async (e) => {
    e.preventDefault();

    // Validation
     const requiredFields = [
      'driveTitle', 'driveCompanyName', 'driveLastDate', 
      'driveSalary', 'driveInterviewMode', 'driveWebsiteLink'
    ];
    
     for (const field of requiredFields) {
      if (!data[field]) {
        notifyError(`Please fill in ${field.replace('drive', '')}`);
        return;
      }
    }

    if (new Date(data.driveLastDate) < new Date()) {
      notifyError('Last date cannot be in the past');
      return;
    }

    if (isNaN(data.driveSalary) || parseFloat(data.driveSalary) <= 0) {
      notifyError('Salary must be a positive number');
      return;
    }

    if (data.driveBond === 'yes' && (!data.driveBondTime || isNaN(data.driveBondTime))) {
      notifyError('Please enter valid bond time in months');
      return;
    }

    if (!/^\d{10}$/.test(data.driveContactNo)) {
      notifyError('Contact number must be 10 digits');
      return;
    }

    // Percentage validations
    const percentageFields = ['driveSscPerc', 'driveHscPerc', 'driveBachelorPerc'];
    for (const field of percentageFields) {
      if (data[field] && (isNaN(data[field]) || data[field] < 0 || data[field] > 100)){
        notifyError(`${field.replace('drive', '')} must be between 0 and 100`);
        return;
      }
    }

    try {
      if (editingDrive) {
        // Update existing drive
        await setDoc(doc(db, "drives", editingDrive.id), {
          ...data,
          createDate: editingDrive.createDate // Preserve original date
        });
        notifySuccess("Drive updated successfully!");
      } else {
        // Create new drive
        const currentDate = new Date().toJSON().slice(0, 10);
        const docRef = await addDoc(collection(db, "drives"), {
          ...data,
          createDate: currentDate
        });
        await setDoc(doc(db, "applications", docRef.id), {
          appliedList: [],
          selectedList: []
        });
        notifySuccess("Drive created successfully!");
      }

      fetchData();
      handleClose();
    } catch (error) {
      console.error("Error saving drive:", error);
      notifyError(error.message || 'Failed to save drive');
    }
  };

  // Delete drive
  const handleDelete = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this drive?')) return;
    
    try {
      await deleteDoc(doc(db, "drives", driveId));
      await deleteDoc(doc(db, "applications", driveId));
      fetchData();
      notifySuccess('Drive deleted successfully');
    } catch (error) {
      console.error("Error deleting drive:", error);
      notifyError('Failed to delete drive');
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Dialog handlers
  const handleClickOpen = () => {
    setEditingDrive(null);
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
    setEditingDrive(null);
    resetInput();
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #e0f7fa, #bbdefb, #d1c4e9)',
      minHeight: '100vh',
      p: 3
    }}>
      <CssBaseline />
      
      <Grid container spacing={3}>
        {/* Create/Edit Drive Dialog */}
        <Dialog
          fullScreen
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, #e0f7fa, #bbdefb, #d1c4e9)'
            }
          }}
        >
          <AppBar sx={{ position: 'relative', bgcolor: '#5c6bc0' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                {editingDrive ? 'Edit Drive' : 'Create New Drive'}
              </Typography>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#5c6bc0' }}>
                Drive Information
              </Typography>
              <Divider sx={{ my: 3 }} />

              <Box component="form" onSubmit={handleSubmitDrive}>
                {/* General Information */}
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#5c6bc0' }}>
                  General Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      // required
                      fullWidth
                      id="driveTitle"
                      label="Drive Title"
                      value={data.driveTitle}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      // required
                      fullWidth
                      id="driveCompanyName"
                      label="Company Name"
                      value={data.driveCompanyName}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      // required
                      fullWidth
                      id="driveLastDate"
                      label="Last Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split("T")[0] }}
                      value={data.driveLastDate}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      // required
                      fullWidth
                      id="driveSalary"
                      label="Salary (per annum)"
                      type="number"
                      value={data.driveSalary}
                      onChange={handleInput}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Academic Requirements */}
                <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, color: '#5c6bc0' }}>
                  Academic Requirements (%)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="driveSscPerc"
                      label="Minimum SSC Percentage"
                      type="number"
                      value={data.driveSscPerc}
                      onChange={handleInput}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="driveHscPerc"
                      label="Minimum HSC Percentage"
                      type="number"
                      value={data.driveHscPerc}
                      onChange={handleInput}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="driveBachelorPerc"
                      label="Minimum Bachelor Percentage"
                      type="number"
                      value={data.driveBachelorPerc}
                      onChange={handleInput}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                  </Grid>
                </Grid>

                {/* Bond Agreement */}
                <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, color: '#5c6bc0' }}>
                  Bond Agreement
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="driveBond"
                      label="Bond Agreement (yes/no)"
                      value={data.driveBond}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="driveBondTime"
                      label="Bond Duration (months)"
                      type="number"
                      value={data.driveBondTime}
                      onChange={handleInput}
                      disabled={data.driveBond !== 'yes'}
                    />
                  </Grid>
                </Grid>

                {/* Job Description */}
                <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, color: '#5c6bc0' }}>
                  Job Description
                </Typography>
                            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  // required
                  fullWidth
                  id="driveDesc" // This should match your state key
                  name="driveDesc" // Add name attribute
                  label="Job Description"
                  multiline
                  rows={4}
                  value={data.driveDesc}
                  onChange={handleInput}
                />
              </Grid>
                            </Grid>

                {/* Additional Information */}
                <Typography variant="subtitle1" sx={{ mt: 4, mb: 2, color: '#5c6bc0' }}>
                  Additional Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                   //  required
                      fullWidth
                      id="driveInterviewMode"
                      label="Interview Mode"
                      value={data.driveInterviewMode}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                     // required
                      fullWidth
                      id="driveWebsiteLink"
                      label="Company Website"
                      value={data.driveWebsiteLink}
                      onChange={handleInput}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                     //required
                      fullWidth
                      id="driveContactNo"
                      label="Contact Number"
                      value={data.driveContactNo}
                      onChange={(e) => {
                        if (/^\d{0,10}$/.test(e.target.value)) {
                          handleInput(e);
                        }
                      }}
                      inputProps={{ maxLength: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="driveRegards"
                      label="Regards/Contact Person"
                      value={data.driveRegards}
                      onChange={handleInput}
                    />
                  </Grid>
                </Grid>

                {/* Form Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    sx={{ mr: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: '#5c6bc0', '&:hover': { bgcolor: '#3949ab' } }}
                  >
                    {editingDrive ? 'Update Drive' : 'Create Drive'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Container>
        </Dialog>

        {/* Drives Table Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h5" sx={{ color: '#5c6bc0', fontWeight: 'bold' }}>
                Current Drives
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleClickOpen}
                sx={{ bgcolor: '#5c6bc0', '&:hover': { bgcolor: '#3949ab' } }}
              >
                New Drive
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Title</StyledTableCell>
                    <StyledTableCell>Company</StyledTableCell>
                    <StyledTableCell>Last Date</StyledTableCell>
                    <StyledTableCell>Created On</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.map((drive) => (
                    <StyledTableRow key={drive.id}>
                      <TableCell>{drive.driveTitle}</TableCell>
                      <TableCell>{drive.driveCompanyName}</TableCell>
                      <TableCell>{drive.driveLastDate}</TableCell>
                      <TableCell>{drive.createDate}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(drive.id)}
                          sx={{ '&:hover': { bgcolor: 'rgba(255, 0, 0, 0.1)' } }}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(drive)}
                          sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 255, 0.1)' } }}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default ManageDrives;