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
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import {
  collection,
  doc,
  getDocs,
  updateDoc
} from "firebase/firestore";
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
  const exportToPDF = async () => {
    try {
      setExportLoading(true);
  
      // Fetch applications from Firestore
      const applicationsSnapshot = await getDocs(collection(db, "applications"));
      const applications = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      if (applications.length === 0) {
        alert("No student applications found.");
        return;
      }
  
      const pdfDoc = new jsPDF();
      pdfDoc.setFontSize(18);
      pdfDoc.setTextColor(40);
      pdfDoc.text("Student Applications Report", 14, 22);
  
      pdfDoc.setFontSize(11);
      pdfDoc.setTextColor(100);
      pdfDoc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
      const tableData = applications.map(app => {
        let appliedDate = "N/A";
        try {
          if (app.appliedDate?.seconds) {
            appliedDate = new Date(app.appliedDate.seconds * 1000).toLocaleDateString();
          }
        } catch (e) {
          console.warn("Error parsing date:", e);
        }
  
        return [
          app.erNo || "N/A",
          `${app.firstName || "N/A"} ${app.lastName || ""}`.trim(),
          app.email || "N/A",
          app.companyName || "N/A",
          app.driveTitle || "N/A",
          appliedDate
        ];
      });
  
      pdfDoc.autoTable({
        startY: 35,
        head: [["Enrollment No", "Student Name", "Email", "Company", "Drive", "Applied Date"]],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [63, 81, 181],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 3,
          fontSize: 9,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 40 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 25 }
        }
      });
  
      pdfDoc.save(`Student_Applications_${new Date().toISOString().split('T')[0]}.pdf`);
  
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert(`Failed to export PDF. Error: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
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
        onClick={exportToPDF}
        disabled={exportLoading}
      >
        {exportLoading ? "Exporting..." : "Export Student Applications (PDF)"}
      </StyledButton>
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onClose={handleCloseProfile}>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogContent>
            <Typography><b>Name:</b> {selectedStudent.firstName} {selectedStudent.lastName}</Typography>
            <Typography><b>Email:</b> {selectedStudent.email}</Typography>
            <Typography><b>Enrollment No:</b> {selectedStudent.erNo}</Typography>
            <Typography><b>College:</b> {selectedStudent.collegeName}</Typography>
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
