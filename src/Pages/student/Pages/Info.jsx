import { Box, Button, CssBaseline, Divider, Grid, Paper, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import React, { useState, useEffect } from "react";

// Firebase
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

// Toastify
import { ToastContainer, toast } from "material-react-toastify";
import "material-react-toastify/dist/ReactToastify.css";

const Info = (props) => {
  // Toastify Notifications
  const notifySuccess = () => toast.success("Check your mail for reset password...");
  const notifyUpdate = () => toast.success("Profile updated...");
  const notifyError = (errorMessage) => toast.error(errorMessage);

  const uid = sessionStorage.getItem("uid");

  // User info state
  const [data, setData] = useState({ ...props.user });

  // Fetch user data from Firestore
  const fetchData = async () => {
    if (!uid) {
      console.error("No UID found in sessionStorage.");
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes
  const handleInput = (e) => {
    const { id, value } = e.target;
    setData({ ...data, [id]: value });
  };

  // Update profile details
  const handleSubmitUpdateDetails = async (e) => {
    e.preventDefault();

    if (!uid) {
      console.error("UID not found.");
      return;
    }

    try {
      const updateData = doc(db, "users", uid);
      await updateDoc(updateData, { ...data });

      props.setUser(data); // Update UI immediately
      notifyUpdate();

      // Fetch updated data from Firestore
      const updatedUserSnap = await getDoc(updateData);
      if (updatedUserSnap.exists()) {
        props.setUser(updatedUserSnap.data());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Send password reset email
  const resetPassword = async () => {
    const auth = getAuth();

    if (!data.email) {
      notifyError("No email found for this user.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, data.email);
      notifySuccess();
    } catch (error) {
      console.error("Error sending password reset email:", error);
      notifyError("Failed to send password reset email.");
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={11} sm={11} md={5} lg={4}>
          {/* Profile Section */}
          <Container>
            <CssBaseline />
            <Box sx={{ display: "flex", flexDirection: "column", padding: "20px" }} component={Paper}>
              <Typography component="h1" variant="h5">
                Profile
              </Typography>

              <Divider sx={{ marginY: "15px" }} />

              <Box component="form" sx={{ mt: 3 }} onSubmit={handleSubmitUpdateDetails}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="standard"
                      name="firstName"
                      required
                      fullWidth
                      type="text"
                      id="firstName"
                      label="First Name"
                      onChange={handleInput}
                      value={data.firstName || ""}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="standard"
                      name="lastName"
                      required
                      fullWidth
                      type="text"
                      id="lastName"
                      label="Last Name"
                      onChange={handleInput}
                      value={data.lastName || ""}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      name="email"
                      required
                      fullWidth
                      id="email"
                      type="email"
                      label="Email"
                      disabled
                      value={data.email || ""}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Button fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }} type="submit">
                  Update
                </Button>
              </Box>
            </Box>
          </Container>
        </Grid>

        <Grid item xs={11} sm={11} md={5} lg={4}>
          {/* Change Password Section */}
          <Container>
            <CssBaseline />
            <Box sx={{ display: "flex", flexDirection: "column", padding: "20px" }} component={Paper}>
              <Typography component="h1" variant="h5">
                Reset Password
              </Typography>

              <Divider sx={{ marginY: "15px" }} />

              <Typography>
                Reset your password via email{" "}
                <Button variant="text" onClick={resetPassword}>
                  Send me mail
                </Button>
              </Typography>
            </Box>
          </Container>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default Info;
