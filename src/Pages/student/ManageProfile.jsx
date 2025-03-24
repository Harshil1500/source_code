import React, { useEffect, useState } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  margin: "2rem auto",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
  background: "#fff",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: "#1976d2",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#115293",
  },
}));

const ManageProfile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Fetch from "users" collection because that's where data is stored
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data());
          } else {
            console.log("No user data found!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (!formData) {
    return <Typography variant="h6" align="center">Loading...</Typography>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const uid = user.uid;
      await updateDoc(doc(db, "users", uid), {
        ...formData,
      });
      setIsEditing(false);
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({ open: true, message: "Error updating profile. Please try again.", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <StyledCard>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Manage Profile
          </Typography>
          <Grid container spacing={2}>
            {/* Non-editable fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Enrollment Number"
                name="enrollmentNumber"
                value={formData.enrollmentNumber || ""}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email || ""}
                fullWidth
                disabled
              />
            </Grid>
            {/* Editable fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile"
                name="mobile"
                value={formData.mobile || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="LinkedIn"
                name="linkedin"
                value={formData.linkedin || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Previous College"
                name="previousCollege"
                value={formData.previousCollege || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Previous Course"
                name="previousCourse"
                value={formData.previousCourse || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Passing Year"
                name="passingYear"
                value={formData.passingYear || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Percentage"
                name="percentage"
                value={formData.percentage || ""}
                onChange={handleChange}
                fullWidth
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            {!isEditing ? (
              <StyledButton variant="contained" onClick={() => setIsEditing(true)}>
                Edit Profile
              </StyledButton>
            ) : (
              <StyledButton variant="contained" onClick={handleSave}>
                Save Profile
              </StyledButton>
            )}
          </Box>
        </CardContent>
      </StyledCard>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageProfile;
