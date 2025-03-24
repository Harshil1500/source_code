import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, Switch, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx"; // Import XLSX for Excel export

// Firebase imports
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure correct Firebase config import

const StudentsNew = () => {
  const [row, setRow] = useState([]);

  // Fetch student data
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const studentList = querySnapshot.docs
        .filter((doc) => doc.data().userType === "student")
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setRow(studentList);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle toggle change for enabling/disabling students
  const handleChange = async (event, theUID) => {
    const newStatus = event.target.checked;
    try {
      await updateDoc(doc(db, "users", theUID), { isEnable: newStatus });

      // Update local state instead of refetching from Firestore
      setRow((prevRows) =>
        prevRows.map((row) =>
          row.id === theUID ? { ...row, isEnable: newStatus } : row
        )
      );
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  // Function to export student applications report to Excel
  const exportStudentsReport = async () => {
    try {
      const applicationsSnapshot = await getDocs(collection(db, "applications"));
      const studentList = applicationsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          Enrollment_No: data.erNo ?? "N/A",
          First_Name: data.firstName ?? "N/A",
          Last_Name: data.lastName ?? "N/A",
          Email: data.email ?? "N/A",
          Applied_Drive: data.driveTitle ?? "N/A",
          Company: data.companyName ?? "N/A",
          Applied_On: data.appliedDate
            ? new Date(data.appliedDate.seconds * 1000).toLocaleDateString()
            : "N/A",
        };
      });

      if (studentList.length === 0) {
        alert("No students have applied yet.");
        return;
      }

      // Convert data to Excel
      const ws = XLSX.utils.json_to_sheet(studentList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Applied Students");
      XLSX.writeFile(wb, "Students_Report.xlsx");

      alert("Students report has been downloaded.");
    } catch (error) {
      console.error("Error exporting students report:", error);
      alert("Failed to export the report. Please try again.");
    }
  };

  // Columns for the DataGrid
  const columns = [
    { field: "erNo", headerName: "Enrollment No", flex: 1 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "isEnable",
      headerName: "Status",
      flex: 1,
      renderCell: (param) => (
        <Switch checked={param.row.isEnable} onChange={(event) => handleChange(event, param.row.id)} />
      ),
    },
  ];

  return (
    <>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={row}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>

      {/* Export Button */}
      <Button
        onClick={exportStudentsReport}
        sx={{ mt: 5, color: "white", backgroundColor: "#1976D2", boxShadow: "0px 0px 10px 0px", px: 2, py: 1 }}
      >
        Download Students Report
      </Button>
    </>
  );
};

export default StudentsNew;
