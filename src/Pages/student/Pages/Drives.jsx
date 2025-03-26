import { Button, Card, CardActions, CardContent, Divider, Grid, Typography, Modal, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { collection, doc, getDoc, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { getAuth } from "firebase/auth";

const Drives = () => {
  const auth = getAuth();
  const [drives, setDrives] = useState([]);
  const [viewDrive, setViewDrive] = useState(null);
  const [open, setOpen] = useState(false);
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [academicDetails, setAcademicDetails] = useState({
    sscPercentage: '',
    hscPercentage: ''
  });

  // Fetch Drives from Firebase
  const fetchDrives = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "drives"));
      const driveList = querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        // Format dates for display
        driveLastDate: formatDate(doc.data().driveLastDate),
        createdAt: formatDate(doc.data().createdAt)
      }));
      setDrives(driveList);
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  };

  // Format Firestore timestamp or date string
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    
    try {
      // If it's a Firestore timestamp
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      // If it's already a string
      return dateValue;
    } catch (e) {
      return dateValue || "N/A";
    }
  };

  // Fetch Applied Drives for Current User
  const fetchAppliedDrives = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, "applications"), where("studentId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const appliedDriveIds = querySnapshot.docs.map((doc) => doc.data().driveId);
      setAppliedDrives(appliedDriveIds);
    }
  };

  useEffect(() => {
    fetchDrives();
    fetchAppliedDrives();
  }, []);

  // View Drive Details in Modal
  const handleViewDrive = async (driveId) => {
    setOpen(true);
    const docRef = doc(db, "drives", driveId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const driveData = docSnap.data();
      setViewDrive({ 
        id: driveId, 
        ...driveData,
        // Format dates
        driveLastDate: formatDate(driveData.driveLastDate),
        createdAt: formatDate(driveData.createdAt)
      });
    }
  };

  // Handle academic details change
  const handleAcademicChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAcademicDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Apply for Drive
  const handleApply = async (drive) => {
    if (!auth.currentUser) {
      alert("You must be logged in to apply.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        alert("User data not found. Please complete your profile.");
        return;
      }

      const userData = userDocSnap.data();
      
      // Validate academic percentages
      const sscPercentage = parseFloat(academicDetails.sscPercentage);
      const hscPercentage = parseFloat(academicDetails.hscPercentage);

      if (drive.sscPercentage && (isNaN(sscPercentage) || sscPercentage < drive.sscPercentage)) {
        alert(`Your SSC percentage (${isNaN(sscPercentage) ? 'not provided' : sscPercentage}%) does not meet the minimum requirement (${drive.sscPercentage}%)`);
        return;
      }
      
      if (drive.hscPercentage && (isNaN(hscPercentage) || hscPercentage < drive.hscPercentage)) {
        alert(`Your HSC percentage (${isNaN(hscPercentage) ? 'not provided' : hscPercentage}%) does not meet the minimum requirement (${drive.hscPercentage}%)`);
        return;
      }

      if (appliedDrives.includes(drive.id)) {
        alert("You have already applied for this drive.");
        return;
      }

      await addDoc(collection(db, "applications"), {
        studentId: auth.currentUser.uid,
        firstName: userData.firstName || "N/A",
        lastName: userData.lastName || "N/A",
        email: userData.email || "N/A",
        erNo: userData.erNo || "N/A",
        sscPercentage: !isNaN(sscPercentage) ? sscPercentage : "N/A",
        hscPercentage: !isNaN(hscPercentage) ? hscPercentage : "N/A",
        driveId: drive.id,
        driveTitle: drive.driveTitle,
        companyName: drive.driveCompanyName,
        appliedDate: serverTimestamp(),
      });

      setAppliedDrives([...appliedDrives, drive.id]);
      setAcademicDetails({ sscPercentage: '', hscPercentage: '' }); // Reset after apply
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to apply. Please try again.");
    }
  };

  return (
    <>
      {/* Drives List */}
      <Grid container spacing={3}>
        {drives.length > 0 ? (
          drives.map((drive) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={drive.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(92, 107, 192, 0.2)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#5c6bc0' }}>
                    {drive.driveTitle || "No Title"}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                    {drive.driveCompanyName || "No Company"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" paragraph>
                    <strong>Salary:</strong> {drive.driveSalary || "Not specified"}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Last Date:</strong> {drive.driveLastDate || "N/A"}
                  </Typography>
                  {drive.driveSscPerc && (
                    <Typography variant="body2">
                      <strong>SSC % Required:</strong> {drive.driveSscPerc}%
                    </Typography>
                  )}
                  {drive.driveHscPerc && (
                    <Typography variant="body2">
                      <strong>HSC % Required:</strong> {drive.driveHscPerc}%
                    </Typography>
                  )}
                  {drive.driveNoOpenings && (
                    <Typography variant="body2">
                      <strong>NO of Opening</strong> {drive.driveNoOpenings}
                    </Typography>
                  )}
                  
                </CardContent>
                <CardActions sx={{ mt: 'auto', p: 2 }}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => handleViewDrive(drive.id)}
                    sx={{ 
                      backgroundColor: '#5c6bc0', 
                      '&:hover': { 
                        backgroundColor: '#3949ab',
                        boxShadow: '0 2px 10px rgba(92, 107, 192, 0.4)'
                      },
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 'medium'
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" color="textSecondary" textAlign="center" sx={{ py: 4 }}>
              No drives available currently
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Drive Details Modal */}
      <Modal open={open} onClose={() => {
        setOpen(false);
        setAcademicDetails({ sscPercentage: '', hscPercentage: '' }); // Reset on close
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: '#ffff', 
          boxShadow: 24, 
          p: 4, 
          width: { xs: '90%', md: '60%' },
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto',
          outline: 'none'
        }}>
          {viewDrive && (
            <>
              <Typography variant="h4" gutterBottom sx={{ color: '#5c6bc0', fontWeight: 'bold' }}>
                {viewDrive.driveTitle || "No Title"}
              </Typography>
              <Divider sx={{ my: 2, borderColor: 'divider' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1, color: '#5c6bc0' }}>Company Details</Typography>
                  <Typography paragraph><strong>Company:</strong> {viewDrive.driveCompanyName || "N/A"}</Typography>
                  <Typography paragraph><strong>Salary:</strong> {viewDrive.driveSalary || "Not specified"}</Typography>
                  <Typography paragraph><strong>Last Date:</strong> {viewDrive.driveLastDate || "N/A"}</Typography>
                  <Typography paragraph><strong>Posted On:</strong> {viewDrive.createdAt || "N/A"}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 1, color: '#5c6bc0' }}> Academic Requirements</Typography>
                  {viewDrive.driveSscPerc && (
                    <Typography paragraph><strong>SSC Minimum %:</strong> {viewDrive.driveSscPerc}%</Typography>
                  )}
                  {viewDrive.driveHscPerc && (
                    <Typography paragraph><strong>HSC Minimum %:</strong> {viewDrive.driveHscPerc}%</Typography>
                  )}
                  <Typography paragraph><strong>Bond Agreement:</strong> {viewDrive.driveBond || "N/A"}</Typography>
                  <Typography paragraph><strong>Bond Duration:</strong> {viewDrive.driveBondTime || "N/A"}</Typography>
                  <Typography paragraph><strong>Interview Mode:</strong> {viewDrive.driveInterviewMode || "N/A"}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, color: '#5c6bc0' }}>Contact Information</Typography>
              <Divider sx={{ my: 1, borderColor: 'divider' }} />
              <Typography paragraph><strong>Website:</strong> {viewDrive.driveWebsiteLink ? (
                <a href={viewDrive.driveWebsiteLink} target="_blank" rel="noopener noreferrer" style={{ color: '#5c6bc0' }}>
                  {viewDrive.driveWebsiteLink}
                </a>
              ) : "N/A"}</Typography>
              <Typography paragraph><strong>Contact:</strong> {viewDrive.driveContactNo || "N/A"}</Typography>

              <Typography variant="h6" sx={{ mt: 3, color: '#5c6bc0' }}>Description</Typography>
              <Divider sx={{ my: 1, borderColor: 'divider' }} />
              <Typography paragraph sx={{ whiteSpace: 'pre-line' }}>
                {viewDrive.driveDesc || "No description provided"}
              </Typography>

              {!appliedDrives.includes(viewDrive.id) && (
                <>
                  {/* <Typography variant="h6" sx={{ mt: 3, color: '#5c6bc0' }}>Academic Details</Typography>
                  <Divider sx={{ my: 1, borderColor: 'divider' }} /> */}
                  {/* <Grid container spacing={2} sx={{ mt: 1 }}>
                    {viewDrive.driveSscPerc && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Your SSC Percentage (%)"
                          name="driveSscPerc"
                          value={academicDetails.driveSscPerc}
                          onChange={handleAcademicChange}
                          variant="outlined"
                          type="text"
                          inputMode="decimal"
                          helperText={`Minimum required: ${viewDrive.driveSscPerc}%`}
                        />
                      </Grid>
                    )}
                    {viewDrive.driveHscPerc && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Your HSC Percentage (%)"
                          name="driveHscPerc"
                          value={academicDetails.driveHscPerc}
                          onChange={handleAcademicChange}
                          variant="outlined"
                          type="text"
                          inputMode="decimal"
                          helperText={`Minimum required: ${viewDrive.driveHscPerc}%`}
                        />
                      </Grid>
                    )}
                  </Grid> */}
                </>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                {appliedDrives.includes(viewDrive.id) ? (
                  <Button 
                    variant="contained" 
                    color="success" 
                    disabled
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 4,
                      py: 1
                    }}
                  >
                    Already Applied
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={() => handleApply(viewDrive)}
                    sx={{ 
                      backgroundColor: '#5c6bc0', 
                      '&:hover': { 
                        backgroundColor: '#3949ab',
                        boxShadow: '0 2px 10px rgba(92, 107, 192, 0.4)'
                      },
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 4,
                      py: 1,
                      fontWeight: 'medium'
                    }}
                  >
                    Apply Now
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default Drives;