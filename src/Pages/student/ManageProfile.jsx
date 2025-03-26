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
  CircularProgress,
  Divider,
  Paper
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: "2rem auto",
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
  borderRadius: "8px",
  fontWeight: "bold",
  textTransform: "none",
  fontSize: "1rem",
  backgroundColor: "#5c6bc0",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#3949ab",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(92, 107, 192, 0.3)"
  },
  transition: "all 0.3s ease",
}));

const ProfileField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "& fieldset": {
      borderColor: "#e0e0e0",
    },
    "&:hover fieldset": {
      borderColor: "#5c6bc0",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#5c6bc0",
    },
  },
}));

const ManageProfile = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: "", 
    severity: "success" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data());
          } else {
            console.log("No user data found!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setSnackbar({ 
            open: true, 
            message: "Error loading profile data", 
            severity: "error" 
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
      });
      setIsEditing(false);
      setSnackbar({ 
        open: true, 
        message: "Profile updated successfully!", 
        severity: "success" 
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({ 
        open: true, 
        message: "Error updating profile. Please try again.", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "50vh" 
      }}>
        <CircularProgress size={60} sx={{ color: "#5c6bc0" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      background: "linear-gradient(135deg, #e0f7fa, #bbdefb, #d1c4e9)",
      minHeight: "100vh"
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledCard component={Paper}>
          <CardContent>
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom 
              sx={{ 
                color: "#5c6bc0",
                fontWeight: "bold",
                mb: 4
              }}
            >
              Manage Your Profile
            </Typography>
            
            <Divider sx={{ mb: 4 }} />
            
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: "#5c6bc0",
                    mb: 2,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      width: "8px", 
                      height: "24px", 
                      bgcolor: "#5c6bc0", 
                      mr: 1.5,
                      borderRadius: "4px"
                    }} 
                  />
                  Personal Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Enrollment Number"
                  name="enrollmentNumber"
                  value={formData.erNo || ""}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Email"
                  name="email"
                  value={formData.email || ""}
                  fullWidth
                  disabled
                />
              </Grid>
              
              {/* Contact Information Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: "#5c6bc0",
                    mb: 2,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      width: "8px", 
                      height: "24px", 
                      bgcolor: "#5c6bc0", 
                      mr: 1.5,
                      borderRadius: "4px"
                    }} 
                  />
                  Contact Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Mobile"
                  name="mobile"
                  value={formData.mobile || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="LinkedIn"
                  name="linkedin"
                  value={formData.linkedin || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </Grid>
              
              {/* Education Information Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: "#5c6bc0",
                    mb: 2,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      width: "8px", 
                      height: "24px", 
                      bgcolor: "#5c6bc0", 
                      mr: 1.5,
                      borderRadius: "4px"
                    }} 
                  />
                  Education Information
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Previous College"
                  name="previousCollege"
                  value={formData.previousCollege || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Previous Course"
                  name="previousCourse"
                  value={formData.previousCourse || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Passing Year"
                  name="passingYear"
                  value={formData.passingYear || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ProfileField
                  label="Percentage"
                  name="percentage"
                  value={formData.percentage || ""}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                  InputProps={{
                    endAdornment: <Typography>%</Typography>
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              mt: 4,
              gap: 2
            }}>
              {!isEditing ? (
                <StyledButton 
                  variant="contained" 
                  onClick={() => setIsEditing(true)}
                  startIcon={<i className="fas fa-edit" />}
                >
                  Edit Profile
                </StyledButton>
              ) : (
                <>
                  <StyledButton 
                    variant="contained" 
                    onClick={handleSave}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <i className="fas fa-save" />}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </StyledButton>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setIsEditing(false)}
                    sx={{ 
                      ml: 2,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: "bold"
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </StyledCard>
      </motion.div>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: "100%",
            boxShadow: 3,
            borderRadius: "8px"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageProfile;