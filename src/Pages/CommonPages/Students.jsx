// import React, { useEffect, useState } from 'react';
// import { styled } from '@mui/material/styles';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell, { tableCellClasses } from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Paper from '@mui/material/Paper';
// import { Box, Switch, IconButton, Tooltip } from '@mui/material';
// import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
// import { db } from '../../firebase';
// import VisibilityIcon from '@mui/icons-material/Visibility';

// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   [`&.${tableCellClasses.head}`]: {
//     backgroundColor: theme.palette.primary.main,
//     color: theme.palette.common.white,
//     fontWeight: 'bold',
//   },
//   [`&.${tableCellClasses.body}`]: {
//     fontSize: 14,
//   },
// }));

// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   '&:nth-of-type(odd)': {
//     backgroundColor: theme.palette.action.hover,
//   },
//   '&:last-child td, &:last-child th': {
//     border: 0,
//   },
// }));

// const Students = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   const fetchStudents = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, "users"));
//       const studentList = [];
      
//       querySnapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.userType === 'student') {
//           studentList.push({ 
//             id: doc.id, 
//             ...data,
//             erNo: data.erNo || doc.id // Use erNo if available, otherwise use document ID
//           });
//         }
//       });
      
//       setStudents(studentList);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const handleStatusChange = async (event, studentId) => {
//     const isEnabled = event.target.checked;
    
//     try {
//       const studentRef = doc(db, "users", studentId);
//       await updateDoc(studentRef, {
//         isEnable: isEnabled
//       });
      
//       setStudents(prevStudents => 
//         prevStudents.map(student => 
//           student.id === studentId 
//             ? { ...student, isEnable: isEnabled } 
//             : student
//         )
//       );
//     } catch (error) {
//       console.error("Error updating student status:", error);
//     }
//   };

//   const handleViewProfile = (studentId) => {
//     // Implement your profile viewing logic here
//     console.log("View profile for student:", studentId);
//     // You can navigate to a profile page or show a modal
//     // Example: navigate(`/student-profile/${studentId}`);
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//         Loading students...
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ padding: 2 }}>
//       <h1>Students</h1>
//       <TableContainer component={Paper} elevation={3}>
//         <Table sx={{ minWidth: 650 }} aria-label="students table">
//           <TableHead>
//             <StyledTableRow>
//               <StyledTableCell>Enrollment No</StyledTableCell>
//               <StyledTableCell>First Name</StyledTableCell>
//               <StyledTableCell>Last Name</StyledTableCell>
//               <StyledTableCell>Email</StyledTableCell>
//               <StyledTableCell align="center">Status</StyledTableCell>
//               <StyledTableCell align="center">View Profile</StyledTableCell>
//             </StyledTableRow>
//           </TableHead>
          
//           <TableBody>
//             {students.length > 0 ? (
//               students.map((student) => (
//                 <StyledTableRow key={student.id}>
//                   <StyledTableCell>{student.erNo}</StyledTableCell>
//                   <StyledTableCell>{student.firstName}</StyledTableCell>
//                   <StyledTableCell>{student.lastName}</StyledTableCell>
//                   <StyledTableCell>{student.email}</StyledTableCell>
//                   <StyledTableCell align="center">
//                     <Switch 
//                       checked={student.isEnable || false}
//                       onChange={(e) => handleStatusChange(e, student.id)}
//                       color="primary"
//                     />
//                   </StyledTableCell>
//                   <StyledTableCell align="center">
//                     <Tooltip title="View Profile">
//                       <IconButton 
//                         onClick={() => handleViewProfile(student.id)}
//                         color="primary"
//                       >
//                         <VisibilityIcon />
//                       </IconButton>
//                     </Tooltip>
//                   </StyledTableCell>
//                 </StyledTableRow>
//               ))
//             ) : (
//               <StyledTableRow>
//                 <StyledTableCell colSpan={6} align="center">
//                   No students found
//                 </StyledTableCell>
//               </StyledTableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// }

// export default Students;

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
import * as XLSX from "xlsx";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import DownloadIcon from '@mui/icons-material/Download';

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

  // Export student applications to Excel
  const exportStudentsReport = async () => {
    try {
      setExportLoading(true);
      const applicationsSnapshot = await getDocs(collection(db, "applications"));
      const studentList = applicationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          "Enrollment No": data.erNo ?? "N/A",
          "First Name": data.firstName ?? "N/A",
          "Last Name": data.lastName ?? "N/A",
          "Email": data.email ?? "N/A",
          "Applied Drive": data.driveTitle ?? "N/A",
          "Company": data.companyName ?? "N/A",
          "Applied Date": data.appliedDate
            ? new Date(data.appliedDate.seconds * 1000).toLocaleDateString()
            : "N/A",
        };
      });

      if (studentList.length === 0) {
        alert("No students have applied yet.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(studentList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Applications");
      XLSX.writeFile(wb, `Student_Applications_${new Date().toISOString().split('T')[0]}.xlsx`);
      
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
        {exportLoading ? 'Exporting...' : 'Export Student Applications'}
      </StyledButton>
    </Box>
  );
};

export default StudentsNew;