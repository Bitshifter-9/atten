import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4A90E2", // A modern blue
    },
    secondary: {
      main: "#FF6B6B", // A bright red for contrast/accents
    },
    background: {
      default: "#f0f2f5", // A light gray for the overall background
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

export default theme;
