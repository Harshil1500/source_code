import { 
  Box, 
  Button, 
  CircularProgress,
  Container,
  Divider, 
  Grid, 
  Paper, 
  TextField, 
  Typography 
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

// Firebase
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

// Toast notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 10px 30px rgba(92, 107, 192, 0.2)",
  background: "rgba(255, 255, 255, 0.95)",
  marginBottom: theme.spacing(3),
  border: "1px solid rgba(92, 107, 192, 0.1)"
}));

const Info = ({ user }) => { // Removed setUser from props
  const [data, setData] = useState({ ...user });
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Show notification function
  const showNotification = (message, type = "success") => {
    toast[type](message, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: type === "success" ? "#5c6bc0" : "#f44336",
        color: "#fff"
      }
    });
  };

  // Fetch user data
  const fetchData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setData(docSnap.data());
    } catch (error) {
      showNotification("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  // Update profile (modified to not use setUser)
  const handleSubmitUpdateDetails = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        updatedAt: serverTimestamp()
      });
      showNotification("Profile updated successfully!");
      fetchData(); // Refresh data after update
    } catch (error) {
      showNotification(error.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Password reset function remains the same
  const resetPassword = async () => {
    if (!data.email) {
      showNotification("No email found", "error");
      return;
    }
    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, data.email);
      showNotification("Reset link sent to your email");
    } catch (error) {
      showNotification(error.message || "Reset failed", "error");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} sx={{ color: "#5c6bc0" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: "linear-gradient(135deg, #e0f7fa, #bbdefb, #d1c4e9)", minHeight: "100vh" }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          {/* Profile Section */}
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom sx={{ color: "#5c6bc0", fontWeight: 700 }}>
                Profile Settings
              </Typography>
              <Box component="form" onSubmit={handleSubmitUpdateDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      id="firstName"
                      label="First Name"
                      value={data.firstName || ""}
                      onChange={(e) => setData({...data, firstName: e.target.value})}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      id="lastName"
                      label="Last Name"
                      value={data.lastName || ""}
                      onChange={(e) => setData({...data, lastName: e.target.value})}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="email"
                      label="Email"
                      value={data.email || ""}
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, bgcolor: "#5c6bc0", "&:hover": { bgcolor: "#3949ab" } }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </StyledPaper>
          </Grid>

          {/* Password Reset Section */}
          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h4" gutterBottom sx={{ color: "#5c6bc0", fontWeight: 700 }}>
                Password Reset
              </Typography>
              <Button
                onClick={resetPassword}
                variant="contained"
                sx={{ bgcolor: "#5c6bc0", "&:hover": { bgcolor: "#3949ab" } }}
                disabled={resetLoading || !data.email}
              >
                {resetLoading ? "Sending..." : "Reset Password"}
              </Button>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer />
    </Box>
  );
};

export default Info;