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
} from "@mui/material";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../firebase";

const steps = ["Welcome", "Personal Details", "Academic Details", "Education History", "Finish"];

const CompleteProfile = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    enrollmentNumber: "",
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
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Custom validation functions
  const validateDOB = (dob) => {
    if (!dob) return "Date of Birth is required";
    const birthYear = new Date(dob).getFullYear();
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
    if (isNaN(year) || year.length !== 4 || year < 2000 || year > currentYear + 5) {
      return `Please enter a valid year between 2000 and ${currentYear + 5}`;
    }
    return "";
  };

  const validateCGPA = (cgpa) => {
    if (!cgpa) return "CGPA is required";
    const cgpaValue = parseFloat(cgpa);
    if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
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

  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 1) {
      if (!formData.firstName) newErrors.firstName = "First Name is required";
      if (!formData.lastName) newErrors.lastName = "Last Name is required";
      
      const dobError = validateDOB(formData.dob);
      if (dobError) newErrors.dob = dobError;
      
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      
      const mobileError = validateMobile(formData.mobile);
      if (mobileError) newErrors.mobile = mobileError;
      
    } else if (activeStep === 2) {
      if (!formData.collegeName) newErrors.collegeName = "College Name is required";
      
      const passingYearError = validatePassingYear(formData.passingYear);
      if (passingYearError) newErrors.passingYear = passingYearError;
      
      const percentageError = validatePercentage(formData.percentage);
      if (percentageError) newErrors.percentage = percentageError;
      
    } else if (activeStep === 3) {
      if (!formData.previousCourse) newErrors.previousCourse = "Previous Course is required";
      if (!formData.previousCollege) newErrors.previousCollege = "Previous College is required";
      
      const cgpaError = validateCGPA(formData.cgpa);
      if (cgpaError) newErrors.cgpa = cgpaError;
      
      if (!formData.startDate) newErrors.startDate = "Start Date is required";
      if (!formData.endDate) newErrors.endDate = "End Date is required";
      
      // Validate end date is after start date
      if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
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
            enrollmentNumber: formData.erNo || "",
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
    const storedFirstName = sessionStorage.getItem("firstName");
    const storedLastName = sessionStorage.getItem("lastName");
    const storedErNo = sessionStorage.getItem("erNo");
    const storedEmail = sessionStorage.getItem("email");

    if (storedFirstName && storedLastName && storedErNo && storedEmail) {
      setFormData((prevData) => ({
        ...prevData,
        firstName: storedFirstName,
        lastName: storedLastName,
        erNo: storedErNo,
        email: storedEmail,
      }));
    } else {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData((prevData) => ({
              ...prevData,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              enrollmentNumber: userData.erNo || "",
              email: userData.email || "",
            }));
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      };
      fetchUserData();
    }
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 5, p: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          {activeStep === 0 ? (
            <Box textAlign="center">
              <Typography variant="h3" gutterBottom>
                Hey {formData.firstName}!,
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                You are most welcome to Placement Portal
              </Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>
                "Most of you desire to be great, but do you know that you don't have to be great to start, 
                but you have to start to be great. Therefore, start from somewhere no matter how small."
              </Typography>
              <Typography sx={{ mt: 3, color: "gray" }}>
                Here, you need to fill out your details once, and then you can proceed with the next steps.
                Click on "Next" to continue.
              </Typography>
            </Box>
          ) : (
            <>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, mb: 3 }} />
            </>
          )}

          <Box component="form" sx={{ mt: 3 }}>
            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="erNo"
                    label="Enrollment Number"
                    fullWidth
                    value={formData.erNo}
                    onChange={handleInputChange}
                    disabled
                  />
                  <TextField
                    name="firstName"
                    label="First Name"
                    fullWidth
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  //  required
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                   // required
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="dob"
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    value={formData.dob}
                    onChange={handleInputChange}
                    error={!!errors.dob}
                    helperText={errors.dob}
                   // required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: "2005-12-31",
                      min: "2004-01-01"
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="mobile"
                    label="Mobile Number"
                    fullWidth
                    value={formData.mobile}
                    onChange={handleInputChange}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                   // required
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="address"
                    label="Address"
                    fullWidth
                    value={formData.address}
                    onChange={handleInputChange}
                    error={!!errors.address}
                    helperText={errors.address}
                  //  required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="city"
                    label="City"
                    fullWidth
                    value={formData.city}
                    onChange={handleInputChange}
                    error={!!errors.city}
                    helperText={errors.city}
                 //   required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="linkedin"
                    label="LinkedIn Profile"
                    fullWidth
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    name="course"
                    label="Course"
                    fullWidth
                    value={formData.course}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="BCA">BCA</MenuItem>
                    <MenuItem value="BBA">BBA</MenuItem>
                    <MenuItem value="B.Com">B.Com</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="collegeName"
                    label="College Name"
                    fullWidth
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    error={!!errors.collegeName}
                    helperText={errors.collegeName}
                    //required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="passingYear"
                    label="Passing Year"
                    fullWidth
                    value={formData.passingYear}
                    onChange={handleInputChange}
                    error={!!errors.passingYear}
                    helperText={errors.passingYear}
                    //required
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="percentage"
                    label="Last Sem Percentage"
                    fullWidth
                    value={formData.percentage}
                    onChange={handleInputChange}
                    error={!!errors.percentage}
                    helperText={errors.percentage}
                   // required
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="previousCourse"
                    label="Previous Course"
                    fullWidth
                    value={formData.previousCourse}
                    onChange={handleInputChange}
                    error={!!errors.previousCourse}
                    helperText={errors.previousCourse}
                  //  required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="previousCollege"
                    label="Previous College Name"
                    fullWidth
                    value={formData.previousCollege}
                    onChange={handleInputChange}
                    error={!!errors.previousCollege}
                    helperText={errors.previousCollege}
                  //  required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="cgpa"
                    label="CGPA (0-10)"
                    fullWidth
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    error={!!errors.cgpa}
                    helperText={errors.cgpa}
                  //  required
                    inputProps={{ maxLength: 4, step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="startDate"
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={formData.startDate}
                    onChange={handleInputChange}
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                  //  required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: "2005-12-31",
                      min: "2004-01-01"
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="endDate"
                    label="End Date"
                    type="date"
                    fullWidth
                    value={formData.endDate}
                    onChange={handleInputChange}
                    error={!!errors.endDate}
                    helperText={errors.endDate}
                  //  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: "2021-12-31",
                    min: "2020-01-01"
                  }} 
                   
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 4 && (
              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold" color="primary">
                  All steps are done!
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  Now, you need to activate your account by contacting the admin or the placement department.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit}>
                  Submit
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CompleteProfile;