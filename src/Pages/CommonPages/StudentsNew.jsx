import React, { useEffect, useState } from "react";
import {
  Box,
  Switch,
  Button,
  Typography,
  LinearProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  boxShadow: theme.shadows[3],
  padding: theme.spacing(1.5, 3),
  marginTop: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
}));

const StudentsNew = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const studentList = querySnapshot.docs
        .filter((doc) => doc.data().userType === "student")
        .map((doc) => ({
          id: doc.id,
          erNo: doc.data().erNo || "N/A",
          firstName: doc.data().firstName || "N/A",
          lastName: doc.data().lastName || "N/A",
          email: doc.data().email || "N/A",
          isEnable: doc.data().isEnable || false,
          linkedin: doc.data().linkedin || "",
          collegeName: doc.data().collegeName || "N/A",
          course: doc.data().course || "N/A",
          mobile: doc.data().mobile || "N/A",
        }));
      setRows(studentList);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (event, studentId) => {
    const newStatus = event.target.checked;
    try {
      await updateDoc(doc(db, "users", studentId), { isEnable: newStatus });
      setRows(prevRows =>
        prevRows.map(row =>
          row.id === studentId ? { ...row, isEnable: newStatus } : row
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseProfile = () => {
    setSelectedStudent(null);
  };

  const columns = [
    {
      field: "profile",
      headerName: "Profile",
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <IconButton onClick={() => handleViewProfile(params.row)}>
          <VisibilityIcon color="primary" />
        </IconButton>
      ),
    },
    { field: "erNo", headerName: "Enrollment No", flex: 1, minWidth: 150 },
    { field: "firstName", headerName: "First Name", flex: 1, minWidth: 150 },
    { field: "lastName", headerName: "Last Name", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "isEnable",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Switch
          checked={params.row.isEnable}
          onChange={(e) => handleStatusChange(e, params.row.id)}
          color="primary"
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: "bold" }}>
        Student Management
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            components={{
              LoadingOverlay: LinearProgress,
            }}
          />
        </Box>
      </Paper>
      <StyledButton
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={() => {}}
        disabled={exportLoading}
      >
        {exportLoading ? "Exporting..." : "Export Student Applications"}
      </StyledButton>
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onClose={handleCloseProfile}>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogContent>
            <Typography><b>Name:</b> {selectedStudent.firstName} {selectedStudent.lastName}</Typography>
            <Typography><b>Email:</b> {selectedStudent.email}</Typography>
            <Typography><b>Enrollment No:</b> {selectedStudent.erNo}</Typography>
            <Typography><b>collegeName:</b> {selectedStudent.collegeName}</Typography>
            <Typography><b>course:</b> {selectedStudent.course}</Typography>
            <Typography><b>Mobile:</b> {selectedStudent.mobile}</Typography>
            <Typography><b>LinkedIn:</b> <a href={selectedStudent.linkedin} target="_blank" rel="noopener noreferrer">Profile</a></Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProfile}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};
export default StudentsNew;
