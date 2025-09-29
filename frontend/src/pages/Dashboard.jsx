import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  LinearProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  styled,
} from "@mui/material";
import { AddCircle, Delete, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "10px",
}));

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [totalAttendance, setTotalAttendance] = useState({});
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await axios.get("https://atten-m39t.onrender.com/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }, [token]);

  const fetchReport = useCallback(async () => {
    try {
      const res = await axios.get("https://atten-m39t.onrender.com/report", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalAttendance(res.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSubjects();
      fetchReport();
    } else {
      navigate("/");
    }
  }, [token, fetchSubjects, fetchReport, navigate]);

  const addSubject = async () => {
    if (!subjectName.trim()) return;
    try {
      await axios.post(
        "https://atten-m39t.onrender.com/subjects",
        { subject_name: subjectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjectName("");
      fetchSubjects();
      fetchReport();
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const deleteSubject = async (id) => {
    try {
      await axios.delete(`https://atten-m39t.onrender.com/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubjects();
      fetchReport();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const updateAttendance = async (subjectId, type, newTotal, newAttended) => {
    try {
      await axios.post(
        "https://atten-m39t.onrender.com/attendance",
        {
          subjectId,
          type,
          total_classes: newTotal,
          attended_classes: newAttended,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubjects();
      fetchReport();
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleInputChange = (subjectId, type, field, value) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    }

    const newSubjects = subjects.map((sub) => {
      if (sub.id === subjectId) {
        const newAttendance = sub.attendance.map((att) => {
          if (att.type === type) {
            const updatedAtt = {
              ...att,
              [field]: numValue,
            };

            if (
              field === "attended_classes" &&
              updatedAtt.attended_classes > updatedAtt.total_classes
            ) {
              return { ...att, [field]: att.total_classes };
            }
            if (
              field === "total_classes" &&
              updatedAtt.attended_classes > updatedAtt.total_classes
            ) {
              return {
                ...updatedAtt,
                attended_classes: updatedAtt.total_classes,
              };
            }

            return updatedAtt;
          }
          return att;
        });
        return { ...sub, attendance: newAttendance };
      }
      return sub;
    });
    setSubjects(newSubjects);
  };

  const handleSaveAttendance = (subjectId, type) => {
    const subject = subjects.find((sub) => sub.id === subjectId);
    if (subject) {
      const attendance = subject.attendance.find((att) => att.type === type);
      if (attendance) {
        if (attendance.attended_classes > attendance.total_classes) {
          alert("Attended classes cannot be more than total classes.");
          return;
        }
        updateAttendance(
          subjectId,
          type,
          attendance.total_classes,
          attendance.attended_classes
        );
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        paddingY: "40px",
      }}
    >
      <Container
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        maxWidth="md"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            component={motion.div}
            whileHover={{
              scale: 1.01,
              boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
            }}
            elevation={6}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: "white",
              borderRadius: "12px",
              textAlign: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Welcome Back!
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Track your attendance and stay on top of your progress.
            </Typography>
          </Paper>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <Paper
            component={motion.div}
            variants={itemVariants}
            elevation={4}
            sx={{ p: 3, mb: 4, borderRadius: "12px" }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#555" }}
              gutterBottom
            >
              Overall Progress
            </Typography>
            <Typography variant="h4" color="primary">
              {totalAttendance.percentage?.toFixed(2) || 0}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={totalAttendance.percentage || 0}
              sx={{ my: 2, height: "8px", borderRadius: "4px" }}
            />
            {totalAttendance.needed > 0 && (
              <Typography variant="body1" color="error">
                You need to attend {totalAttendance.needed} more classes to
                reach 75%
              </Typography>
            )}
          </Paper>

          <Paper
            component={motion.div}
            variants={itemVariants}
            elevation={4}
            sx={{ p: 3, mb: 4, borderRadius: "12px" }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#555" }}
              gutterBottom
            >
              Add New Subject
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  label="Subject Name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<AddCircle />}
                  onClick={addSubject}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Grid
            component={motion.div}
            variants={containerVariants}
            container
            spacing={3}
          >
            {subjects.map((sub) => {
              const totalClasses = sub.attendance.reduce(
                (sum, att) => sum + att.total_classes,
                0
              );
              const attendedClasses = sub.attendance.reduce(
                (sum, att) => sum + att.attended_classes,
                0
              );
              const percentage =
                totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
              const needed =
                percentage >= 75
                  ? 0
                  : Math.ceil((75 * totalClasses - 100 * attendedClasses) / 25);

              return (
                <Grid
                  component={motion.div}
                  variants={itemVariants}
                  item
                  xs={12}
                  md={6}
                  key={sub.id}
                >
                  <Card elevation={2} sx={{ borderRadius: "12px" }}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="h6">{sub.subject_name}</Typography>
                        <IconButton
                          aria-label="delete"
                          onClick={() => deleteSubject(sub.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <List>
                        {sub.attendance.map((att) => (
                          <ListItem key={att.id} disablePadding>
                            <ListItemText
                              primary={`${
                                att.type.charAt(0).toUpperCase() +
                                att.type.slice(1)
                              }`}
                              secondary={`Attended: ${att.attended_classes}/${
                                att.total_classes
                              } (${
                                (
                                  (att.attended_classes / att.total_classes) *
                                  100
                                ).toFixed(2) || 0
                              }%)`}
                            />
                            <ActionButtons>
                              <TextField
                                size="small"
                                label="Total"
                                type="number"
                                value={att.total_classes}
                                onChange={(e) =>
                                  handleInputChange(
                                    sub.id,
                                    att.type,
                                    "total_classes",
                                    e.target.value
                                  )
                                }
                                sx={{ width: "80px" }}
                              />
                              <TextField
                                size="small"
                                label="Attended"
                                type="number"
                                value={att.attended_classes}
                                onChange={(e) =>
                                  handleInputChange(
                                    sub.id,
                                    att.type,
                                    "attended_classes",
                                    e.target.value
                                  )
                                }
                                sx={{ width: "80px" }}
                              />
                              <Button
                                variant="contained"
                                onClick={() =>
                                  handleSaveAttendance(sub.id, att.type)
                                }
                                size="small"
                              >
                                Save
                              </Button>
                            </ActionButtons>
                          </ListItem>
                        ))}
                      </List>

                      <Typography variant="body2" mt={2} mb={1}>
                        Combined: {attendedClasses} / {totalClasses} (
                        {percentage.toFixed(2)}%)
                      </Typography>
                      {needed > 0 && (
                        <Typography variant="body2" color="error">
                          Attend {needed} more to reach 75%
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;
