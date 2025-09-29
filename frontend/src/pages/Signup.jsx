import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Link,
} from "@mui/material";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSignup = async () => {
    try {
      await axios.post("https://atten-m39t.onrender.com/auth/signup", {
        name,
        email,
        password,
      });
      alert("Signup successful! Please login.");
      navigate("/");
    } catch (error) {
      if (error.response) {
        console.error("Backend error:", error.response.data);
        alert(error.response.data.error || "Signup failed.");
      } else {
        console.error("Network/Other error:", error);
        alert("Signup failed due to network error.");
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSignup}
          >
            Sign Up
          </Button>
          <Typography variant="body2" align="center">
            <Link href="/" variant="body2">
              {"Already have an account? Login"}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
