import { Button, Card, CardActions, CardContent, Divider, Grid, Typography, Modal } from '@mui/material';
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

  // 🔹 Fetch Drives from Firebase
  const fetchDrives = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "drives"));
      const driveList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("📢 Fetched Drives:", driveList);  // Debugging log
      setDrives(driveList);
    } catch (error) {
      console.error("❌ Error fetching drives:", error);
    }
  };

  // 🔹 Fetch Applied Drives for Current User
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

  // 🔹 View Drive Details in Modal
  const handleViewDrive = async (driveId) => {
    setOpen(true);
    const docRef = doc(db, "drives", driveId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const driveData = { id: driveId, ...docSnap.data() };
      console.log("📢 View Drive Data:", driveData);  // Debugging
      setViewDrive(driveData);
    }
  };

  // 🔹 Apply for Drive
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
        driveId: drive.id,
        driveTitle: drive.driveTitle,
        companyName: drive.driveCompanyName,
        appliedDate: serverTimestamp(),
      });
      setAppliedDrives([...appliedDrives, drive.id]);
      alert("✅ Application submitted successfully!");
    } catch (error) {
      console.error("❌ Error applying for job:", error);
      alert("Failed to apply. Please try again.");
    }
  };

  return (
    <>
      {/* 🔹 Display Drives List */}
      <Grid container spacing={3}>
        {drives.length > 0 ? (
          drives.map((drive) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={drive.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{drive.driveTitle || "No Title"}</Typography>
                  <Typography>{drive.driveCompanyName || "No Company"}</Typography>
                  <Typography>Salary: {drive.driveSalary || "Not Mentioned"}</Typography>
                  <Typography>Last Date: {drive.driveLastDate || "N/A"}</Typography>
                  <Typography>Mode: {drive.driveInterviewMode || "N/A"}</Typography>
                  <Typography>Website: {drive.driveWebsiteLink || "N/A"}</Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" onClick={() => handleViewDrive(drive.id)}>View</Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="h6" color="error">No drives available.</Typography>
        )}
      </Grid>

      {/* 🔹 View Drive Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', boxShadow: 24, p: 4, width: '60%', borderRadius: 2 }}>
          {viewDrive && (
            <>
              <Typography variant="h4" gutterBottom>{viewDrive.driveTitle || "No Title"}</Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="h6"><strong>Company:</strong> {viewDrive.driveCompanyName || "N/A"}</Typography>
              <Typography><strong>Salary:</strong> {viewDrive.driveSalary || "Not Mentioned"}</Typography>
              <Typography><strong>Last Date:</strong> {viewDrive.driveLastDate || "N/A"}</Typography>
              <Typography><strong>Bond Agreement:</strong> {viewDrive.driveBond || "N/A"}</Typography>
              <Typography><strong>Bond Time:</strong> {viewDrive.driveBondTime || "N/A"}</Typography>
              <Typography><strong>Description:</strong> {viewDrive.driveDescription || "No Description Provided"}</Typography>
              <Typography><strong>Interview Mode:</strong> {viewDrive.driveInterviewMode || "N/A"}</Typography>
              <Typography><strong>Website:</strong> <a href={viewDrive.driveWebsiteLink || "#"} target="_blank" rel="noopener noreferrer">{viewDrive.driveWebsiteLink || "N/A"}</a></Typography>
              <Typography><strong>Contact:</strong> {viewDrive.driveContact || "N/A"}</Typography>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                {appliedDrives.includes(viewDrive.id) ? (
                  <Button variant="contained" color="success" disabled>Already Applied</Button>
                ) : (
                  <Button variant="contained" color="primary" onClick={() => handleApply(viewDrive)}>Apply</Button>
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
