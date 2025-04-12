import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Paper,
  CssBaseline,
  ThemeProvider,
  createTheme
} from "@mui/material";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../firebase";

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
  },
});

const steps = ["Welcome", "Personal Details", "Academic Details", "Education History", "Finish"];

const CompleteProfile = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    erNo: "",
    firstName: "",
    lastName: "",
    dob: "",
    email: auth.currentUser?.email || "",
    mobile: "",
    address: "",
    city: "",
    linkedin: "",
    course: "BCA",
    collegeName: "",
    passingYear: "",
    percentage: "",
    previousCourse: "",
    previousCollege: "",
    cgpa: "",
    startYear: "",
    endYear: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validation functions
  const validateDOB = (dob) => {
    if (!dob) return "Date of Birth is required";
    const birthDate = new Date(dob);
    const birthYear = birthDate.getFullYear();
    if (birthYear < 2004 || birthYear > 2006) {
      return "Birth year must be between 2004 and 2006";
    }
    return "";
  };

  const validatePercentage = (percentage) => {
    if (!percentage) return "Percentage is required";
    const percent = parseFloat(percentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      return "Percentage must be between 0 and 100";
    }
    return "";
  };

  const validatePassingYear = (year) => {
    if (!year) return "Passing Year is required";
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return "Please enter a valid year";
    if (year.length !== 4 || yearNum < 2000 || yearNum > currentYear + 5) {
      return `Please enter a valid year between 2000 and ${currentYear + 5}`;
    }
    return "";
  };

  const validateCGPA = (cgpa) => {
    if (!cgpa) return "CGPA is required";
    const cgpaValue = parseFloat(cgpa);
    if (isNaN(cgpaValue) )return "Please enter a valid number";
    if (cgpaValue < 0 || cgpaValue > 10) {
      return "CGPA must be between 0 and 10";
    }
    return "";
  };

  const validateMobile = (mobile) => {
    if (!mobile) return "Mobile number is required";
    if (!/^\d{10}$/.test(mobile)) {
      return "Mobile number must be 10 digits";
    }
    return "";
  };

  const validateYearRange = (startYear, endYear) => {
    if (startYear && endYear) {
      const start = parseInt(startYear);
      const end = parseInt(endYear);
      if (end < start) {
        return "End year must be after start year";
      }
    }
    return "";
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
      
      const dobError = validateDOB(formData.dob);
      if (dobError) newErrors.dob = dobError;
      
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      
      const mobileError = validateMobile(formData.mobile);
      if (mobileError) newErrors.mobile = mobileError;
      
    } else if (activeStep === 2) {
      if (!formData.collegeName.trim()) newErrors.collegeName = "College Name is required";
      
      const passingYearError = validatePassingYear(formData.passingYear);
      if (passingYearError) newErrors.passingYear = passingYearError;
      
      const percentageError = validatePercentage(formData.percentage);
      if (percentageError) newErrors.percentage = percentageError;
      
    } else if (activeStep === 3) {
      // Only validate if fields are filled (optional fields)
      if (formData.cgpa) {
        const cgpaError = validateCGPA(formData.cgpa);
        if (cgpaError) newErrors.cgpa = cgpaError;
      }
      
      if (formData.startYear || formData.endYear) {
        const yearRangeError = validateYearRange(formData.startYear, formData.endYear);
        if (yearRangeError) newErrors.endYear = yearRangeError;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
      setProgress(((activeStep + 1) / (steps.length - 1)) * 100);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setProgress(((activeStep - 1) / (steps.length - 1)) * 100);
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        const uid = auth.currentUser.uid;
        await setDoc(
          doc(db, "users", uid),
          {
            ...formData,
            erNo: formData.erNo || "",
            userType: "student",
            profileCompleted: true,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
        setSnackbarMessage("Profile saved successfully! Please contact the admin for account activation.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setTimeout(() => navigate("/dash"), 3000);
      } catch (error) {
        console.error("Error saving profile: ", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("Error saving profile. Please try again.");
        setSnackbarOpen(true);
      }
    }
  };

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData((prevData) => ({
            ...prevData,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            erNo: userData.erNo || "",
            email: userData.email || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 6, px: 2 }}>
        <Container maxWidth="md">
          <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Card sx={{ border: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                {activeStep === 0 ? (
                  <Box textAlign="center" sx={{ py: 4 }}>
                    <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                      Hey {formData.firstName}!
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                      Welcome to Placement Portal
                    </Typography>
                    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2, mb: 4 }}>
                      <Typography variant="h6" fontStyle="italic" sx={{ mb: 2 }}>
                        "Most of you desire to be great, but do you know that you don't have to be great to start, 
                        but you have to start to be great. Therefore, start from somewhere no matter how small."
                      </Typography>
                    </Box>
                    <Typography sx={{ color: 'text.secondary' }}>
                      Please complete your profile to access all features of the portal.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, '& .MuiStepLabel-label': { fontWeight: 500 } }}>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 4,
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        '& .MuiLinearProgress-bar': { borderRadius: 4 }
                      }}
                    />
                  </>
                )}

                <Box component="form" sx={{ mt: 2 }}>
                  {/* Step 1: Personal Details */}
                  {activeStep === 1 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="erNo"
                          label="Enrollment Number"
                          fullWidth
                          value={formData.erNo}
                          onChange={handleInputChange}
                          error={!!errors.erNo}
                          helperText={errors.erNo}
                          disabled
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="firstName"
                          label="First Name *"
                          fullWidth
                          value={formData.firstName}
                          onChange={handleInputChange}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          disabled
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="lastName"
                          label="Last Name *"
                          fullWidth
                          value={formData.lastName}
                          onChange={handleInputChange}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                          disabled
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="dob"
                          label="Date of Birth *"
                          type="date"
                          fullWidth
                          value={formData.dob}
                          onChange={handleInputChange}
                          error={!!errors.dob}
                          helperText={errors.dob}
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ max: "2005-12-31", min: "2004-01-01" }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="mobile"
                          label="Mobile Number *"
                          fullWidth
                          value={formData.mobile}
                          onChange={handleInputChange}
                          error={!!errors.mobile}
                          helperText={errors.mobile}
                          inputProps={{ maxLength: 10 }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="address"
                          label="Address *"
                          fullWidth
                          multiline
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          error={!!errors.address}
                          helperText={errors.address}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="city"
                          label="City *"
                          fullWidth
                          value={formData.city}
                          onChange={handleInputChange}
                          error={!!errors.city}
                          helperText={errors.city}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="linkedin"
                          label="LinkedIn Profile URL"
                          fullWidth
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {/* Step 2: Academic Details */}
                  {activeStep === 2 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          select
                          name="course"
                          label="Current Course *"
                          fullWidth
                          value={formData.course}
                          onChange={handleInputChange}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="BCA">BCA</MenuItem>
                          <MenuItem value="BBA">BBA</MenuItem>
                          <MenuItem value="B.Com">B.Com</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="collegeName"
                          label="College Name *"
                          fullWidth
                          value={formData.collegeName}
                          onChange={handleInputChange}
                          error={!!errors.collegeName}
                          helperText={errors.collegeName}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="passingYear"
                          label="Passing Year *"
                          fullWidth
                          value={formData.passingYear}
                          onChange={handleInputChange}
                          error={!!errors.passingYear}
                          helperText={errors.passingYear}
                          inputProps={{ maxLength: 4 }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="percentage"
                          label="Last Semester Percentage *"
                          fullWidth
                          value={formData.percentage}
                          onChange={handleInputChange}
                          error={!!errors.percentage}
                          helperText={errors.percentage}
                          inputProps={{ maxLength: 5 }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {/* Step 3: Education History */}
                  {activeStep === 3 && (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          name="previousCourse"
                          label="Previous Course (Optional)"
                          fullWidth
                          value={formData.previousCourse}
                          onChange={handleInputChange}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          name="previousCollege"
                          label="Previous College Name (Optional)"
                          fullWidth
                          value={formData.previousCollege}
                          onChange={handleInputChange}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="cgpa"
                          label="CGPA (0-10) (Optional)"
                          fullWidth
                          value={formData.cgpa}
                          onChange={handleInputChange}
                          error={!!errors.cgpa}
                          helperText={errors.cgpa}
                          inputProps={{ maxLength: 4, step: "0.01" }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="startYear"
                          label="Start Year (Optional)"
                          type="number"
                          fullWidth
                          value={formData.startYear}
                          onChange={handleInputChange}
                          inputProps={{ min: 2004, max: 2005 }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="endYear"
                          label="End Year (Optional)"
                          type="number"
                          fullWidth
                          value={formData.endYear}
                          onChange={handleInputChange}
                          error={!!errors.endYear}
                          helperText={errors.endYear}
                          inputProps={{ min: 2020, max: 2021 }}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {/* Step 4: Confirmation */}
                  {activeStep === 4 && (
                    <Box textAlign="center" sx={{ py: 4 }}>
                      <Box sx={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                        <Typography variant="h4" sx={{ color: 'white' }}>✓</Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                        Profile Complete!
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
                        Your profile has been successfully saved. Please contact the placement office
                        for account activation and further instructions.
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                    >
                      Back
                    </Button>
                    {activeStep < steps.length - 1 ? (
                      <Button variant="contained" onClick={handleNext} sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}>
                        Continue
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={handleSubmit} sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}>
                        Submit Profile
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Paper>

          <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }} elevation={6}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CompleteProfile;