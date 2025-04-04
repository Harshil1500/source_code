import { 
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  Grid, 
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Divider,
  Tooltip
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { getAuth } from "firebase/auth";
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { blue, green } from '@mui/material/colors';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Applied = () => {
  const auth = getAuth();
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [allDrives, setAllDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString();
      }
      if (typeof date === 'string') {
        return new Date(date).toLocaleDateString();
      }
      if (date instanceof Date) {
        return date.toLocaleDateString();
      }
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const fetchDrives = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "drives"));
      const driveList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          formattedDate: formatDate(data.createDate),
          formattedLastDate: formatDate(data.driveLastDate),
          formattedDriveDate: formatDate(data.driveDate)
        };
      });
      setAllDrives(driveList);
    } catch (error) {
      console.error("Error fetching drives:", error);
      setError("Failed to load drives. Please try again.");
    }
  };

  const fetchAppliedDrives = async () => {
    if (auth.currentUser) {
      try {
        const q = query(collection(db, "applications"), where("studentId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const appliedDriveIds = querySnapshot.docs.map((doc) => doc.data().driveId);
        setAppliedDrives(appliedDriveIds);
      } catch (error) {
        console.error("Error fetching applied drives:", error);
        setError("Failed to load your applications. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Applied Job Drives Report', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const headers = [
      ['Title', 'Company', 'Applied Date', 'Start Date', 'Last Date', 'Openings', 'Job Type', 'Salary', 'Status']
    ];

    const data = filteredDrives.map(drive => ([
      drive.driveTitle || 'N/A',
      drive.driveCompanyName || 'N/A',
      drive.formattedDate,
      drive.createDate || 'N/A',
      drive.driveLastDate || 'N/A',
      drive.driveNoOpenings || 'N/A',
      drive.driveTitle || 'N/A',
      drive.driveSalary || 'N/A',
      'Applied'
    ]));

    doc.autoTable({
      head: headers,
      body: data,
      startY: 35,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`Applied_Drives_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDrives();
      await fetchAppliedDrives();
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  const filteredDrives = allDrives.filter(drive => appliedDrives.includes(drive.id));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          My Applied Drives
        </Typography>
        
        {filteredDrives.length > 0 && (
          <Tooltip title="Download PDF Report">
            <Button 
              variant="contained"
              onClick={downloadReport}
              startIcon={<DownloadIcon />}
              sx={{ 
                bgcolor: blue[500],
                color: 'white',
                '&:hover': {
                  bgcolor: blue[600]
                }
              }}
            >
              Download PDF
            </Button>
          </Tooltip>
        )}
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {filteredDrives.length === 0 ? (
        <Alert severity="info">You haven't applied to any drives yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredDrives.map((drive) => (
            <Grid item xs={12} sm={6} md={4} key={drive.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip 
                      label={`Applied: ${drive.formattedDate}`} 
                      size="small" 
                      icon={<EventIcon fontSize="small" />}
                    />
                    <Chip 
                      label="Applied" 
                      color="success" 
                      size="small"
                      icon={<CheckCircleIcon fontSize="small" />}
                    />
                  </Box>

                  <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                    {drive.driveTitle}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: blue[100], 
                      color: blue[800], 
                      width: 24, 
                      height: 24, 
                      mr: 1 
                    }}>
                      <WorkIcon fontSize="small" />
                    </Avatar>
                    <Typography color="text.secondary">
                      {drive.driveCompanyName}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Start Date:</strong> {drive.createDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Last Date to Apply:</strong> {drive.driveLastDate}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Job Type:</strong> {drive.driveTitle || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Salary:</strong> {drive.driveSalary || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      bgcolor: green[500],
                      '&:hover': {
                        bgcolor: green[600]
                      }
                    }}
                  >
                    Applied
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Applied;
