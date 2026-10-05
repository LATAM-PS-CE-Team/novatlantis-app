import { createTheme } from '@mui/material/styles';

export const novatlantisTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      light: '#4285f4',
      dark: '#1557b0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#1e8e3e',
      light: '#34a853',
      dark: '#137333',
      contrastText: '#ffffff'
    },
    error: {
      main: '#d93025',
      light: '#ea4335',
      dark: '#b31412'
    },
    warning: {
      main: '#f9ab00',
      light: '#fbbc04',
      dark: '#e37400'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368'
    },
    divider: '#dadce0'
  },
  typography: {
    fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", "Roboto", system-ui, -apple-system, sans-serif',
    h1: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.015em'
    },
    h3: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 600
    },
    h4: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 600
    },
    h5: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 600
    },
    h6: {
      fontFamily: '"Google Sans", "Plus Jakarta Sans", "Inter", sans-serif',
      fontWeight: 600
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 8,
          '&:hover': {
            boxShadow: '0 1px 3px rgba(60, 64, 67, 0.3)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: '#dadce0'
        }
      }
    }
  }
});
