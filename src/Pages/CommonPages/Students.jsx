import React, { useEffect, useState } from "react";
import { 
  Box, 
  Switch, 
  Button,
  Typography,
  LinearProgress,
  Paper,
  styled
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { collection, doc, getDocs, updateDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import DownloadIcon from '@mui/icons-material/Download';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Styled components for consistent UI
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

  // Fetch student data
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
          isEnable: doc.data().isEnable || false
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

  // Handle toggle change for enabling/disabling students
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

  // Export student applications to PDF
  const exportStudentsReport = async () => {
    try {
      setExportLoading(true);
      
      // First get all student users to map erNo to names
      const usersQuery = query(collection(db, "users"), where("userType", "==", "student"));
      const usersSnapshot = await getDocs(usersQuery);
      const studentsMap = {};
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        studentsMap[data.erNo] = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        };
      });

      // Then get all applications
      const applicationsSnapshot = await getDocs(collection(db, "applications"));
      const studentList = [];
      
      applicationsSnapshot.forEach((doc) => {
        const data = doc.data();
        const studentInfo = studentsMap[data.erNo] || {};
        
        studentList.push({
          erNo: data.erNo || "N/A",
          name: `${studentInfo.firstName || "N/A"} ${studentInfo.lastName || ""}`,
          email: studentInfo.email || "N/A",
          drive: data.driveTitle || "N/A",
          company: data.companyName || "N/A",
          date: data.appliedDate
            ? new Date(data.appliedDate.seconds * 1000).toLocaleDateString()
            : "N/A",
          status: data.status || "N/A"
        });
      });

      // Check if the studentList is empty
      if (studentList.length === 0) {
        alert("No students have applied yet.");
        return;
      }

      // Create PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text("Student Applications Report", 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add table
      doc.autoTable({
        startY: 35,
        head: [
          ["Enrollment No", "Student Name", "Email", "Drive", "Company", "Applied Date", "Status"]
        ],
        body: studentList.map(item => [
          item.erNo,
          item.name,
          item.email,
          item.drive,
          item.company,
          item.date,
          item.status
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [63, 81, 181], // Material UI primary color
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        styles: {
          cellPadding: 3,
          fontSize: 9,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 }
        },
        margin: { left: 14 }
      });

      // Save the PDF
      doc.save(`Student_Applications_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // DataGrid columns configuration
  const columns = [
    { 
      field: "erNo", 
      headerName: "Enrollment No", 
      flex: 1,
      minWidth: 150 
    },
    { 
      field: "firstName", 
      headerName: "First Name", 
      flex: 1,
      minWidth: 150 
    },
    { 
      field: "lastName", 
      headerName: "Last Name", 
      flex: 1,
      minWidth: 150 
    },
    { 
      field: "email", 
      headerName: "Email", 
      flex: 1,
      minWidth: 200 
    },
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Student Management
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ height: 500, width: '100%' }}>
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
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
              },
              '& .MuiDataGrid-cell': {
                borderRight: '1px solid #f0f0f0',
              },
            }}
          />
        </Box>
      </Paper>

      <StyledButton
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={exportStudentsReport}
        disabled={exportLoading}
      >
        {exportLoading ? 'Exporting...' : 'Export Student Applications (PDF)'}
      </StyledButton>
    </Box>
  );
}; 

export default StudentsNew;
