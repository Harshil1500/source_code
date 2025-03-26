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
  Divider
} from "@mui/material";
import { collection, doc, getDoc, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { getAuth } from "firebase/auth";
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { teal, blue, orange, green } from '@mui/material/colors';

const Applied = () => {
  const auth = getAuth();
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [allDrives, setAllDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrives = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "drives"));
      const driveList = querySnapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        formattedDate: doc.data().createDate ? 
          new Date(doc.data().createDate.seconds * 1000).toLocaleDateString() : 'N/A'
      }));
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

  // Filter to only show applied drives
  const filteredDrives = allDrives.filter(drive => appliedDrives.includes(drive.id));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        My Applied Drives
      </Typography>

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
                      label={drive.formattedDate} 
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

                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon fontSize="small" sx={{ mr: 1, color: orange[500] }} />
                        <Typography variant="body2">
                          {drive.driveNoOpenings} openings
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventIcon fontSize="small" sx={{ mr: 1, color: teal[500] }} />
                        <Typography variant="body2">
                          {drive.driveLastDate || 'N/A'}
                        </Typography>
                      </Box>
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

export default Applied;