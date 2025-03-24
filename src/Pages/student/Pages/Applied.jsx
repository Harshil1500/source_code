import { Button, Card, CardActions, CardContent, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { getAuth } from "firebase/auth";

const Applied = () => {
  const auth = getAuth();
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [allDrives, setAllDrives] = useState([]);

  // ✅ Fetch all drives from Firestore
  const fetchDrives = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "drives"));
      const driveList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllDrives(driveList);
    } catch (error) {
      console.error("Error fetching drives:", error);
    }
  };

  // ✅ Fetch applied drives for the logged-in user
  const fetchAppliedDrives = async () => {
    if (auth.currentUser) {
      const q = query(collection(db, "applications"), where("studentId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const appliedDriveIds = querySnapshot.docs.map((doc) => doc.data().driveId);
      setAppliedDrives(appliedDriveIds);
    }
  };

  // ✅ Apply for job function (Full Fix)
  const applyForJob = async (drive) => {
    if (!auth.currentUser) {
      alert("You must be logged in to apply.");
      return;
    }

    try {
      // ✅ Fetch student details from Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        alert("User data not found. Please complete your profile.");
        return;
      }

      const userData = userDocSnap.data(); // Student details

      // ✅ Prevent duplicate applications
      if (appliedDrives.includes(drive.id)) {
        alert("You have already applied for this drive.");
        return;
      }

      // ✅ Add application details to Firestore (Full Student Details)
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

      // ✅ Update state to disable button after applying
      setAppliedDrives([...appliedDrives, drive.id]);
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to apply. Please try again.");
    }
  };

  // ✅ UseEffect to load drives & applied drives
  useEffect(() => {
    fetchDrives();
    fetchAppliedDrives(); // ✅ Applied drives fetch kari ne state update kari do
  }, []);
  
  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        My Applied Drives
      </Typography>
      <Grid container spacing={3}>
        {allDrives.map((drive) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={drive.id}>
            <Card sx={{ backgroundColor: "#f3f3f3" }}>
              <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                  {drive.createDate}
                </Typography>
                <Typography variant="h5">{drive.driveTitle}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {drive.driveCompanyName}
                </Typography>
                <Typography variant="body2">Openings: {drive.driveNoOpenings}</Typography>
                <Typography variant="body2">Last Date: {drive.driveLastDate}</Typography>
              </CardContent>
              <CardActions sx={{ textAlign: "end" }}>
                <Button
                  variant="contained"
                  onClick={() => applyForJob(drive)}
                  disabled={appliedDrives.includes(drive.id)}
                >
                  {appliedDrives.includes(drive.id) ? "Applied" : "Apply"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Applied; 